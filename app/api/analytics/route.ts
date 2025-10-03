import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";

export async function GET() {
  try {
    // Get total counts by category
    const { data: categoryStats } = await supabaseAdmin
      .from("data_entries")
      .select("category")
      .then(({ data }) => {
        const stats = data?.reduce((acc, item) => {
          acc[item.category] = (acc[item.category] || 0) + 1;
          return acc;
        }, {} as Record<string, number>);
        return { data: stats };
      });

    // Get status distribution
    const { data: statusStats } = await supabaseAdmin
      .from("data_entries")
      .select("status")
      .then(({ data }) => {
        const stats = data?.reduce((acc, item) => {
          acc[item.status] = (acc[item.status] || 0) + 1;
          return acc;
        }, {} as Record<string, number>);
        return { data: stats };
      });

    // Get sentiment analysis
    const { data: sentimentStats } = await supabaseAdmin
      .from("data_entries")
      .select("sentiment")
      .then(({ data }) => {
        const stats = data?.reduce((acc, item) => {
          acc[item.sentiment] = (acc[item.sentiment] || 0) + 1;
          return acc;
        }, {} as Record<string, number>);
        return { data: stats };
      });

    // Get high urgency items
    const { data: urgentItems } = await supabaseAdmin
      .from("data_entries")
      .select("*")
      .gte("urgency_level", 7)
      .order("urgency_level", { ascending: false })
      .limit(10);

    // Get potential hoax items
    const { data: hoaxItems } = await supabaseAdmin
      .from("data_entries")
      .select("*")
      .gte("hoax_probability", 70)
      .order("hoax_probability", { ascending: false })
      .limit(10);

    // Get daily trends (last 7 days)
    const { data: dailyTrends } = await supabaseAdmin
      .from("data_entries")
      .select("created_at, category")
      .gte(
        "created_at",
        new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
      )
      .order("created_at", { ascending: true });

    // Process daily trends
    const trendData = dailyTrends?.reduce((acc, item) => {
      const date = new Date(item.created_at).toISOString().split("T")[0];
      if (!acc[date]) {
        acc[date] = { date, berita: 0, laporan: 0, aspirasi: 0, lainnya: 0 };
      }
      acc[date][item.category as keyof (typeof acc)[typeof date]]++;
      return acc;
    }, {} as Record<string, any>);

    return NextResponse.json({
      categoryStats: categoryStats || {},
      statusStats: statusStats || {},
      sentimentStats: sentimentStats || {},
      urgentItems: urgentItems || [],
      hoaxItems: hoaxItems || [],
      dailyTrends: Object.values(trendData || {}),
    });
  } catch (error) {
    console.error("Analytics error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
