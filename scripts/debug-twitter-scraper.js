#!/usr/bin/env node

/**
 * Debug Twitter scraper to see what's happening
 */

require("dotenv").config({ path: ".env.local" });

async function debugTwitterScraper() {
  console.log("🐦 Debugging Twitter scraper...");

  try {
    // Import the scraper functions
    const { scrapeTwitterData } = require("../lib/simple-scraper");

    console.log("📊 Testing scrapeTwitterData function...");
    const results = await scrapeTwitterData();

    console.log(`✅ Results: ${results.length} items`);

    if (results.length > 0) {
      console.log("\n📝 Sample results:");
      results.slice(0, 3).forEach((item, index) => {
        console.log(`${index + 1}. ${item.content.substring(0, 100)}...`);
        console.log(`   Source: ${item.source}`);
        console.log(`   Author: ${item.author}`);
        console.log(`   Timestamp: ${item.timestamp}`);
        console.log("");
      });
    } else {
      console.log("ℹ️ No results returned from Twitter scraper");
    }
  } catch (error) {
    console.error("❌ Error testing Twitter scraper:", error);
  }
}

// Run the debug
debugTwitterScraper().catch(console.error);
