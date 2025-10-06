// Test analytics API directly
const fetch = globalThis.fetch;

async function testAnalyticsAPI() {
  const baseUrl = "http://localhost:3000";

  console.log("🧪 Testing Analytics API...\n");

  try {
    console.log("📊 Fetching analytics data...");
    const response = await fetch(`${baseUrl}/api/analytics`);
    const data = await response.json();

    if (response.ok) {
      console.log("✅ Analytics API working!");
      console.log("\n📈 Data Summary:");
      console.log(`   - Total Entries: ${data.totalEntries}`);
      console.log(
        `   - Urgent Items: ${
          data.urgentItemsCount || data.urgentItems?.length || 0
        } items`
      );
      console.log(
        `   - Hoax Items: ${
          data.hoaxItemsCount || data.hoaxItems?.length || 0
        } items`
      );

      console.log("\n📊 Categories Breakdown:");
      Object.entries(data.categoriesBreakdown || {}).forEach(([key, value]) => {
        console.log(`   - ${key}: ${value}`);
      });

      console.log("\n📋 Status Breakdown:");
      Object.entries(data.statusBreakdown || {}).forEach(([key, value]) => {
        console.log(`   - ${key}: ${value}`);
      });

      console.log("\n💭 Sentiment Breakdown:");
      Object.entries(data.sentimentBreakdown || {}).forEach(([key, value]) => {
        console.log(`   - ${key}: ${value}`);
      });

      console.log("\n📈 Daily Trends:");
      if (data.dailyTrends && data.dailyTrends.length > 0) {
        data.dailyTrends.forEach((trend) => {
          console.log(`   - ${trend.date}: ${trend.count} entries`);
        });
      } else {
        console.log("   - No daily trends data");
      }

      console.log("\n🔝 Top Sources:");
      if (data.topSources && data.topSources.length > 0) {
        data.topSources.forEach((source) => {
          console.log(`   - ${source.source}: ${source.count}`);
        });
      } else {
        console.log("   - No top sources data");
      }
    } else {
      console.log("❌ Analytics API failed:", response.status);
      console.log("Response:", data);
    }
  } catch (error) {
    console.error("❌ Test failed:", error.message);
    console.log(
      "\n💡 Make sure your Next.js development server is running on port 3000"
    );
    console.log("   Run: npm run dev");
  }
}

testAnalyticsAPI();
