require("dotenv").config({ path: ".env.local" });

// Test direct fetching of Google News URLs to see what we get
async function testDirectFetch() {
  const testUrl =
    "https://news.google.com/rss/articles/CBMiqwFBVV95cUxQNTdfbThvdGpDbFRfd3pET0ViVTdKS2s0R0NjcW9yZVV1NnRQS1NIaWtVVHdOQTh1ZXZOVVpaSy12TTdocmJJcGMzakdXV0tRTEtzYmJrN19oUERjMkQyMjNCeERZWXFZU2QxbkNUOEZQOUo1TlpRQ25vdEZUU0h6TnlwTDJDUFNJdEhCN3BiX3gzdVJrZVByZk5rZGFXSWxpaXR3OVNEakhlbHc?oc=5";

  try {
    console.log("Testing direct fetch of Google News URL...\n");

    const response = await fetch(testUrl, {
      method: "GET",
      redirect: "follow",
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
        Accept:
          "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "Accept-Language": "id-ID,id;q=0.9,en;q=0.8",
      },
    });

    console.log(`Status: ${response.status}`);
    console.log(`Final URL: ${response.url}`);
    console.log(`Content-Type: ${response.headers.get("content-type")}`);

    if (response.ok) {
      const html = await response.text();
      console.log(`Content length: ${html.length} characters`);
      console.log(`First 500 characters:`);
      console.log(html.substring(0, 500));

      // Check if it contains redirect JavaScript
      if (
        html.includes("window.location") ||
        html.includes("document.location")
      ) {
        console.log("\n🔍 Found JavaScript redirect in content");

        // Try to extract the redirect URL
        const redirectMatch = html.match(
          /(?:window\.location|document\.location)(?:\.href)?\s*=\s*["']([^"']+)["']/
        );
        if (redirectMatch) {
          console.log(`🎯 Extracted redirect URL: ${redirectMatch[1]}`);
        }
      }

      // Check for meta refresh
      const metaRefreshMatch = html.match(
        /<meta[^>]*http-equiv=["']refresh["'][^>]*content=["'][^"']*url=([^"']+)["']/i
      );
      if (metaRefreshMatch) {
        console.log(`🎯 Found meta refresh URL: ${metaRefreshMatch[1]}`);
      }
    }
  } catch (error) {
    console.error("Error:", error);
  }
}

testDirectFetch();
