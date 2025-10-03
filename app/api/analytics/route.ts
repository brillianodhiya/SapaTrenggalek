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
    // Return demo data instead of error
    return NextResponse.json(getDemoAnalytics());
  }
}

function getDemoAnalytics() {
  return {
    categoryStats: {
      berita: 45,
      laporan: 23,
      aspirasi: 18,
      lainnya: 12,
    },
    statusStats: {
      baru: 32,
      diproses: 28,
      selesai: 38,
    },
    sentimentStats: {
      positif: 42,
      netral: 35,
      negatif: 21,
    },
    urgentItems: [
      {
        id: 1,
        content:
          "Laporan kerusakan jalan utama di Kecamatan Trenggalek yang mengganggu aktivitas warga",
        urgency_level: 9,
        source: "WhatsApp",
        created_at: new Date().toISOString(),
      },
      {
        id: 2,
        content:
          "Keluhan masyarakat tentang pelayanan administrasi yang lambat di kantor desa",
        urgency_level: 8,
        source: "Website",
        created_at: new Date().toISOString(),
      },
    ],
    hoaxItems: [
      {
        id: 3,
        content:
          "Informasi tidak akurat tentang program bantuan pemerintah yang beredar di media sosial",
        hoax_probability: 85,
        source: "Facebook",
        created_at: new Date().toISOString(),
      },
    ],
    dailyTrends: [
      { date: "2024-01-01", berita: 5, laporan: 3, aspirasi: 2, lainnya: 1 },
      { date: "2024-01-02", berita: 7, laporan: 4, aspirasi: 3, lainnya: 2 },
      { date: "2024-01-03", berita: 6, laporan: 5, aspirasi: 4, lainnya: 1 },
      { date: "2024-01-04", berita: 8, laporan: 2, aspirasi: 3, lainnya: 2 },
      { date: "2024-01-05", berita: 9, laporan: 6, aspirasi: 2, lainnya: 1 },
      { date: "2024-01-06", berita: 5, laporan: 3, aspirasi: 5, lainnya: 3 },
      { date: "2024-01-07", berita: 5, laporan: 0, aspirasi: 2, lainnya: 2 },
    ],
  };
}
