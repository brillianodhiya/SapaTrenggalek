// Test script for trends analysis
// Use built-in fetch for Node.js 18+
const fetch = globalThis.fetch;

// Load environment variables
require("dotenv").config({ path: ".env.local" });

async function testTrendsAnalysis() {
  const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:3000";
  const cronSecret = process.env.CRON_SECRET;

  if (!cronSecret) {
    console.error("❌ CRON_SECRET not found in environment variables");
    process.exit(1);
  }

  console.log("🧪 Testing Trends Analysis...\n");

  try {
    console.log("📊 Triggering trends analysis...");

    const response = await fetch(`${baseUrl}/api/cron/analyze-trends`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${cronSecret}`,
        "Content-Type": "application/json",
      },
    });

    const data = await response.json();

    if (response.ok && data.success) {
      console.log("✅ Trends analysis completed successfully!");
      console.log(`📈 Results:`);
      console.log(`   - Entries processed: ${data.processed}`);
      console.log(`   - Keyword trends found: ${data.keywordTrends}`);
      console.log(`   - Emerging issues detected: ${data.emergingIssues}`);
      console.log(`   - Message: ${data.message}`);

      // Test the API endpoints to see if new data is available
      console.log("\n🔍 Testing API endpoints with new data...");

      // Test trends endpoint
      const trendsResponse = await fetch(`${baseUrl}/api/trends?limit=5`);
      const trendsData = await trendsResponse.json();

      if (trendsData.success) {
        console.log(
          `✅ Trends API: ${trendsData.data.length} trends available`
        );
        console.log(`   Data source: ${trendsData.metadata.data_source}`);
      }

      // Test emerging issues endpoint
      const emergingResponse = await fetch(`${baseUrl}/api/trends/emerging`);
      const emergingData = await emergingResponse.json();

      if (emergingData.success) {
        console.log(
          `✅ Emerging Issues API: ${emergingData.data.length} issues available`
        );
        console.log(`   Data source: ${emergingData.metadata.data_source}`);
      }
    } else {
      console.log("❌ Trends analysis failed:", data.error || data.message);
      console.log("Details:", data.details);
    }
  } catch (error) {
    console.error("❌ Test failed:", error.message);
    console.log("\n💡 Make sure:");
    console.log("   1. Your Next.js development server is running");
    console.log("   2. CRON_SECRET is set in .env.local");
    console.log("   3. Database connection is working");
  }
}

testTrendsAnalysis();
