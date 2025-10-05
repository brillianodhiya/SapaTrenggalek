import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const runtime = "nodejs";
export const maxDuration = 60;

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: NextRequest) {
  try {
    // Verify cron secret for security
    const authHeader = request.headers.get("authorization");
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    console.log("📊 Starting trends analysis job...");

    // Get recent data entries from last 24 hours
    const last24Hours = new Date(Date.now() - 24 * 60 * 60 * 1000);

    const { data: recentEntries, error: entriesError } = await supabase
      .from("data_entries")
      .select("*")
      .gte("created_at", last24Hours.toISOString())
      .order("created_at", { ascending: false });

    if (entriesError) {
      console.error("❌ Error fetching recent entries:", entriesError);
      throw entriesError;
    }

    console.log(`📈 Analyzing ${recentEntries?.length || 0} recent entries...`);

    if (!recentEntries || recentEntries.length === 0) {
      return NextResponse.json({
        success: true,
        message: "No recent entries to analyze",
        timestamp: new Date().toISOString(),
      });
    }

    // Extract and analyze keywords
    const keywordAnalysis = await analyzeKeywordTrends(recentEntries);

    // Detect emerging issues
    const emergingIssues = await detectEmergingIssues(recentEntries);

    // Save keyword trends to database
    await saveKeywordTrends(keywordAnalysis);

    // Save emerging issues to database
    await saveEmergingIssues(emergingIssues);

    console.log("✅ Trends analysis completed successfully");

    return NextResponse.json({
      success: true,
      processed: recentEntries.length,
      keywordTrends: keywordAnalysis.length,
      emergingIssues: emergingIssues.length,
      message: `Analyzed ${recentEntries.length} entries, found ${keywordAnalysis.length} keyword trends and ${emergingIssues.length} emerging issues`,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("❌ Trends analysis job failed:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Trends analysis failed",
        details: error instanceof Error ? error.message : "Unknown error",
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}

async function analyzeKeywordTrends(entries: any[]) {
  console.log("🔍 Extracting keywords from entries...");

  const hourlyKeywords = new Map();
  const now = new Date();

  // Create hourly buckets for the last 24 hours
  for (let i = 0; i < 24; i++) {
    const hourBucket = new Date(now.getTime() - i * 60 * 60 * 1000);
    hourBucket.setMinutes(0, 0, 0);

    entries.forEach((entry) => {
      const entryHour = new Date(entry.created_at);
      entryHour.setMinutes(0, 0, 0);

      // Check if entry belongs to this hour bucket
      if (entryHour.getTime() === hourBucket.getTime()) {
        let keywords: string[] = [];

        // Extract keywords from AI analysis or content
        if (entry.ai_analysis?.keywords) {
          keywords = entry.ai_analysis.keywords;
        } else {
          // Simple keyword extraction
          keywords = extractKeywordsFromContent(entry.content);
        }

        keywords.forEach((keyword: string) => {
          const key = `${keyword}_${hourBucket.toISOString()}`;

          if (!hourlyKeywords.has(key)) {
            hourlyKeywords.set(key, {
              keyword: keyword,
              time_bucket: hourBucket.toISOString(),
              mention_count: 0,
              positive_count: 0,
              negative_count: 0,
              neutral_count: 0,
              sources: {},
            });
          }

          const trend = hourlyKeywords.get(key);
          if (trend) {
            trend.mention_count++;

            // Count sentiment
            const sentiment = entry.sentiment || "neutral";
            trend[`${sentiment}_count`]++;

            // Count sources
            const source = entry.source || "unknown";
            trend.sources[source] = (trend.sources[source] || 0) + 1;
          }
        });
      }
    });
  }

  return Array.from(hourlyKeywords.values()).filter(
    (trend) => trend.mention_count > 0
  );
}

async function detectEmergingIssues(entries: any[]) {
  console.log("🚨 Detecting emerging issues...");

  const issueMap = new Map();
  const urgentThreshold = 7;
  const velocityThreshold = 50;

  // Group entries by similar keywords/topics
  entries.forEach((entry) => {
    if (entry.urgency_level >= urgentThreshold) {
      const keywords =
        entry.ai_analysis?.keywords ||
        extractKeywordsFromContent(entry.content);
      const mainKeyword = keywords[0] || "unknown";

      if (!issueMap.has(mainKeyword)) {
        issueMap.set(mainKeyword, {
          title: generateIssueTitle(keywords, entry.category),
          keywords: keywords.slice(0, 4),
          entries: [],
          first_detected: entry.created_at,
          urgency_scores: [],
          departments: new Set(),
        });
      }

      const issue = issueMap.get(mainKeyword);
      issue.entries.push(entry);
      issue.urgency_scores.push(entry.urgency_level);

      // Determine department relevance
      const department = determineDepartment(keywords, entry.category);
      if (department) {
        issue.departments.add(department);
      }
    }
  });

  // Calculate velocity and filter emerging issues
  const emergingIssues = [];

  for (const [keyword, issue] of issueMap) {
    const timeSpan =
      (new Date().getTime() - new Date(issue.first_detected).getTime()) /
      (1000 * 60 * 60); // hours
    const velocity =
      timeSpan > 0
        ? (issue.entries.length / timeSpan) * 60
        : issue.entries.length; // mentions per hour

    if (velocity >= velocityThreshold || issue.entries.length >= 5) {
      emergingIssues.push({
        title: issue.title,
        keywords: issue.keywords,
        velocity: Math.round(velocity * 10) / 10,
        urgency_score: Math.round(
          issue.urgency_scores.reduce((a: number, b: number) => a + b, 0) /
            issue.urgency_scores.length
        ),
        department_relevance: Array.from(issue.departments),
        status: "active",
        first_detected: issue.first_detected,
      });
    }
  }

  return emergingIssues;
}

async function saveKeywordTrends(trends: any[]) {
  if (trends.length === 0) return;

  console.log(`💾 Saving ${trends.length} keyword trends...`);

  // Clear old trends (older than 7 days)
  const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  await supabase
    .from("keyword_trends")
    .delete()
    .lt("time_bucket", weekAgo.toISOString());

  // Insert new trends in batches
  const batchSize = 50;
  for (let i = 0; i < trends.length; i += batchSize) {
    const batch = trends.slice(i, i + batchSize);

    const { error } = await supabase.from("keyword_trends").upsert(batch, {
      onConflict: "keyword,time_bucket",
      ignoreDuplicates: false,
    });

    if (error) {
      console.error(
        `❌ Error saving trends batch ${i / batchSize + 1}:`,
        error
      );
    } else {
      console.log(
        `✅ Saved trends batch ${i / batchSize + 1}/${Math.ceil(
          trends.length / batchSize
        )}`
      );
    }
  }
}

async function saveEmergingIssues(issues: any[]) {
  if (issues.length === 0) return;

  console.log(`🚨 Saving ${issues.length} emerging issues...`);

  // Clear old active issues (older than 3 days)
  const threeDaysAgo = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000);
  await supabase
    .from("emerging_issues")
    .update({ status: "resolved" })
    .eq("status", "active")
    .lt("first_detected", threeDaysAgo.toISOString());

  // Insert new issues
  const { error } = await supabase.from("emerging_issues").upsert(issues, {
    onConflict: "title",
    ignoreDuplicates: false,
  });

  if (error) {
    console.error("❌ Error saving emerging issues:", error);
  } else {
    console.log("✅ Emerging issues saved successfully");
  }
}

function extractKeywordsFromContent(content: string): string[] {
  const stopWords = [
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
    "the",
    "and",
    "or",
    "but",
    "in",
    "on",
    "at",
    "to",
    "for",
    "of",
    "with",
    "by",
    "is",
    "are",
    "was",
    "were",
    "be",
    "been",
  ];

  return content
    .toLowerCase()
    .replace(/[^\w\s]/g, " ")
    .split(/\s+/)
    .filter((word) => word.length > 3 && !stopWords.includes(word))
    .slice(0, 5); // Take top 5 keywords
}

function generateIssueTitle(keywords: string[], category: string): string {
  const mainKeyword = keywords[0] || "Isu";
  const categoryMap: Record<string, string> = {
    berita: "Berita",
    laporan: "Laporan",
    aspirasi: "Aspirasi Masyarakat",
    lainnya: "Isu",
  };

  const prefix = categoryMap[category] || "Isu";
  return `${prefix} terkait ${
    mainKeyword.charAt(0).toUpperCase() + mainKeyword.slice(1)
  }`;
}

function determineDepartment(
  keywords: string[],
  category: string
): string | null {
  const keywordString = keywords.join(" ").toLowerCase();

  if (
    keywordString.includes("jalan") ||
    keywordString.includes("infrastruktur") ||
    keywordString.includes("perbaikan")
  ) {
    return "Dinas Pekerjaan Umum";
  }
  if (
    keywordString.includes("kesehatan") ||
    keywordString.includes("rumah sakit") ||
    keywordString.includes("dokter")
  ) {
    return "Dinas Kesehatan";
  }
  if (
    keywordString.includes("pendidikan") ||
    keywordString.includes("sekolah") ||
    keywordString.includes("siswa")
  ) {
    return "Dinas Pendidikan";
  }
  if (
    keywordString.includes("ekonomi") ||
    keywordString.includes("usaha") ||
    keywordString.includes("perdagangan")
  ) {
    return "Dinas Perdagangan";
  }
  if (
    keywordString.includes("lingkungan") ||
    keywordString.includes("sampah") ||
    keywordString.includes("kebersihan")
  ) {
    return "Dinas Lingkungan Hidup";
  }
  if (
    keywordString.includes("wisata") ||
    keywordString.includes("pariwisata") ||
    keywordString.includes("festival")
  ) {
    return "Dinas Pariwisata";
  }

  return "Sekretariat Daerah";
}
