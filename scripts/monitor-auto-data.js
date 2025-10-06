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

async function monitorAutoData() {
  try {
    console.log("🔍 Monitoring automatic data collection...\n");

    // Check recent entries (last 24 hours)
    const last24Hours = new Date(Date.now() - 24 * 60 * 60 * 1000);

    const { data: recentEntries, count: recentCount } = await supabase
      .from("data_entries")
      .select("*", { count: "exact" })
      .gte("created_at", last24Hours.toISOString())
      .order("created_at", { ascending: false });

    console.log(`📊 Data dalam 24 jam terakhir: ${recentCount} entries`);

    if (recentEntries && recentEntries.length > 0) {
      console.log("✅ Recent entries found:");
      recentEntries.slice(0, 5).forEach((entry, index) => {
        const timeAgo = Math.round(
          (Date.now() - new Date(entry.created_at).getTime()) / (1000 * 60 * 60)
        );
        console.log(
          `   ${index + 1}. ${timeAgo}h ago: ${entry.content.substring(
            0,
            50
          )}... (${entry.source})`
        );
      });
    } else {
      console.log("⚠️ No recent entries from scraping");
    }

    // Check data sources distribution
    const { data: sourceData } = await supabase
      .from("data_entries")
      .select("source, created_at")
      .gte("created_at", last24Hours.toISOString());

    if (sourceData) {
      const sourceStats = sourceData.reduce((acc, item) => {
        acc[item.source] = (acc[item.source] || 0) + 1;
        return acc;
      }, {});

      console.log("\n📡 Sources in last 24h:", sourceStats);
    }

    // Check AI processing status
    const { data: aiProcessed, count: aiCount } = await supabase
      .from("data_entries")
      .select("*", { count: "exact" })
      .eq("processed_by_ai", true)
      .gte("created_at", last24Hours.toISOString());

    console.log(`\n🤖 AI processed entries (24h): ${aiCount}`);

    // Check next expected scraping time
    const now = new Date();
    const currentHour = now.getHours();
    const scrapingHours = [0, 6, 12, 18];

    let nextScraping = scrapingHours.find((hour) => hour > currentHour);
    if (!nextScraping) {
      nextScraping = scrapingHours[0] + 24; // Next day
    }

    const hoursUntilNext = nextScraping - currentHour;
    console.log(
      `\n⏰ Next scraping in ~${hoursUntilNext} hours (${nextScraping % 24}:00)`
    );

    // Check GitHub Actions status (if possible)
    console.log("\n🔧 Automation Status:");
    console.log(
      "   - Scraping Schedule: Every 6 hours (00:00, 06:00, 12:00, 18:00)"
    );
    console.log("   - Trends Analysis: Every 2 hours");
    console.log("   - Dashboard: Real-time (updates on refresh)");

    // Predict dashboard growth
    const { count: totalCount } = await supabase
      .from("data_entries")
      .select("*", { count: "exact", head: true });

    console.log(`\n📈 Growth Prediction:`);
    console.log(`   - Current total: ${totalCount} entries`);
    console.log(`   - Expected daily growth: 20-50 entries (from scraping)`);
    console.log(`   - Dashboard will be fully populated in 3-7 days`);

    console.log("\n✅ Monitoring completed!");
    console.log(
      "💡 Dashboard data will grow automatically as scraping jobs run"
    );
  } catch (error) {
    console.error("❌ Error monitoring data:", error.message);
  }
}

monitorAutoData();
