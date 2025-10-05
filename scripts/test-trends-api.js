// Simple test script to check if trends API is working with Supabase data
const fetch = require("node-fetch");

async function testTrendsAPI() {
  const baseUrl = "http://localhost:3000";

  console.log("🧪 Testing Trends API with Supabase integration...\n");

  try {
    // Test main trends endpoint
    console.log("📈 Testing /api/trends...");
    const trendsResponse = await fetch(
      `${baseUrl}/api/trends?timeRange=24h&limit=5`
    );
    const trendsData = await trendsResponse.json();

    if (trendsData.success) {
      console.log(
        `✅ Trends API working! Found ${trendsData.data.length} trends`
      );
      console.log(`   Data source: ${trendsData.metadata.data_source}`);
      if (trendsData.data.length > 0) {
        console.log(
          `   Sample: ${trendsData.data[0].keyword} (${trendsData.data[0].total_mentions} mentions)`
        );
      }
    } else {
      console.log("❌ Trends API failed:", trendsData.error);
    }

    // Test emerging issues endpoint
    console.log("\n🚨 Testing /api/trends/emerging...");
    const emergingResponse = await fetch(
      `${baseUrl}/api/trends/emerging?urgencyMin=4`
    );
    const emergingData = await emergingResponse.json();

    if (emergingData.success) {
      console.log(
        `✅ Emerging Issues API working! Found ${emergingData.data.length} issues`
      );
      console.log(`   Data source: ${emergingData.metadata.data_source}`);
      if (emergingData.data.length > 0) {
        console.log(
          `   Sample: ${emergingData.data[0].title} (urgency: ${emergingData.data[0].urgency_score})`
        );
      }
    } else {
      console.log("❌ Emerging Issues API failed:", emergingData.error);
    }

    // Test keywords endpoint
    console.log("\n☁️ Testing /api/trends/keywords...");
    const keywordsResponse = await fetch(
      `${baseUrl}/api/trends/keywords?timeRange=24h&limit=10`
    );
    const keywordsData = await keywordsResponse.json();

    if (keywordsData.success) {
      console.log(
        `✅ Keywords API working! Found ${keywordsData.data.keywords.length} keywords`
      );
      console.log(`   Data source: ${keywordsData.metadata.data_source}`);
      if (keywordsData.data.keywords.length > 0) {
        console.log(
          `   Sample: ${keywordsData.data.keywords[0].text} (weight: ${keywordsData.data.keywords[0].weight})`
        );
      }
    } else {
      console.log("❌ Keywords API failed:", keywordsData.error);
    }

    console.log("\n🎉 API testing completed!");
  } catch (error) {
    console.error("❌ Test failed:", error.message);
    console.log(
      "\n💡 Make sure your Next.js development server is running on port 3000"
    );
    console.log("   Run: npm run dev");
  }
}

testTrendsAPI();
