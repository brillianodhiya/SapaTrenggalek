import { NextRequest, NextResponse } from "next/server";
import { batchUpdateEmbeddings, updateEntryEmbedding } from "@/lib/embeddings";
import { supabaseAdmin } from "@/lib/supabase-admin";

export const runtime = "nodejs";

// Batch update embeddings for entries without embeddings
export async function POST(request: NextRequest) {
  try {
    const { limit = 50, force = false } = await request.json();

    console.log(
      `Starting batch embedding update (limit: ${limit}, force: ${force})`
    );

    let updatedCount;

    if (force) {
      // Force update all entries
      const { data: entries, error } = await supabaseAdmin
        .from("data_entries")
        .select("id, content")
        .limit(limit);

      if (error || !entries) {
        throw new Error(`Error fetching entries: ${error?.message}`);
      }

      updatedCount = 0;
      for (const entry of entries) {
        const success = await updateEntryEmbedding(entry.id, entry.content);
        if (success) updatedCount++;

        // Small delay to avoid rate limiting
        await new Promise((resolve) => setTimeout(resolve, 200));
      }
    } else {
      // Update only entries without embeddings
      updatedCount = await batchUpdateEmbeddings(limit);
    }

    // Get statistics using the secure function
    const { data: statsResult, error: statsError } = await supabaseAdmin.rpc(
      "get_embedding_statistics"
    );

    const stats = statsResult?.[0] || {
      total_entries: 0,
      entries_with_embeddings: 0,
      entries_without_embeddings: 0,
      completion_percentage: 0,
    };

    const totalEntries = stats.total_entries || 0;
    const entriesWithEmbeddings = stats.entries_with_embeddings || 0;
    const entriesWithoutEmbeddings = stats.entries_without_embeddings || 0;

    return NextResponse.json({
      success: true,
      updatedCount,
      statistics: {
        totalEntries,
        entriesWithEmbeddings,
        entriesWithoutEmbeddings,
        completionPercentage:
          totalEntries > 0
            ? Math.round((entriesWithEmbeddings / totalEntries) * 100)
            : 0,
      },
      message: `Successfully updated ${updatedCount} embeddings`,
    });
  } catch (error) {
    console.error("Batch embedding update error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to update embeddings",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

// Get embedding statistics
export async function GET() {
  try {
    // Get statistics using the secure function
    const { data: statsResult, error: statsError } = await supabaseAdmin.rpc(
      "get_embedding_statistics"
    );

    if (statsError) {
      throw new Error(`Error fetching statistics: ${statsError.message}`);
    }

    const stats = statsResult?.[0] || {
      total_entries: 0,
      entries_with_embeddings: 0,
      entries_without_embeddings: 0,
      completion_percentage: 0,
    };

    const totalEntries = stats.total_entries || 0;
    const entriesWithEmbeddings = stats.entries_with_embeddings || 0;
    const entriesWithoutEmbeddings = stats.entries_without_embeddings || 0;

    // Get recent entries without embeddings
    const { data: recentWithoutEmbeddings } = await supabaseAdmin
      .from("data_entries")
      .select("id, content, source, created_at")
      .is("content_embedding", null)
      .order("created_at", { ascending: false })
      .limit(10);

    return NextResponse.json({
      statistics: {
        totalEntries,
        entriesWithEmbeddings,
        entriesWithoutEmbeddings,
        completionPercentage:
          totalEntries > 0
            ? Math.round((entriesWithEmbeddings / totalEntries) * 100)
            : 0,
      },
      recentWithoutEmbeddings: recentWithoutEmbeddings || [],
      recommendations: {
        shouldUpdate: entriesWithoutEmbeddings > 0,
        batchSize: Math.min(50, entriesWithoutEmbeddings),
        estimatedTime: `${Math.ceil(
          entriesWithoutEmbeddings / 50
        )} batches (~${Math.ceil(
          (entriesWithoutEmbeddings * 0.2) / 60
        )} minutes)`,
      },
    });
  } catch (error) {
    console.error("Embedding statistics error:", error);
    return NextResponse.json(
      {
        error: "Failed to get embedding statistics",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
