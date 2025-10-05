import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  try {
    console.log("🧹 Starting deduplication process...");

    const { threshold = 0.9, dryRun = true } = await request.json();

    // Get all entries
    const { data: entries, error } = await supabaseAdmin
      .from("data_entries")
      .select("id, content, source, created_at")
      .order("created_at", { ascending: true });

    if (error) {
      console.error("❌ Error fetching entries:", error);
      return NextResponse.json({ error: "Database error" }, { status: 500 });
    }

    console.log(`📊 Analyzing ${entries.length} entries for duplicates...`);

    const duplicates = [];
    const processed = new Set();

    // Simple similarity check based on content length and first 100 chars
    for (let i = 0; i < entries.length; i++) {
      if (processed.has(entries[i].id)) continue;

      const current = entries[i];
      const currentPreview = current.content.substring(0, 100).toLowerCase();

      for (let j = i + 1; j < entries.length; j++) {
        if (processed.has(entries[j].id)) continue;

        const compare = entries[j];
        const comparePreview = compare.content.substring(0, 100).toLowerCase();

        // Check similarity
        const similarity = calculateSimilarity(currentPreview, comparePreview);

        if (similarity >= threshold) {
          duplicates.push({
            original: current,
            duplicate: compare,
            similarity: similarity,
          });
          processed.add(compare.id);
        }
      }
      processed.add(current.id);
    }

    console.log(`🔍 Found ${duplicates.length} duplicate pairs`);

    if (!dryRun && duplicates.length > 0) {
      // Delete duplicates (keep the older one)
      const idsToDelete = duplicates.map((d) => d.duplicate.id);

      const { error: deleteError } = await supabaseAdmin
        .from("data_entries")
        .delete()
        .in("id", idsToDelete);

      if (deleteError) {
        console.error("❌ Error deleting duplicates:", deleteError);
        return NextResponse.json({ error: "Delete error" }, { status: 500 });
      }

      console.log(`🗑️ Deleted ${idsToDelete.length} duplicate entries`);
    }

    return NextResponse.json({
      success: true,
      totalEntries: entries.length,
      duplicatesFound: duplicates.length,
      duplicates: duplicates.map((d) => ({
        originalId: d.original.id,
        duplicateId: d.duplicate.id,
        similarity: d.similarity,
        originalPreview: d.original.content.substring(0, 100),
        duplicatePreview: d.duplicate.content.substring(0, 100),
      })),
      dryRun,
      deletedCount: dryRun ? 0 : duplicates.length,
    });
  } catch (error: any) {
    console.error("❌ Deduplication error:", error);
    return NextResponse.json(
      {
        error: "Internal server error",
        details: error?.message || "Unknown error",
      },
      { status: 500 }
    );
  }
}

// Simple similarity calculation
function calculateSimilarity(str1: string, str2: string): number {
  if (str1 === str2) return 1.0;

  const longer = str1.length > str2.length ? str1 : str2;
  const shorter = str1.length > str2.length ? str2 : str1;

  if (longer.length === 0) return 1.0;

  const editDistance = levenshteinDistance(longer, shorter);
  return (longer.length - editDistance) / longer.length;
}

// Helper functions for better deduplication
function normalizeContent(content: string): string {
  return content
    .toLowerCase()
    .replace(/[^\w\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function extractTitle(content: string): string {
  // Extract first line or first 100 chars as title
  const lines = content.split("\n");
  const firstLine = lines[0] || "";
  return firstLine.length > 100 ? firstLine.substring(0, 100) : firstLine;
}

// Levenshtein distance calculation
function levenshteinDistance(str1: string, str2: string): number {
  const matrix = [];

  for (let i = 0; i <= str2.length; i++) {
    matrix[i] = [i];
  }

  for (let j = 0; j <= str1.length; j++) {
    matrix[0][j] = j;
  }

  for (let i = 1; i <= str2.length; i++) {
    for (let j = 1; j <= str1.length; j++) {
      if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j] + 1
        );
      }
    }
  }

  return matrix[str2.length][str1.length];
}
