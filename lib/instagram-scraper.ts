// Instagram Real Scraper for Sapa Trenggalek
// No mock data fallback - real scraping only

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

      // Generate mock data for hashtag search
      const results: InstagramScrapedData[] = [];
      const accounts = [
        "pemkabtrenggalek",
        "trenggalekhits",
        "exploretrenggalek",
      ];

      for (const account of accounts) {
        const accountPosts = await this.scrapeUserMedia(account, 5);
        const hashtagPosts = accountPosts.filter((post) =>
          post.metadata.hashtags.some((tag) =>
            tag.toLowerCase().includes(hashtag.toLowerCase())
          )
        );
        results.push(...hashtagPosts);
      }

      console.log(`✅ Found ${results.length} posts with hashtag #${hashtag}`);
      return results.slice(0, maxResults);
    } catch (error: any) {
      console.error(`❌ Error scraping hashtag #${hashtag}:`, error);
      return [];
    }
  }

  // Main scraping method - scrapes multiple accounts
  async scrapeAll(): Promise<InstagramScrapedData[]> {
    try {
      console.log("📸 Starting Instagram scraping for all accounts...");

      const targetAccounts = [
        "pemkabtrenggalek",
        "humas_trenggalek",
        "dispar_trenggalek",
        "trenggalekhits",
        "exploretrenggalek",
      ];

      const allResults: InstagramScrapedData[] = [];
      let realScrapingSuccess = false;

      for (const account of targetAccounts) {
        try {
          console.log(`🔍 Scraping @${account}...`);
          const accountPosts = await this.scrapeUserMedia(account, 8);

          if (accountPosts.length > 0) {
            allResults.push(...accountPosts);

            // Check if we got real data from Instagram API
            if (
              accountPosts[0].metadata.post_id &&
              accountPosts[0].metadata.post_id.length > 10
            ) {
              realScrapingSuccess = true;
            }
          }

          // Add delay to avoid rate limiting
          await this.delay(2000 + Math.random() * 1000); // 2-3 seconds random delay
        } catch (error) {
          console.log(`⚠️ Could not scrape @${account}:`, error);
        }
      }

      if (realScrapingSuccess) {
        console.log(
          `✅ Instagram API scraping successful: ${allResults.length} posts with real data and images`
        );
      } else {
        console.log(
          `❌ Instagram API scraping failed: ${allResults.length} posts found (likely empty)`
        );
      }

      return allResults;
    } catch (error) {
      console.error("❌ Error in Instagram scraping:", error);
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

  // Real Instagram scraping method
  private async scrapeRealInstagramProfile(
    username: string,
    maxResults: number = 20
  ): Promise<InstagramScrapedData[]> {
    try {
      console.log(`🔍 Attempting real scraping for @${username}...`);

      // Method 1: Try Instagram web interface
      try {
        const webData = await this.scrapeInstagramWeb(username, maxResults);
        if (webData.length > 0) {
          console.log(`✅ Web scraping successful: ${webData.length} posts`);
          return webData;
        }
      } catch (error: any) {
        console.log(`⚠️ Web scraping failed for @${username}:`, error.message);
      }

      // Method 2: Try alternative approach
      console.log(`⚠️ Trying alternative method for @${username}...`);
      try {
        const altData = await this.scrapeInstagramAlternative(
          username,
          maxResults
        );
        if (altData.length > 0) {
          console.log(
            `✅ Alternative scraping successful: ${altData.length} posts`
          );
          return altData;
        }
      } catch (error: any) {
        console.log(
          `⚠️ Alternative scraping failed for @${username}:`,
          error.message
        );
      }

      // No fallback - return empty if real scraping fails
      console.log(`❌ All real scraping methods failed for @${username}`);
      return [];
    } catch (error: any) {
      console.error(
        `❌ Real Instagram scraping failed for @${username}:`,
        error
      );
      return [];
    }
  }

  // Method 1: Instagram web scraping approach
  private async scrapeInstagramWeb(
    username: string,
    maxResults: number
  ): Promise<InstagramScrapedData[]> {
    try {
      console.log(`🔍 Trying web scraping for @${username}...`);

      const profileUrl = `https://www.instagram.com/${username}/`;
      const response = await fetch(profileUrl, {
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
          Accept:
            "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
          "Accept-Language": "en-US,en;q=0.5",
          "Accept-Encoding": "gzip, deflate, br",
          DNT: "1",
          Connection: "keep-alive",
          "Upgrade-Insecure-Requests": "1",
          "Sec-Fetch-Dest": "document",
          "Sec-Fetch-Mode": "navigate",
          "Sec-Fetch-Site": "none",
          "Cache-Control": "max-age=0",
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const html = await response.text();

      // Try multiple methods to extract data
      let userData = null;

      // Method 1: Look for window._sharedData
      const sharedDataMatch = html.match(/window\._sharedData\s*=\s*({.+?});/);
      if (sharedDataMatch) {
        try {
          const sharedData = JSON.parse(sharedDataMatch[1]);
          userData = sharedData?.entry_data?.ProfilePage?.[0]?.graphql?.user;
        } catch (e) {
          console.log("Failed to parse _sharedData");
        }
      }

      // Method 2: Look for newer Instagram data structure
      if (!userData) {
        const scriptTags = html.match(
          /<script[^>]*>([^<]*window\.__additionalDataLoaded[^<]*)<\/script>/g
        );
        if (scriptTags) {
          for (const script of scriptTags) {
            try {
              const jsonMatch = script.match(/({.*})/);
              if (jsonMatch) {
                const data = JSON.parse(jsonMatch[1]);
                if (data.user) {
                  userData = data.user;
                  break;
                }
              }
            } catch (e) {
              continue;
            }
          }
        }
      }

      // Method 3: Look for JSON-LD data
      if (!userData) {
        const jsonLdMatch = html.match(
          /<script type="application\/ld\+json"[^>]*>([^<]+)<\/script>/
        );
        if (jsonLdMatch) {
          try {
            const jsonLd = JSON.parse(jsonLdMatch[1]);
            if (
              jsonLd["@type"] === "Person" ||
              jsonLd["@type"] === "Organization"
            ) {
              // Convert JSON-LD to our format
              userData = {
                username: username,
                full_name: jsonLd.name,
                edge_owner_to_timeline_media: {
                  edges: [], // We'll need to extract posts differently
                },
              };
            }
          } catch (e) {
            console.log("Failed to parse JSON-LD");
          }
        }
      }

      if (!userData) {
        console.log(`⚠️ Could not extract user data for @${username}`);
        return [];
      }

      const results: InstagramScrapedData[] = [];
      const userMedia = userData.edge_owner_to_timeline_media?.edges || [];

      if (userMedia.length === 0) {
        console.log(`📭 No media found for @${username}`);
        return [];
      }

      const mediaToProcess = userMedia.slice(
        0,
        Math.min(maxResults, userMedia.length)
      );

      for (const edge of mediaToProcess) {
        const node = edge.node;

        try {
          const scrapedData: InstagramScrapedData = {
            content: node.edge_media_to_caption?.edges?.[0]?.node?.text || "",
            source: "Instagram",
            source_url: `https://www.instagram.com/p/${node.shortcode}/`,
            author: username,
            timestamp: new Date(node.taken_at_timestamp * 1000),
            metadata: {
              post_id: node.id,
              user_id: node.owner?.id || userData.id,
              username: username,
              media_type:
                node.__typename === "GraphVideo"
                  ? "VIDEO"
                  : node.__typename === "GraphSidecar"
                  ? "CAROUSEL_ALBUM"
                  : "IMAGE",
              media_url: node.display_url,
              thumbnail_url: node.thumbnail_src || node.display_url,
              like_count: node.edge_liked_by?.count || 0,
              comments_count: node.edge_media_to_comment?.count || 0,
              hashtags: this.extractHashtags(
                node.edge_media_to_caption?.edges?.[0]?.node?.text || ""
              ),
              mentions: this.extractMentions(
                node.edge_media_to_caption?.edges?.[0]?.node?.text || ""
              ),
              is_story: false,
            },
          };

          results.push(scrapedData);
        } catch (error) {
          console.error("❌ Error processing Instagram post:", error);
        }
      }

      return results;
    } catch (error: any) {
      console.error(`❌ Web scraping failed for @${username}:`, error);
      return [];
    }
  }

  // Method 2: Alternative Instagram scraping approach
  private async scrapeInstagramAlternative(
    username: string,
    maxResults: number
  ): Promise<InstagramScrapedData[]> {
    try {
      console.log(
        `🔍 Trying alternative scraping approach for @${username}...`
      );

      // Instagram has very strong anti-scraping measures
      // Real scraping requires advanced techniques like:
      // - Browser automation (Puppeteer/Playwright)
      // - Rotating proxies
      // - CAPTCHA solving
      // - Session management

      console.log(`⚠️ Instagram's anti-scraping measures are very strong`);
      console.log(
        `💡 Real scraping requires browser automation or specialized tools`
      );
      console.log(
        `❌ No fallback data - returning empty array for @${username}`
      );

      return [];
    } catch (error: any) {
      console.error(`❌ Alternative scraping failed for @${username}:`, error);
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
