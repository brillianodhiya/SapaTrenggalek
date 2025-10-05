#!/usr/bin/env node

/**
 * Script to test Twitter scraper functionality
 */

require("dotenv").config({ path: ".env.local" });

async function testTwitterScraper() {
  console.log("🐦 Testing Twitter scraper...");

  // Check environment variables
  const requiredVars = [
    "TWITTER_API_KEY",
    "TWITTER_API_SECRET",
    "TWITTER_ACCESS_TOKEN",
    "TWITTER_ACCESS_TOKEN_SECRET",
  ];

  console.log("\n🔐 Checking environment variables:");
  const missingVars = [];

  for (const varName of requiredVars) {
    const value = process.env[varName];
    if (value) {
      console.log(`✅ ${varName}: ${value.substring(0, 10)}...`);
    } else {
      console.log(`❌ ${varName}: NOT SET`);
      missingVars.push(varName);
    }
  }

  if (missingVars.length > 0) {
    console.log(
      `\n❌ Missing environment variables: ${missingVars.join(", ")}`
    );
    console.log("Please configure these in .env.local file");
    return;
  }

  console.log("\n✅ All Twitter API credentials are configured");

  // Test API endpoint
  try {
    console.log("\n🧪 Testing Twitter scraper API endpoint...");

    const response = await fetch(
      "http://localhost:3000/api/admin/scrape-twitter",
      {
        method: "GET",
      }
    );

    if (response.ok) {
      const data = await response.json();
      console.log("✅ API endpoint response:", data);
    } else {
      console.log(
        "❌ API endpoint failed:",
        response.status,
        response.statusText
      );
    }
  } catch (error) {
    console.log("❌ Could not reach API endpoint:", error.message);
    console.log("💡 Make sure development server is running: npm run dev");
  }

  // Test scraping functionality
  try {
    console.log("\n🔍 Testing Twitter scraping functionality...");

    // Import the TwitterScraper class
    const { TwitterScraper } = require("../lib/twitter-scraper.ts");
    const scraper = new TwitterScraper();

    console.log("📊 Attempting to scrape recent tweets...");
    const results = await scraper.scrapeRecentTweets(5);

    console.log(`✅ Scraping completed: ${results.length} tweets found`);

    if (results.length > 0) {
      console.log("\n📝 Sample tweet:");
      const sample = results[0];
      console.log(`- Content: ${sample.content.substring(0, 100)}...`);
      console.log(`- Author: ${sample.author}`);
      console.log(`- Source: ${sample.source}`);
      console.log(`- Timestamp: ${sample.timestamp}`);
    }
  } catch (error) {
    console.log("❌ Twitter scraping failed:", error.message);

    if (error.code === 429) {
      console.log("⏰ Rate limit exceeded - this is normal, try again later");
    } else if (error.code === 401) {
      console.log("🔐 Authentication failed - check API credentials");
    } else {
      console.log("🔍 Full error:", error);
    }
  }
}

// Run the test
testTwitterScraper().catch(console.error);
