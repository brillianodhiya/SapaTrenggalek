"use client";

import { useState } from "react";
import {
  Instagram,
  Search,
  User,
  Hash,
  BarChart3,
  Heart,
  MessageCircle,
  Image,
  Video,
  Grid3X3,
} from "lucide-react";

interface InstagramResult {
  content: string;
  source: string;
  source_url: string;
  author: string;
  timestamp: string;
  metadata: {
    post_id: string;
    username: string;
    media_type: "IMAGE" | "VIDEO" | "CAROUSEL_ALBUM";
    media_url?: string;
    thumbnail_url?: string;
    like_count?: number;
    comments_count?: number;
    hashtags: string[];
    mentions: string[];
    location?: string;
  };
}

interface InstagramAnalysis {
  totalPosts: number;
  uniqueUsers: number;
  mediaTypes: Record<string, number>;
  totalEngagement: number;
  topHashtags: Array<{ hashtag: string; count: number }>;
  engagementStats: {
    avgLikes: number;
    avgComments: number;
    totalLikes: number;
    totalComments: number;
  };
}

interface InstagramResponse {
  success: boolean;
  type: string;
  results?: InstagramResult[];
  analysis?: InstagramAnalysis;
  count: number;
  configured?: boolean;
  message?: string;
}

export default function InstagramManager() {
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<InstagramResponse | null>(null);
  const [scrapeType, setScrapeType] = useState<"user" | "hashtag" | "multiple">(
    "user"
  );
  const [username, setUsername] = useState("");
  const [hashtag, setHashtag] = useState("");
  const [maxResults, setMaxResults] = useState(20);

  const handleScrape = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/admin/scrape-instagram", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: scrapeType,
          username: scrapeType === "user" ? username : undefined,
          hashtag: scrapeType === "hashtag" ? hashtag : undefined,
          maxResults,
        }),
      });

      const data = await response.json();
      setResults(data);
    } catch (error) {
      console.error("Instagram scraping error:", error);
    } finally {
      setLoading(false);
    }
  };

  const checkStatus = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/admin/scrape-instagram");
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

  const getMediaIcon = (mediaType: string) => {
    switch (mediaType) {
      case "IMAGE":
        return <Image className="h-4 w-4" />;
      case "VIDEO":
        return <Video className="h-4 w-4" />;
      case "CAROUSEL_ALBUM":
        return <Grid3X3 className="h-4 w-4" />;
      default:
        return <Image className="h-4 w-4" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="card">
        <h3 className="text-lg font-semibold mb-4 flex items-center">
          <Instagram className="h-5 w-5 mr-2 text-pink-500" />
          Instagram Scraping Manager
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
                <option value="user">User Media</option>
                <option value="hashtag">Hashtag Posts</option>
                <option value="multiple">Multiple Accounts</option>
              </select>
            </div>

            {scrapeType === "user" && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Username (Optional)
                </label>
                <input
                  type="text"
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                  placeholder="Leave empty for current user"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                />
                <p className="text-xs text-gray-500 mt-1">
                  Instagram Basic Display API only allows access to
                  authenticated user's media
                </p>
              </div>
            )}

            {scrapeType === "hashtag" && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Hashtag
                </label>
                <input
                  type="text"
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                  placeholder="trenggalek"
                  value={hashtag}
                  onChange={(e) => setHashtag(e.target.value)}
                />
              </div>
            )}

            {scrapeType !== "multiple" && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Max Results
                </label>
                <select
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                  value={maxResults}
                  onChange={(e) => setMaxResults(parseInt(e.target.value))}
                >
                  <option value={10}>10 posts</option>
                  <option value={20}>20 posts</option>
                  <option value={25}>25 posts</option>
                </select>
              </div>
            )}

            <div className="flex items-end space-x-2">
              <button
                onClick={handleScrape}
                disabled={
                  loading || (scrapeType === "hashtag" && !hashtag.trim())
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
          <div className="bg-pink-50 border border-pink-200 rounded-lg p-3">
            <p className="text-sm text-pink-700">
              <strong>User Media:</strong> Scrape posts from specific Instagram
              account
              <br />
              <strong>Hashtag Posts:</strong> Search posts by hashtag across
              multiple accounts
              <br />
              <strong>Multiple Accounts:</strong> Scrape from all monitored
              accounts
            </p>
            <p className="text-xs text-pink-600 mt-2">
              💡 Menggunakan unofficial scraping - tidak memerlukan API key atau
              verifikasi bisnis.
            </p>
          </div>
        </div>
      </div>

      {/* Results */}
      {results && (
        <div className="space-y-6">
          {/* Status Info */}
          {results.message && (
            <div className="card bg-green-50 border-green-200">
              <h4 className="font-semibold mb-2">
                ✅ Instagram Official API Ready
              </h4>
              <p className="text-sm text-gray-600">{results.message}</p>
              <div className="mt-3 text-xs text-gray-500">
                <p>Official Instagram API - menggunakan access token resmi</p>
              </div>
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
                <div className="bg-pink-50 p-4 rounded-lg">
                  <div className="text-2xl font-bold text-pink-600">
                    {results.analysis.totalPosts}
                  </div>
                  <div className="text-sm text-pink-700">Total Posts</div>
                </div>

                <div className="bg-purple-50 p-4 rounded-lg">
                  <div className="text-2xl font-bold text-purple-600">
                    {results.analysis.uniqueUsers}
                  </div>
                  <div className="text-sm text-purple-700">Unique Users</div>
                </div>

                <div className="bg-blue-50 p-4 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">
                    {formatNumber(results.analysis.totalEngagement)}
                  </div>
                  <div className="text-sm text-blue-700">Total Engagement</div>
                </div>

                <div className="bg-green-50 p-4 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">
                    {results.analysis.engagementStats.avgLikes}
                  </div>
                  <div className="text-sm text-green-700">Avg Likes</div>
                </div>
              </div>

              {/* Media Types */}
              {Object.keys(results.analysis.mediaTypes).length > 0 && (
                <div className="mb-6">
                  <h5 className="font-medium text-gray-900 mb-3">
                    Media Types
                  </h5>
                  <div className="flex space-x-4">
                    {Object.entries(results.analysis.mediaTypes).map(
                      ([type, count]) => (
                        <div
                          key={type}
                          className="flex items-center bg-gray-50 px-3 py-2 rounded-lg"
                        >
                          {getMediaIcon(type)}
                          <span className="ml-2 text-sm font-medium">
                            {type}: {count}
                          </span>
                        </div>
                      )
                    )}
                  </div>
                </div>
              )}

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
                        className="bg-pink-100 text-pink-800 px-3 py-1 rounded-full text-sm"
                      >
                        {tag.hashtag} ({tag.count})
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Post Results */}
          {results.results && results.results.length > 0 && (
            <div className="card">
              <h4 className="text-lg font-semibold mb-4">
                Scraped Posts ({results.count})
              </h4>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-h-96 overflow-y-auto">
                {results.results.map((post, index) => (
                  <div
                    key={post.metadata.post_id}
                    className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center">
                        <User className="h-4 w-4 text-gray-400 mr-2" />
                        <span className="font-medium text-sm">
                          @{post.metadata.username}
                        </span>
                      </div>
                      <div className="flex items-center text-gray-500">
                        {getMediaIcon(post.metadata.media_type)}
                      </div>
                    </div>

                    {post.metadata.media_url && (
                      <div className="mb-3">
                        {post.metadata.media_type === "VIDEO" ? (
                          <video
                            src={post.metadata.media_url}
                            className="w-full h-32 object-cover rounded"
                            controls={false}
                            muted
                          />
                        ) : (
                          <img
                            src={post.metadata.media_url}
                            alt="Instagram post"
                            className="w-full h-32 object-cover rounded"
                          />
                        )}
                      </div>
                    )}

                    <p className="text-gray-800 text-sm mb-3 line-clamp-3">
                      {post.content || "No caption"}
                    </p>

                    <div className="flex items-center justify-between text-sm text-gray-500 mb-2">
                      <div className="flex items-center space-x-3">
                        <div className="flex items-center">
                          <Heart className="h-4 w-4 mr-1" />
                          {formatNumber(post.metadata.like_count || 0)}
                        </div>
                        <div className="flex items-center">
                          <MessageCircle className="h-4 w-4 mr-1" />
                          {formatNumber(post.metadata.comments_count || 0)}
                        </div>
                      </div>

                      <span className="text-xs">
                        {new Date(post.timestamp).toLocaleDateString("id-ID")}
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex flex-wrap gap-1">
                        {post.metadata.hashtags
                          .slice(0, 2)
                          .map((hashtag, i) => (
                            <span
                              key={i}
                              className="bg-pink-100 text-pink-700 px-2 py-1 rounded text-xs"
                            >
                              {hashtag}
                            </span>
                          ))}
                        {post.metadata.hashtags.length > 2 && (
                          <span className="text-xs text-gray-500">
                            +{post.metadata.hashtags.length - 2}
                          </span>
                        )}
                      </div>

                      <a
                        href={post.source_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-pink-500 hover:text-pink-700 text-xs"
                      >
                        View Post →
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* No Results */}
          {results.success && results.count === 0 && (
            <div className="card text-center py-8">
              <Instagram className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No Instagram posts found</p>
              <p className="text-sm text-gray-400 mt-1">
                Try different username/hashtag or check if the account exists
                and is public
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
