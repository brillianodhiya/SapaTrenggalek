"use client";

import { useState, useEffect } from "react";
import {
  Search,
  Filter,
  Calendar,
  ExternalLink,
  ArrowRight,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Clock,
} from "lucide-react";

interface NewsItem {
  id: number;
  content: string;
  excerpt: string;
  source: string;
  category: string;
  sentiment: string;
  urgency_level: number;
  hoax_probability: number;
  status: string;
  author: string;
  created_at: string;
  source_url: string;
  image_url?: string;
  image_alt?: string;
  image_caption?: string;
}

interface NewsPortalProps {
  initialNews?: NewsItem[];
  initialCategories?: string[];
}

export default function NewsPortal({
  initialNews = [],
  initialCategories = [],
}: NewsPortalProps) {
  const [news, setNews] = useState<NewsItem[]>(initialNews);
  const [categories, setCategories] = useState<string[]>(initialCategories);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedSentiment, setSelectedSentiment] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedNews, setSelectedNews] = useState<NewsItem | null>(null);

  const fetchNews = async (page = 1, reset = false) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: "12",
      });

      if (searchTerm) params.append("search", searchTerm);
      if (selectedCategory) params.append("category", selectedCategory);
      if (selectedSentiment) params.append("sentiment", selectedSentiment);

      console.log("Fetching news with params:", params.toString());
      const response = await fetch(`/api/news?${params}`);
      const result = await response.json();
      console.log("News API response:", {
        success: result.success,
        dataLength: result.data?.length,
      });

      if (result.success) {
        if (reset || page === 1) {
          setNews(result.data || []);
        } else {
          setNews((prev) => [...prev, ...(result.data || [])]);
        }
        setCategories(result.categories || []);
        setTotalPages(result.pagination?.totalPages || 1);
        setCurrentPage(page);
      } else {
        console.error("API Error:", result.error);
        setNews([]);
      }
    } catch (error) {
      console.error("Error fetching news:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNews(1, true);
  }, []);

  const handleSearch = () => {
    fetchNews(1, true);
  };

  const handleFilter = (type: string, value: string) => {
    if (type === "category") {
      setSelectedCategory(value === selectedCategory ? "" : value);
    } else if (type === "sentiment") {
      setSelectedSentiment(value === selectedSentiment ? "" : value);
    }
    setTimeout(() => fetchNews(1, true), 100);
  };

  const loadMore = () => {
    if (currentPage < totalPages) {
      fetchNews(currentPage + 1, false);
    }
  };

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment?.toLowerCase()) {
      case "positive":
        return "bg-green-100 text-green-800";
      case "negative":
        return "bg-red-100 text-red-800";
      case "neutral":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-blue-100 text-blue-800";
    }
  };

  const getSentimentIcon = (sentiment: string) => {
    switch (sentiment?.toLowerCase()) {
      case "positive":
        return <CheckCircle className="h-4 w-4" />;
      case "negative":
        return <AlertTriangle className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  const getUrgencyColor = (level: number) => {
    if (level >= 8) return "bg-red-500";
    if (level >= 6) return "bg-yellow-500";
    if (level >= 4) return "bg-blue-500";
    return "bg-gray-400";
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  const openNewsDetail = async (newsItem: NewsItem) => {
    try {
      const response = await fetch("/api/news", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: newsItem.id }),
      });

      const result = await response.json();
      if (result.success) {
        setSelectedNews(result.data);
      }
    } catch (error) {
      console.error("Error fetching news detail:", error);
      setSelectedNews(newsItem);
    }
  };

  return (
    <div className="space-y-6">
      {/* Search and Filter */}
      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search */}
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Cari berita..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleSearch()}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Category Filter */}
          <div className="lg:w-48">
            <select
              value={selectedCategory}
              onChange={(e) => handleFilter("category", e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              <option value="">Semua Kategori</option>
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>

          {/* Sentiment Filter */}
          <div className="lg:w-48">
            <select
              value={selectedSentiment}
              onChange={(e) => handleFilter("sentiment", e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              <option value="">Semua Sentimen</option>
              <option value="positive">Positif</option>
              <option value="negative">Negatif</option>
              <option value="neutral">Netral</option>
            </select>
          </div>

          <button
            onClick={handleSearch}
            className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
          >
            Cari
          </button>
        </div>
      </div>

      {/* News Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {news.map((item) => (
          <article
            key={item.id}
            className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
            onClick={() => openNewsDetail(item)}
          >
            {/* Image */}
            {item.image_url ? (
              <div className="h-48 bg-gray-200 overflow-hidden">
                <img
                  src={item.image_url}
                  alt={item.image_alt || item.excerpt}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    // Hide image if it fails to load
                    (e.target as HTMLElement).style.display = "none";
                  }}
                />
              </div>
            ) : (
              <div className="h-48 bg-gradient-to-br from-primary-100 to-primary-200 flex items-center justify-center">
                <div className="text-center">
                  <TrendingUp className="h-12 w-12 text-primary-400 mx-auto mb-2" />
                  <span className="text-primary-600 text-sm font-medium">
                    {item.category?.charAt(0).toUpperCase() +
                      item.category?.slice(1) || "Berita"}
                  </span>
                </div>
              </div>
            )}

            <div className="p-6">
              {/* Header */}
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center text-sm text-gray-500">
                  <Calendar className="h-4 w-4 mr-1" />
                  <span>{formatDate(item.created_at)}</span>
                </div>
                <div className="flex items-center space-x-2">
                  {/* Urgency Level */}
                  <div className="flex items-center">
                    <div
                      className={`w-2 h-2 rounded-full ${getUrgencyColor(
                        item.urgency_level
                      )} mr-1`}
                    ></div>
                    <span className="text-xs text-gray-500">
                      {item.urgency_level}/10
                    </span>
                  </div>
                  {/* Hoax Probability */}
                  {item.hoax_probability > 50 && (
                    <div className="flex items-center text-xs text-red-600">
                      <AlertTriangle className="h-3 w-3 mr-1" />
                      <span>{item.hoax_probability}%</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Content */}
              <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
                {item.excerpt}
              </h3>

              {/* Source */}
              <div className="flex items-center text-sm text-gray-600 mb-3">
                <span className="font-medium">{item.source}</span>
                {item.author && (
                  <>
                    <span className="mx-2">•</span>
                    <span>{item.author}</span>
                  </>
                )}
              </div>

              {/* Tags */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  {/* Sentiment */}
                  <span
                    className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getSentimentColor(
                      item.sentiment
                    )}`}
                  >
                    {getSentimentIcon(item.sentiment)}
                    <span className="ml-1 capitalize">{item.sentiment}</span>
                  </span>

                  {/* Category */}
                  {item.category && (
                    <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                      {item.category}
                    </span>
                  )}
                </div>

                {/* Read More */}
                <div className="flex items-center text-primary-600 hover:text-primary-700 text-sm font-medium">
                  <span>Baca</span>
                  <ArrowRight className="h-4 w-4 ml-1" />
                </div>
              </div>

              {/* Source URL */}
              {item.source_url && (
                <div className="mt-3 pt-3 border-t border-gray-100">
                  <a
                    href={item.source_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center text-xs text-gray-500 hover:text-gray-700"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <ExternalLink className="h-3 w-3 mr-1" />
                    Sumber Asli
                  </a>
                </div>
              )}
            </div>
          </article>
        ))}
      </div>

      {/* Load More */}
      {currentPage < totalPages && (
        <div className="text-center">
          <button
            onClick={loadMore}
            disabled={loading}
            className="px-8 py-3 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700 transition-colors disabled:opacity-50"
          >
            {loading ? "Memuat..." : "Muat Lebih Banyak"}
          </button>
        </div>
      )}

      {/* News Detail Modal */}
      {selectedNews && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              {/* Header */}
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold text-gray-900">
                  Detail Berita
                </h2>
                <button
                  onClick={() => setSelectedNews(null)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  ✕
                </button>
              </div>

              {/* Image */}
              {selectedNews.image_url && (
                <div className="mb-6">
                  <img
                    src={selectedNews.image_url}
                    alt={selectedNews.image_alt || selectedNews.excerpt}
                    className="w-full h-64 object-cover rounded-lg"
                    onError={(e) => {
                      (e.target as HTMLElement).style.display = "none";
                    }}
                  />
                  {selectedNews.image_caption && (
                    <p className="text-sm text-gray-600 mt-2 italic">
                      {selectedNews.image_caption}
                    </p>
                  )}
                </div>
              )}

              {/* Content */}
              <div className="space-y-4">
                <div className="flex items-center justify-between text-sm text-gray-500">
                  <div className="flex items-center">
                    <Calendar className="h-4 w-4 mr-1" />
                    <span>{formatDate(selectedNews.created_at)}</span>
                    <span className="mx-2">•</span>
                    <span className="font-medium">{selectedNews.source}</span>
                    {selectedNews.author && (
                      <>
                        <span className="mx-2">•</span>
                        <span>{selectedNews.author}</span>
                      </>
                    )}
                  </div>
                </div>

                <div className="prose max-w-none">
                  <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                    {selectedNews.content}
                  </p>
                </div>

                {/* Analysis */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-gray-900 mb-3">Analisis</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <span className="text-sm text-gray-600">Sentimen:</span>
                      <div
                        className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ml-2 ${getSentimentColor(
                          selectedNews.sentiment
                        )}`}
                      >
                        {getSentimentIcon(selectedNews.sentiment)}
                        <span className="ml-1 capitalize">
                          {selectedNews.sentiment}
                        </span>
                      </div>
                    </div>
                    <div>
                      <span className="text-sm text-gray-600">
                        Tingkat Urgensi:
                      </span>
                      <span className="ml-2 font-medium">
                        {selectedNews.urgency_level}/10
                      </span>
                    </div>
                    <div>
                      <span className="text-sm text-gray-600">
                        Probabilitas Hoax:
                      </span>
                      <span
                        className={`ml-2 font-medium ${
                          selectedNews.hoax_probability > 50
                            ? "text-red-600"
                            : "text-green-600"
                        }`}
                      >
                        {selectedNews.hoax_probability}%
                      </span>
                    </div>
                  </div>
                </div>

                {/* Source URL */}
                {selectedNews.source_url && (
                  <div className="pt-4 border-t border-gray-200">
                    <a
                      href={selectedNews.source_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center text-primary-600 hover:text-primary-700 font-medium"
                    >
                      <ExternalLink className="h-4 w-4 mr-2" />
                      Lihat Sumber Asli
                    </a>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Empty State */}
      {news.length === 0 && !loading && (
        <div className="text-center py-12">
          <TrendingUp className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Tidak ada berita ditemukan
          </h3>
          <p className="text-gray-600">Coba ubah filter pencarian Anda</p>
        </div>
      )}
    </div>
  );
}
