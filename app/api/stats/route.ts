import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";

export async function GET() {
  try {
    // Get total entries
    const { count: totalEntries } = await supabaseAdmin
      .from("data_entries")
      .select("*", { count: "exact", head: true });

    // Get entries by category
    const { data: categoryData } = await supabaseAdmin
      .from("data_entries")
      .select("category");

    const categoryStats =
      categoryData?.reduce((acc, item) => {
        acc[item.category] = (acc[item.category] || 0) + 1;
        return acc;
      }, {} as Record<string, number>) || {};

    // Get recent entries (last 24 hours)
    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
    const { count: recentEntries } = await supabaseAdmin
      .from("data_entries")
      .select("*", { count: "exact", head: true })
      .gte("created_at", yesterday);

    // Get urgent items
    const { count: urgentItems } = await supabaseAdmin
      .from("data_entries")
      .select("*", { count: "exact", head: true })
      .gte("urgency_level", 7);

    // Get potential hoax items
    const { count: hoaxItems } = await supabaseAdmin
      .from("data_entries")
      .select("*", { count: "exact", head: true })
      .gte("hoax_probability", 70);

    // Get latest entries
    const { data: latestEntries } = await supabaseAdmin
      .from("data_entries")
      .select(
        "id, content, category, sentiment, urgency_level, created_at, source"
      )
      .order("created_at", { ascending: false })
      .limit(5);

    return NextResponse.json({
      success: true,
      stats: {
        total_entries: totalEntries || 0,
        recent_entries_24h: recentEntries || 0,
        urgent_items: urgentItems || 0,
        potential_hoax: hoaxItems || 0,
        category_breakdown: categoryStats,
        last_updated: new Date().toISOString(),
      },
      latest_entries:
        latestEntries?.map((entry) => ({
          id: entry.id,
          content_preview: entry.content.substring(0, 100) + "...",
          category: entry.category,
          sentiment: entry.sentiment,
          urgency_level: entry.urgency_level,
          source: entry.source,
          created_at: entry.created_at,
        })) || [],
    });
  } catch (error) {
    console.error("❌ Stats error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to get stats",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
