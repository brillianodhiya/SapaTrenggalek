#!/usr/bin/env node

/**
 * Script to force insert Twitter fallback data
 */

require("dotenv").config({ path: ".env.local" });

async function forceTwitterFallback() {
  console.log("🐦 Forcing Twitter fallback data insertion...");

  try {
    // Call the scrape API to force new data
    const response = await fetch("http://localhost:3000/api/cron/scrape", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.CRON_SECRET}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    console.log("✅ Scraping result:", JSON.stringify(result, null, 2));

    // Check if Twitter data was processed
    if (result.summary && result.summary.sources) {
      const twitterCount = result.summary.sources["Twitter/X"] || 0;
      console.log(`📊 Twitter/X items processed: ${twitterCount}`);

      if (twitterCount > 0) {
        console.log("🎉 Twitter fallback data successfully inserted!");
      } else {
        console.log(
          "⚠️ No Twitter data was processed. This might be due to duplicates or other issues."
        );
      }
    }
  } catch (error) {
    console.error("❌ Error forcing Twitter fallback:", error);
  }
}

// Run the script
forceTwitterFallback().catch(console.error);
