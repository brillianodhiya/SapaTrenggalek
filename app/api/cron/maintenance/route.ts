import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { batchUpdateEmbeddings } from "@/lib/embeddings";

export const runtime = "nodejs";
export const maxDuration = 60; // 60 seconds timeout

export async function POST(request: NextRequest) {
  try {
    // Verify cron secret for security
    const authHeader = request.headers.get("authorization");
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    console.log("🔧 Starting maintenance cronjob...");

    const results = {
      embeddings: { processed: 0, errors: 0 },
      deduplication: { found: 0, removed: 0, errors: 0 },
      cleanup: { cleaned: 0, errors: 0 },
    };

    // 1. Update embeddings for entries without embeddings
    console.log("📊 Step 1: Updating embeddings...");
    try {
      const embeddingLimit = 15; // Reduced to 15 entries per run to avoid timeout
      const updatedCount = await batchUpdateEmbeddings(embeddingLimit);
      results.embeddings.processed = updatedCount;
      console.log(`✅ Updated ${updatedCount} embeddings`);
    } catch (error) {
      console.error("❌ Embedding update error:", error);
      results.embeddings.errors = 1;
    }

    // 2. Run deduplication
    console.log("🧹 Step 2: Running deduplication...");
    try {
      const deduplicationResult = await runDeduplication();
      results.deduplication = deduplicationResult;
      console.log(
        `✅ Deduplication: ${deduplicationResult.found} found, ${deduplicationResult.removed} removed`
      );
    } catch (error) {
      console.error("❌ Deduplication error:", error);
      results.deduplication.errors = 1;
    }

    // 3. Cleanup old processed entries (optional)
    console.log("🗑️ Step 3: Cleanup old entries...");
    try {
      const cleanupResult = await cleanupOldEntries();
      results.cleanup = cleanupResult;
      console.log(`✅ Cleanup: ${cleanupResult.cleaned} entries cleaned`);
    } catch (error) {
      console.error("❌ Cleanup error:", error);
      results.cleanup.errors = 1;
    }

    // Get final statistics
    const { data: statsResult } = await supabaseAdmin.rpc(
      "get_embedding_statistics"
    );
    const stats = statsResult?.[0] || {
      total_entries: 0,
      entries_with_embeddings: 0,
      entries_without_embeddings: 0,
      completion_percentage: 0,
    };

    const response = {
      success: true,
      timestamp: new Date().toISOString(),
      results,
      statistics: {
        totalEntries: stats.total_entries || 0,
        entriesWithEmbeddings: stats.entries_with_embeddings || 0,
        entriesWithoutEmbeddings: stats.entries_without_embeddings || 0,
        completionPercentage: stats.completion_percentage || 0,
      },
      message: `✅ Maintenance completed! Embeddings: ${results.embeddings.processed}, Deduplication: ${results.deduplication.removed} removed, Cleanup: ${results.cleanup.cleaned}`,
    };

    console.log("🎉 Maintenance cronjob completed successfully");
    return NextResponse.json(response);
  } catch (error) {
    console.error("❌ Maintenance cronjob failed:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Maintenance cronjob failed",
        details: error instanceof Error ? error.message : "Unknown error",
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}

async function runDeduplication() {
  const threshold = 0.85; // 85% similarity threshold

  // Get entries from last 30 days to check for duplicates
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

  const { data: entries, error } = await supabaseAdmin
    .from("data_entries")
    .select("id, content, source, created_at, content_hash")
    .gte("created_at", thirtyDaysAgo.toISOString())
    .order("created_at", { ascending: true });

  if (error || !entries) {
    throw new Error(`Error fetching entries: ${error?.message}`);
  }

  console.log(
    `🔍 Analyzing ${entries.length} recent entries for duplicates...`
  );

  const duplicates = [];
  const processed = new Set();

  // Check for duplicates using content hash first (exact matches)
  const hashGroups = new Map();
  entries.forEach((entry) => {
    if (entry.content_hash) {
      if (!hashGroups.has(entry.content_hash)) {
        hashGroups.set(entry.content_hash, []);
      }
      hashGroups.get(entry.content_hash).push(entry);
    }
  });

  // Find exact duplicates by hash
  for (const [hash, group] of hashGroups) {
    if (group.length > 1) {
      // Keep the oldest entry, mark others as duplicates
      const sorted = group.sort(
        (a: any, b: any) =>
          new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
      );
      const original = sorted[0];

      for (let i = 1; i < sorted.length; i++) {
        duplicates.push({
          original,
          duplicate: sorted[i],
          similarity: 1.0, // Exact match
          method: "hash",
        });
        processed.add(sorted[i].id);
      }
      processed.add(original.id);
    }
  }

  // Check for similar content (for entries without hash or different hashes)
  for (let i = 0; i < entries.length; i++) {
    if (processed.has(entries[i].id)) continue;

    const current = entries[i];
    const currentPreview = normalizeContent(current.content.substring(0, 200));

    for (let j = i + 1; j < entries.length; j++) {
      if (processed.has(entries[j].id)) continue;

      const compare = entries[j];
      const comparePreview = normalizeContent(
        compare.content.substring(0, 200)
      );

      const similarity = calculateSimilarity(currentPreview, comparePreview);

      if (similarity >= threshold) {
        duplicates.push({
          original: current,
          duplicate: compare,
          similarity,
          method: "content",
        });
        processed.add(compare.id);
      }
    }
    processed.add(current.id);
  }

  console.log(`🔍 Found ${duplicates.length} duplicate pairs`);

  let removedCount = 0;
  if (duplicates.length > 0) {
    // Delete duplicates in batches
    const batchSize = 50;
    for (let i = 0; i < duplicates.length; i += batchSize) {
      const batch = duplicates.slice(i, i + batchSize);
      const idsToDelete = batch.map((d) => d.duplicate.id);

      const { error: deleteError } = await supabaseAdmin
        .from("data_entries")
        .delete()
        .in("id", idsToDelete);

      if (deleteError) {
        console.error("❌ Error deleting batch:", deleteError);
      } else {
        removedCount += idsToDelete.length;
        console.log(`🗑️ Deleted batch of ${idsToDelete.length} duplicates`);
      }

      // Small delay between batches
      await new Promise((resolve) => setTimeout(resolve, 100));
    }
  }

  return {
    found: duplicates.length,
    removed: removedCount,
    errors: 0,
  };
}

async function cleanupOldEntries() {
  // Clean up entries older than 1 year that are marked as 'selesai' (completed)
  const oneYearAgo = new Date(Date.now() - 365 * 24 * 60 * 60 * 1000);

  const { data: oldEntries, error: deleteError } = await supabaseAdmin
    .from("data_entries")
    .delete()
    .eq("status", "selesai")
    .lt("created_at", oneYearAgo.toISOString())
    .select("id");

  if (deleteError) {
    throw new Error(`Cleanup error: ${deleteError.message}`);
  }

  return {
    cleaned: oldEntries?.length || 0,
    errors: 0,
  };
}

function normalizeContent(content: string): string {
  return content
    .toLowerCase()
    .replace(/[^\w\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function calculateSimilarity(str1: string, str2: string): number {
  if (str1 === str2) return 1.0;
  if (str1.length === 0 || str2.length === 0) return 0;

  const longer = str1.length > str2.length ? str1 : str2;
  const shorter = str1.length > str2.length ? str2 : str1;

  const editDistance = levenshteinDistance(longer, shorter);
  return (longer.length - editDistance) / longer.length;
}

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
