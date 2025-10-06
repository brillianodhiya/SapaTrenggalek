const { createClient } = require("@supabase/supabase-js");
const cheerio = require("cheerio");
require("dotenv").config({ path: ".env.local" });

// Use built-in fetch for Node.js 18+
const fetch = globalThis.fetch;

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Decode HTML entities
function decodeHtmlEntities(text) {
  const entities = {
    "&lt;": "<",
    "&gt;": ">",
    "&amp;": "&",
    "&quot;": '"',
    "&#39;": "'",
    "&nbsp;": " ",
  };

  return text.replace(/&[#\w]+;/g, (entity) => {
    return entities[entity] || entity;
  });
}

// Extract actual URL from Google News redirect
function extractActualUrl(googleNewsUrl) {
  try {
    const url = new URL(googleNewsUrl);

    // Google News URLs often contain the actual URL in the path or query
    if (url.hostname === "news.google.com") {
      // Try to extract from the encoded URL
      const pathParts = url.pathname.split("/");
      const articlesPart = pathParts.find((part) =>
        part.startsWith("articles")
      );

      if (articlesPart) {
        // This is a complex encoded URL, we'll need to fetch it to get redirect
        return googleNewsUrl;
      }
    }

    return googleNewsUrl;
  } catch (error) {
    return googleNewsUrl;
  }
}

// Fetch actual content from URL
async function fetchActualContent(url) {
  try {
    console.log(`  🌐 Fetching content from: ${url.substring(0, 80)}...`);

    const response = await fetch(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
        Accept:
          "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.5",
        "Accept-Encoding": "gzip, deflate",
        Connection: "keep-alive",
        "Upgrade-Insecure-Requests": "1",
      },
      signal: AbortSignal.timeout(10000), // 10 second timeout
      redirect: "follow", // Follow redirects
    });

    if (!response.ok) {
      console.log(`  ❌ HTTP ${response.status}: ${response.statusText}`);
      return null;
    }

    const html = await response.text();
    console.log(`  ✅ Fetched ${html.length} characters`);
    return html;
  } catch (error) {
    console.log(`  ❌ Fetch error: ${error.message}`);
    return null;
  }
}

// Extract image from HTML content
function extractImageFromHTML(html, sourceUrl) {
  try {
    const $ = cheerio.load(html);

    // Priority order for image selection
    const selectors = [
      'meta[property="og:image"]', // Open Graph image (highest priority)
      'meta[name="twitter:image"]', // Twitter Card image
      'meta[property="twitter:image"]', // Twitter Card image (alternative)
      'link[rel="image_src"]', // Image source link
      "article img:first", // First image in article
      ".featured-image img", // Featured image class
      ".post-thumbnail img", // Post thumbnail
      ".entry-content img:first", // First image in entry content
      ".content img:first", // First image in content
      ".article-content img:first", // First image in article content
      'img[class*="featured"]', // Images with "featured" in class
      'img[src*="featured"]', // Images with "featured" in src
      'img[src*="thumbnail"]', // Images with "thumbnail" in src
      'img[alt*="featured"]', // Images with "featured" in alt
      "img:first", // Fallback to first image
    ];

    for (const selector of selectors) {
      let imageUrl;
      let alt;
      let caption;

      if (selector.includes("meta") || selector.includes("link")) {
        // Handle meta tags and link tags
        const element = $(selector).first();
        if (element.length > 0) {
          imageUrl = element.attr("content") || element.attr("href");
        }
      } else {
        // Handle img tags
        const img = $(selector).first();
        if (img.length > 0) {
          imageUrl =
            img.attr("src") ||
            img.attr("data-src") ||
            img.attr("data-lazy-src") ||
            img.attr("data-original");
          alt = img.attr("alt");

          // Try to find caption from nearby elements
          const figcaption = img
            .closest("figure")
            .find("figcaption")
            .text()
            .trim();
          const parentCaption = img
            .parent()
            .find(".caption, .wp-caption-text, .image-caption")
            .text()
            .trim();
          caption = figcaption || parentCaption || undefined;
        }
      }

      if (imageUrl) {
        // Convert relative URLs to absolute
        if (imageUrl.startsWith("//")) {
          imageUrl = "https:" + imageUrl;
        } else if (imageUrl.startsWith("/") && sourceUrl) {
          try {
            const baseUrl = new URL(sourceUrl);
            imageUrl = baseUrl.origin + imageUrl;
          } catch (e) {
            continue;
          }
        }

        // Validate image URL
        if (isValidImageUrl(imageUrl)) {
          console.log(
            `  🖼️  Found image via ${selector}: ${imageUrl.substring(0, 80)}...`
          );
          return {
            url: imageUrl,
            alt: alt || undefined,
            caption: caption || undefined,
          };
        }
      }
    }

    console.log(`  ❌ No valid images found in HTML`);
    return null;
  } catch (error) {
    console.error(`  ❌ Error extracting image from HTML:`, error.message);
    return null;
  }
}

