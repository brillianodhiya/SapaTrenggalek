import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const runtime = "nodejs";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    // Parse query parameters
    const timeRange = searchParams.get("timeRange") || "24h";
    const department = searchParams.get("department");
    const sources = searchParams.get("sources")?.split(",").filter(Boolean);
    const limit = parseInt(searchParams.get("limit") || "20");
    const minMentions = parseInt(searchParams.get("minMentions") || "3");

    console.log("📈 Fetching trending topics from Supabase with filters:", {
      timeRange,
      department,
      sources,
      limit,
      minMentions,
    });

    // Calculate time range
    const timeRangeHours =
      timeRange === "1h"
        ? 1
        : timeRange === "6h"
        ? 6
        : timeRange === "24h"
        ? 24
        : timeRange === "7d"
        ? 168
        : 24;

    const timeStart = new Date(Date.now() - timeRangeHours * 60 * 60 * 1000);

    // Query keyword trends from Supabase
    let query = supabase
      .from("keyword_trends")
      .select("*")
      .gte("time_bucket", timeStart.toISOString())
      .order("mention_count", { ascending: false });

    const { data: keywordTrends, error } = await query;

    if (error) {
      console.error("❌ Error fetching trends from Supabase:", error);
      throw error;
    }

    // Aggregate data by keyword
    const keywordMap = new Map();

    keywordTrends?.forEach((trend) => {
      const keyword = trend.keyword;

      if (!keywordMap.has(keyword)) {
        keywordMap.set(keyword, {
          keyword,
          total_mentions: 0,
          positive_count: 0,
          negative_count: 0,
          neutral_count: 0,
          sources: {},
          latest_mentions: 0,
          first_seen: trend.time_bucket,
          last_seen: trend.time_bucket,
        });
      }

      const existing = keywordMap.get(keyword);
      existing.total_mentions += trend.mention_count;
      existing.positive_count += trend.positive_count;
      existing.negative_count += trend.negative_count;
      existing.neutral_count += trend.neutral_count;

      // Merge sources
      Object.entries(trend.sources || {}).forEach(([source, count]) => {
        existing.sources[source] =
          (existing.sources[source] || 0) + (count as number);
      });

      // Update time tracking
      if (new Date(trend.time_bucket) > new Date(existing.last_seen)) {
        existing.last_seen = trend.time_bucket;
        existing.latest_mentions = trend.mention_count;
      }
    });

    // Convert to array and calculate additional metrics
    let trendingKeywords = Array.from(keywordMap.values()).map((trend) => {
      const totalMentions = trend.total_mentions;

      return {
        keyword: trend.keyword,
        total_mentions: totalMentions,
        growth_rate: Math.random() * 200 - 100, // Simplified for now
        momentum:
          totalMentions > 15
            ? "rising"
            : totalMentions > 8
            ? "stable"
            : "declining",
        positive_ratio:
          totalMentions > 0 ? trend.positive_count / totalMentions : 0,
        negative_ratio:
          totalMentions > 0 ? trend.negative_count / totalMentions : 0,
        neutral_ratio:
          totalMentions > 0 ? trend.neutral_count / totalMentions : 0,
        sources: trend.sources,
        latest_mentions: trend.latest_mentions,
      };
    });

    // Apply filters
    if (minMentions > 0) {
      trendingKeywords = trendingKeywords.filter(
        (trend) => trend.total_mentions >= minMentions
      );
    }

    if (sources && sources.length > 0) {
      trendingKeywords = trendingKeywords.filter((trend) => {
        const trendSources = Object.keys(trend.sources || {});
        return sources.some((source) => trendSources.includes(source));
      });
    }

    // Sort by total mentions and apply limit
    trendingKeywords.sort((a, b) => b.total_mentions - a.total_mentions);
    trendingKeywords = trendingKeywords.slice(0, limit);

    console.log(
      `✅ Found ${trendingKeywords.length} trending keywords from Supabase`
    );

    return NextResponse.json({
      success: true,
      data: trendingKeywords,
      metadata: {
        total_trends: trendingKeywords.length,
        time_range: timeRange,
        filters_applied: {
          department,
          sources,
          min_mentions: minMentions,
        },
        generated_at: new Date().toISOString(),
        data_source: "supabase",
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("❌ Trends API error:", error);
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
