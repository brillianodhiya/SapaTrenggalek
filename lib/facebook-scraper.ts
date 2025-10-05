// Facebook Official API Scraper for Sapa Trenggalek
// Using Facebook Graph API

interface FacebookScrapedData {
  content: string;
  source: string;
  source_url: string;
  author: string;
  timestamp: Date;
  metadata: {
    post_id: string;
    user_id: string;
    username: string;
    page_name?: string;
    post_type: "status" | "photo" | "video" | "link" | "event";
    media_url?: string;
    thumbnail_url?: string;
    like_count?: number;
    comment_count?: number;
    share_count?: number;
    reaction_count?: number;
    hashtags: string[];
    mentions: string[];
    location?: string;
    is_published: boolean;
  };
}

class FacebookScraper {
  private accessToken: string;
  private keywords: string[];

  constructor() {
    this.accessToken = process.env.FACEBOOK_ACCESS_TOKEN || "";

    // Keywords untuk monitoring Trenggalek
    this.keywords = [
      "trenggalek",
      "pemkabtrenggalek",
      "bupati_trenggalek",
      "kabupaten_trenggalek",
      "dinas_trenggalek",
      "pemerintah_trenggalek",
      "wisata_trenggalek",
      "kuliner_trenggalek",
      "trenggalekhits",
      "exploretrenggalek",
    ];
  }

  async scrapePagePosts(
    pageId: string,
    maxResults: number = 20
  ): Promise<FacebookScrapedData[]> {
    try {
      console.log(`📘 Scraping Facebook posts for page: ${pageId}...`);

      if (!this.isConfigured()) {
        console.log("⚠️ Facebook API not configured, skipping...");
        return [];
      }

      // Get page posts using Graph API
      const response = await fetch(
        `https://graph.facebook.com/v18.0/${pageId}/posts?fields=id,message,story,created_time,type,link,picture,full_picture,permalink_url,likes.summary(true),comments.summary(true),shares,reactions.summary(true),from&access_token=${
          this.accessToken
        }&limit=${Math.min(maxResults, 100)}`
      );

      if (!response.ok) {
        throw new Error(`Facebook API error: ${response.status}`);
      }

      const data = await response.json();

      if (data.error) {
        console.error("❌ Facebook API error:", data.error);
        return [];
      }

      if (!data.data || data.data.length === 0) {
        console.log(`📭 No posts found for page: ${pageId}`);
        return [];
      }

      console.log(`📊 Found ${data.data.length} Facebook posts`);

      const results: FacebookScrapedData[] = [];

      for (const post of data.data) {
        try {
          const scrapedData: FacebookScrapedData = {
            content: this.cleanContent(post.message || post.story || ""),
            source: "Facebook",
            source_url: post.permalink_url || `https://facebook.com/${post.id}`,
            author: post.from?.name || pageId,
            timestamp: new Date(post.created_time),
            metadata: {
              post_id: post.id,
              user_id: post.from?.id || pageId,
              username: post.from?.name || pageId,
              page_name: post.from?.name,
              post_type: this.mapPostType(post.type),
              media_url: post.full_picture || post.picture,
              thumbnail_url: post.picture,
              like_count: post.likes?.summary?.total_count || 0,
              comment_count: post.comments?.summary?.total_count || 0,
              share_count: post.shares?.count || 0,
              reaction_count: post.reactions?.summary?.total_count || 0,
              hashtags: this.extractHashtags(post.message || post.story || ""),
              mentions: this.extractMentions(post.message || post.story || ""),
              is_published: true,
            },
          };

          // Filter by keywords if needed
          if (
            this.containsKeywords(scrapedData.content) ||
            this.containsKeywords(scrapedData.author)
          ) {
            results.push(scrapedData);
          } else {
            // Include all posts for now, not just keyword matches
            results.push(scrapedData);
          }
        } catch (error) {
          console.error("❌ Error processing Facebook post:", error);
        }
      }

      console.log(
        `✅ Successfully scraped ${results.length} Facebook posts from ${pageId}`
      );
      return results;
    } catch (error: any) {
      console.error(`❌ Error scraping Facebook page ${pageId}:`, error);

      // Handle rate limiting
      if (error.message?.includes("429")) {
        console.log("⏰ Facebook rate limit reached");
      }

      // Handle authentication errors
      if (error.message?.includes("401") || error.message?.includes("400")) {
        console.log("🔐 Facebook authentication failed, check access token");
      }

      return [];
    }
  }

