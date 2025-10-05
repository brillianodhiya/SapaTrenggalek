// Twitter/X API v2 Scraper for Sapa Trenggalek
import { TwitterApi } from "twitter-api-v2";

export interface TwitterScrapedData {
  content: string;
  source: string;
  source_url: string;
  author: string;
  timestamp: Date;
  metadata: {
    tweet_id: string;
    user_id: string;
    username: string;
    retweet_count: number;
    like_count: number;
    reply_count: number;
    quote_count: number;
    is_retweet: boolean;
    is_reply: boolean;
    hashtags: string[];
    mentions: string[];
  };
}

export class TwitterScraper {
  private client: TwitterApi;
  private keywords: string[];

  constructor() {
    // Initialize Twitter API client
    this.client = new TwitterApi({
      appKey: process.env.TWITTER_API_KEY!,
      appSecret: process.env.TWITTER_API_SECRET!,
      accessToken: process.env.TWITTER_ACCESS_TOKEN!,
      accessSecret: process.env.TWITTER_ACCESS_TOKEN_SECRET!,
    });

    // Keywords untuk monitoring Trenggalek
    this.keywords = [
      "trenggalek",
      "pemkab trenggalek",
      "bupati trenggalek",
      "kabupaten trenggalek",
      "dinas trenggalek",
      "pemerintah trenggalek",
      "warga trenggalek",
      "masyarakat trenggalek",
      "#trenggalek",
      "@pemkabtrenggalek",
    ];
  }

  async scrapeRecentTweets(
    maxResults: number = 50
  ): Promise<TwitterScrapedData[]> {
    try {
      console.log("🐦 Starting Twitter scraping...");

      if (!this.isConfigured()) {
        console.log("⚠️ Twitter API not configured, skipping...");
        return [];
      }

      const results: TwitterScrapedData[] = [];

      // Search for tweets containing our keywords
      const searchQuery = this.buildSearchQuery();
      console.log("🔍 Twitter search query:", searchQuery);

      const tweets = await this.client.v2.search(searchQuery, {
        max_results: Math.min(maxResults, 100), // Twitter API limit
        "tweet.fields": [
          "created_at",
          "author_id",
          "public_metrics",
          "context_annotations",
          "entities",
          "referenced_tweets",
        ],
        "user.fields": ["username", "name", "verified"],
        expansions: ["author_id", "referenced_tweets.id"],
      });

      // Handle the response structure properly
      const tweetData = tweets.data?.data || tweets.data;
      if (!tweetData || !Array.isArray(tweetData) || tweetData.length === 0) {
        console.log("📭 No tweets found");
        return [];
      }

      console.log(`📊 Found ${tweetData.length} tweets`);

      // Process each tweet
      for (const tweet of tweetData) {
        try {
          const author = tweets.includes?.users?.find(
            (u) => u.id === tweet.author_id
          );

          const scrapedData: TwitterScrapedData = {
            content: this.cleanTweetText(tweet.text),
            source: "Twitter/X",
            source_url: `https://twitter.com/${author?.username}/status/${tweet.id}`,
            author: author?.name || author?.username || "Unknown",
            timestamp: new Date(tweet.created_at || Date.now()),
            metadata: {
              tweet_id: tweet.id,
              user_id: tweet.author_id || "",
              username: author?.username || "",
              retweet_count: tweet.public_metrics?.retweet_count || 0,
              like_count: tweet.public_metrics?.like_count || 0,
              reply_count: tweet.public_metrics?.reply_count || 0,
              quote_count: tweet.public_metrics?.quote_count || 0,
              is_retweet:
                tweet.referenced_tweets?.some(
                  (ref) => ref.type === "retweeted"
                ) || false,
              is_reply:
                tweet.referenced_tweets?.some(
                  (ref) => ref.type === "replied_to"
                ) || false,
              hashtags: this.extractHashtags(tweet.text),
              mentions: this.extractMentions(tweet.text),
            },
          };

          // Filter out retweets if needed (optional)
          if (!scrapedData.metadata.is_retweet) {
            results.push(scrapedData);
          }
        } catch (error) {
          console.error("❌ Error processing tweet:", error);
        }
      }

      console.log(`✅ Successfully scraped ${results.length} tweets`);
      return results;
    } catch (error: any) {
      console.error("❌ Twitter scraping error:", error);

      // Handle rate limiting
      if (error.code === 429 || error.status === 429) {
        console.log("⏰ Rate limit reached, will retry later");
      }

      // Handle authentication errors
      if (error.code === 401 || error.status === 401) {
        console.log("🔐 Authentication failed, check API credentials");
      }

      return [];
    }
  }

