#!/usr/bin/env node

/**
 * Direct test of Twitter scraper functionality
 */

require("dotenv").config({ path: ".env.local" });

async function testTwitterDirect() {
  console.log("🐦 Testing Twitter scraper directly...");

  // Check Bearer Token
  const bearerToken = process.env.TWITTER_BEARER_TOKEN;
  console.log(`Bearer Token: ${bearerToken ? "SET" : "NOT SET"}`);

  if (!bearerToken) {
    console.log("❌ Twitter Bearer Token not found");
    return;
  }

  try {
    // Test Twitter API directly
    const searchQuery = "indonesia -is:retweet";
    const url = new URL("https://api.twitter.com/2/tweets/search/recent");
    url.searchParams.append("query", searchQuery);
    url.searchParams.append("max_results", "10");
    url.searchParams.append(
      "tweet.fields",
      "created_at,author_id,public_metrics"
    );

    console.log(`🔍 Searching Twitter for: "${searchQuery}"`);
    console.log(`📡 API URL: ${url.toString()}`);

    const response = await fetch(url.toString(), {
      headers: {
        Authorization: `Bearer ${bearerToken}`,
        "Content-Type": "application/json",
      },
    });

    console.log(
      `📊 Response status: ${response.status} ${response.statusText}`
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`❌ Twitter API error:`, errorText);
      return;
    }

    const data = await response.json();
    console.log(`📝 Response data:`, JSON.stringify(data, null, 2));

    if (!data.data || data.data.length === 0) {
      console.log(`ℹ️ No tweets found for query: "${searchQuery}"`);
    } else {
      console.log(`✅ Found ${data.data.length} tweets`);
      data.data.forEach((tweet, index) => {
        console.log(`Tweet ${index + 1}: ${tweet.text.substring(0, 100)}...`);
      });
    }
  } catch (error) {
    console.error("❌ Error testing Twitter API:", error);
  }
}

// Run the test
testTwitterDirect().catch(console.error);
