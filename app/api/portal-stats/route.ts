import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";

export async function GET(request: NextRequest) {
  try {
    // Get total aspirasi
    const { count: totalAspirasi } = await supabaseAdmin
      .from("aspirasi")
      .select("*", { count: "exact", head: true });

    // Get total berita
    const { count: totalBerita } = await supabaseAdmin
      .from("data_entries")
      .select("*", { count: "exact", head: true });

    // Get resolved aspirasi for response rate
    const { count: resolvedAspirasi } = await supabaseAdmin
      .from("aspirasi")
      .select("*", { count: "exact", head: true })
      .eq("status", "resolved");

    // Calculate response rate
    const responseRate =
      totalAspirasi && totalAspirasi > 0 && resolvedAspirasi
        ? Math.round((resolvedAspirasi / totalAspirasi) * 100)
        : 0;

    // Get recent aspirasi for activity
    const { data: recentAspirasi } = await supabaseAdmin
      .from("aspirasi")
      .select("created_at")
      .order("created_at", { ascending: false })
      .limit(10);

    // Get recent berita for activity
    const { data: recentBerita } = await supabaseAdmin
      .from("data_entries")
      .select("created_at")
      .order("created_at", { ascending: false })
      .limit(10);

    return NextResponse.json({
      success: true,
      data: {
        totalAspirasi: totalAspirasi || 0,
        totalBerita: totalBerita || 0,
        responseRate: responseRate,
        totalKecamatan: 14, // Fixed number for Trenggalek
        recentActivity: {
          aspirasi: recentAspirasi?.length || 0,
          berita: recentBerita?.length || 0,
        },
      },
    });
  } catch (error) {
    console.error("Error fetching portal stats:", error);
    return NextResponse.json(
      { error: "Gagal mengambil statistik portal" },
      { status: 500 }
    );
  }
}
