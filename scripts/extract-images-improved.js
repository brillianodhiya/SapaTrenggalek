require("dotenv").config({ path: ".env.local" });
const { createClient } = require("@supabase/supabase-js");

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
      console.log(`Resolved to: ${response.url}`);
      return response.url;
    }

    return null;
  } catch (error) {
    console.error(`Error resolving Google News URL: ${error}`);
    return null;
  }
}

function isNewsArticleUrl(url) {
  try {
    const urlObj = new URL(url);
    const pathname = urlObj.pathname.toLowerCase();
    const hostname = urlObj.hostname.toLowerCase();

    // Skip non-news URLs
    const skipPatterns = [
      "/search",
      "/category",
      "/tag",
      "/author",
      "/page",
      "/feed",
      "/rss",
      "facebook.com",
      "twitter.com",
      "instagram.com",
      "youtube.com",
    ];

    for (const pattern of skipPatterns) {
      if (pathname.includes(pattern) || hostname.includes(pattern)) {
        return false;
      }
    }

    // Check for article indicators
    const articleIndicators = [
      "/news/",
      "/berita/",
      "/artikel/",
      "/read/",
      "/post/",
      "/story/",
      "/article/",
      "/content/",
      "/detail/",
      "/view/",
      "/show/",
      ".html",
    ];

    for (const indicator of articleIndicators) {
      if (pathname.includes(indicator)) {
        return true;
      }
    }

    return true; // Default to true for news domains
  } catch (error) {
    return false;
  }
}

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function extractBestImageFromUrl(url) {
  try {
    console.log(`Extracting image from: ${url}`);

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000);

    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
        Accept:
          "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
        "Accept-Language": "id-ID,id;q=0.9,en;q=0.8",
        "Accept-Encoding": "gzip, deflate, br",
        DNT: "1",
        Connection: "keep-alive",
        "Upgrade-Insecure-Requests": "1",
      },
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      console.log(`Failed to fetch ${url}: ${response.status}`);
      return null;
    }

    const html = await response.text();
    const cheerio = require("cheerio");
    const $ = cheerio.load(html);

    // Extract candidates with scoring
    const candidates = [];

    // 1. Open Graph images (highest priority)
    const ogImage = $('meta[property="og:image"]').attr("content");
    if (ogImage) {
      candidates.push({
        url: ogImage,
        score: 100,
        alt: $('meta[property="og:image:alt"]').attr("content"),
      });
    }

    // 2. Twitter Card images
    const twitterImage = $('meta[name="twitter:image"]').attr("content");
    if (twitterImage && twitterImage !== ogImage) {
      candidates.push({
        url: twitterImage,
        score: 95,
        alt: $('meta[name="twitter:image:alt"]').attr("content"),
      });
    }

    // 3. Article images with quality scoring
    const contentSelectors = [
      { selector: "article img", baseScore: 80 },
      { selector: ".post-content img", baseScore: 75 },
      { selector: ".entry-content img", baseScore: 75 },
      { selector: ".featured-image img", baseScore: 85 },
      { selector: ".post-thumbnail img", baseScore: 80 },
      { selector: ".wp-post-image", baseScore: 80 },
      { selector: "figure img", baseScore: 75 },
    ];

    for (const { selector, baseScore } of contentSelectors) {
      $(selector).each((index, img) => {
        const $img = $(img);
        const src =
          $img.attr("src") ||
          $img.attr("data-src") ||
          $img.attr("data-lazy-src");

        if (src) {
          let score = baseScore;

          // Boost score for first images
          if (index === 0) score += 10;

          // Boost score for larger images
          const width = parseInt($img.attr("width") || "0");
          const height = parseInt($img.attr("height") || "0");
          if (width > 400 && height > 300) score += 15;

          // Boost score for images with good alt text
          const alt = $img.attr("alt");
          if (alt && alt.length > 10) score += 5;

          candidates.push({
            url: normalizeImageUrl(src, url),
            score,
            alt,
          });
        }
      });
    }

    // Sort by score and validate
    candidates.sort((a, b) => b.score - a.score);

    for (const candidate of candidates) {
      if (await isHighQualityImage(candidate.url)) {
        console.log(
          `Selected image: ${candidate.url} (score: ${candidate.score})`
        );
        return {
          url: candidate.url,
          alt: candidate.alt,
          quality: candidate.score > 75 ? "high" : "medium",
        };
      }
    }

    return null;
  } catch (error) {
    console.error(`Error extracting image from ${url}:`, error);
    return null;
  }
}

