require("dotenv").config({ path: ".env.local" });
const { createClient } = require("@supabase/supabase-js");
const cheerio = require("cheerio");

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Enhanced image extraction from content only (no placeholders)
async function extractImageFromContent(url, content) {
  try {
    console.log(`Extracting image from content...`);

    // If content contains HTML, parse it for images
    if (content.includes("<img") || content.includes("src=")) {
      const $ = cheerio.load(content);

      // Look for images in the content
      const images = [];
      $("img").each((_, img) => {
        const src = $(img).attr("src");
        const alt = $(img).attr("alt");
        if (src) {
          images.push({ src: normalizeImageUrl(src, url), alt });
        }
      });

      if (images.length > 0) {
        // Filter out small/placeholder images
        const goodImages = images.filter((img) => {
          const src = img.src.toLowerCase();
          return (
            !src.includes("placeholder") &&
            !src.includes("loading") &&
            !src.includes("1x1") &&
            !src.includes("pixel") &&
            !src.includes("spacer") &&
            !src.includes("blank") &&
            !src.includes("logo") &&
            !src.includes("icon") &&
            !src.includes("avatar")
          );
        });

        if (goodImages.length > 0) {
          console.log(`✅ Found image in content: ${goodImages[0].src}`);
          return goodImages[0];
        }
      }
    }

    // Look for image URLs in plain text content
    const imageUrlPattern =
      /https?:\/\/[^\s]+\.(?:jpg|jpeg|png|gif|webp|bmp)(?:\?[^\s]*)?/gi;
    const imageUrls = content.match(imageUrlPattern);

    if (imageUrls && imageUrls.length > 0) {
      for (const imageUrl of imageUrls) {
        if (await isValidImageUrl(imageUrl)) {
          console.log(`✅ Found image URL in text: ${imageUrl}`);
          return { src: imageUrl, alt: null };
        }
      }
    }

    return null;
  } catch (error) {
    console.error("Error extracting image from content:", error);
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

async function isValidImageUrl(url) {
  try {
    // Basic URL validation
    const urlObj = new URL(url);

    // Reject known bad patterns
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
      /unsplash/i,
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
      if (width < 200 || height < 150) {
        return false;
      }
    }

    // Quick HEAD request to validate
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
    if (contentLength && parseInt(contentLength) < 5000) return false; // Less than 5KB

    return true;
  } catch (error) {
    return false;
  }
}

async function main() {
  try {
    console.log("🖼️ Starting image extraction (no placeholders)...\n");

    // Get entries without images
    const { data: entries, error: fetchError } = await supabase
      .from("data_entries")
      .select("id, content, source_url, image_url, category")
      .is("image_url", null)
      .limit(50) // Process more entries for initial run
      .order("created_at", { ascending: false });

    if (fetchError) {
      console.error("Error fetching entries:", fetchError);
      return;
    }

    if (!entries || entries.length === 0) {
      console.log("No entries without images found");
      return;
    }

    console.log(`Processing ${entries.length} entries...\n`);

    let processed = 0;
    let successful = 0;
    let skipped = 0;

    for (const entry of entries) {
      try {
        console.log(
          `📰 Entry ${entry.id}: ${entry.content.substring(0, 80)}...`
        );

        let imageUrl = null;
        let imageAlt = null;
        let imageSource = "none";

        // Method 1: Extract from content
        const contentImage = await extractImageFromContent(
          entry.source_url || "",
          entry.content
        );
        if (contentImage && (await isValidImageUrl(contentImage.src))) {
          imageUrl = contentImage.src;
          imageAlt = contentImage.alt;
          imageSource = "content";
        }

        // Only update if we found a real image (no placeholders)
        if (imageUrl) {
          const { error: updateError } = await supabase
            .from("data_entries")
            .update({
              image_url: imageUrl,
              image_alt:
                imageAlt || `Image for ${entry.content.substring(0, 50)}...`,
            })
            .eq("id", entry.id);

          if (updateError) {
            console.error(`❌ Error updating entry ${entry.id}:`, updateError);
          } else {
            console.log(
              `✅ Updated with ${imageSource} image: ${imageUrl.substring(
                0,
                80
              )}...`
            );
            successful++;
          }
        } else {
          console.log(
            `⚪ No suitable image found - leaving empty (as requested)`
          );
          skipped++;
        }

        processed++;

        // Add delay between requests
        await new Promise((resolve) => setTimeout(resolve, 1500));
      } catch (error) {
        console.error(`❌ Error processing entry ${entry.id}:`, error);
        processed++;
      }
    }

    console.log(`\n=== Image Extraction Complete ===`);
    console.log(`📊 Processed: ${processed}`);
    console.log(`✅ Successful: ${successful}`);
    console.log(`⚪ Skipped (no image): ${skipped}`);
    console.log(
      `📈 Success rate: ${
        processed > 0 ? ((successful / processed) * 100).toFixed(1) : 0
      }%`
    );
    console.log(
      `\n✨ No placeholder images used - only real extracted images!`
    );
  } catch (error) {
    console.error("Error in main function:", error);
  }
}

main().catch(console.error);
