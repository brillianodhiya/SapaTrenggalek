/**
 * Resolves Google News RSS redirect URLs to actual article URLs
 */
export async function resolveGoogleNewsUrl(
  googleNewsUrl: string
): Promise<string | null> {
  try {
    // Check if it's a Google News URL
    if (!googleNewsUrl.includes("news.google.com/rss/articles/")) {
      return googleNewsUrl; // Return as-is if not a Google News URL
    }

    console.log(
      `Resolving Google News URL: ${googleNewsUrl.substring(0, 100)}...`
    );

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

    // Follow redirects to get the final URL
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

    // If HEAD request fails, try GET with manual redirect following
    return await followRedirectsManually(googleNewsUrl);
  } catch (error) {
    console.error(`Error resolving Google News URL: ${error}`);
    return null;
  }
}

async function followRedirectsManually(
  url: string,
  maxRedirects: number = 5
): Promise<string | null> {
  let currentUrl = url;
  let redirectCount = 0;

  while (redirectCount < maxRedirects) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);

      const response = await fetch(currentUrl, {
        method: "GET",
        signal: controller.signal,
        redirect: "manual", // Handle redirects manually
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
          Accept:
            "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
          "Accept-Language": "id-ID,id;q=0.9,en;q=0.8",
        },
      });

      clearTimeout(timeoutId);

      // Check if it's a redirect
      if (response.status >= 300 && response.status < 400) {
        const location = response.headers.get("location");
        if (location) {
          currentUrl = new URL(location, currentUrl).href;
          redirectCount++;
          console.log(`Redirect ${redirectCount}: ${currentUrl}`);
          continue;
        }
      }

      // If we get here, we have the final URL
      if (response.ok) {
        console.log(`Final resolved URL: ${currentUrl}`);
        return currentUrl;
      }

      break;
    } catch (error) {
      console.error(`Error following redirect: ${error}`);
      break;
    }
  }

  return null;
}

/**
 * Extracts the actual news domain from a resolved URL
 */
export function extractNewsDomain(url: string): string | null {
  try {
    const urlObj = new URL(url);

    // List of known Indonesian news domains
    const newsDomains = [
      "detik.com",
      "kompas.com",
      "tribunnews.com",
      "liputan6.com",
      "okezone.com",
      "antaranews.com",
      "tempo.co",
      "cnnindonesia.com",
      "suara.com",
      "republika.co.id",
      "sindonews.com",
      "jpnn.com",
      "viva.co.id",
      "bisnis.com",
      "kontan.co.id",
      "merdeka.com",
      "kapanlagi.com",
      "grid.id",
      "bola.com",
      "bolasport.com",
      "goal.com",
      "tirto.id",
      "thejakartapost.com",
      "jawapos.com",
      "pikiran-rakyat.com",
      "mediaindonesia.com",
      "beritasatu.com",
      "wartakota.tribunnews.com",
      "jatim.tribunnews.com",
      "surabaya.tribunnews.com",
      "malang.tribunnews.com",
      "kediri.tribunnews.com",
      "blitar.tribunnews.com",
      "tulungagung.tribunnews.com",
      "trenggalek.tribunnews.com",
      "ponorogo.tribunnews.com",
      "madiun.tribunnews.com",
      "ngawi.tribunnews.com",
      "bojonegoro.tribunnews.com",
      "tuban.tribunnews.com",
      "lamongan.tribunnews.com",
      "gresik.tribunnews.com",
      "sidoarjo.tribunnews.com",
      "pasuruan.tribunnews.com",
      "probolinggo.tribunnews.com",
      "lumajang.tribunnews.com",
      "jember.tribunnews.com",
      "bondowoso.tribunnews.com",
      "situbondo.tribunnews.com",
      "banyuwangi.tribunnews.com",
    ];

    const hostname = urlObj.hostname.toLowerCase();

    // Check if it's a known news domain
    for (const domain of newsDomains) {
      if (hostname.includes(domain)) {
        return domain;
      }
    }

    return hostname;
  } catch (error) {
    return null;
  }
}

/**
 * Checks if a URL is likely to be a news article
 */
export function isNewsArticleUrl(url: string): boolean {
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
      "/sitemap",
      "/wp-admin",
      "/wp-content",
      "/wp-includes",
      "facebook.com",
      "twitter.com",
      "instagram.com",
      "youtube.com",
      "tiktok.com",
      "whatsapp.com",
      "telegram.org",
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
      "/index.php",
      ".html",
      ".htm",
    ];

    for (const indicator of articleIndicators) {
      if (pathname.includes(indicator)) {
        return true;
      }
    }

    // If URL has date patterns, likely an article
    const datePattern = /\/\d{4}\/\d{2}\/\d{2}\//;
    if (datePattern.test(pathname)) {
      return true;
    }

    // If URL has ID patterns, likely an article
    const idPattern = /\/\d{6,}/;
    if (idPattern.test(pathname)) {
      return true;
    }

    return false;
  } catch (error) {
    return false;
  }
}
