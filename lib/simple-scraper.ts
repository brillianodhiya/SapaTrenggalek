// Simple scraper without problematic dependencies
export interface ScrapedData {
  content: string;
  source: string;
  source_url: string;
  author: string;
  timestamp: Date;
}

// Keywords untuk monitoring
const MONITORING_KEYWORDS = [
  "trenggalek",
  "pemkab trenggalek",
  "bupati trenggalek",
  "dinas trenggalek",
  "kecamatan trenggalek",
];

export async function scrapeNewsData(): Promise<ScrapedData[]> {
  const results: ScrapedData[] = [];

  try {
    console.log("🔍 Starting simple news scraping...");

    // Use native fetch instead of axios to avoid undici issues
    const response = await fetch(
      "https://news.google.com/rss/search?q=trenggalek&hl=id&gl=ID&ceid=ID:id",
      {
        headers: {
          "User-Agent": "Mozilla/5.0 (compatible; SapaTrenggalek/1.0)",
          Accept: "application/rss+xml, application/xml, text/xml",
        },
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const xmlText = await response.text();
    console.log(`📡 Received ${xmlText.length} bytes from Google News`);

    // Simple XML parsing without cheerio
    const items = parseRSSItems(xmlText);
    console.log(`📰 Found ${items.length} news items`);

    // Filter items with monitoring keywords
    for (const item of items) {
      const contentLower = (item.title + " " + item.description).toLowerCase();
      const hasKeyword = MONITORING_KEYWORDS.some((keyword) =>
        contentLower.includes(keyword.toLowerCase())
      );

      if (hasKeyword && item.title && item.link) {
        results.push({
          content: `${item.title}\n\n${item.description}`,
          source: "Google News",
          source_url: item.link,
          author: "Various News Sources",
          timestamp: new Date(item.pubDate || Date.now()),
        });
      }
    }

    console.log(`✅ Found ${results.length} relevant news items`);
  } catch (error) {
    console.error("❌ Error scraping news:", error);

    // Add fallback sample data if scraping fails
    console.log("📝 Adding fallback sample data...");
    results.push({
      content:
        "Fallback: Pemerintah Kabupaten Trenggalek terus berkomitmen meningkatkan pelayanan publik untuk masyarakat",
      source: "Fallback News",
      source_url: "https://example.com/fallback",
      author: "System Fallback",
      timestamp: new Date(),
    });
  }

  return results;
}

// Simple RSS parser without external dependencies
function parseRSSItems(xmlText: string) {
  const items: Array<{
    title: string;
    link: string;
    description: string;
    pubDate: string;
  }> = [];

  try {
    // Simple regex-based XML parsing (not perfect but works for RSS)
    const itemRegex = /<item[^>]*>([\s\S]*?)<\/item>/gi;
    const titleRegex =
      /<title[^>]*><!\[CDATA\[(.*?)\]\]><\/title>|<title[^>]*>(.*?)<\/title>/i;
    const linkRegex = /<link[^>]*>(.*?)<\/link>/i;
    const descRegex =
      /<description[^>]*><!\[CDATA\[(.*?)\]\]><\/description>|<description[^>]*>(.*?)<\/description>/i;
    const pubDateRegex = /<pubDate[^>]*>(.*?)<\/pubDate>/i;

    let match;
    while ((match = itemRegex.exec(xmlText)) !== null) {
      const itemXml = match[1];

      const titleMatch = titleRegex.exec(itemXml);
      const linkMatch = linkRegex.exec(itemXml);
      const descMatch = descRegex.exec(itemXml);
      const pubDateMatch = pubDateRegex.exec(itemXml);

      const title = (titleMatch?.[1] || titleMatch?.[2] || "").trim();
      const link = (linkMatch?.[1] || "").trim();
      const description = (descMatch?.[1] || descMatch?.[2] || "")
        .replace(/<[^>]*>/g, "")
        .trim();
      const pubDate = (pubDateMatch?.[1] || "").trim();

      if (title && link) {
        items.push({
          title,
          link,
          description,
          pubDate,
        });
      }
    }
  } catch (error) {
    console.error("❌ Error parsing RSS:", error);
  }

  return items;
}

// Simulasi scraping media sosial
export async function scrapeSocialMedia(): Promise<ScrapedData[]> {
  return [
    {
      content:
        "Jalan di Kecamatan Panggul rusak parah, mohon segera diperbaiki @pemkabtrenggalek",
      source: "Twitter",
      source_url: "https://twitter.com/example/status/123",
      author: "@warga_trenggalek",
      timestamp: new Date(),
    },
    {
      content:
        "Pelayanan di Disdukcapil Trenggalek sangat memuaskan, terima kasih!",
      source: "Facebook",
      source_url: "https://facebook.com/example/post/456",
      author: "Budi Santoso",
      timestamp: new Date(),
    },
  ];
}

export async function scrapeAllSources(): Promise<ScrapedData[]> {
  const [newsData, socialData] = await Promise.all([
    scrapeNewsData(),
    scrapeSocialMedia(),
  ]);

  return [...newsData, ...socialData];
}
