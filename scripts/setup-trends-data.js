const { createClient } = require("@supabase/supabase-js");
const fs = require("fs");

// Load environment variables
require("dotenv").config({ path: ".env.local" });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error("❌ Missing Supabase environment variables");
  console.log(
    "Make sure you have NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env.local"
  );
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function setupTrendsData() {
  try {
    console.log("🚀 Setting up trends data...");

    // Check if tables exist by trying to query them
    console.log("📝 Checking if trends tables exist...");

    const { data: keywordData, error: keywordError } = await supabase
      .from("keyword_trends")
      .select("*")
      .limit(1);

    if (keywordError) {
      console.log("❌ keyword_trends table not found:", keywordError.message);
      console.log("💡 Please run the SQL migration first:");
      console.log("   1. Open Supabase Dashboard > SQL Editor");
      console.log("   2. Run the contents of sql/trends-tables-only.sql");
      return;
    }

    console.log("✅ keyword_trends table exists");

    // Check emerging_issues table
    const { data: issuesData, error: issuesError } = await supabase
      .from("emerging_issues")
      .select("*")
      .limit(1);

    if (issuesError) {
      console.log("❌ emerging_issues table not found:", issuesError.message);
      return;
    }

    console.log("✅ emerging_issues table exists");

    // Now populate with sample data
    console.log("📊 Populating sample trends data...");

    // Sample keyword trends data
    const sampleKeywordTrends = [
      {
        keyword: "Trenggalek",
        time_bucket: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        mention_count: 15,
        positive_count: 8,
        negative_count: 2,
        neutral_count: 5,
        sources: { twitter: 8, facebook: 4, instagram: 3 },
      },
      {
        keyword: "Infrastruktur",
        time_bucket: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
        mention_count: 12,
        positive_count: 3,
        negative_count: 7,
        neutral_count: 2,
        sources: { twitter: 5, facebook: 7 },
      },
      {
        keyword: "Pelayanan Publik",
        time_bucket: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
        mention_count: 8,
        positive_count: 2,
        negative_count: 4,
        neutral_count: 2,
        sources: { facebook: 5, instagram: 3 },
      },
      {
        keyword: "Festival Jaranan",
        time_bucket: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
        mention_count: 20,
        positive_count: 18,
        negative_count: 0,
        neutral_count: 2,
        sources: { instagram: 12, facebook: 8 },
      },
    ];

    // Clear existing data
    await supabase
      .from("keyword_trends")
      .delete()
      .neq("id", "00000000-0000-0000-0000-000000000000");

    // Insert sample data
    const { error: insertError } = await supabase
      .from("keyword_trends")
      .insert(sampleKeywordTrends);

    if (insertError) {
      console.error("❌ Error inserting keyword trends:", insertError.message);
      return;
    }

    console.log("✅ Sample keyword trends inserted");

    // Sample emerging issues
    const sampleEmergingIssues = [
      {
        title: "Jalan Rusak di Kecamatan Trenggalek",
        keywords: ["jalan", "rusak", "trenggalek", "infrastruktur"],
        velocity: 125.5,
        urgency_score: 8,
        department_relevance: ["Dinas Pekerjaan Umum"],
        status: "active",
        first_detected: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
      },
      {
        title: "Antrian Panjang di Puskesmas",
        keywords: ["puskesmas", "antrian", "pelayanan", "kesehatan"],
        velocity: 89.2,
        urgency_score: 6,
        department_relevance: ["Dinas Kesehatan"],
        status: "active",
        first_detected: new Date(
          Date.now() - 12 * 60 * 60 * 1000
        ).toISOString(),
      },
    ];

    // Clear existing emerging issues
    await supabase
      .from("emerging_issues")
      .delete()
      .neq("id", "00000000-0000-0000-0000-000000000000");

    // Insert sample emerging issues
    const { error: issuesInsertError } = await supabase
      .from("emerging_issues")
      .insert(sampleEmergingIssues);

    if (issuesInsertError) {
      console.error(
        "❌ Error inserting emerging issues:",
        issuesInsertError.message
      );
      return;
    }

    console.log("✅ Sample emerging issues inserted");

    // Verify data
    const { count: keywordCount } = await supabase
      .from("keyword_trends")
      .select("*", { count: "exact", head: true });

    const { count: issuesCount } = await supabase
      .from("emerging_issues")
      .select("*", { count: "exact", head: true });

    console.log("");
    console.log("🎉 Trends data setup completed!");
    console.log(`📊 Summary:`);
    console.log(`   - Keyword trends: ${keywordCount} records`);
    console.log(`   - Emerging issues: ${issuesCount} records`);
    console.log("");
    console.log(
      "🔄 Next: Update API endpoints to use Supabase data instead of cache file"
    );
  } catch (error) {
    console.error("❌ Error setting up trends data:", error.message);
    console.error(error);
  }
}

setupTrendsData();
