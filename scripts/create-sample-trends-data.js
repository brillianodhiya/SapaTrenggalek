const { createClient } = require("@supabase/supabase-js");

// Load environment variables
require("dotenv").config({ path: ".env.local" });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error("❌ Missing Supabase environment variables");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function createSampleTrendsData() {
  try {
    console.log("🚀 Creating sample trends data...");

    // For now, let's create a simple trends analysis from existing data
    // We'll extract keywords from existing data_entries and create trend data

    // Get recent data entries
    const { data: entries, error: entriesError } = await supabase
      .from("data_entries")
      .select("content, category, sentiment, created_at, ai_analysis")
      .gte(
        "created_at",
        new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
      ) // Last 7 days
      .limit(100);

    if (entriesError) {
      console.error("❌ Error fetching entries:", entriesError.message);
      return;
    }

    console.log(`📊 Analyzing ${entries?.length || 0} entries for trends...`);

    // Extract keywords and create trend data
    const keywordCounts = {};
    const keywordSentiments = {};
    const keywordSources = {};

    entries?.forEach((entry) => {
      // Extract keywords from AI analysis or content
      let keywords = [];

      if (entry.ai_analysis?.keywords) {
        keywords = entry.ai_analysis.keywords;
      } else {
        // Simple keyword extraction from content
        const words = entry.content
          .toLowerCase()
          .replace(/[^\w\s]/g, " ")
          .split(/\s+/)
          .filter((word) => word.length > 3)
          .filter(
            (word) =>
              ![
                "yang",
                "untuk",
                "dengan",
                "dari",
                "akan",
                "pada",
                "dalam",
                "adalah",
                "atau",
                "dan",
                "ini",
                "itu",
                "tidak",
                "juga",
                "dapat",
                "sudah",
                "telah",
                "bisa",
                "harus",
                "saja",
                "lebih",
                "masih",
                "sangat",
                "sekali",
                "paling",
                "cukup",
                "agak",
                "kurang",
              ].includes(word)
          );

        keywords = words.slice(0, 5); // Take first 5 meaningful words
      }

      keywords.forEach((keyword) => {
        if (!keywordCounts[keyword]) {
          keywordCounts[keyword] = 0;
          keywordSentiments[keyword] = { positive: 0, negative: 0, neutral: 0 };
          keywordSources[keyword] = {};
        }

        keywordCounts[keyword]++;
        keywordSentiments[keyword][entry.sentiment || "neutral"]++;

        const source = entry.source || "unknown";
        keywordSources[keyword][source] =
          (keywordSources[keyword][source] || 0) + 1;
      });
    });

    // Get top trending keywords
    const trendingKeywords = Object.entries(keywordCounts)
      .filter(([keyword, count]) => count >= 3) // Minimum 3 mentions
      .sort(([, a], [, b]) => b - a)
      .slice(0, 20)
      .map(([keyword, count]) => ({
        keyword,
        total_mentions: count,
        growth_rate: Math.random() * 200 - 50, // Mock growth rate
        momentum: count > 10 ? "rising" : count > 5 ? "stable" : "declining",
        positive_ratio: keywordSentiments[keyword].positive / count,
        negative_ratio: keywordSentiments[keyword].negative / count,
        neutral_ratio: keywordSentiments[keyword].neutral / count,
        sources: keywordSources[keyword],
        latest_mentions: Math.floor(count * 0.3), // Mock recent mentions
      }));

    console.log("📈 Top trending keywords:");
    trendingKeywords.slice(0, 10).forEach((trend, i) => {
      console.log(
        `${i + 1}. ${trend.keyword} (${trend.total_mentions} mentions, ${
          trend.momentum
        })`
      );
    });

    // Create mock emerging issues
    const emergingIssues = [
      {
        title: "Infrastruktur Jalan Rusak",
        keywords: ["jalan", "rusak", "infrastruktur", "perbaikan"],
        velocity: 150.5,
        urgency_score: 8,
        mention_count: 25,
        first_mention: new Date(Date.now() - 6 * 60 * 60 * 1000), // 6 hours ago
      },
      {
        title: "Pelayanan Kesehatan",
        keywords: ["kesehatan", "pelayanan", "rumah sakit", "dokter"],
        velocity: 89.2,
        urgency_score: 6,
        mention_count: 18,
        first_mention: new Date(Date.now() - 12 * 60 * 60 * 1000), // 12 hours ago
      },
      {
        title: "Pendidikan Online",
        keywords: ["pendidikan", "sekolah", "online", "siswa"],
        velocity: 67.8,
        urgency_score: 4,
        mention_count: 12,
        first_mention: new Date(Date.now() - 24 * 60 * 60 * 1000), // 24 hours ago
      },
    ];

    console.log("🚨 Emerging issues detected:");
    emergingIssues.forEach((issue, i) => {
      console.log(
        `${i + 1}. ${issue.title} (velocity: ${issue.velocity}, urgency: ${
          issue.urgency_score
        })`
      );
    });

    // Create keyword cloud data
    const keywordCloud = trendingKeywords.slice(0, 30).map((trend) => ({
      text: trend.keyword,
      weight: trend.total_mentions,
      sentiment:
        trend.positive_ratio > trend.negative_ratio
          ? "positive"
          : trend.negative_ratio > trend.positive_ratio
          ? "negative"
          : "neutral",
      category: "general",
    }));

    console.log("☁️ Keyword cloud ready with", keywordCloud.length, "keywords");

    // Store this data in a simple format for the API to use
    const trendsData = {
      trending_keywords: trendingKeywords,
      emerging_issues: emergingIssues,
      keyword_cloud: keywordCloud,
      generated_at: new Date().toISOString(),
      data_source: "analysis_of_existing_entries",
    };

    // Save to a JSON file for now (since we can't create tables directly)
    const fs = require("fs");
    const path = require("path");

    const dataPath = path.join(__dirname, "../data/trends-cache.json");

    // Create data directory if it doesn't exist
    const dataDir = path.dirname(dataPath);
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }

    fs.writeFileSync(dataPath, JSON.stringify(trendsData, null, 2));

    console.log("✅ Trends data generated and saved to data/trends-cache.json");
    console.log("📊 Summary:");
    console.log(`   - ${trendingKeywords.length} trending keywords`);
    console.log(`   - ${emergingIssues.length} emerging issues`);
    console.log(`   - ${keywordCloud.length} keyword cloud items`);
  } catch (error) {
    console.error("❌ Error creating trends data:", error.message);
    process.exit(1);
  }
}

createSampleTrendsData();
