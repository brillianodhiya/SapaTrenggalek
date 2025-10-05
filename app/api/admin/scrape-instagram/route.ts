import { NextRequest, NextResponse } from "next/server";
import { InstagramScraper } from "@/lib/instagram-scraper-api";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  try {
    console.log("📸 Manual Instagram scraping initiated...");

    const {
      type = "user",
      username,
      hashtag,
      maxResults = 20,
    } = await request.json();

    const instagramScraper = new InstagramScraper();
    let results = [];

    switch (type) {
      case "user":
        const targetUsername = username || "pemkabtrenggalek";
        console.log(`👤 Scraping Instagram media for @${targetUsername}...`);
        results = await instagramScraper.scrapeUserMedia(
          targetUsername,
          maxResults
        );
        break;

      case "hashtag":
        if (!hashtag) {
          return NextResponse.json(
            { error: "Hashtag required for hashtag media scraping" },
            { status: 400 }
          );
        }
        console.log(`#️⃣ Scraping Instagram hashtag #${hashtag}...`);
        results = await instagramScraper.scrapeHashtagMedia(
          hashtag,
          maxResults
        );
        break;

      case "multiple":
        console.log("📸 Scraping multiple Instagram accounts...");
        results = await instagramScraper.scrapeAll();
        break;

      default:
        return NextResponse.json(
          { error: "Invalid scraping type. Use: user, hashtag, or multiple" },
          { status: 400 }
        );
    }

    console.log(`✅ Instagram scraping completed: ${results.length} items`);

    // Analyze results
    const analysis = {
      totalPosts: results.length,
      uniqueUsers: new Set(results.map((r) => r.metadata.username)).size,
      mediaTypes: results.reduce((acc, r) => {
        acc[r.metadata.media_type] = (acc[r.metadata.media_type] || 0) + 1;
        return acc;
      }, {} as Record<string, number>),
      totalEngagement: results.reduce(
        (sum, r) =>
          sum + (r.metadata.like_count || 0) + (r.metadata.comments_count || 0),
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
              (sum, r) => sum + (r.metadata.comments_count || 0),
              0
            ) / results.length
          ) || 0,
        totalLikes: results.reduce(
          (sum, r) => sum + (r.metadata.like_count || 0),
          0
        ),
        totalComments: results.reduce(
          (sum, r) => sum + (r.metadata.comments_count || 0),
          0
        ),
      },
    };

    return NextResponse.json({
      success: true,
      type,
      username: username || null,
      hashtag: hashtag || null,
      results,
      analysis,
      count: results.length,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error("❌ Instagram scraping error:", error);

    // Handle specific Instagram API errors
    if (error.message?.includes("429")) {
      return NextResponse.json(
        {
          error: "Rate limit exceeded",
          message: "Instagram API rate limit reached. Please try again later.",
          retryAfter: "1 hour",
        },
        { status: 429 }
      );
    }

    if (error.message?.includes("401") || error.message?.includes("400")) {
      return NextResponse.json(
        {
          error: "Authentication failed",
          message: "Instagram API credentials are invalid or expired.",
        },
        { status: 401 }
      );
    }

    return NextResponse.json(
      {
        error: "Instagram scraping failed",
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
      status: "Instagram Official API ready",
      message:
        "Instagram Official API configured - menggunakan access token resmi",
      features: {
        authenticatedUserMedia: "Scrape posts dari akun yang terautentikasi",
        officialAPI: "Menggunakan Instagram Graph API resmi",
        rateLimit: "Rate limiting sesuai kebijakan Instagram",
        businessFeatures: "Fitur business tersedia setelah verifikasi",
      },
      limitations: {
        userAccess: "Hanya bisa akses media dari akun yang terautentikasi",
        hashtagAccess: "Hashtag search memerlukan business account",
        publicAccess: "Akses akun publik lain memerlukan izin khusus",
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        error: "Instagram scraper status check failed",
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
