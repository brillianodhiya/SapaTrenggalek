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

async function populateTrendsData() {
  try {
    console.log("🚀 Populating trends tables with real data...");

    // Get recent data entries for analysis
    const { data: entries, error: entriesError } = await supabase
      .from("data_entries")
      .select("content, category, sentiment, created_at, ai_analysis, source")
      .gte(
        "created_at",
        new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
      )
      .limit(100);

    if (entriesError) {
      console.error("❌ Error fetching entries:", entriesError.message);
      return;
    }

    console.log(`📊 Analyzing ${entries?.length || 0} entries...`);

    // Extract keywords and create hourly trend data
    const hourlyKeywords = {};

    entries?.forEach((entry) => {
      const entryDate = new Date(entry.created_at);
      const hourBucket = new Date(entryDate);
      hourBucket.setMinutes(0, 0, 0); // Round to hour

      let keywords = [];
      if (entry.ai_analysis?.keywords) {
        keywords = entry.ai_analysis.keywords;
      } else {
        // Simple keyword extraction
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
        keywords = words.slice(0, 3);
      }

      keywords.forEach((keyword) => {
        const key = `${keyword}_${hourBucket.toISOString()}`;

        if (!hourlyKeywords[key]) {
          hourlyKeywords[key] = {
            keyword: keyword,
            time_bucket: hourBucket.toISOString(),
            mention_count: 0,
            positive_count: 0,
            negative_count: 0,
            neutral_count: 0,
            sources: {},
          };
        }

        hourlyKeywords[key].mention_count++;
        hourlyKeywords[key][`${entry.sentiment || "neutral"}_count`]++;

        const source = entry.source || "unknown";
        hourlyKeywords[key].sources[source] =
          (hourlyKeywords[key].sources[source] || 0) + 1;
      });
    });

    // Insert keyword trends data
    const keywordTrendsData = Object.values(hourlyKeywords);
    console.log(
      `📈 Inserting ${keywordTrendsData.length} keyword trend records...`
    );

    // Clear existing data first
    await supabase
      .from("keyword_trends")
      .delete()
      .neq("id", "00000000-0000-0000-0000-000000000000");

    // Insert in batches
    const batchSize = 50;
    for (let i = 0; i < keywordTrendsData.length; i += batchSize) {
      const batch = keywordTrendsData.slice(i, i + batchSize);

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
            keywordTrendsData.length / batchSize
          )}`
        );
      }
    }

    // Create sample emerging issues
    const emergingIssuesData = [
      {
        title: "Infrastruktur Jalan Rusak",
        keywords: ["jalan", "rusak", "infrastruktur", "perbaikan"],
        velocity: 150.5,
        urgency_score: 8,
        department_relevance: ["Dinas Pekerjaan Umum"],
        status: "active",
        first_detected: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
      },
      {
        title: "Pelayanan Kesehatan",
        keywords: ["kesehatan", "pelayanan", "rumah sakit", "dokter"],
        velocity: 89.2,
        urgency_score: 6,
        department_relevance: ["Dinas Kesehatan"],
        status: "active",
        first_detected: new Date(
          Date.now() - 12 * 60 * 60 * 1000
        ).toISOString(),
      },
      {
        title: "Festival Jaranan Trenggalek",
        keywords: ["festival", "jaranan", "trenggalek", "budaya"],
        velocity: 67.8,
        urgency_score: 4,
        department_relevance: ["Dinas Pariwisata", "Dinas Kebudayaan"],
        status: "active",
        first_detected: new Date(
          Date.now() - 24 * 60 * 60 * 1000
        ).toISOString(),
      },
    ];

    console.log("🚨 Inserting emerging issues...");

    // Clear existing emerging issues
    await supabase
      .from("emerging_issues")
      .delete()
      .neq("id", "00000000-0000-0000-0000-000000000000");

    const { error: issuesError } = await supabase
      .from("emerging_issues")
      .insert(emergingIssuesData);

    if (issuesError) {
      console.error("❌ Error inserting emerging issues:", issuesError.message);
    } else {
      console.log("✅ Emerging issues inserted successfully");
    }

    // Verify data
    const { count: keywordCount } = await supabase
      .from("keyword_trends")
      .select("*", { count: "exact", head: true });

    const { count: issuesCount } = await supabase
      .from("emerging_issues")
      .select("*", { count: "exact", head: true });

    console.log("");
    console.log("✅ Trends data population completed!");
    console.log(`📊 Summary:`);
    console.log(`   - Keyword trends: ${keywordCount} records`);
    console.log(`   - Emerging issues: ${issuesCount} records`);
    console.log("");
    console.log("🎯 Next step: Update API endpoints to use Supabase data");
  } catch (error) {
    console.error("❌ Error populating trends data:", error.message);
    process.exit(1);
  }
}

populateTrendsData();
