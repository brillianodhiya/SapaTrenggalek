const { createClient } = require("@supabase/supabase-js");
const cheerio = require("cheerio");
require("dotenv").config({ path: ".env.local" });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

function extractImageFromHTML(html, sourceUrl) {
  try {
    const $ = cheerio.load(html);

    // Priority order for image selection
    const selectors = [
      'meta[property="og:image"]', // Open Graph image (highest priority)
      'meta[name="twitter:image"]', // Twitter Card image
      "article img:first", // First image in article
      ".featured-image img", // Featured image class
      ".post-thumbnail img", // Post thumbnail
      ".entry-content img:first", // First image in entry content
      'img[src*="featured"]', // Images with "featured" in src
      'img[src*="thumbnail"]', // Images with "thumbnail" in src
      "img:first", // Fallback to first image
    ];

    for (const selector of selectors) {
      let imageUrl;
      let alt;

      if (selector.includes("meta")) {
        // Handle meta tags
        const metaContent = $(selector).attr("content");
        if (metaContent) {
          imageUrl = metaContent;
        }
      } else {
        // Handle img tags
        const img = $(selector).first();
        if (img.length > 0) {
          imageUrl =
            img.attr("src") ||
            img.attr("data-src") ||
            img.attr("data-lazy-src");
          alt = img.attr("alt");
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
          return {
            url: imageUrl,
            alt: alt || undefined,
          };
        }
      }
    }

    return null;
  } catch (error) {
    console.error("Error extracting image from HTML:", error);
    return null;
  }
}

function extractImageFromGoogleNews(content) {
  try {
    // Google News RSS often contains images in the content
    const $ = cheerio.load(content);

    // Look for images in the content
    const img = $("img").first();
    if (img.length > 0) {
      const src = img.attr("src");
      if (src && isValidImageUrl(src)) {
        return {
          url: src,
          alt: img.attr("alt"),
        };
      }
    }

    return null;
  } catch (error) {
    console.error("Error extracting image from Google News content:", error);
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

    // Check if it has a valid image extension or is from known image services
    const pathname = urlObj.pathname.toLowerCase();
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
    ];

    const isFromImageService = imageServices.some((service) =>
      urlObj.hostname.includes(service)
    );

    return hasImageExtension || isFromImageService;
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

async function extractImagesFromNews() {
  try {
    console.log("🖼️  Starting image extraction from news...");

    // Get all news entries without images
    const { data: entries, error } = await supabase
      .from("data_entries")
      .select("id, content, source, source_url, category")
      .is("image_url", null)
      .limit(50); // Process 50 at a time

    if (error) {
      console.error("Error fetching entries:", error);
      return;
    }

    console.log(`📰 Found ${entries.length} entries without images`);

    let updatedCount = 0;
    let placeholderCount = 0;

    for (const entry of entries) {
      console.log(`\n🔍 Processing entry ${entry.id}...`);

      let extractedImage = null;

      // Try to extract image from content
      if (entry.source === "Google News") {
        extractedImage = extractImageFromGoogleNews(entry.content);
      } else {
        extractedImage = extractImageFromHTML(entry.content, entry.source_url);
      }

      let imageUrl = null;
      let imageAlt = null;

      if (extractedImage) {
        imageUrl = extractedImage.url;
        imageAlt = extractedImage.alt;
        console.log(`✅ Found image: ${imageUrl}`);
      } else {
        // Generate placeholder image
        imageUrl = generatePlaceholderImage(entry.category);
        imageAlt = `${entry.category} - Sapa Trenggalek`;
        placeholderCount++;
        console.log(`🎨 Generated placeholder: ${imageUrl}`);
      }

      // Update the entry with image
      const { error: updateError } = await supabase
        .from("data_entries")
        .update({
          image_url: imageUrl,
          image_alt: imageAlt,
          updated_at: new Date().toISOString(),
        })
        .eq("id", entry.id);

      if (updateError) {
        console.error(`❌ Error updating entry ${entry.id}:`, updateError);
      } else {
        updatedCount++;
        console.log(`✅ Updated entry ${entry.id}`);
      }

      // Small delay to avoid overwhelming the API
      await new Promise((resolve) => setTimeout(resolve, 100));
    }

    console.log("\n📊 Summary:");
    console.log(`   Total processed: ${entries.length}`);
    console.log(`   Successfully updated: ${updatedCount}`);
    console.log(`   With extracted images: ${updatedCount - placeholderCount}`);
    console.log(`   With placeholder images: ${placeholderCount}`);
  } catch (error) {
    console.error("❌ Error in image extraction:", error);
  }
}

// Run the script
extractImagesFromNews();