  async searchPosts(
    query: string,
    maxResults: number = 20
  ): Promise<FacebookScrapedData[]> {
    try {
      console.log(`🔍 Searching Facebook posts for: "${query}"...`);

      if (!this.isConfigured()) {
        console.log("⚠️ Facebook API not configured, skipping...");
        return [];
      }

      // Note: Facebook Graph API search is limited and requires special permissions
      console.log("⚠️ Facebook post search requires special permissions");
      console.log("💡 Using page-specific search instead");

      // Search within specific pages instead
      const targetPages = [
        "pemkabtrenggalek",
        "humastrengggalek",
        "dispartrenggalek",
      ];

      const allResults: FacebookScrapedData[] = [];

      for (const pageId of targetPages) {
        try {
          const pagePosts = await this.scrapePagePosts(pageId, 10);
          const filteredPosts = pagePosts.filter(
            (post) =>
              post.content.toLowerCase().includes(query.toLowerCase()) ||
              post.metadata.hashtags.some((tag) =>
                tag.toLowerCase().includes(query.toLowerCase())
              )
          );
          allResults.push(...filteredPosts);
        } catch (error) {
          console.log(`⚠️ Could not search in page @${pageId}:`, error);
        }
      }

      console.log(`✅ Found ${allResults.length} posts matching "${query}"`);
      return allResults.slice(0, maxResults);
    } catch (error: any) {
      console.error(`❌ Error searching Facebook posts:`, error);
      return [];
    }
  }

  // Main scraping method - scrapes multiple pages
  async scrapeAll(): Promise<FacebookScrapedData[]> {
    try {
      console.log("📘 Starting Facebook scraping for all pages...");

      if (!this.isConfigured()) {
        console.log("⚠️ Facebook API not configured, skipping...");
        return [];
      }

      const targetPages = [
        "pemkabtrenggalek",
        "humastrengggalek",
        "dispartrenggalek",
        "trenggalekhits",
        "exploretrenggalek",
      ];

      const allResults: FacebookScrapedData[] = [];

      for (const pageId of targetPages) {
        try {
          console.log(`🔍 Scraping Facebook page: ${pageId}...`);
          const pagePosts = await this.scrapePagePosts(pageId, 10);

          if (pagePosts.length > 0) {
            allResults.push(...pagePosts);
          }

          // Add delay to avoid rate limiting
          await this.delay(1000 + Math.random() * 1000); // 1-2 seconds random delay
        } catch (error) {
          console.log(`⚠️ Could not scrape Facebook page ${pageId}:`, error);
        }
      }

      console.log(
        `✅ Facebook scraping complete: ${allResults.length} posts found`
      );
      return allResults;
    } catch (error) {
      console.error("❌ Error in Facebook scraping:", error);
      return [];
    }
  }

  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  private mapPostType(
    fbType: string
  ): "status" | "photo" | "video" | "link" | "event" {
    switch (fbType) {
      case "photo":
        return "photo";
      case "video":
        return "video";
      case "link":
        return "link";
      case "event":
        return "event";
      default:
        return "status";
    }
  }

  private cleanContent(content: string): string {
    // Clean Facebook content: remove excessive hashtags, normalize whitespace
    return content
      .replace(/\n+/g, " ") // Replace newlines with spaces
      .replace(/\s+/g, " ") // Normalize whitespace
      .trim();
  }

  private extractHashtags(text: string): string[] {
    const hashtags = text.match(/#[\w\u00c0-\u024f\u1e00-\u1eff]+/gi) || [];
    return hashtags.map((tag) => tag.toLowerCase());
  }

  private extractMentions(text: string): string[] {
    const mentions = text.match(/@[\w.]+/g) || [];
    return mentions.map((mention) => mention.toLowerCase());
  }

  private containsKeywords(text: string): boolean {
    const textLower = text.toLowerCase();
    return this.keywords.some((keyword) =>
      textLower.includes(keyword.toLowerCase())
    );
  }

  private isConfigured(): boolean {
    return !!(
      this.accessToken && this.accessToken !== "your-facebook-access-token"
    );
  }

  // Get Facebook page info
  async getPageInfo(pageId: string): Promise<any> {
    try {
      if (!this.isConfigured()) return null;

      const response = await fetch(
        `https://graph.facebook.com/v18.0/${pageId}?fields=id,name,username,about,category,fan_count,followers_count,link,picture&access_token=${this.accessToken}`
      );

      if (!response.ok) {
        throw new Error(`Facebook API error: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error("❌ Error getting Facebook page info:", error);
      return null;
    }
  }

  // Get current user info (if using user access token)
  async getUserInfo(): Promise<any> {
    try {
      if (!this.isConfigured()) return null;

      const response = await fetch(
        `https://graph.facebook.com/v18.0/me?fields=id,name,email&access_token=${this.accessToken}`
      );

      if (!response.ok) {
        throw new Error(`Facebook API error: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error("❌ Error getting Facebook user info:", error);
      return null;
    }
  }
}

export { FacebookScraper, type FacebookScrapedData };