function normalizeImageUrl(imageUrl, baseUrl) {
  try {
    if (imageUrl.startsWith("//")) {
      return "https:" + imageUrl;
    } else if (imageUrl.startsWith("/")) {
      const base = new URL(baseUrl);
      return base.origin + imageUrl;
    } else if (!imageUrl.startsWith("http")) {
      const base = new URL(baseUrl);
      return new URL(imageUrl, base.href).href;
    }
    return imageUrl;
  } catch (error) {
    return imageUrl;
  }
}

async function isHighQualityImage(url) {
  try {
    // Reject known low-quality patterns
    const rejectPatterns = [
      /placeholder/i,
      /loading/i,
      /spinner/i,
      /blank/i,
      /default/i,
      /avatar/i,
      /profile/i,
      /logo/i,
      /icon/i,
      /favicon/i,
      /1x1/,
      /pixel/i,
      /transparent/i,
      /spacer/i,
      /google.*news.*thumb/i,
      /gstatic/i,
      /googleusercontent.*=s\d+/i,
      /gravatar/i,
    ];

    const urlString = url.toLowerCase();
    if (rejectPatterns.some((pattern) => pattern.test(urlString))) {
      return false;
    }

    // Check minimum dimensions in URL
    const dimensionMatch = urlString.match(/(\d+)x(\d+)/);
    if (dimensionMatch) {
      const width = parseInt(dimensionMatch[1]);
      const height = parseInt(dimensionMatch[2]);
      if (width < 300 || height < 200) {
        return false;
      }
    }

    // Validate the actual image
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);

    const response = await fetch(url, {
      method: "HEAD",
      signal: controller.signal,
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
      },
    });

    clearTimeout(timeoutId);

    if (!response.ok) return false;

    const contentType = response.headers.get("content-type");
    const contentLength = response.headers.get("content-length");

    if (!contentType || !contentType.startsWith("image/")) return false;

    // Reject very small images
    if (contentLength && parseInt(contentLength) < 5000) return false;

    return true;
  } catch (error) {
    return false;
  }
}

async function main() {
  try {
    console.log("Starting improved image extraction...");

    // Get entries without images
    const { data: entries, error: fetchError } = await supabase
      .from("data_entries")
      .select("id, content, source_url, image_url")
      .is("image_url", null)
      .not("source_url", "is", null)
      .limit(10) // Process 10 entries for testing
      .order("created_at", { ascending: false });

    if (fetchError) {
      console.error("Error fetching entries:", fetchError);
      return;
    }

    if (!entries || entries.length === 0) {
      console.log("No entries without images found");
      return;
    }

    console.log(`Processing ${entries.length} entries...`);

    let processed = 0;
    let successful = 0;

    for (const entry of entries) {
      try {
        console.log(
          `\nProcessing entry ${entry.id}: ${entry.content.substring(
            0,
            100
          )}...`
        );

        const extractedImage = await extractBestImageFromUrl(entry.source_url);

        if (extractedImage) {
          const { error: updateError } = await supabase
            .from("data_entries")
            .update({
              image_url: extractedImage.url,
              image_alt: extractedImage.alt,
            })
            .eq("id", entry.id);

          if (updateError) {
            console.error(`Error updating entry ${entry.id}:`, updateError);
          } else {
            console.log(
              `✅ Successfully updated entry ${entry.id} with image: ${extractedImage.url}`
            );
            successful++;
          }
        } else {
          console.log(`❌ No suitable image found for entry ${entry.id}`);
        }

        processed++;

        // Add delay between requests
        await new Promise((resolve) => setTimeout(resolve, 2000));
      } catch (error) {
        console.error(`Error processing entry ${entry.id}:`, error);
        processed++;
      }
    }

    console.log(`\n=== Image Extraction Complete ===`);
    console.log(`Processed: ${processed}`);
    console.log(`Successful: ${successful}`);
    console.log(
      `Success rate: ${((successful / processed) * 100).toFixed(1)}%`
    );
  } catch (error) {
    console.error("Error in main function:", error);
  }
}

// Run the script
main().catch(console.error);
