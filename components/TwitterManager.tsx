"use client";

import { useState } from "react";
import {
  Twitter,
  Search,
  User,
  TrendingUp,
  BarChart3,
  Heart,
  Repeat,
  MessageCircle,
} from "lucide-react";

interface TwitterResult {
  content: string;
  source: string;
  source_url: string;
  author: string;
  timestamp: string;
  metadata: {
    tweet_id: string;
    username: string;
    like_count: number;
    retweet_count: number;
    reply_count: number;
    hashtags: string[];
    mentions: string[];
  };
}

interface TwitterAnalysis {
  totalTweets: number;
  uniqueUsers: number;
  totalEngagement: number;
  topHashtags: Array<{ hashtag: string; count: number }>;
  engagementStats: {
    avgLikes: number;
    avgRetweets: number;
    totalReplies: number;
  };
}

interface TwitterResponse {
  success: boolean;
  type: string;
  results?: TwitterResult[];
  trends?: string[];
  analysis?: TwitterAnalysis;
  count: number;
  configured?: boolean;
  message?: string;
}

export default function TwitterManager() {
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<TwitterResponse | null>(null);
  const [scrapeType, setScrapeType] = useState<"recent" | "user" | "trending">(
    "recent"
  );
  const [username, setUsername] = useState("");
  const [maxResults, setMaxResults] = useState(50);

  const handleScrape = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/admin/scrape-twitter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: scrapeType,
          username: scrapeType === "user" ? username : undefined,
          maxResults,
        }),
      });

      const data = await response.json();
      setResults(data);
    } catch (error) {
      console.error("Twitter scraping error:", error);
    } finally {
      setLoading(false);
    }
  };

  const checkStatus = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/admin/scrape-twitter");
      const data = await response.json();
      setResults(data);
    } catch (error) {
      console.error("Status check error:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatNumber = (num: number): string => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + "M";
    if (num >= 1000) return (num / 1000).toFixed(1) + "K";
    return num.toString();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="card">
        <h3 className="text-lg font-semibold mb-4 flex items-center">
          <Twitter className="h-5 w-5 mr-2 text-blue-500" />
          Twitter/X Scraping Manager
        </h3>

        <div className="space-y-4">
          {/* Scraping Controls */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Scraping Type
              </label>
              <select
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                value={scrapeType}
                onChange={(e) => setScrapeType(e.target.value as any)}
              >
                <option value="recent">Recent Tweets</option>
                <option value="user">User Timeline</option>
                <option value="trending">Trending Topics</option>
              </select>
            </div>

            {scrapeType === "user" && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Username
                </label>
                <input
                  type="text"
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                  placeholder="pemkabtrenggalek"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                />
              </div>
            )}

            {scrapeType !== "trending" && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Max Results
                </label>
                <select
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                  value={maxResults}
                  onChange={(e) => setMaxResults(parseInt(e.target.value))}
                >
                  <option value={10}>10 tweets</option>
                  <option value={25}>25 tweets</option>
                  <option value={50}>50 tweets</option>
                  <option value={100}>100 tweets</option>
                </select>
              </div>
            )}

            <div className="flex items-end space-x-2">
              <button
                onClick={handleScrape}
                disabled={
                  loading || (scrapeType === "user" && !username.trim())
                }
                className="flex-1 btn-primary flex items-center justify-center"
              >
                {loading ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                ) : (
                  <Search className="h-4 w-4 mr-2" />
                )}
                Scrape
              </button>
              <button
                onClick={checkStatus}
                disabled={loading}
                className="btn-secondary"
              >
                Status
              </button>
            </div>
          </div>

          {/* Info */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <p className="text-sm text-blue-700">
              <strong>Recent Tweets:</strong> Search tweets mentioning
              Trenggalek keywords
              <br />
              <strong>User Timeline:</strong> Get tweets from specific user
              account
              <br />
              <strong>Trending Topics:</strong> Get current trending topics in
              Indonesia
            </p>
          </div>
        </div>
      </div>

      {/* Results */}
      {results && (
        <div className="space-y-6">
          {/* Status/Configuration Info */}
          {results.configured !== undefined && (
            <div
              className={`card ${
                results.configured
                  ? "bg-green-50 border-green-200"
                  : "bg-red-50 border-red-200"
              }`}
            >
              <h4 className="font-semibold mb-2">
                {results.configured
                  ? "✅ Twitter API Configured"
                  : "❌ Twitter API Not Configured"}
              </h4>
              <p className="text-sm text-gray-600">{results.message}</p>
              {!results.configured && (
                <div className="mt-3 text-xs text-gray-500">
                  <p>Required environment variables:</p>
                  <ul className="list-disc list-inside mt-1">
                    <li>TWITTER_API_KEY</li>
                    <li>TWITTER_API_SECRET</li>
                    <li>TWITTER_ACCESS_TOKEN</li>
                    <li>TWITTER_ACCESS_TOKEN_SECRET</li>
                  </ul>
                </div>
              )}
            </div>
          )}

          {/* Analytics Summary */}
          {results.analysis && (
            <div className="card">
              <h4 className="text-lg font-semibold mb-4 flex items-center">
                <BarChart3 className="h-5 w-5 mr-2" />
                Scraping Analytics
              </h4>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">
                    {results.analysis.totalTweets}
                  </div>
                  <div className="text-sm text-blue-700">Total Tweets</div>
                </div>

                <div className="bg-green-50 p-4 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">
                    {results.analysis.uniqueUsers}
                  </div>
                  <div className="text-sm text-green-700">Unique Users</div>
                </div>

                <div className="bg-purple-50 p-4 rounded-lg">
                  <div className="text-2xl font-bold text-purple-600">
                    {formatNumber(results.analysis.totalEngagement)}
                  </div>
                  <div className="text-sm text-purple-700">
                    Total Engagement
                  </div>
                </div>

                <div className="bg-orange-50 p-4 rounded-lg">
                  <div className="text-2xl font-bold text-orange-600">
                    {results.analysis.engagementStats.avgLikes}
                  </div>
                  <div className="text-sm text-orange-700">Avg Likes</div>
                </div>
              </div>

              {/* Top Hashtags */}
              {results.analysis.topHashtags.length > 0 && (
                <div>
                  <h5 className="font-medium text-gray-900 mb-3">
                    Top Hashtags
                  </h5>
                  <div className="flex flex-wrap gap-2">
                    {results.analysis.topHashtags.map((tag, index) => (
                      <span
                        key={index}
                        className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm"
                      >
                        {tag.hashtag} ({tag.count})
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Trending Topics */}
          {results.trends && (
            <div className="card">
              <h4 className="text-lg font-semibold mb-4 flex items-center">
                <TrendingUp className="h-5 w-5 mr-2" />
                Trending Topics in Indonesia
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                {results.trends.map((trend, index) => (
                  <div key={index} className="bg-gray-50 p-3 rounded-lg border">
                    <span className="text-sm font-medium">#{index + 1}</span>
                    <p className="font-semibold">{trend}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Tweet Results */}
          {results.results && results.results.length > 0 && (
            <div className="card">
              <h4 className="text-lg font-semibold mb-4">
                Scraped Tweets ({results.count})
              </h4>

              <div className="space-y-4 max-h-96 overflow-y-auto">
                {results.results.map((tweet, index) => (
                  <div
                    key={tweet.metadata.tweet_id}
                    className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center">
                        <User className="h-4 w-4 text-gray-400 mr-2" />
                        <span className="font-medium text-sm">
                          {tweet.author} (@{tweet.metadata.username})
                        </span>
                      </div>
                      <span className="text-xs text-gray-500">
                        {new Date(tweet.timestamp).toLocaleString("id-ID")}
                      </span>
                    </div>

                    <p className="text-gray-800 mb-3">{tweet.content}</p>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4 text-sm text-gray-500">
                        <div className="flex items-center">
                          <Heart className="h-4 w-4 mr-1" />
                          {formatNumber(tweet.metadata.like_count)}
                        </div>
                        <div className="flex items-center">
                          <Repeat className="h-4 w-4 mr-1" />
                          {formatNumber(tweet.metadata.retweet_count)}
                        </div>
                        <div className="flex items-center">
                          <MessageCircle className="h-4 w-4 mr-1" />
                          {formatNumber(tweet.metadata.reply_count)}
                        </div>
                      </div>

                      <a
                        href={tweet.source_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-500 hover:text-blue-700 text-sm"
                      >
                        View Tweet →
                      </a>
                    </div>

                    {tweet.metadata.hashtags.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-1">
                        {tweet.metadata.hashtags.map((hashtag, i) => (
                          <span
                            key={i}
                            className="bg-blue-100 text-blue-700 px-2 py-1 rounded text-xs"
                          >
                            {hashtag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* No Results */}
          {results.success && results.count === 0 && (
            <div className="card text-center py-8">
              <Twitter className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No tweets found</p>
              <p className="text-sm text-gray-400 mt-1">
                Try different keywords or check if the account exists
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
