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
    const limit = parseInt(searchParams.get("limit") || "50");
    const minWeight = parseInt(searchParams.get("minWeight") || "2");
    const categories = searchParams
      .get("categories")
      ?.split(",")
      .filter(Boolean);

    console.log("☁️ Fetching keyword cloud data from Supabase with filters:", {
      timeRange,
      limit,
      minWeight,
      categories,
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
    const { data: keywordTrends, error } = await supabase
      .from("keyword_trends")
      .select("*")
      .gte("time_bucket", timeStart.toISOString())
      .order("mention_count", { ascending: false });

    if (error) {
      console.error("❌ Error fetching keyword trends from Supabase:", error);
      throw error;
    }

    // Aggregate data by keyword for cloud visualization
    const keywordMap = new Map();

    keywordTrends?.forEach((trend) => {
      const keyword = trend.keyword;

      if (!keywordMap.has(keyword)) {
        keywordMap.set(keyword, {
          text: keyword,
          weight: 0,
          positive_count: 0,
          negative_count: 0,
          neutral_count: 0,
        });
      }

      const existing = keywordMap.get(keyword);
      existing.weight += trend.mention_count;
      existing.positive_count += trend.positive_count;
      existing.negative_count += trend.negative_count;
      existing.neutral_count += trend.neutral_count;
    });

    // Convert to array and process
    let keywordCloud = Array.from(keywordMap.values()).map((keyword, index) => {
      const totalMentions = keyword.weight;
      const sentiment =
        keyword.positive_count > keyword.negative_count &&
        keyword.positive_count > keyword.neutral_count
          ? "positive"
          : keyword.negative_count > keyword.positive_count &&
            keyword.negative_count > keyword.neutral_count
          ? "negative"
          : "neutral";

      return {
        id: `keyword_${index}`,
        text: keyword.text,
        weight: totalMentions,
        sentiment,
        category: "general", // Default category
        color: getSentimentColor(sentiment),
      };
    });

    // Apply filters
    keywordCloud = keywordCloud.filter((keyword) => {
      // Weight filter
      if (keyword.weight < minWeight) return false;

      // Category filter
      if (
        categories &&
        categories.length > 0 &&
        !categories.includes(keyword.category)
      ) {
        return false;
      }

      return true;
    });

    // Sort by weight and apply limit
    keywordCloud.sort((a, b) => b.weight - a.weight);
    keywordCloud = keywordCloud.slice(0, limit);

    // Add additional computed fields for better visualization
    const maxWeight =
      keywordCloud.length > 0
        ? Math.max(...keywordCloud.map((k) => k.weight))
        : 0;
    const minWeightInData =
      keywordCloud.length > 0
        ? Math.min(...keywordCloud.map((k) => k.weight))
        : 0;

    keywordCloud = keywordCloud.map((keyword, index) => ({
      ...keyword,
      normalized_weight:
        maxWeight > minWeightInData
          ? ((keyword.weight - minWeightInData) /
              (maxWeight - minWeightInData)) *
            100
          : 100,
      rank: index + 1,
      font_size: Math.max(
        12,
        Math.min(48, 12 + (keyword.weight / (maxWeight || 1)) * 36)
      ),
    }));

    // Calculate statistics
    const totalMentions = keywordCloud.reduce((sum, k) => sum + k.weight, 0);
    const sentimentDistribution = keywordCloud.reduce((acc: any, k) => {
      acc[k.sentiment] = (acc[k.sentiment] || 0) + 1;
      return acc;
    }, {});

    console.log(
      `✅ Generated keyword cloud with ${keywordCloud.length} keywords from Supabase`
    );

    return NextResponse.json({
      success: true,
      data: {
        keywords: keywordCloud,
        total_mentions: totalMentions,
        time_range: timeRange,
        max_weight: maxWeight,
        min_weight: minWeightInData,
      },
      metadata: {
        total_keywords: keywordCloud.length,
        sentiment_distribution: sentimentDistribution,
        weight_range: {
          min: minWeightInData,
          max: maxWeight,
          avg:
            keywordCloud.length > 0
              ? Math.round(totalMentions / keywordCloud.length)
              : 0,
        },
        filters_applied: {
          timeRange,
          limit,
          minWeight,
          categories,
        },
        generated_at: new Date().toISOString(),
        data_source: "supabase",
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("❌ Keywords API error:", error);
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

function getSentimentColor(sentiment: string): string {
  switch (sentiment) {
    case "positive":
      return "#10b981"; // green
    case "negative":
      return "#ef4444"; // red
    case "neutral":
    default:
      return "#6b7280"; // gray
  }
}
