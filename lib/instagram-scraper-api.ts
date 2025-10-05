// Instagram Official API Scraper for Sapa Trenggalek
// Using Instagram Basic Display API and Graph API

interface InstagramScrapedData {
  content: string;
  source: string;
  source_url: string;
  author: string;
  timestamp: Date;
  metadata: {
    post_id: string;
    user_id: string;
    username: string;
    media_type: "IMAGE" | "VIDEO" | "CAROUSEL_ALBUM";
    media_url?: string;
    thumbnail_url?: string;
    like_count?: number;
    comments_count?: number;
    hashtags: string[];
    mentions: string[];
    location?: string;
    is_story?: boolean;
  };
}

class InstagramScraper {
  private accessToken: string;
  private keywords: string[];

  constructor() {
    this.accessToken = process.env.INSTAGRAM_ACCESS_TOKEN || "";

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

  async scrapeUserMedia(
    username: string,
    maxResults: number = 20
  ): Promise<InstagramScrapedData[]> {
    try {
      console.log(`📸 Scraping Instagram posts for @${username}...`);

      if (!this.isConfigured()) {
        console.log("⚠️ Instagram API not configured, skipping...");
        return [];
      }

      // For Instagram API, we can access the authenticated user's media
      if (username === "me" || !username) {
        return this.scrapeCurrentUserMedia(maxResults);
      }

      // For other users, we need to check if we have access
      console.log(`🔍 Attempting to scrape @${username} via Instagram API...`);
      return this.scrapeOtherUserMedia(username, maxResults);
    } catch (error: any) {
      console.error(`❌ Error scraping Instagram @${username}:`, error);
      return [];
    }
  }

  async scrapeHashtagMedia(
    hashtag: string,
    maxResults: number = 20
  ): Promise<InstagramScrapedData[]> {
    try {
      console.log(`📸 Scraping Instagram hashtag #${hashtag}...`);

      if (!this.isConfigured()) {
        console.log("⚠️ Instagram API not configured, skipping...");
        return [];
      }

      // Note: Hashtag search requires Instagram Graph API with business account
      console.log(
        "⚠️ Hashtag search requires business Instagram account and Graph API"
      );
      console.log(
        "💡 After business verification, you can access hashtag endpoints"
      );

      return [];
    } catch (error: any) {
      console.error(`❌ Error scraping hashtag #${hashtag}:`, error);
      return [];
    }
  }

  // Main scraping method - scrapes multiple accounts
  async scrapeAll(): Promise<InstagramScrapedData[]> {
    try {
      console.log("📸 Starting Instagram API scraping...");

      if (!this.isConfigured()) {
        console.log("⚠️ Instagram API not configured, skipping...");
        return [];
      }

      // With Instagram API, we can only access authenticated user's media
      const results = await this.scrapeCurrentUserMedia(25);

      console.log(
        `✅ Instagram API scraping complete: ${results.length} posts found`
      );
      return results;
    } catch (error) {
      console.error("❌ Error in Instagram API scraping:", error);
      return [];
    }
  }

  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  // Instagram API method for current user
  async scrapeCurrentUserMedia(
    maxResults: number = 20
  ): Promise<InstagramScrapedData[]> {
    try {
      console.log(`📸 Scraping current user's Instagram media...`);

      // Get current user info
      const userInfoResponse = await fetch(
        `https://graph.instagram.com/me?fields=id,username&access_token=${this.accessToken}`
      );

      if (!userInfoResponse.ok) {
        throw new Error(`Instagram API error: ${userInfoResponse.status}`);
      }

      const userInfo = await userInfoResponse.json();

      if (userInfo.error) {
        console.error("❌ Instagram API error:", userInfo.error);
        return [];
      }

      console.log(
        `📸 Scraping media for authenticated user: @${userInfo.username}`
      );

      // Get user's recent media
      const mediaResponse = await fetch(
        `https://graph.instagram.com/me/media?fields=id,caption,media_type,media_url,thumbnail_url,permalink,timestamp,like_count,comments_count&access_token=${
          this.accessToken
        }&limit=${Math.min(maxResults, 25)}`
      );

      if (!mediaResponse.ok) {
        throw new Error(`Instagram API error: ${mediaResponse.status}`);
      }

      const mediaData = await mediaResponse.json();

      if (!mediaData.data || mediaData.data.length === 0) {
        console.log(`📭 No media found for @${userInfo.username}`);
        return [];
      }

      console.log(`📊 Found ${mediaData.data.length} media posts`);

      const results: InstagramScrapedData[] = [];

      for (const media of mediaData.data) {
        try {
          const scrapedData: InstagramScrapedData = {
            content: this.cleanCaption(media.caption || ""),
            source: "Instagram",
            source_url: media.permalink,
            author: userInfo.username,
            timestamp: new Date(media.timestamp),
            metadata: {
              post_id: media.id,
              user_id: userInfo.id,
              username: userInfo.username,
              media_type: media.media_type,
              media_url: media.media_url,
              thumbnail_url: media.thumbnail_url,
              like_count: media.like_count || 0,
              comments_count: media.comments_count || 0,
              hashtags: this.extractHashtags(media.caption || ""),
              mentions: this.extractMentions(media.caption || ""),
              is_story: false,
            },
          };

          // Filter by keywords if needed
          if (this.containsKeywords(scrapedData.content)) {
            results.push(scrapedData);
          } else {
            // Include all posts for now, not just keyword matches
            results.push(scrapedData);
          }
        } catch (error) {
          console.error("❌ Error processing Instagram media:", error);
        }
      }

      console.log(
        `✅ Successfully scraped ${results.length} Instagram posts from @${userInfo.username}`
      );
      return results;
    } catch (error: any) {
      console.error(`❌ Error scraping current user's Instagram:`, error);

      // Handle rate limiting
      if (error.message?.includes("429")) {
        console.log("⏰ Instagram rate limit reached");
      }

      // Handle authentication errors
      if (error.message?.includes("401") || error.message?.includes("400")) {
        console.log("🔐 Instagram authentication failed, check access token");
      }

      return [];
    }
  }

  // Instagram API method for other users (limited access)
  async scrapeOtherUserMedia(
    username: string,
    maxResults: number = 20
  ): Promise<InstagramScrapedData[]> {
    try {
      console.log(`📸 Attempting to scrape @${username} via Instagram API...`);

      // Instagram Basic Display API only allows access to authenticated user's data
      // For business accounts with Graph API, we might have more access
      console.log(
        `⚠️ Instagram API limitations: Can only access authenticated user's media`
      );
      console.log(
        `💡 To access @${username}, they need to authorize your app or use Graph API with business verification`
      );

      return [];
    } catch (error: any) {
      console.error(`❌ Error scraping @${username}:`, error);
      return [];
    }
  }

  private cleanCaption(caption: string): string {
    // Clean Instagram caption: remove excessive hashtags, normalize whitespace
    return caption
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
      this.accessToken && this.accessToken !== "your-instagram-access-token"
    );
  }

  // Get Instagram account info via API
  async getUserInfo(username: string): Promise<any> {
    try {
      if (!this.isConfigured()) return null;

      const response = await fetch(
        `https://graph.instagram.com/me?fields=id,username,account_type,media_count&access_token=${this.accessToken}`
      );

      if (!response.ok) {
        throw new Error(`Instagram API error: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error("❌ Error getting Instagram user info:", error);
      return null;
    }
  }
}

export { InstagramScraper, type InstagramScrapedData };
