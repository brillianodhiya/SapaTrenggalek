"use client";

import { useState } from "react";
import {
  Facebook,
  Search,
  Users,
  Hash,
  BarChart3,
  Heart,
  MessageCircle,
  Share2,
  Image,
  Video,
  Link,
  Calendar,
  FileText,
} from "lucide-react";

interface FacebookResult {
  content: string;
  source: string;
  source_url: string;
  author: string;
  timestamp: string;
  metadata: {
    post_id: string;
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
  };
}

interface FacebookAnalysis {
  totalPosts: number;
  uniquePages: number;
  postTypes: Record<string, number>;
  totalEngagement: number;
  topHashtags: Array<{ hashtag: string; count: number }>;
  engagementStats: {
    avgLikes: number;
    avgComments: number;
    avgShares: number;
    totalLikes: number;
    totalComments: number;
    totalShares: number;
    totalReactions: number;
  };
}

interface FacebookResponse {
  success: boolean;
  type: string;
  pageId?: string;
  query?: string;
  results: FacebookResult[];
  analysis: FacebookAnalysis;
  count: number;
  timestamp: string;
  message?: string;
  status?: string;
  features?: any;
  targetPages?: string[];
  limitations?: any;
}

export default function FacebookManager() {
  const [results, setResults] = useState<FacebookResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [scrapingType, setScrapingType] = useState<
    "page" | "search" | "multiple"
  >("page");
  const [pageId, setPageId] = useState("pemkabtrenggalek");
  const [searchQuery, setSearchQuery] = useState("");
  const [maxResults, setMaxResults] = useState(20);

  const handleScrape = async () => {
    setLoading(true);
    setError(null);

    try {
      const requestBody: any = {
        type: scrapingType,
        maxResults,
      };

      if (scrapingType === "page") {
        requestBody.pageId = pageId;
      } else if (scrapingType === "search") {
        requestBody.query = searchQuery;
      }

      const response = await fetch("/api/admin/scrape-facebook", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Facebook scraping failed");
      }

      setResults(data);
    } catch (err: any) {
      setError(err.message);
      console.error("Facebook scraping error:", err);
    } finally {
      setLoading(false);
    }
  };

  const checkStatus = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/admin/scrape-facebook");
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Status check failed");
      }

      setResults(data);
    } catch (err: any) {
      setError(err.message);
      console.error("Facebook status check error:", err);
    } finally {
      setLoading(false);
    }
  };

  const getPostTypeIcon = (type: string) => {
    switch (type) {
      case "photo":
        return <Image className="h-4 w-4" />;
      case "video":
        return <Video className="h-4 w-4" />;
      case "link":
        return <Link className="h-4 w-4" />;
      case "event":
        return <Calendar className="h-4 w-4" />;
      default:
        return <FileText className="h-4 w-4" />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="card">
        <h3 className="text-xl font-semibold mb-4 flex items-center">
          <Facebook className="h-6 w-6 mr-2 text-blue-600" />
          Facebook Manager
        </h3>

        {/* Controls */}
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Scraping Type
              </label>
              <select
                value={scrapingType}
                onChange={(e) => setScrapingType(e.target.value as any)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="page">Single Page</option>
                <option value="search">Search Posts</option>
                <option value="multiple">Multiple Pages</option>
              </select>
            </div>

            {scrapingType === "page" && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Page ID
                </label>
                <input
                  type="text"
                  value={pageId}
                  onChange={(e) => setPageId(e.target.value)}
                  placeholder="pemkabtrenggalek"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            )}

            {scrapingType === "search" && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Search Query
                </label>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="trenggalek"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Max Results
              </label>
              <input
                type="number"
                value={maxResults}
                onChange={(e) => setMaxResults(parseInt(e.target.value))}
                min="1"
                max="100"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="flex space-x-4">
            <button
              onClick={handleScrape}
              disabled={loading}
              className="btn-primary flex items-center"
            >
              <Facebook className="h-4 w-4 mr-2" />
              {loading ? "Scraping..." : "Start Facebook Scraping"}
            </button>

            <button
              onClick={checkStatus}
              disabled={loading}
              className="btn-secondary flex items-center"
            >
              <Search className="h-4 w-4 mr-2" />
              Check Status
            </button>
          </div>
        </div>

        {error && (
          <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-md">
            <p className="text-red-800">{error}</p>
          </div>
        )}
      </div>

      {results && (
        <div className="space-y-6">
          {/* Status Info */}
          {results.message && (
            <div className="card bg-blue-50 border-blue-200">
              <h4 className="font-semibold mb-2">
                ✅ Facebook Official API Ready
              </h4>
              <p className="text-sm text-gray-600">{results.message}</p>
              <div className="mt-3 text-xs text-gray-500">
                <p>
                  Official Facebook Graph API - menggunakan access token resmi
                </p>
              </div>
            </div>
          )}

          {/* Analytics Summary */}
          {results.analysis && (
            <div className="card">
              <h4 className="text-lg font-semibold mb-4 flex items-center">
                <BarChart3 className="h-5 w-5 mr-2" />
                Facebook Analytics
              </h4>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">
                    {results.analysis.totalPosts}
                  </div>
                  <div className="text-sm text-blue-700">Total Posts</div>
                </div>

                <div className="bg-green-50 p-4 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">
                    {results.analysis.uniquePages}
                  </div>
                  <div className="text-sm text-green-700">Unique Pages</div>
                </div>

                <div className="bg-purple-50 p-4 rounded-lg">
                  <div className="text-2xl font-bold text-purple-600">
                    {results.analysis.totalEngagement.toLocaleString()}
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

              {/* Post Types */}
              <div className="mb-6">
                <h5 className="font-medium mb-3">Post Types</h5>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
                  {Object.entries(results.analysis.postTypes).map(
                    ([type, count]) => (
                      <div
                        key={type}
                        className="flex items-center space-x-2 text-sm"
                      >
                        {getPostTypeIcon(type)}
                        <span className="capitalize">
                          {type}: {count}
                        </span>
                      </div>
                    )
                  )}
                </div>
              </div>

              {/* Engagement Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="text-center">
                  <div className="flex items-center justify-center mb-1">
                    <Heart className="h-4 w-4 text-red-500 mr-1" />
                    <span className="font-semibold">
                      {results.analysis.engagementStats.totalLikes.toLocaleString()}
                    </span>
                  </div>
                  <div className="text-xs text-gray-500">Total Likes</div>
                </div>

                <div className="text-center">
                  <div className="flex items-center justify-center mb-1">
                    <MessageCircle className="h-4 w-4 text-blue-500 mr-1" />
                    <span className="font-semibold">
                      {results.analysis.engagementStats.totalComments.toLocaleString()}
                    </span>
                  </div>
                  <div className="text-xs text-gray-500">Total Comments</div>
                </div>

                <div className="text-center">
                  <div className="flex items-center justify-center mb-1">
                    <Share2 className="h-4 w-4 text-green-500 mr-1" />
                    <span className="font-semibold">
                      {results.analysis.engagementStats.totalShares.toLocaleString()}
                    </span>
                  </div>
                  <div className="text-xs text-gray-500">Total Shares</div>
                </div>

                <div className="text-center">
                  <div className="flex items-center justify-center mb-1">
                    <Heart className="h-4 w-4 text-purple-500 mr-1" />
                    <span className="font-semibold">
                      {results.analysis.engagementStats.totalReactions.toLocaleString()}
                    </span>
                  </div>
                  <div className="text-xs text-gray-500">Total Reactions</div>
                </div>
              </div>

              {/* Top Hashtags */}
              {results.analysis.topHashtags.length > 0 && (
                <div>
                  <h5 className="font-medium mb-3 flex items-center">
                    <Hash className="h-4 w-4 mr-1" />
                    Top Hashtags
                  </h5>
                  <div className="flex flex-wrap gap-2">
                    {results.analysis.topHashtags.map((item, index) => (
                      <span
                        key={index}
                        className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs"
                      >
                        {item.hashtag} ({item.count})
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Posts List */}
          {results.results && results.results.length > 0 && (
            <div className="card">
              <h4 className="text-lg font-semibold mb-4 flex items-center">
                <Facebook className="h-5 w-5 mr-2" />
                Facebook Posts ({results.results.length})
              </h4>

              <div className="space-y-4 max-h-96 overflow-y-auto">
                {results.results.slice(0, 10).map((post, index) => (
                  <div
                    key={index}
                    className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        {getPostTypeIcon(post.metadata.post_type)}
                        <span className="font-medium text-blue-600">
                          {post.metadata.page_name || post.author}
                        </span>
                        <span className="text-xs text-gray-500">
                          {new Date(post.timestamp).toLocaleDateString("id-ID")}
                        </span>
                      </div>
                      <a
                        href={post.source_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-500 hover:text-blue-700 text-xs"
                      >
                        View Post
                      </a>
                    </div>

                    <p className="text-gray-700 text-sm mb-3 line-clamp-3">
                      {post.content || "No content available"}
                    </p>

                    {post.metadata.media_url && (
                      <div className="mb-3">
                        <img
                          src={
                            post.metadata.thumbnail_url ||
                            post.metadata.media_url
                          }
                          alt="Post media"
                          className="w-full h-32 object-cover rounded"
                          onError={(e) => {
                            e.currentTarget.style.display = "none";
                          }}
                        />
                      </div>
                    )}

                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <div className="flex items-center space-x-4">
                        <span className="flex items-center">
                          <Heart className="h-3 w-3 mr-1" />
                          {post.metadata.like_count || 0}
                        </span>
                        <span className="flex items-center">
                          <MessageCircle className="h-3 w-3 mr-1" />
                          {post.metadata.comment_count || 0}
                        </span>
                        <span className="flex items-center">
                          <Share2 className="h-3 w-3 mr-1" />
                          {post.metadata.share_count || 0}
                        </span>
                      </div>
                      <div className="flex space-x-1">
                        {post.metadata.hashtags.slice(0, 3).map((tag, i) => (
                          <span key={i} className="text-blue-500">
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {results.results.length > 10 && (
                <div className="mt-4 text-center text-sm text-gray-500">
                  Showing 10 of {results.results.length} posts
                </div>
              )}
            </div>
          )}

          {/* Features & Limitations */}
          {results.features && (
            <div className="card">
              <h4 className="text-lg font-semibold mb-4">
                Features & Limitations
              </h4>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h5 className="font-medium mb-2 text-green-600">
                    ✅ Available Features
                  </h5>
                  <ul className="text-sm space-y-1">
                    {Object.entries(results.features).map(([key, value]) => (
                      <li key={key}>
                        <strong>{key}:</strong> {value as string}
                      </li>
                    ))}
                  </ul>
                </div>

                {results.limitations && (
                  <div>
                    <h5 className="font-medium mb-2 text-orange-600">
                      ⚠️ Limitations
                    </h5>
                    <ul className="text-sm space-y-1">
                      {Object.entries(results.limitations).map(
                        ([key, value]) => (
                          <li key={key}>
                            <strong>{key}:</strong> {value as string}
                          </li>
                        )
                      )}
                    </ul>
                  </div>
                )}
              </div>

              {results.targetPages && (
                <div className="mt-4">
                  <h5 className="font-medium mb-2">Target Pages</h5>
                  <div className="flex flex-wrap gap-2">
                    {results.targetPages.map((page, index) => (
                      <span
                        key={index}
                        className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs"
                      >
                        @{page}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
