require("dotenv").config({ path: ".env.local" });

async function testImageExtractionAPI() {
  try {
    console.log("🧪 Testing Image Extraction API...\n");

    const apiUrl = "http://localhost:3000/api/cron/extract-images";
    const cronSecret = process.env.CRON_SECRET || "dev-secret";

    console.log(`API URL: ${apiUrl}`);
    console.log(`Using CRON_SECRET: ${cronSecret.substring(0, 10)}...`);

    const response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${cronSecret}`,
        "Content-Type": "application/json",
      },
    });

    console.log(`\n📊 Response Status: ${response.status}`);
    console.log(
      `Response Headers:`,
      Object.fromEntries(response.headers.entries())
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`❌ API Error: ${errorText}`);
      return;
    }

    const result = await response.json();
    console.log("\n✅ API Response:");
    console.log(`Message: ${result.message}`);
    console.log(`Processed: ${result.processed}`);
    console.log(`Successful: ${result.successful}`);

    if (result.results && result.results.length > 0) {
      console.log("\n📋 Results:");
      result.results.slice(0, 3).forEach((item, i) => {
        console.log(`${i + 1}. ${item.status.toUpperCase()}: ${item.title}`);
        if (item.image_url) {
          console.log(`   Image: ${item.image_url.substring(0, 80)}...`);
        }
        if (item.error) {
          console.log(`   Error: ${item.error}`);
        }
      });

      if (result.results.length > 3) {
        console.log(`   ... and ${result.results.length - 3} more results`);
      }
    }

    console.log("\n🎯 Test completed successfully!");
  } catch (error) {
    console.error("❌ Test failed:", error.message);
  }
}

testImageExtractionAPI();
