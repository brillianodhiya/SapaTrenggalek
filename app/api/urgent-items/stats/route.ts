import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const urgencyMin = parseInt(searchParams.get("urgencyMin") || "7");
    const timeRangeHours = parseInt(searchParams.get("timeRange") || "24");

    console.log(
      `📊 Fetching urgent items statistics (urgency >= ${urgencyMin}, last ${timeRangeHours}h)`
    );

    const timeThreshold = new Date();
    timeThreshold.setHours(timeThreshold.getHours() - timeRangeHours);

    // Get total urgent items
    const { count: totalUrgent } = await supabaseAdmin
      .from("data_entries")
      .select("*", { count: "exact", head: true })
      .gte("urgency_level", urgencyMin)
      .gte("created_at", timeThreshold.toISOString());

    // Get category breakdown
    const { data: categoryData } = await supabaseAdmin
      .from("data_entries")
      .select("category")
      .gte("urgency_level", urgencyMin)
      .gte("created_at", timeThreshold.toISOString());

    const byCategory =
      categoryData?.reduce((acc: Record<string, number>, item) => {
        acc[item.category] = (acc[item.category] || 0) + 1;
        return acc;
      }, {}) || {};

    // Get source breakdown
    const { data: sourceData } = await supabaseAdmin
      .from("data_entries")
      .select("source")
      .gte("urgency_level", urgencyMin)
      .gte("created_at", timeThreshold.toISOString());

    const bySource =
      sourceData?.reduce((acc: Record<string, number>, item) => {
        acc[item.source] = (acc[item.source] || 0) + 1;
        return acc;
      }, {}) || {};

    // Get status breakdown
    const { data: statusData } = await supabaseAdmin
      .from("data_entries")
      .select("status")
      .gte("urgency_level", urgencyMin)
      .gte("created_at", timeThreshold.toISOString());

    const byStatus =
      statusData?.reduce((acc: Record<string, number>, item) => {
        acc[item.status] = (acc[item.status] || 0) + 1;
        return acc;
      }, {}) || {};

    // Calculate average response time for handled items
    const { data: handledItems } = await supabaseAdmin
      .from("data_entries")
      .select("created_at, handled_at")
      .gte("urgency_level", urgencyMin)
      .gte("created_at", timeThreshold.toISOString())
      .eq("status", "handled")
      .not("handled_at", "is", null);

    let avgResponseTime = 0;
    if (handledItems && handledItems.length > 0) {
      const totalResponseTime = handledItems.reduce((sum, item) => {
        const created = new Date(item.created_at).getTime();
        const handled = new Date(item.handled_at).getTime();
        return sum + (handled - created);
      }, 0);
      avgResponseTime = totalResponseTime / handledItems.length / (1000 * 60); // Convert to minutes
    }

    // Count handled today
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const { count: handledToday } = await supabaseAdmin
      .from("data_entries")
      .select("*", { count: "exact", head: true })
      .gte("urgency_level", urgencyMin)
      .eq("status", "handled")
      .gte("handled_at", today.toISOString());

    // Count escalated today
    const { count: escalatedToday } = await supabaseAdmin
      .from("data_entries")
      .select("*", { count: "exact", head: true })
      .gte("urgency_level", urgencyMin)
      .eq("status", "escalated")
      .gte("escalated_at", today.toISOString());

    // Get hourly trends for last 24 hours
    const last24Hours = new Date();
    last24Hours.setHours(last24Hours.getHours() - 24);

    const { data: hourlyData } = await supabaseAdmin
      .from("data_entries")
      .select("created_at")
      .gte("urgency_level", urgencyMin)
      .gte("created_at", last24Hours.toISOString());

    const trendsHourly: Record<string, number> = {};

    // Initialize all hours with 0
    for (let i = 0; i < 24; i++) {
      const hour = new Date();
      hour.setHours(hour.getHours() - i, 0, 0, 0);
      const hourLabel = hour.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      });
      trendsHourly[hourLabel] = 0;
    }

    // Count items per hour
    hourlyData?.forEach((item) => {
      const itemHour = new Date(item.created_at);
      itemHour.setMinutes(0, 0, 0);
      const hourLabel = itemHour.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      });
      if (trendsHourly.hasOwnProperty(hourLabel)) {
        trendsHourly[hourLabel]++;
      }
    });

    const stats = {
      total_urgent: totalUrgent || 0,
      by_category: byCategory,
      by_source: bySource,
      by_status: byStatus,
      avg_response_time_minutes: Math.round(avgResponseTime * 100) / 100,
      handled_today: handledToday || 0,
      escalated_today: escalatedToday || 0,
      trends_hourly: trendsHourly,
    };

    console.log(`✅ Generated urgent items statistics:`, {
      total: stats.total_urgent,
      categories: Object.keys(byCategory).length,
      avgResponse: stats.avg_response_time_minutes,
    });

    return NextResponse.json({
      success: true,
      data: stats,
      filters: {
        urgencyMin,
        timeRangeHours,
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("❌ Urgent items stats API error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Internal server error",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
