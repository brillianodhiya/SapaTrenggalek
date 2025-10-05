import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const range = searchParams.get("range") || "7d";
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

    // Get daily trends based on selected range
    const getDaysFromRange = (range: string) => {
      switch (range) {
        case "30d":
          return 30;
        case "90d":
          return 90;
        case "1y":
          return 365;
        default:
          return 7;
      }
    };

    const days = getDaysFromRange(range);
    const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
    const { data: dailyTrends, error: trendsError } = await supabaseAdmin
      .from("data_entries")
      .select("created_at, category")
      .gte("created_at", startDate.toISOString())
      .order("created_at", { ascending: true });

    console.log("Daily trends query result:", {
      count: dailyTrends?.length,
      error: trendsError,
      range: range,
      startDate: startDate.toISOString(),
      sampleData: dailyTrends?.slice(0, 3).map((item) => ({
        date: item.created_at,
        category: item.category,
      })),
    });

    // Create daily trends array based on selected range
    const dailyTrendsArray = [];
    const displayDays = Math.min(days, 30); // Limit display to max 30 days for readability
    for (let i = displayDays - 1; i >= 0; i--) {
      const date = new Date(Date.now() - i * 24 * 60 * 60 * 1000);
      const dateStr = date.toISOString().split("T")[0];

      // Count entries for this date
      const dayCount =
        dailyTrends?.filter((item) => {
          const itemDate = new Date(item.created_at)
            .toISOString()
            .split("T")[0];
          return itemDate === dateStr;
        }).length || 0;

      dailyTrendsArray.push({
        date: dateStr,
        count: dayCount,
      });
    }

    console.log("Generated daily trends array:", dailyTrendsArray);

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

    // dailyTrendsArray is already created above

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
      { date: "2025-01-01", count: 12 },
      { date: "2025-01-02", count: 18 },
      { date: "2025-01-03", count: 15 },
      { date: "2025-01-04", count: 22 },
      { date: "2025-01-05", count: 19 },
      { date: "2025-01-06", count: 25 },
      { date: "2025-01-07", count: 21 },
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
