const fetch = require("node-fetch");

async function testNewsAPI() {
  try {
    console.log("🧪 Testing News API...");

    // Test basic API call
    console.log("📡 Calling /api/news...");
    const response = await fetch("http://localhost:3000/api/news?limit=3");

    if (!response.ok) {
      console.error("❌ HTTP Error:", response.status, response.statusText);
      return;
    }

    const result = await response.json();

    console.log("✅ API Response received");
    console.log("Success:", result.success);
    console.log("Data count:", result.data?.length || 0);
    console.log("Categories:", result.categories?.length || 0);
    console.log("Total:", result.pagination?.total || 0);

    if (result.data && result.data.length > 0) {
      console.log("📰 Sample news:");
      result.data.slice(0, 2).forEach((item, index) => {
        console.log(
          `  ${index + 1}. ${item.id}: ${item.content?.substring(0, 50)}...`
        );
        console.log(`     Status: ${item.status}, Category: ${item.category}`);
      });
    } else {
      console.log("❌ No news data returned");
    }

    // Test with filters
    console.log("\n🔍 Testing with category filter...");
    const filteredResponse = await fetch(
      "http://localhost:3000/api/news?category=berita&limit=2"
    );
    const filteredResult = await filteredResponse.json();

    console.log("Filtered results:", filteredResult.data?.length || 0);
  } catch (error) {
    console.error("❌ Error testing News API:", error);
  }
}

testNewsAPI();
