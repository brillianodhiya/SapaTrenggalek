import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";

export async function GET() {
  try {
    console.log("📊 Getting database statistics...");

    // Get total count
    const { count: totalCount } = await supabaseAdmin
      .from("data_entries")
      .select("*", { count: "exact", head: true });

    // Get entries by source
    const { data: sourceData } = await supabaseAdmin
      .from("data_entries")
      .select("source, created_at");

    const sourceStats =
      sourceData?.reduce((acc, item) => {
        acc[item.source] = (acc[item.source] || 0) + 1;
        return acc;
      }, {} as Record<string, number>) || {};

    // Get entries by category
    const { data: categoryData } = await supabaseAdmin
      .from("data_entries")
      .select("category");

    const categoryStats =
      categoryData?.reduce((acc, item) => {
        acc[item.category] = (acc[item.category] || 0) + 1;
        return acc;
      }, {} as Record<string, number>) || {};

    // Get recent entries (last 10)
    const { data: recentEntries } = await supabaseAdmin
      .from("data_entries")
      .select("id, content, source, category, sentiment, created_at")
      .order("created_at", { ascending: false })
      .limit(10);

    // Identify test/sample data
    const testSources = [
      "Manual Test",
      "Test Source",
      "Fallback News",
      "System Test",
      "System Fallback",
    ];
    const testDataCount = Object.entries(sourceStats)
      .filter(([source]) => testSources.includes(source))
      .reduce((sum, [, count]) => sum + count, 0);

    // Get oldest and newest entries
    const { data: oldestEntry } = await supabaseAdmin
      .from("data_entries")
      .select("created_at, source, content")
      .order("created_at", { ascending: true })
      .limit(1);

    const { data: newestEntry } = await supabaseAdmin
      .from("data_entries")
      .select("created_at, source, content")
      .order("created_at", { ascending: false })
      .limit(1);

    return NextResponse.json({
      success: true,
      database_stats: {
        total_entries: totalCount || 0,
        test_data_entries: testDataCount,
        real_data_entries: (totalCount || 0) - testDataCount,
        sources: sourceStats,
        categories: categoryStats,
        oldest_entry: oldestEntry?.[0]
          ? {
              date: oldestEntry[0].created_at,
              source: oldestEntry[0].source,
              preview: oldestEntry[0].content.substring(0, 50) + "...",
            }
          : null,
        newest_entry: newestEntry?.[0]
          ? {
              date: newestEntry[0].created_at,
              source: newestEntry[0].source,
              preview: newestEntry[0].content.substring(0, 50) + "...",
            }
          : null,
      },
      recent_entries:
        recentEntries?.map((entry) => ({
          id: entry.id,
          source: entry.source,
          category: entry.category,
          sentiment: entry.sentiment,
          created_at: entry.created_at,
          content_preview: entry.content.substring(0, 60) + "...",
        })) || [],
      cleanup_recommendations: {
        should_cleanup: testDataCount > 0,
        test_sources_to_remove: testSources.filter(
          (source) => sourceStats[source] > 0
        ),
        cleanup_command: "npm run cleanup-db",
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("❌ Database stats error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to get database stats",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
