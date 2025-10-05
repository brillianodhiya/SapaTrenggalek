"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import AdminLayout from "@/components/AdminLayout";

interface TrendData {
  keyword: string;
  total_mentions: number;
  growth_rate: number;
  momentum: "rising" | "stable" | "declining";
  positive_ratio: number;
  negative_ratio: number;
  neutral_ratio: number;
  sources: Record<string, number>;
  latest_mentions: number;
}

interface EmergingIssue {
  id: string;
  title: string;
  keywords: string[];
  velocity: number;
  urgency_score: number;
  mention_count: number;
  first_mention: string;
  department_relevance: string[];
  status: string;
  growth_trend: string;
}

interface KeywordCloudItem {
  id: string;
  text: string;
  weight: number;
  sentiment: "positive" | "negative" | "neutral";
  color: string;
  font_size: number;
  rank: number;
}

interface FilterState {
  timeRange: string;
  department: string;
  sources: string[];
  minMentions: number;
}

export default function TrendsIssuesPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [trends, setTrends] = useState<TrendData[]>([]);
  const [emergingIssues, setEmergingIssues] = useState<EmergingIssue[]>([]);
  const [keywordCloud, setKeywordCloud] = useState<KeywordCloudItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const [filters, setFilters] = useState<FilterState>({
    timeRange: "24h",
    department: "all",
    sources: [],
    minMentions: 3,
  });

  // Redirect if not authenticated
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/admin/login");
    }
  }, [status, router]);

  const fetchTrends = async () => {
    try {
      setError(null);

      const params = new URLSearchParams({
        timeRange: filters.timeRange,
        limit: "10",
        minMentions: filters.minMentions.toString(),
      });

      if (filters.department !== "all") {
        params.set("department", filters.department);
      }
      if (filters.sources.length > 0) {
        params.set("sources", filters.sources.join(","));
      }

      const response = await fetch(`/api/trends?${params}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to fetch trends");
      }

      setTrends(data.data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    }
  };

  const fetchEmergingIssues = async () => {
    try {
      const params = new URLSearchParams({
        velocityThreshold: "50",
        urgencyMin: "4",
      });

      const response = await fetch(`/api/trends/emerging?${params}`);
      const data = await response.json();

      if (response.ok) {
        setEmergingIssues(data.data || []);
      }
    } catch (err) {
      console.error("Failed to fetch emerging issues:", err);
    }
  };

  const fetchKeywordCloud = async () => {
    try {
      const params = new URLSearchParams({
        timeRange: filters.timeRange,
        limit: "30",
        minWeight: "2",
      });

      const response = await fetch(`/api/trends/keywords?${params}`);
      const data = await response.json();

      if (response.ok) {
        setKeywordCloud(data.data?.keywords || []);
      }
    } catch (err) {
      console.error("Failed to fetch keyword cloud:", err);
    }
  };

  const fetchAllData = async () => {
    setLoading(true);
    await Promise.all([
      fetchTrends(),
      fetchEmergingIssues(),
      fetchKeywordCloud(),
    ]);
    setLastUpdated(new Date());
    setLoading(false);
  };

  const getMomentumIcon = (momentum: string) => {
    switch (momentum) {
      case "rising":
        return "📈";
      case "declining":
        return "📉";
      case "stable":
        return "➡️";
      default:
        return "📊";
    }
  };

  const getMomentumColor = (momentum: string) => {
    switch (momentum) {
      case "rising":
        return "text-green-600";
      case "declining":
        return "text-red-600";
      case "stable":
        return "text-blue-600";
      default:
        return "text-gray-600";
    }
  };

  const getUrgencyColor = (score: number) => {
    if (score >= 8) return "bg-red-500";
    if (score >= 6) return "bg-orange-500";
    if (score >= 4) return "bg-yellow-500";
    return "bg-gray-500";
  };

  const formatTimeAgo = (dateString: string) => {
    const now = new Date();
    const date = new Date(dateString);
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));

    if (diffHours < 1) return "Baru saja";
    if (diffHours < 24) return `${diffHours} jam lalu`;
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays} hari lalu`;
  };

  useEffect(() => {
    fetchAllData();
  }, [filters]);

  // Auto-refresh every 15 minutes
  useEffect(() => {
    const interval = setInterval(() => {
      fetchAllData();
    }, 15 * 60 * 1000);

    return () => clearInterval(interval);
  }, [filters]);

  // Handle loading and authentication states
  if (status === "loading") {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!session) {
    return null;
  }

  return (
    <AdminLayout title="Tren & Isu Viral" activeTab="trends">
      <div className="space-y-6">
        {/* Overview Stats */}
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-gray-900 flex items-center">
                📈 Analisis Tren & Isu Viral
              </h2>
              <p className="text-gray-600 mt-1">
                Monitoring trending topics dan emerging issues
              </p>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-blue-600">
                {trends.length}
              </div>
              <div className="text-sm text-gray-500">Trending Topics</div>
              <div className="text-xs text-gray-400 mt-1">
                Update: {lastUpdated.toLocaleTimeString()}
              </div>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="card">
            <div className="text-2xl font-bold text-green-600">
              {trends.filter((t) => t.momentum === "rising").length}
            </div>
            <div className="text-sm text-gray-600">Rising Trends</div>
          </div>
          <div className="card">
            <div className="text-2xl font-bold text-red-600">
              {emergingIssues.length}
            </div>
            <div className="text-sm text-gray-600">Emerging Issues</div>
          </div>
          <div className="card">
            <div className="text-2xl font-bold text-purple-600">
              {keywordCloud.length}
            </div>
            <div className="text-sm text-gray-600">Keywords Tracked</div>
          </div>
          <div className="card">
            <div className="text-2xl font-bold text-orange-600">
              {emergingIssues.filter((i) => i.urgency_score >= 8).length}
            </div>
            <div className="text-sm text-gray-600">High Urgency</div>
          </div>
        </div>

        {/* Filters */}
        <div className="card">
          <div className="flex flex-wrap gap-4 items-center">
            <select
              value={filters.timeRange}
              onChange={(e) =>
                setFilters((prev) => ({ ...prev, timeRange: e.target.value }))
              }
              className="border border-gray-300 rounded-md px-3 py-2"
            >
              <option value="1h">1 Jam Terakhir</option>
              <option value="6h">6 Jam Terakhir</option>
              <option value="24h">24 Jam Terakhir</option>
              <option value="7d">7 Hari Terakhir</option>
            </select>

            <select
              value={filters.department}
              onChange={(e) =>
                setFilters((prev) => ({ ...prev, department: e.target.value }))
              }
              className="border border-gray-300 rounded-md px-3 py-2"
            >
              <option value="all">Semua Departemen</option>
              <option value="pu">Dinas PU</option>
              <option value="kesehatan">Dinas Kesehatan</option>
              <option value="pendidikan">Dinas Pendidikan</option>
              <option value="perdagangan">Dinas Perdagangan</option>
            </select>

            <input
              type="number"
              placeholder="Min mentions"
              value={filters.minMentions}
              onChange={(e) =>
                setFilters((prev) => ({
                  ...prev,
                  minMentions: parseInt(e.target.value) || 3,
                }))
              }
              className="border border-gray-300 rounded-md px-3 py-2 w-32"
              min="1"
            />

            <button
              onClick={fetchAllData}
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
            >
              🔄 Refresh
            </button>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Trending Topics */}
          <div className="card">
            <h3 className="text-lg font-semibold mb-4 flex items-center">
              📈 Top Trending Topics
            </h3>

            {loading && (
              <div className="text-center py-8">
                <div className="text-gray-600">Memuat trending topics...</div>
              </div>
            )}

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="text-red-800">Error: {error}</div>
              </div>
            )}

            {!loading && !error && trends.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                Tidak ada trending topics saat ini
              </div>
            )}

            <div className="space-y-3">
              {trends.map((trend, index) => (
                <div
                  key={trend.keyword}
                  className="border-l-4 border-blue-500 pl-4 py-2"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-gray-900">
                        #{index + 1} {trend.keyword}
                      </span>
                      <span
                        className={`text-sm ${getMomentumColor(
                          trend.momentum
                        )}`}
                      >
                        {getMomentumIcon(trend.momentum)} {trend.momentum}
                      </span>
                    </div>
                    <div className="text-sm text-gray-500">
                      {trend.total_mentions} mentions
                    </div>
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    Growth: {trend.growth_rate > 0 ? "+" : ""}
                    {trend.growth_rate.toFixed(1)}%
                    {trend.latest_mentions > 0 &&
                      ` • ${trend.latest_mentions} recent`}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Emerging Issues */}
          <div className="card">
            <h3 className="text-lg font-semibold mb-4 flex items-center">
              🚨 Emerging Issues
            </h3>

            <div className="space-y-3">
              {emergingIssues.map((issue) => (
                <div
                  key={issue.id}
                  className="border-l-4 border-red-500 pl-4 py-2"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-gray-900">
                        {issue.title}
                      </span>
                      <span
                        className={`px-2 py-1 rounded-full text-white text-xs font-bold ${getUrgencyColor(
                          issue.urgency_score
                        )}`}
                      >
                        {issue.urgency_score}/10
                      </span>
                    </div>
                    <div className="text-sm text-gray-500">
                      {issue.mention_count} mentions
                    </div>
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    Velocity: {issue.velocity.toFixed(1)}/hour •
                    {issue.department_relevance.join(", ")} •
                    {formatTimeAgo(issue.first_mention)}
                  </div>
                  <div className="text-xs text-gray-600 mt-1">
                    Keywords: {issue.keywords.join(", ")}
                  </div>
                </div>
              ))}

              {emergingIssues.length === 0 && !loading && (
                <div className="text-center py-8 text-gray-500">
                  Tidak ada emerging issues terdeteksi
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Keyword Cloud */}
        <div className="card">
          <h3 className="text-lg font-semibold mb-4 flex items-center">
            ☁️ Keyword Cloud
          </h3>

          <div className="flex flex-wrap gap-2 justify-center py-4">
            {keywordCloud.map((keyword) => (
              <span
                key={keyword.id}
                className="inline-block px-3 py-1 rounded-full border"
                style={{
                  fontSize: `${Math.max(
                    12,
                    Math.min(24, keyword.font_size / 2)
                  )}px`,
                  color: keyword.color,
                  borderColor: keyword.color,
                  opacity: 0.7 + (keyword.weight / 100) * 0.3,
                }}
              >
                {keyword.text} ({keyword.weight})
              </span>
            ))}

            {keywordCloud.length === 0 && !loading && (
              <div className="text-center py-8 text-gray-500">
                Tidak ada keyword cloud data
              </div>
            )}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