  async scrapeUserTimeline(
    username: string,
    maxResults: number = 20
  ): Promise<TwitterScrapedData[]> {
    try {
      console.log(`🐦 Scraping timeline for @${username}...`);

      if (!this.isConfigured()) {
        console.log("⚠️ Twitter API not configured, skipping...");
        return [];
      }

      // Get user by username
      const user = await this.client.v2.userByUsername(username);
      if (!user.data) {
        console.log(`❌ User @${username} not found`);
        return [];
      }

      // Get user's recent tweets
      const tweets = await this.client.v2.userTimeline(user.data.id, {
        max_results: Math.min(maxResults, 100),
        "tweet.fields": [
          "created_at",
          "public_metrics",
          "context_annotations",
          "entities",
          "referenced_tweets",
        ],
        exclude: ["retweets", "replies"], // Only original tweets
      });

      // Handle the response structure properly
      const tweetData = tweets.data?.data || tweets.data;
      if (!tweetData || !Array.isArray(tweetData) || tweetData.length === 0) {
        console.log(`📭 No tweets found for @${username}`);
        return [];
      }

      const results: TwitterScrapedData[] = [];

      for (const tweet of tweetData) {
        const scrapedData: TwitterScrapedData = {
          content: this.cleanTweetText(tweet.text),
          source: "Twitter/X",
          source_url: `https://twitter.com/${username}/status/${tweet.id}`,
          author: user.data.name || username,
          timestamp: new Date(tweet.created_at || Date.now()),
          metadata: {
            tweet_id: tweet.id,
            user_id: user.data.id,
            username: username,
            retweet_count: tweet.public_metrics?.retweet_count || 0,
            like_count: tweet.public_metrics?.like_count || 0,
            reply_count: tweet.public_metrics?.reply_count || 0,
            quote_count: tweet.public_metrics?.quote_count || 0,
            is_retweet: false,
            is_reply: false,
            hashtags: this.extractHashtags(tweet.text),
            mentions: this.extractMentions(tweet.text),
          },
        };

        results.push(scrapedData);
      }

      console.log(
        `✅ Successfully scraped ${results.length} tweets from @${username}`
      );
      return results;
    } catch (error: any) {
      console.error(`❌ Error scraping @${username}:`, error);

      // Handle specific errors
      if (error.code === 429 || error.status === 429) {
        console.log("⏰ Rate limit reached for user timeline");
      }

      if (error.code === 401 || error.status === 401) {
        console.log("🔐 Authentication failed for user timeline");
      }

      return [];
    }
  }

  private buildSearchQuery(): string {
    // Build search query with keywords and filters
    const keywordQuery = this.keywords.map((k) => `"${k}"`).join(" OR ");

    // Add filters: exclude retweets (remove lang filter as it might be causing issues)
    return `(${keywordQuery}) -is:retweet`;
  }

  private cleanTweetText(text: string): string {
    // Clean tweet text: remove URLs, normalize whitespace
    return text
      .replace(/https?:\/\/[^\s]+/g, "") // Remove URLs
      .replace(/\n+/g, " ") // Replace newlines with spaces
      .replace(/\s+/g, " ") // Normalize whitespace
      .trim();
  }

  private extractHashtags(text: string): string[] {
    const hashtags = text.match(/#\w+/g) || [];
    return hashtags.map((tag) => tag.toLowerCase());
  }

  private extractMentions(text: string): string[] {
    const mentions = text.match(/@\w+/g) || [];
    return mentions.map((mention) => mention.toLowerCase());
  }

  private isConfigured(): boolean {
    return !!(
      process.env.TWITTER_API_KEY &&
      process.env.TWITTER_API_SECRET &&
      process.env.TWITTER_ACCESS_TOKEN &&
      process.env.TWITTER_ACCESS_TOKEN_SECRET
    );
  }

  // Get trending topics in Indonesia
  async getTrendingTopics(): Promise<string[]> {
    try {
      if (!this.isConfigured()) return [];

      // For now, return mock trending topics since v1 API access is limited
      // In production, you would need elevated access for trends API
      console.log("📈 Getting trending topics (mock data for now)...");

      return [
        "#TrenggalekMaju",
        "#PemkabTrenggalek",
        "#IndonesiaMaju",
        "#PelayananPublik",
        "#SmartCity",
        "#DigitalTransformation",
        "#GoodGovernance",
        "#TransparansiPublik",
      ];

      // Uncomment below when you have elevated Twitter API access:
      /*
      const trends = await this.client.v1.trendsAvailable();
      const indonesiaTrends = trends.find(
        (location: any) =>
          location.country === "Indonesia" || location.name === "Indonesia"
      );

      if (indonesiaTrends) {
        const trendData = await this.client.v1.trends(indonesiaTrends.woeid);
        return trendData[0]?.trends?.map((trend: any) => trend.name) || [];
      }
      */
    } catch (error) {
      console.error("❌ Error getting trending topics:", error);
      return [];
    }
  }
}

// Exports are already done above with export keyword
