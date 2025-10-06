import * as cheerio from "cheerio";

interface ExtractedImage {
  url: string;
  alt?: string;
  caption?: string;
}

export function extractImageFromHTML(
  html: string,
  sourceUrl?: string
): ExtractedImage | null {
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
      let imageUrl: string | undefined;
      let alt: string | undefined;
      let caption: string | undefined;

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

          // Try to find caption from nearby elements
          const figcaption = img
            .closest("figure")
            .find("figcaption")
            .text()
            .trim();
          const parentCaption = img
            .parent()
            .find(".caption, .wp-caption-text")
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
            // If sourceUrl is invalid, skip this image
            continue;
          }
        }

        // Validate image URL
        if (isValidImageUrl(imageUrl)) {
          return {
            url: imageUrl,
            alt: alt || undefined,
            caption: caption || undefined,
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

export function extractImageFromGoogleNews(
  content: string
): ExtractedImage | null {
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
          caption: undefined,
        };
      }
    }

    // Look for images in links (Google News sometimes wraps images in links)
    const imgInLink = $("a img").first();
    if (imgInLink.length > 0) {
      const src = imgInLink.attr("src");
      if (src && isValidImageUrl(src)) {
        return {
          url: src,
          alt: imgInLink.attr("alt"),
          caption: undefined,
        };
      }
    }

    return null;
  } catch (error) {
    console.error("Error extracting image from Google News content:", error);
    return null;
  }
}

function isValidImageUrl(url: string): boolean {
  try {
    const urlObj = new URL(url);

    // Check if it's a valid HTTP/HTTPS URL
    if (!["http:", "https:"].includes(urlObj.protocol)) {
      return false;
    }

    // Reject low-quality or placeholder images
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
      /googleusercontent.*=s\d+/i, // Google thumbnails with size parameter
    ];

    const urlString = url.toLowerCase();
    if (rejectPatterns.some((pattern) => pattern.test(urlString))) {
      return false;
    }

    // Check minimum dimensions in URL (reject very small images)
    const dimensionMatch = urlString.match(/(\d+)x(\d+)/);
    if (dimensionMatch) {
      const width = parseInt(dimensionMatch[1]);
      const height = parseInt(dimensionMatch[2]);
      if (width < 200 || height < 150) {
        return false;
      }
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

    // Known image services/CDNs (but exclude low-quality ones)
    const imageServices = [
      "images.unsplash.com",
      "cdn.pixabay.com",
      "img.freepik.com",
      "images.pexels.com",
      "i.imgur.com",
      "media.giphy.com",
      "cloudinary.com",
      "amazonaws.com",
      "wp.com",
      "wordpress.com",
      "blogspot.com",
      "detik.com",
      "kompas.com",
      "tribunnews.com",
      "liputan6.com",
      "okezone.com",
      "antaranews.com",
      "tempo.co",
      "cnnindonesia.com",
      "suara.com",
    ];

    const isFromImageService = imageServices.some((service) =>
      urlObj.hostname.includes(service)
    );

    // Accept if it has image extension or is from known image service
    return hasImageExtension || isFromImageService;
  } catch (error) {
    return false;
  }
}

export async function validateImageUrl(url: string): Promise<boolean> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout

    const response = await fetch(url, {
      method: "HEAD",
      signal: controller.signal,
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
      },
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      return false;
    }

    const contentType = response.headers.get("content-type");
    const contentLength = response.headers.get("content-length");

    // Check if it's actually an image
    if (!contentType || !contentType.startsWith("image/")) {
      return false;
    }

    // Reject very small images (likely placeholders)
    if (contentLength) {
      const size = parseInt(contentLength);
      if (size < 5000) {
        // Less than 5KB
        return false;
      }
    }

    return true;
  } catch (error) {
    return false;
  }
}

export function generatePlaceholderImage(
  title: string,
  category: string = "berita"
): string {
  // Generate a placeholder image URL using a service like Unsplash or a local placeholder
  const width = 400;
  const height = 250;

  // Use Unsplash with relevant keywords based on category
  const keywords = {
    berita: "news,newspaper,information",
    laporan: "report,document,analysis",
    aspirasi: "community,people,discussion",
    lainnya: "trenggalek,indonesia,government",
  };

  const keyword =
    keywords[category as keyof typeof keywords] || keywords.lainnya;

  return `https://images.unsplash.com/${width}x${height}/?${keyword}&sig=${Math.random()}`;
}
