require("dotenv").config({ path: ".env.local" });
const { createClient } = require("@supabase/supabase-js");

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Google News URL resolver
async function resolveGoogleNewsUrl(googleNewsUrl) {
  try {
    if (!googleNewsUrl.includes("news.google.com/rss/articles/")) {
      return googleNewsUrl;
    }

    console.log(`Resolving Google News URL...`);

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);

    const response = await fetch(googleNewsUrl, {
      method: "HEAD",
      signal: controller.signal,
      redirect: "follow",
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
        Accept:
          "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "Accept-Language": "id-ID,id;q=0.9,en;q=0.8",
      },
    });

    clearTimeout(timeoutId);

    if (response.ok && response.url !== googleNewsUrl) {
      console.log(`✅ Resolved to: ${response.url}`);
      return response.url;
    }

    console.log(`❌ Failed to resolve URL`);
    return null;
  } catch (error) {
    console.error(`❌ Error resolving Google News URL: ${error.message}`);
    return null;
  }
}

async function testResolver() {
  try {
    console.log("🔍 Testing Google News URL resolver...\n");

    // Get a few Google News URLs from the database
    const { data: entries, error } = await supabase
      .from("data_entries")
      .select("id, content, source_url")
      .like("source_url", "%news.google.com%")
      .limit(3);

    if (error) {
      console.error("Error fetching entries:", error);
      return;
    }

    if (!entries || entries.length === 0) {
      console.log("No Google News URLs found in database");
      return;
    }

    console.log(`Found ${entries.length} Google News URLs to test:\n`);

    for (const entry of entries) {
      console.log(`📰 Entry: ${entry.content.substring(0, 80)}...`);
      console.log(`🔗 Original URL: ${entry.source_url.substring(0, 100)}...`);

      const resolvedUrl = await resolveGoogleNewsUrl(entry.source_url);

      if (resolvedUrl) {
        console.log(`✅ Success! Resolved URL: ${resolvedUrl}`);

        // Test if we can fetch the resolved URL
        try {
          const testResponse = await fetch(resolvedUrl, {
            method: "HEAD",
            headers: {
              "User-Agent":
                "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
            },
          });

          if (testResponse.ok) {
            console.log(
              `✅ Resolved URL is accessible (${testResponse.status})`
            );
          } else {
            console.log(`⚠️ Resolved URL returned ${testResponse.status}`);
          }
        } catch (fetchError) {
          console.log(`❌ Error accessing resolved URL: ${fetchError.message}`);
        }
      } else {
        console.log(`❌ Failed to resolve URL`);
      }

      console.log("---\n");

      // Add delay between requests
      await new Promise((resolve) => setTimeout(resolve, 2000));
    }
  } catch (error) {
    console.error("Error in test:", error);
  }
}

testResolver().catch(console.error);
