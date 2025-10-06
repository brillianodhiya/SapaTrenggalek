import * as cheerio from "cheerio";
import { validateImageUrl } from "./image-extractor";
import { resolveGoogleNewsUrl, isNewsArticleUrl } from "./google-news-resolver";

interface ExtractedImage {
  url: string;
  alt?: string;
  caption?: string;
  quality: "high" | "medium" | "low";
  dimensions?: { width: number; height: number };
}

export async function extractBestImageFromUrl(
  url: string
): Promise<ExtractedImage | null> {
  try {
    console.log(`Extracting image from: ${url.substring(0, 100)}...`);

    // First, resolve Google News URLs to actual article URLs
    const resolvedUrl = await resolveGoogleNewsUrl(url);
    if (!resolvedUrl) {
      console.log("Failed to resolve URL");
      return null;
    }

    // Check if the resolved URL is actually a news article
    if (!isNewsArticleUrl(resolvedUrl)) {
      console.log("URL does not appear to be a news article");
      return null;
    }

    console.log(`Resolved URL: ${resolvedUrl}`);

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 second timeout

    const response = await fetch(resolvedUrl, {
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
      console.log(`Failed to fetch ${resolvedUrl}: ${response.status}`);
      return null;
    }

    const html = await response.text();
    const $ = cheerio.load(html);

    // Extract all potential images with scoring
    const candidates: Array<ExtractedImage & { score: number }> = [];

    // 1. Open Graph and Twitter Card images (highest priority)
    const ogImage = $('meta[property="og:image"]').attr("content");
    if (ogImage) {
      candidates.push({
        url: ogImage,
        quality: "high" as const,
        score: 100,
        alt: $('meta[property="og:image:alt"]').attr("content"),
      });
    }

    const twitterImage = $('meta[name="twitter:image"]').attr("content");
    if (twitterImage && twitterImage !== ogImage) {
      candidates.push({
        url: twitterImage,
        quality: "high" as const,
        score: 95,
        alt: $('meta[name="twitter:image:alt"]').attr("content"),
      });
    }

    // 2. Structured data images
    $('script[type="application/ld+json"]').each((_, script) => {
      try {
        const data = JSON.parse($(script).html() || "{}");
        if (data.image) {
          const imageUrl =
            typeof data.image === "string" ? data.image : data.image.url;
          if (imageUrl) {
            candidates.push({
              url: imageUrl,
              quality: "high" as const,
              score: 90,
              alt: data.image.caption || data.headline,
            });
          }
        }
      } catch (e) {
        // Ignore JSON parse errors
      }
    });

    // 3. Article and content images with quality scoring
    const contentSelectors = [
      { selector: "article img", baseScore: 80 },
      { selector: ".post-content img", baseScore: 75 },
      { selector: ".entry-content img", baseScore: 75 },
      { selector: ".content img", baseScore: 70 },
      { selector: ".featured-image img", baseScore: 85 },
      { selector: ".post-thumbnail img", baseScore: 80 },
      { selector: ".wp-post-image", baseScore: 80 },
      { selector: "figure img", baseScore: 75 },
      { selector: ".image-container img", baseScore: 70 },
      { selector: "main img", baseScore: 65 },
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
          else if (width > 200 && height > 150) score += 5;

          // Boost score for images with good alt text
          const alt = $img.attr("alt");
          if (alt && alt.length > 10) score += 5;

          // Reduce score for images with suspicious attributes
          const className = $img.attr("class") || "";
          if (className.includes("avatar") || className.includes("logo"))
            score -= 20;

          // Find caption
          const figcaption = $img
            .closest("figure")
            .find("figcaption")
            .text()
            .trim();
          const caption =
            figcaption ||
            $img.parent().find(".caption, .wp-caption-text").text().trim();

          candidates.push({
            url: normalizeImageUrl(src, resolvedUrl),
            quality: score > 75 ? "high" : score > 60 ? "medium" : "low",
            score,
            alt,
            caption: caption || undefined,
            dimensions: width && height ? { width, height } : undefined,
          });
        }
      });
    }

    // Sort candidates by score and validate
    candidates.sort((a, b) => b.score - a.score);

    for (const candidate of candidates) {
      if (await isHighQualityImage(candidate.url)) {
        console.log(
          `Selected image: ${candidate.url} (score: ${candidate.score})`
        );
        return {
          url: candidate.url,
          alt: candidate.alt,
          caption: candidate.caption,
          quality: candidate.quality,
          dimensions: candidate.dimensions,
        };
      }
    }

    console.log(`No suitable image found for: ${resolvedUrl}`);
    return null;
  } catch (error) {
    console.error(`Error extracting image from ${url}:`, error);
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

async function isHighQualityImage(url: string): Promise<boolean> {
  try {
    // Basic URL validation
    const urlObj = new URL(url);

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
      /wp-content.*avatar/i,
      /\d+x\d+.*placeholder/i,
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
    return await validateImageUrl(url);
  } catch (error) {
    return false;
  }
}

export async function extractImagesFromMultipleUrls(
  urls: string[]
): Promise<Array<{ url: string; image: ExtractedImage | null }>> {
  const results = [];

  for (const url of urls) {
    try {
      const image = await extractBestImageFromUrl(url);
      results.push({ url, image });

      // Add delay to avoid overwhelming servers
      await new Promise((resolve) => setTimeout(resolve, 1000));
    } catch (error) {
      console.error(`Error processing ${url}:`, error);
      results.push({ url, image: null });
    }
  }

  return results;
}
