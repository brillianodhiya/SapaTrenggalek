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

async function addMoreTrendsData() {
  try {
    console.log("🚀 Adding more comprehensive trends data...");

    // More comprehensive keyword trends data
    const moreKeywordTrends = [
      // Recent trends (last 2 hours)
      {
        keyword: "Festival Jaranan",
        time_bucket: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
        mention_count: 25,
        positive_count: 22,
        negative_count: 1,
        neutral_count: 2,
        sources: { instagram: 15, facebook: 8, twitter: 2 },
      },
      {
        keyword: "Wisata Pantai",
        time_bucket: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
        mention_count: 18,
        positive_count: 16,
        negative_count: 0,
        neutral_count: 2,
        sources: { instagram: 12, facebook: 6 },
      },
      {
        keyword: "Jalan Rusak",
        time_bucket: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        mention_count: 22,
        positive_count: 2,
        negative_count: 18,
        neutral_count: 2,
        sources: { twitter: 12, facebook: 10 },
      },
      {
        keyword: "Pelayanan Kesehatan",
        time_bucket: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
        mention_count: 14,
        positive_count: 5,
        negative_count: 7,
        neutral_count: 2,
        sources: { facebook: 8, twitter: 6 },
      },
      {
        keyword: "Bupati Trenggalek",
        time_bucket: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
        mention_count: 16,
        positive_count: 12,
        negative_count: 2,
        neutral_count: 2,
        sources: { facebook: 10, twitter: 4, instagram: 2 },
      },
      {
        keyword: "Pasar Tradisional",
        time_bucket: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
        mention_count: 11,
        positive_count: 8,
        negative_count: 2,
        neutral_count: 1,
        sources: { facebook: 7, instagram: 4 },
      },
      {
        keyword: "Sekolah Rusak",
        time_bucket: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
        mention_count: 19,
        positive_count: 1,
        negative_count: 16,
        neutral_count: 2,
        sources: { twitter: 11, facebook: 8 },
      },
      {
        keyword: "Air Bersih",
        time_bucket: new Date(Date.now() - 7 * 60 * 60 * 1000).toISOString(),
        mention_count: 13,
        positive_count: 3,
        negative_count: 8,
        neutral_count: 2,
        sources: { facebook: 9, twitter: 4 },
      },
      {
        keyword: "Bantuan Sosial",
        time_bucket: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(),
        mention_count: 17,
        positive_count: 14,
        negative_count: 1,
        neutral_count: 2,
        sources: { facebook: 12, twitter: 5 },
      },
      {
        keyword: "Sampah",
        time_bucket: new Date(Date.now() - 9 * 60 * 60 * 1000).toISOString(),
        mention_count: 15,
        positive_count: 2,
        negative_count: 11,
        neutral_count: 2,
        sources: { twitter: 8, facebook: 7 },
      },
      // Add some historical data for better trends
      {
        keyword: "Festival Jaranan",
        time_bucket: new Date(Date.now() - 25 * 60 * 60 * 1000).toISOString(),
        mention_count: 8,
        positive_count: 7,
        negative_count: 0,
        neutral_count: 1,
        sources: { facebook: 5, instagram: 3 },
      },
      {
        keyword: "Jalan Rusak",
        time_bucket: new Date(Date.now() - 26 * 60 * 60 * 1000).toISOString(),
        mention_count: 12,
        positive_count: 1,
        negative_count: 10,
        neutral_count: 1,
        sources: { twitter: 7, facebook: 5 },
      },
    ];

    console.log(
      `📈 Adding ${moreKeywordTrends.length} more keyword trend records...`
    );

    // Insert in batches
    const batchSize = 10;
    for (let i = 0; i < moreKeywordTrends.length; i += batchSize) {
      const batch = moreKeywordTrends.slice(i, i + batchSize);

      const { error: insertError } = await supabase
        .from("keyword_trends")
        .insert(batch);

      if (insertError) {
        console.error(
          `❌ Error inserting batch ${i / batchSize + 1}:`,
          insertError.message
        );
      } else {
        console.log(
          `✅ Inserted batch ${i / batchSize + 1}/${Math.ceil(
            moreKeywordTrends.length / batchSize
          )}`
        );
      }
    }

    // Add more emerging issues
    const moreEmergingIssues = [
      {
        title: "Keluhan Pelayanan Puskesmas",
        keywords: ["puskesmas", "pelayanan", "antrian", "dokter"],
        velocity: 95.3,
        urgency_score: 7,
        department_relevance: ["Dinas Kesehatan"],
        status: "active",
        first_detected: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(),
      },
      {
        title: "Kerusakan Fasilitas Sekolah",
        keywords: ["sekolah", "rusak", "fasilitas", "pendidikan"],
        velocity: 78.9,
        urgency_score: 6,
        department_relevance: ["Dinas Pendidikan"],
        status: "active",
        first_detected: new Date(
          Date.now() - 10 * 60 * 60 * 1000
        ).toISOString(),
      },
      {
        title: "Masalah Pengelolaan Sampah",
        keywords: ["sampah", "kebersihan", "lingkungan", "pengelolaan"],
        velocity: 65.4,
        urgency_score: 5,
        department_relevance: ["Dinas Lingkungan Hidup"],
        status: "active",
        first_detected: new Date(
          Date.now() - 15 * 60 * 60 * 1000
        ).toISOString(),
      },
      {
        title: "Promosi Wisata Pantai Trenggalek",
        keywords: ["wisata", "pantai", "promosi", "pariwisata"],
        velocity: 112.7,
        urgency_score: 4,
        department_relevance: ["Dinas Pariwisata"],
        status: "active",
        first_detected: new Date(
          Date.now() - 18 * 60 * 60 * 1000
        ).toISOString(),
      },
    ];

    console.log("🚨 Adding more emerging issues...");

    const { error: moreIssuesError } = await supabase
      .from("emerging_issues")
      .insert(moreEmergingIssues);

    if (moreIssuesError) {
      console.error(
        "❌ Error inserting more emerging issues:",
        moreIssuesError.message
      );
    } else {
      console.log("✅ More emerging issues inserted successfully");
    }

    // Verify final data count
    const { count: finalKeywordCount } = await supabase
      .from("keyword_trends")
      .select("*", { count: "exact", head: true });

    const { count: finalIssuesCount } = await supabase
      .from("emerging_issues")
      .select("*", { count: "exact", head: true });

    console.log("");
    console.log("🎉 Enhanced trends data setup completed!");
    console.log(`📊 Final Summary:`);
    console.log(`   - Keyword trends: ${finalKeywordCount} records`);
    console.log(`   - Emerging issues: ${finalIssuesCount} records`);
    console.log("");
    console.log("✨ Your trends page should now show rich data from Supabase!");
    console.log("🔄 Refresh your trends page to see the updated data");
  } catch (error) {
    console.error("❌ Error adding more trends data:", error.message);
    process.exit(1);
  }
}

addMoreTrendsData();
