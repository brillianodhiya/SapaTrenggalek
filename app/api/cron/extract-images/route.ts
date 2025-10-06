import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { extractBestImageFromUrl } from "@/lib/advanced-image-extractor";
import * as cheerio from "cheerio";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Enhanced image extraction from content
async function extractImageFromContent(url: string, content: string) {
  try {
    console.log("Extracting image from content...");

    // If content contains HTML, parse it for images
    if (content.includes("<img") || content.includes("src=")) {
      const $ = cheerio.load(content);

      // Look for images in the content
      const images: Array<{ src: string; alt?: string }> = [];
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
            !src.includes("blank")
          );
        });

        if (goodImages.length > 0) {
          console.log(`Found image in content: ${goodImages[0].src}`);
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
          console.log(`Found image URL in text: ${imageUrl}`);
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

function normalizeImageUrl(imageUrl: string, baseUrl: string): string {
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

async function isValidImageUrl(url: string): Promise<boolean> {
  try {
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
    ];

    const urlString = url.toLowerCase();
    if (rejectPatterns.some((pattern) => pattern.test(urlString))) {
      return false;
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
    if (contentLength && parseInt(contentLength) < 3000) return false; // Less than 3KB

    return true;
  } catch (error) {
    return false;
  }
}

export async function GET(request: NextRequest) {
  try {
    // Verify cron secret for security
    const authHeader = request.headers.get("authorization");
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    console.log("Starting automated image extraction...");

    // Get entries without images (limit to avoid timeout)
    const { data: entries, error: fetchError } = await supabase
      .from("data_entries")
      .select("id, content, source_url, image_url, category")
      .is("image_url", null)
      .limit(20) // Process 20 entries at a time
      .order("created_at", { ascending: false });

    if (fetchError) {
      console.error("Error fetching entries:", fetchError);
      return NextResponse.json({ error: "Database error" }, { status: 500 });
    }

    if (!entries || entries.length === 0) {
      return NextResponse.json({
        message: "No entries without images found",
        processed: 0,
      });
    }

    console.log(`Processing ${entries.length} entries...`);

    let processed = 0;
    let successful = 0;
    const results = [];

    for (const entry of entries) {
      try {
        console.log(
          `Processing entry ${entry.id}: ${entry.content.substring(0, 80)}...`
        );

        let imageUrl: string | null = null;
        let imageAlt: string | null = null;
        let imageSource = "none";

        // Method 1: Try advanced extraction from source URL
        if (entry.source_url) {
          const extractedImage = await extractBestImageFromUrl(
            entry.source_url
          );
          if (extractedImage) {
            imageUrl = extractedImage.url;
            imageAlt = extractedImage.alt || null;
            imageSource = "advanced";
          }
        }

        // Method 2: Extract from content if no URL extraction worked
        if (!imageUrl) {
          const contentImage = await extractImageFromContent(
            entry.source_url || "",
            entry.content
          );
          if (contentImage && (await isValidImageUrl(contentImage.src))) {
            imageUrl = contentImage.src;
            imageAlt = contentImage.alt || null;
            imageSource = "content";
          }
        }

        // Only update if we found a real image (no placeholders)
        if (imageUrl) {
          // Update the database with the extracted image
          const { error: updateError } = await supabase
            .from("data_entries")
            .update({
              image_url: imageUrl,
              image_alt:
                imageAlt || `Image for ${entry.content.substring(0, 50)}...`,
            })
            .eq("id", entry.id);

          if (updateError) {
            console.error(`Error updating entry ${entry.id}:`, updateError);
            results.push({
              id: entry.id,
              title: entry.content.substring(0, 100) + "...",
              status: "error",
              error: updateError.message,
            });
          } else {
            console.log(
              `Successfully updated entry ${entry.id} with ${imageSource} image: ${imageUrl}`
            );
            successful++;
            results.push({
              id: entry.id,
              title: entry.content.substring(0, 100) + "...",
              status: "success",
              image_url: imageUrl,
              source: imageSource,
            });
          }
        } else {
          console.log(
            `No suitable image found for entry ${entry.id} - leaving empty`
          );
          results.push({
            id: entry.id,
            title: entry.content.substring(0, 100) + "...",
            status: "no_image",
          });
        }

        processed++;

        // Add delay between requests to be respectful
        await new Promise((resolve) => setTimeout(resolve, 2000));
      } catch (error) {
        console.error(`Error processing entry ${entry.id}:`, error);
        results.push({
          id: entry.id,
          title: entry.content.substring(0, 100) + "...",
          status: "error",
          error: error instanceof Error ? error.message : "Unknown error",
        });
        processed++;
      }
    }

    console.log(
      `Image extraction completed. Processed: ${processed}, Successful: ${successful}`
    );

    return NextResponse.json({
      message: "Image extraction completed",
      processed,
      successful,
      results,
    });
  } catch (error) {
    console.error("Error in image extraction cron:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// Also allow POST for manual triggering
export async function POST(request: NextRequest) {
  return GET(request);
}
