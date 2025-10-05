import { NextRequest, NextResponse } from "next/server";
import { TwitterScraper } from "@/lib/twitter-scraper";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  try {
    console.log("🐦 Manual Twitter scraping initiated...");

    const { type = "recent", username, maxResults = 50 } = await request.json();

    const twitterScraper = new TwitterScraper();
    let results = [];

    switch (type) {
      case "recent":
        console.log("🔍 Scraping recent tweets about Trenggalek...");
        results = await twitterScraper.scrapeRecentTweets(maxResults);
        break;

      case "user":
        if (!username) {
          return NextResponse.json(
            { error: "Username required for user timeline scraping" },
            { status: 400 }
          );
        }
        console.log(`👤 Scraping timeline for @${username}...`);
        results = await twitterScraper.scrapeUserTimeline(username, maxResults);
        break;

      case "trending":
        console.log("📈 Getting trending topics...");
        const trends = await twitterScraper.getTrendingTopics();
        return NextResponse.json({
          success: true,
          type: "trending",
          trends,
          count: trends.length,
          timestamp: new Date().toISOString(),
        });

      default:
        return NextResponse.json(
          { error: "Invalid scraping type. Use: recent, user, or trending" },
          { status: 400 }
        );
    }

    console.log(`✅ Twitter scraping completed: ${results.length} items`);

    // Analyze results
    const analysis = {
      totalTweets: results.length,
      uniqueUsers: new Set(results.map((r) => r.metadata.username)).size,
      totalEngagement: results.reduce(
        (sum, r) => sum + r.metadata.like_count + r.metadata.retweet_count,
        0
      ),
      topHashtags: getTopHashtags(results),
      engagementStats: {
        avgLikes:
          Math.round(
            results.reduce((sum, r) => sum + r.metadata.like_count, 0) /
              results.length
          ) || 0,
        avgRetweets:
          Math.round(
            results.reduce((sum, r) => sum + r.metadata.retweet_count, 0) /
              results.length
          ) || 0,
        totalReplies: results.reduce(
          (sum, r) => sum + r.metadata.reply_count,
          0
        ),
      },
    };

    return NextResponse.json({
      success: true,
      type,
      username: username || null,
      results,
      analysis,
      count: results.length,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error("❌ Twitter scraping error:", error);

    // Handle specific Twitter API errors
    if (error.code === 429) {
      return NextResponse.json(
        {
          error: "Rate limit exceeded",
          message: "Twitter API rate limit reached. Please try again later.",
          retryAfter: "15 minutes",
        },
        { status: 429 }
      );
    }

    if (error.code === 401) {
      return NextResponse.json(
        {
          error: "Authentication failed",
          message: "Twitter API credentials are invalid or expired.",
        },
        { status: 401 }
      );
    }

    return NextResponse.json(
      {
        error: "Twitter scraping failed",
        details: error.message,
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    // Quick status check
    const twitterScraper = new TwitterScraper();

    // Check if Twitter API is configured
    const isConfigured = !!(
      process.env.TWITTER_API_KEY &&
      process.env.TWITTER_API_SECRET &&
      process.env.TWITTER_ACCESS_TOKEN &&
      process.env.TWITTER_ACCESS_TOKEN_SECRET
    );

    return NextResponse.json({
      status: "Twitter scraper ready",
      configured: isConfigured,
      message: isConfigured
        ? "Twitter API credentials are configured"
        : "Twitter API credentials not found. Please configure environment variables.",
      requiredEnvVars: [
        "TWITTER_API_KEY",
        "TWITTER_API_SECRET",
        "TWITTER_ACCESS_TOKEN",
        "TWITTER_ACCESS_TOKEN_SECRET",
      ],
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        error: "Twitter scraper status check failed",
        details: error.message,
      },
      { status: 500 }
    );
  }
}

// Helper function to get top hashtags
function getTopHashtags(
  results: any[]
): Array<{ hashtag: string; count: number }> {
  const hashtagCounts = new Map<string, number>();

  results.forEach((result) => {
    result.metadata.hashtags.forEach((hashtag: string) => {
      hashtagCounts.set(hashtag, (hashtagCounts.get(hashtag) || 0) + 1);
    });
  });

  return Array.from(hashtagCounts.entries())
    .sort(([, a], [, b]) => b - a)
    .slice(0, 10)
    .map(([hashtag, count]) => ({ hashtag, count }));
}
