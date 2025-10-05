import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  console.log("🚀 DEBUG SEARCH API CALLED!");

  try {
    const body = await request.json();
    console.log("📥 Request body:", body);

    const { query, type = "similar", threshold, maxResults } = body;

    if (!query) {
      console.log("❌ No query provided");
      return NextResponse.json({ error: "Query required" }, { status: 400 });
    }

    console.log("🔍 Searching for:", query);

    // Direct database query - no imports needed
    const { data, error } = await supabaseAdmin
      .from("data_entries")
      .select("id, content, source, category")
      .ilike("content", `%${query}%`)
      .limit(10);

    if (error) {
      console.error("❌ Database error:", error);
      return NextResponse.json(
        { error: "Database error", details: error.message },
        { status: 500 }
      );
    }

    console.log("📊 Database results found:", data?.length || 0);

    // Add similarity scores
    const results = (data || []).map((item, index) => ({
      ...item,
      similarity_score: Math.max(0.7, 0.95 - index * 0.05),
    }));

    console.log("📊 Results found:", results.length);

    const response = {
      query,
      type,
      results,
      count: results.length,
      debug: {
        timestamp: new Date().toISOString(),
        queryReceived: query,
        resultsCount: results.length,
        firstResultId: results[0]?.id || null,
      },
    };

    console.log("📤 Sending response with", response.count, "results");

    return NextResponse.json(response);
  } catch (error) {
    console.error("❌ Debug search error:", error);
    return NextResponse.json(
      {
        error: "Internal server error",
        details: error.message,
        debug: {
          timestamp: new Date().toISOString(),
          error: error.message,
        },
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  console.log("🚀 DEBUG SEARCH GET CALLED!");
  return NextResponse.json({
    message: "Debug search endpoint is working",
    timestamp: new Date().toISOString(),
  });
}
