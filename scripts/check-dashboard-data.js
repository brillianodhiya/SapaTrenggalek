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

async function checkDashboardData() {
  try {
    console.log("🔍 Checking dashboard data...\n");

    // Check data_entries table
    const {
      data: entries,
      error: entriesError,
      count,
    } = await supabase
      .from("data_entries")
      .select("*", { count: "exact" })
      .limit(5);

    if (entriesError) {
      console.error("❌ Error fetching data_entries:", entriesError.message);
    } else {
      console.log(`📊 Data Entries: ${count} total records`);
      if (entries && entries.length > 0) {
        console.log("✅ Sample data found:");
        entries.forEach((entry, index) => {
          console.log(
            `   ${index + 1}. ${entry.content.substring(0, 50)}... (${
              entry.category
            }, ${entry.sentiment})`
          );
        });
      } else {
        console.log("⚠️ No data entries found");
      }
    }

    // Check categories breakdown
    const { data: categoryData } = await supabase
      .from("data_entries")
      .select("category");

    if (categoryData) {
      const categoryStats = categoryData.reduce((acc, item) => {
        acc[item.category] = (acc[item.category] || 0) + 1;
        return acc;
      }, {});
      console.log("\n📈 Category Breakdown:", categoryStats);
    }

    // Check status breakdown
    const { data: statusData } = await supabase
      .from("data_entries")
      .select("status");

    if (statusData) {
      const statusStats = statusData.reduce((acc, item) => {
        acc[item.status] = (acc[item.status] || 0) + 1;
        return acc;
      }, {});
      console.log("📋 Status Breakdown:", statusStats);
    }

    // Check urgent items
    const { data: urgentItems } = await supabase
      .from("data_entries")
      .select("id, content, urgency_level")
      .gte("urgency_level", 7)
      .limit(5);

    console.log(
      `\n🚨 Urgent Items (urgency >= 7): ${urgentItems?.length || 0} found`
    );
    if (urgentItems && urgentItems.length > 0) {
      urgentItems.forEach((item, index) => {
        console.log(
          `   ${index + 1}. Level ${
            item.urgency_level
          }: ${item.content.substring(0, 40)}...`
        );
      });
    }

    // Check recent entries
    const { data: recentEntries } = await supabase
      .from("data_entries")
      .select("created_at, category, content")
      .order("created_at", { ascending: false })
      .limit(5);

    console.log(`\n🕐 Recent Entries: ${recentEntries?.length || 0} found`);
    if (recentEntries && recentEntries.length > 0) {
      recentEntries.forEach((entry, index) => {
        const date = new Date(entry.created_at).toLocaleDateString("id-ID");
        console.log(
          `   ${index + 1}. ${date}: ${entry.content.substring(0, 40)}... (${
            entry.category
          })`
        );
      });
    }

    // Test analytics API
    console.log("\n🧪 Testing Analytics API...");
    try {
      const response = await fetch(`http://localhost:3000/api/analytics`);
      if (response.ok) {
        const analyticsData = await response.json();
        console.log("✅ Analytics API working:");
        console.log(`   - Total Entries: ${analyticsData.totalEntries}`);
        console.log(`   - Urgent Items: ${analyticsData.urgentItems}`);
        console.log(
          `   - Daily Trends: ${analyticsData.dailyTrends?.length || 0} days`
        );
      } else {
        console.log("❌ Analytics API failed:", response.status);
      }
    } catch (apiError) {
      console.log("⚠️ Could not test API (server might not be running)");
    }

    console.log("\n✅ Dashboard data check completed!");
  } catch (error) {
    console.error("❌ Error checking dashboard data:", error.message);
  }
}

checkDashboardData();
