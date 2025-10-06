const { createClient } = require("@supabase/supabase-js");
require("dotenv").config({ path: ".env.local" });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function checkData() {
  try {
    console.log("🔍 Checking data_entries data...");
    console.log("Supabase URL:", process.env.NEXT_PUBLIC_SUPABASE_URL);

    // Check total entries
    const { count: totalCount, error: countError } = await supabase
      .from("data_entries")
      .select("*", { count: "exact", head: true });

    if (countError) {
      console.error("Error getting count:", countError);
      return;
    }

    console.log("📊 Total data_entries:", totalCount);

    if (totalCount > 0) {
      // Check recent entries
      const { data: recent, error: recentError } = await supabase
        .from("data_entries")
        .select("id, content, status, created_at, source, category")
        .order("created_at", { ascending: false })
        .limit(5);

      if (recentError) {
        console.error("Error getting recent entries:", recentError);
        return;
      }

      console.log("📰 Recent entries:");
      recent?.forEach((row) => {
        console.log(
          `  ${row.id}: ${row.content?.substring(0, 50)}... (${row.status}) - ${
            row.source
          }`
        );
      });

      // Check by status
      const { data: statusData, error: statusError } = await supabase
        .from("data_entries")
        .select("status");

      if (statusError) {
        console.error("Error getting status data:", statusError);
        return;
      }

      const statusCounts = {};
      statusData?.forEach((row) => {
        const status = row.status || "null";
        statusCounts[status] = (statusCounts[status] || 0) + 1;
      });

      console.log("📈 By status:");
      Object.entries(statusCounts).forEach(([status, count]) => {
        console.log(`   ${status}: ${count}`);
      });

      // Check categories
      const { data: categoryData } = await supabase
        .from("data_entries")
        .select("category")
        .not("category", "is", null);

      const categories = [
        ...new Set(categoryData?.map((item) => item.category)),
      ];
      console.log("🏷️  Categories:", categories.join(", "));
    } else {
      console.log("❌ No entries found in data_entries table");
      console.log("💡 You may need to run scraping to populate data");
    }
  } catch (error) {
    console.error("❌ Error:", error);
  }
}

checkData();
