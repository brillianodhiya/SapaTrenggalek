import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    // Parse query parameters
    const urgencyMin = parseInt(searchParams.get("urgencyMin") || "7");
    const categories =
      searchParams.get("categories")?.split(",").filter(Boolean) || null;
    const sources =
      searchParams.get("sources")?.split(",").filter(Boolean) || null;
    const timeRangeHours = searchParams.get("timeRange")
      ? parseInt(searchParams.get("timeRange")!)
      : null;
    const statusFilter =
      searchParams.get("status")?.split(",").filter(Boolean) || null;
    const limit = parseInt(searchParams.get("limit") || "50");
    const offset = parseInt(searchParams.get("offset") || "0");
    const search = searchParams.get("search") || "";

    console.log("🚨 Fetching urgent items with filters:", {
      urgencyMin,
      categories,
      sources,
      timeRangeHours,
      statusFilter,
      limit,
      offset,
      search,
    });

    // Build the query
    let query = supabaseAdmin
      .from("data_entries")
      .select(
        `
        id,
        content,
        source,
        source_url,
        author,
        category,
        sentiment,
        urgency_level,
        status,
        assigned_to,
        handled_by,
        handled_at,
        escalated_at,
        escalation_reason,
        ai_analysis,
        created_at,
        updated_at
      `
      )
      .gte("urgency_level", urgencyMin)
      .order("urgency_level", { ascending: false })
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1);

    // Apply filters
    if (categories && categories.length > 0) {
      query = query.in("category", categories);
    }

    if (sources && sources.length > 0) {
      query = query.in("source", sources);
    }

    if (statusFilter && statusFilter.length > 0) {
      query = query.in("status", statusFilter);
    }

    if (timeRangeHours) {
      const timeThreshold = new Date();
      timeThreshold.setHours(timeThreshold.getHours() - timeRangeHours);
      query = query.gte("created_at", timeThreshold.toISOString());
    }

    if (search) {
      query = query.ilike("content", `%${search}%`);
    }

    const { data: urgentItems, error, count } = await query;

    if (error) {
      console.error("❌ Error fetching urgent items:", error);
      return NextResponse.json(
        { error: "Failed to fetch urgent items", details: error.message },
        { status: 500 }
      );
    }

    // Get total count for pagination
    let countQuery = supabaseAdmin
      .from("data_entries")
      .select("*", { count: "exact", head: true })
      .gte("urgency_level", urgencyMin);

    if (categories && categories.length > 0) {
      countQuery = countQuery.in("category", categories);
    }
    if (sources && sources.length > 0) {
      countQuery = countQuery.in("source", sources);
    }
    if (statusFilter && statusFilter.length > 0) {
      countQuery = countQuery.in("status", statusFilter);
    }
    if (timeRangeHours) {
      const timeThreshold = new Date();
      timeThreshold.setHours(timeThreshold.getHours() - timeRangeHours);
      countQuery = countQuery.gte("created_at", timeThreshold.toISOString());
    }
    if (search) {
      countQuery = countQuery.ilike("content", `%${search}%`);
    }

    const { count: totalCount } = await countQuery;

    console.log(
      `✅ Found ${urgentItems?.length || 0} urgent items (${totalCount} total)`
    );

    return NextResponse.json({
      success: true,
      data: urgentItems || [],
      pagination: {
        total: totalCount || 0,
        limit,
        offset,
        hasMore: (totalCount || 0) > offset + limit,
      },
      filters: {
        urgencyMin,
        categories,
        sources,
        timeRangeHours,
        statusFilter,
        search,
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("❌ Urgent items API error:", error);
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
