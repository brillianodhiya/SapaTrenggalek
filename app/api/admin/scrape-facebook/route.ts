import { NextRequest, NextResponse } from "next/server";
import { FacebookScraper } from "@/lib/facebook-scraper";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  try {
    console.log("📘 Manual Facebook scraping initiated...");

    const {
      type = "page",
      pageId,
      query,
      maxResults = 20,
    } = await request.json();

    const facebookScraper = new FacebookScraper();
    let results = [];

    switch (type) {
      case "page":
        const targetPageId = pageId || "pemkabtrenggalek";
        console.log(`📘 Scraping Facebook page: ${targetPageId}...`);
        results = await facebookScraper.scrapePagePosts(
          targetPageId,
          maxResults
        );
        break;

      case "search":
        if (!query) {
          return NextResponse.json(
            { error: "Query required for Facebook search" },
            { status: 400 }
          );
        }
        console.log(`🔍 Searching Facebook posts for: "${query}"...`);
        results = await facebookScraper.searchPosts(query, maxResults);
        break;

      case "multiple":
        console.log("📘 Scraping multiple Facebook pages...");
        results = await facebookScraper.scrapeAll();
        break;

      default:
        return NextResponse.json(
          { error: "Invalid scraping type. Use: page, search, or multiple" },
          { status: 400 }
        );
    }

    console.log(`✅ Facebook scraping completed: ${results.length} items`);

    // Analyze results
    const analysis = {
      totalPosts: results.length,
      uniquePages: new Set(results.map((r) => r.metadata.page_name || r.author))
        .size,
      postTypes: results.reduce((acc, r) => {
        acc[r.metadata.post_type] = (acc[r.metadata.post_type] || 0) + 1;
        return acc;
      }, {} as Record<string, number>),
      totalEngagement: results.reduce(
        (sum, r) =>
          sum +
          (r.metadata.like_count || 0) +
          (r.metadata.comment_count || 0) +
          (r.metadata.share_count || 0) +
          (r.metadata.reaction_count || 0),
        0
      ),
      topHashtags: getTopHashtags(results),
      engagementStats: {
        avgLikes:
          Math.round(
            results.reduce((sum, r) => sum + (r.metadata.like_count || 0), 0) /
              results.length
          ) || 0,
        avgComments:
          Math.round(
            results.reduce(
              (sum, r) => sum + (r.metadata.comment_count || 0),
              0
            ) / results.length
          ) || 0,
        avgShares:
          Math.round(
            results.reduce((sum, r) => sum + (r.metadata.share_count || 0), 0) /
              results.length
          ) || 0,
        totalLikes: results.reduce(
          (sum, r) => sum + (r.metadata.like_count || 0),
          0
        ),
        totalComments: results.reduce(
          (sum, r) => sum + (r.metadata.comment_count || 0),
          0
        ),
        totalShares: results.reduce(
          (sum, r) => sum + (r.metadata.share_count || 0),
          0
        ),
        totalReactions: results.reduce(
          (sum, r) => sum + (r.metadata.reaction_count || 0),
          0
        ),
      },
    };

    return NextResponse.json({
      success: true,
      type,
      pageId: pageId || null,
      query: query || null,
      results,
      analysis,
      count: results.length,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error("❌ Facebook scraping error:", error);

    // Handle specific Facebook API errors
    if (error.message?.includes("429")) {
      return NextResponse.json(
        {
          error: "Rate limit exceeded",
          message: "Facebook API rate limit reached. Please try again later.",
          retryAfter: "1 hour",
        },
        { status: 429 }
      );
    }

    if (error.message?.includes("401") || error.message?.includes("400")) {
      return NextResponse.json(
        {
          error: "Authentication failed",
          message: "Facebook API credentials are invalid or expired.",
        },
        { status: 401 }
      );
    }

    return NextResponse.json(
      {
        error: "Facebook scraping failed",
        details: error?.message || "Unknown error",
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    return NextResponse.json({
      status: "Facebook scraper ready",
      message: "Facebook Official API ready - menggunakan access token resmi",
      features: {
        pageScraping: "Scrape posts dari Facebook pages tertentu",
        postSearch: "Search posts berdasarkan query (limited)",
        multiplePages: "Scrape dari beberapa pages sekaligus",
        realTimeData: "Data real-time dari Facebook Graph API",
      },
      targetPages: [
        "pemkabtrenggalek",
        "humastrengggalek",
        "dispartrenggalek",
        "trenggalekhits",
        "exploretrenggalek",
      ],
      limitations: {
        searchAccess: "Post search memerlukan special permissions",
        pageAccess:
          "Hanya bisa akses public pages atau pages dengan permission",
        rateLimit: "Rate limiting sesuai Facebook Graph API",
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        error: "Facebook scraper status check failed",
        details: error?.message || "Unknown error",
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