// Extract image from Google News RSS content
function extractImageFromGoogleNews(content) {
  try {
    // Decode HTML entities first
    const decodedContent = decodeHtmlEntities(content);
    const $ = cheerio.load(decodedContent);

    // Look for images in the content
    const img = $("img").first();
    if (img.length > 0) {
      const src = img.attr("src");
      if (src && isValidImageUrl(src)) {
        console.log(`  🖼️  Found image in RSS: ${src.substring(0, 80)}...`);
        return {
          url: src,
          alt: img.attr("alt"),
          caption: undefined,
        };
      }
    }

    // Look for images in links
    const imgInLink = $("a img").first();
    if (imgInLink.length > 0) {
      const src = imgInLink.attr("src");
      if (src && isValidImageUrl(src)) {
        console.log(
          `  🖼️  Found image in RSS link: ${src.substring(0, 80)}...`
        );
        return {
          url: src,
          alt: imgInLink.attr("alt"),
          caption: undefined,
        };
      }
    }

    return null;
  } catch (error) {
    console.error(
      `  ❌ Error extracting image from Google News:`,
      error.message
    );
    return null;
  }
}

function isValidImageUrl(url) {
  try {
    const urlObj = new URL(url);

    // Check if it's a valid HTTP/HTTPS URL
    if (!["http:", "https:"].includes(urlObj.protocol)) {
      return false;
    }

    // Skip very small images (likely icons or tracking pixels)
    const pathname = urlObj.pathname.toLowerCase();
    if (
      pathname.includes("1x1") ||
      pathname.includes("pixel") ||
      pathname.includes("tracking")
    ) {
      return false;
    }

    // Check if it has a valid image extension or is from known image services
    const imageExtensions = [
      ".jpg",
      ".jpeg",
      ".png",
      ".gif",
      ".webp",
      ".svg",
      ".bmp",
    ];
    const hasImageExtension = imageExtensions.some((ext) =>
      pathname.endsWith(ext)
    );

    // Known image services/CDNs
    const imageServices = [
      "images.unsplash.com",
      "cdn.pixabay.com",
      "img.freepik.com",
      "images.pexels.com",
      "i.imgur.com",
      "media.giphy.com",
      "cloudinary.com",
      "amazonaws.com",
      "googleusercontent.com",
      "wp.com",
      "wordpress.com",
      "blogspot.com",
      "medium.com",
      "cdn.",
      "static.",
      "assets.",
    ];

    const isFromImageService = imageServices.some((service) =>
      urlObj.hostname.includes(service)
    );

    // Accept if it has image extension, is from known service, or looks like an image URL
    return (
      hasImageExtension ||
      isFromImageService ||
      pathname.includes("image") ||
      pathname.includes("photo")
    );
  } catch (error) {
    return false;
  }
}

