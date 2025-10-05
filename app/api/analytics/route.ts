import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";

export const runtime = "nodejs";

export async function GET() {
  try {
    // Check if Supabase is configured
    if (
      !process.env.SUPABASE_SERVICE_ROLE_KEY ||
      !process.env.NEXT_PUBLIC_SUPABASE_URL
    ) {
      console.log("Supabase not configured, returning demo data");
      return NextResponse.json(getDemoAnalytics());
    }

    // Get total counts by category
    const { data: categoryData, error: categoryError } = await supabaseAdmin
      .from("data_entries")
      .select("category");

    if (categoryError) {
      console.log("Database error, returning demo data:", categoryError);
      return NextResponse.json(getDemoAnalytics());
    }

    const categoryStats =
      categoryData?.reduce((acc, item) => {
        acc[item.category] = (acc[item.category] || 0) + 1;
        return acc;
      }, {} as Record<string, number>) || {};

    // Get status distribution
    const { data: statusData } = await supabaseAdmin
      .from("data_entries")
      .select("status");

    const statusStats =
      statusData?.reduce((acc, item) => {
        acc[item.status] = (acc[item.status] || 0) + 1;
        return acc;
      }, {} as Record<string, number>) || {};

    // Get sentiment analysis
    const { data: sentimentData } = await supabaseAdmin
      .from("data_entries")
      .select("sentiment");

    const sentimentStats =
      sentimentData?.reduce((acc, item) => {
        acc[item.sentiment] = (acc[item.sentiment] || 0) + 1;
        return acc;
      }, {} as Record<string, number>) || {};

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

    // Get source distribution
    const { data: sourceData } = await supabaseAdmin
      .from("data_entries")
      .select("source");

    const sourceStats =
      sourceData?.reduce((acc, item) => {
        acc[item.source] = (acc[item.source] || 0) + 1;
        return acc;
      }, {} as Record<string, number>) || {};

    // Convert to top sources array
    const topSources = Object.entries(sourceStats)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([source, count]) => ({ source, count }));

    // Convert daily trends to simple format
    const dailyTrendsArray = Object.values(trendData || {}).map((day: any) => ({
      date: day.date,
      count: day.berita + day.laporan + day.aspirasi + day.lainnya,
    }));

    return NextResponse.json({
      totalEntries: categoryData?.length || 0,
      categoriesBreakdown: categoryStats || {},
      sentimentBreakdown: sentimentStats || {},
      urgentItems: urgentItems?.length || 0,
      hoaxItems: hoaxItems?.length || 0,
      statusBreakdown: statusStats || {},
      dailyTrends: dailyTrendsArray,
      topSources: topSources,
    });
  } catch (error) {
    console.error("Analytics error:", error);
    // Return demo data instead of error
    return NextResponse.json(getDemoAnalytics());
  }
}

function getDemoAnalytics() {
  return {
    totalEntries: 156,
    categoriesBreakdown: {
      berita: 45,
      laporan: 38,
      aspirasi: 32,
      pengaduan: 28,
      lainnya: 13,
    },
    sentimentBreakdown: {
      positif: 62,
      netral: 71,
      negatif: 23,
    },
    urgentItems: 12,
    hoaxItems: 8,
    statusBreakdown: {
      baru: 34,
      diverifikasi: 45,
      diteruskan: 38,
      dikerjakan: 25,
      selesai: 14,
    },
    dailyTrends: [
      { date: "2024-01-01", count: 12 },
      { date: "2024-01-02", count: 18 },
      { date: "2024-01-03", count: 15 },
      { date: "2024-01-04", count: 22 },
      { date: "2024-01-05", count: 19 },
      { date: "2024-01-06", count: 25 },
      { date: "2024-01-07", count: 21 },
    ],
    topSources: [
      { source: "WhatsApp", count: 45 },
      { source: "Facebook", count: 32 },
      { source: "Website Resmi", count: 28 },
      { source: "Instagram", count: 24 },
      { source: "Twitter", count: 18 },
    ],
    // Legacy format for Dashboard compatibility
    categoryStats: {
      berita: 45,
      laporan: 38,
      aspirasi: 32,
      pengaduan: 28,
      lainnya: 13,
    },
    statusStats: {
      baru: 34,
      diverifikasi: 45,
      diteruskan: 38,
      dikerjakan: 25,
      selesai: 14,
    },
    sentimentStats: {
      positif: 62,
      netral: 71,
      negatif: 23,
    },
  };
}
