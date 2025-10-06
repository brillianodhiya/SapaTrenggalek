require("dotenv").config({ path: ".env.local" });
const cheerio = require("cheerio");

// Enhanced Google News URL resolver
async function resolveGoogleNewsUrl(googleNewsUrl) {
  try {
    if (!googleNewsUrl.includes("news.google.com/rss/articles/")) {
      return googleNewsUrl;
    }

    console.log(`Resolving Google News URL...`);

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000);

    const response = await fetch(googleNewsUrl, {
      method: "GET",
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

    if (!response.ok) {
      console.log(`Failed to fetch Google News URL: ${response.status}`);
      return null;
    }

    const html = await response.text();

    // Method 1: Look for article links in the HTML
    const $ = cheerio.load(html);

    // Try to find article links
    const articleLinks = [];

    // Look for links that might be the actual article
    $("a[href]").each((_, element) => {
      const href = $(element).attr("href");
      if (
        href &&
        !href.includes("google.com") &&
        !href.startsWith("/") &&
        href.startsWith("http")
      ) {
        articleLinks.push(href);
      }
    });

    if (articleLinks.length > 0) {
      console.log(`✅ Found article link: ${articleLinks[0]}`);
      return articleLinks[0];
    }

    // Method 2: Look for JavaScript redirects
    const jsRedirectPatterns = [
      /window\.location\.href\s*=\s*["']([^"']+)["']/g,
      /window\.location\s*=\s*["']([^"']+)["']/g,
      /document\.location\.href\s*=\s*["']([^"']+)["']/g,
      /document\.location\s*=\s*["']([^"']+)["']/g,
    ];

    for (const pattern of jsRedirectPatterns) {
      const matches = [...html.matchAll(pattern)];
      for (const match of matches) {
        const url = match[1];
        if (url && !url.includes("google.com") && url.startsWith("http")) {
          console.log(`✅ Found JS redirect: ${url}`);
          return url;
        }
      }
    }

    // Method 3: Look for meta refresh
    const metaRefreshMatch = html.match(
      /<meta[^>]*http-equiv=["']refresh["'][^>]*content=["'][^"']*url=([^"']+)["']/i
    );
    if (metaRefreshMatch) {
      const url = metaRefreshMatch[1];
      if (url && !url.includes("google.com") && url.startsWith("http")) {
        console.log(`✅ Found meta refresh: ${url}`);
        return url;
      }
    }

    // Method 4: Look for data attributes or JSON that might contain the URL
    const jsonMatches = html.match(/"url":"([^"]+)"/g);
    if (jsonMatches) {
      for (const match of jsonMatches) {
        const urlMatch = match.match(/"url":"([^"]+)"/);
        if (urlMatch) {
          const url = urlMatch[1].replace(/\\u[\dA-F]{4}/gi, (match) => {
            return String.fromCharCode(parseInt(match.replace(/\\u/g, ""), 16));
          });
          if (url && !url.includes("google.com") && url.startsWith("http")) {
            console.log(`✅ Found JSON URL: ${url}`);
            return url;
          }
        }
      }
    }

    console.log(`❌ Could not extract article URL from Google News page`);
    return null;
  } catch (error) {
    console.error(`❌ Error resolving Google News URL: ${error.message}`);
    return null;
  }
}

// Test the enhanced resolver
async function testEnhancedResolver() {
  const testUrls = [
    "https://news.google.com/rss/articles/CBMiqwFBVV95cUxQNTdfbThvdGpDbFRfd3pET0ViVTdKS2s0R0NjcW9yZVV1NnRQS1NIaWtVVHdOQTh1ZXZOVVpaSy12TTdocmJJcGMzakdXV0tRTEtzYmJrN19oUERjMkQyMjNCeERZWXFZU2QxbkNUOEZQOUo1TlpRQ25vdEZUU0h6TnlwTDJDUFNJdEhCN3BiX3gzdVJrZVByZk5rZGFXSWxpaXR3OVNEakhlbHc?oc=5",
    "https://news.google.com/rss/articles/CBMi3wFBVV95cUxNd2VhZmYyandHYnBtU1F5OE9GaFlidzF1MVAwS2FHak13eF9uS2tFS0hGMFNnbUxXZEp2VXlNWlhiSlo3eXRoNHVadlJFLWlJdUs4aTdfSFhEYl9LMFcxWlYzeGE5VFpLUFhocUpQRThIYzhVM2xhcWxWa0NvMmtZRTlfZVgxeWw1YkRDNmxSU1M0YTdDZDVkTG8weVZNSEduMTM0TkZPbzc2TjRmUTZHYXRwMVhsVjNfcGdxcjBRRUJOZ29rMEpCZU5VcDdCamlFaXIwTzF4X2M5ZTBfS19B?oc=5",
  ];

  for (const url of testUrls) {
    console.log(`\n🔍 Testing URL: ${url.substring(0, 100)}...`);
    const resolved = await resolveGoogleNewsUrl(url);

    if (resolved) {
      console.log(`✅ Success: ${resolved}`);

      // Test if the resolved URL is accessible
      try {
        const testResponse = await fetch(resolved, { method: "HEAD" });
        console.log(`📊 Status: ${testResponse.status}`);
      } catch (error) {
        console.log(`❌ Error accessing resolved URL: ${error.message}`);
      }
    } else {
      console.log(`❌ Failed to resolve`);
    }

    console.log("---");
    await new Promise((resolve) => setTimeout(resolve, 3000));
  }
}

testEnhancedResolver().catch(console.error);