function generatePlaceholderImage(category = "berita") {
  const width = 400;
  const height = 250;

  // Use Unsplash with relevant keywords based on category
  const keywords = {
    berita: "news,newspaper,information",
    laporan: "report,document,analysis",
    aspirasi: "community,people,discussion",
    lainnya: "trenggalek,indonesia,government",
  };

  const keyword = keywords[category] || keywords.lainnya;
  const seed = Math.floor(Math.random() * 1000);

  return `https://images.unsplash.com/${width}x${height}/?${keyword}&sig=${seed}`;
}

async function extractImagesAdvanced() {
  try {
    console.log("🖼️  Starting advanced image extraction from news...");

    // Get all news entries without images
    const { data: entries, error } = await supabase
      .from("data_entries")
      .select("id, content, source, source_url, category")
      .is("image_url", null)
      .limit(10); // Process 10 at a time for testing

    if (error) {
      console.error("Error fetching entries:", error);
      return;
    }

    console.log(`📰 Found ${entries.length} entries without images`);

    let updatedCount = 0;
    let extractedCount = 0;
    let placeholderCount = 0;

    for (const entry of entries) {
      console.log(`\n🔍 Processing entry ${entry.id}...`);
      console.log(`   Source: ${entry.source}`);
      console.log(`   Category: ${entry.category}`);

      let extractedImage = null;

      // Step 1: Try to extract from RSS content first
      if (entry.source === "Google News") {
        console.log(`  📡 Trying RSS content extraction...`);
        extractedImage = extractImageFromGoogleNews(entry.content);
      }

      // Step 2: If no image from RSS, try to fetch actual article
      if (!extractedImage && entry.source_url) {
        console.log(`  🌐 Trying actual article extraction...`);
        const actualUrl = extractActualUrl(entry.source_url);
        const html = await fetchActualContent(actualUrl);

        if (html) {
          extractedImage = extractImageFromHTML(html, actualUrl);
        }
      }

      // Step 3: If still no image, try extracting from any HTML in content
      if (!extractedImage) {
        console.log(`  📄 Trying content HTML extraction...`);
        extractedImage = extractImageFromHTML(entry.content, entry.source_url);
      }

      let imageUrl = null;
      let imageAlt = null;
      let imageCaption = null;

      if (extractedImage) {
        imageUrl = extractedImage.url;
        imageAlt = extractedImage.alt;
        imageCaption = extractedImage.caption;
        extractedCount++;
        console.log(`  ✅ Extracted image: ${imageUrl.substring(0, 80)}...`);
      } else {
        // Generate placeholder image
        imageUrl = generatePlaceholderImage(entry.category);
        imageAlt = `${entry.category} - Sapa Trenggalek`;
        placeholderCount++;
        console.log(
          `  🎨 Generated placeholder: ${imageUrl.substring(0, 80)}...`
        );
      }

      // Update the entry with image
      const { error: updateError } = await supabase
        .from("data_entries")
        .update({
          image_url: imageUrl,
          image_alt: imageAlt,
          image_caption: imageCaption,
          updated_at: new Date().toISOString(),
        })
        .eq("id", entry.id);

      if (updateError) {
        console.error(`  ❌ Error updating entry ${entry.id}:`, updateError);
      } else {
        updatedCount++;
        console.log(`  ✅ Updated entry ${entry.id}`);
      }

      // Delay to avoid overwhelming servers
      await new Promise((resolve) => setTimeout(resolve, 2000)); // 2 second delay
    }

    console.log("\n📊 Summary:");
    console.log(`   Total processed: ${entries.length}`);
    console.log(`   Successfully updated: ${updatedCount}`);
    console.log(`   With extracted images: ${extractedCount}`);
    console.log(`   With placeholder images: ${placeholderCount}`);
    console.log(
      `   Success rate: ${Math.round((extractedCount / entries.length) * 100)}%`
    );
  } catch (error) {
    console.error("❌ Error in advanced image extraction:", error);
  }
}

// Run the script
extractImagesAdvanced();
