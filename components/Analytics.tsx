"use client";

import { useState, useEffect } from "react";
import {
  BarChart3,
  TrendingUp,
  AlertTriangle,
  MessageSquare,
  Calendar,
  PieChart,
  Activity,
  Users,
} from "lucide-react";

interface AnalyticsData {
  totalEntries: number;
  categoriesBreakdown: Record<string, number>;
  sentimentBreakdown: Record<string, number>;
  urgentItems: number;
  hoaxItems: number;
  statusBreakdown: Record<string, number>;
  dailyTrends: Array<{ date: string; count: number }>;
  topSources: Array<{ source: string; count: number }>;
}

export default function Analytics() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState("7d");

  useEffect(() => {
    fetchAnalytics();
  }, [timeRange]);

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/analytics?range=${timeRange}`);
      const result = await response.json();
      console.log("Analytics data received:", result);
      console.log("Daily trends data:", result.dailyTrends);
      setData(result);
    } catch (error) {
      console.error("Error fetching analytics:", error);
      // Set demo data if API fails
      setData(getDemoAnalytics());
    } finally {
      setLoading(false);
    }
  };

  const getDemoAnalytics = (): AnalyticsData => ({
    totalEntries: 156,
    categoriesBreakdown: {
      berita: 45,
      laporan: 38,
      aspirasi: 32,
      pengaduan: 28,
      lainnya: 13,
    },
    sentimentBreakdown: {
      positif: 62,
      netral: 71,
      negatif: 23,
    },
    urgentItems: 12,
    hoaxItems: 8,
    statusBreakdown: {
      baru: 34,
      diverifikasi: 45,
      diteruskan: 38,
      dikerjakan: 25,
      selesai: 14,
    },
    dailyTrends: [
      { date: "2024-01-01", count: 12 },
      { date: "2024-01-02", count: 18 },
      { date: "2024-01-03", count: 15 },
      { date: "2024-01-04", count: 22 },
      { date: "2024-01-05", count: 19 },
      { date: "2024-01-06", count: 25 },
      { date: "2024-01-07", count: 21 },
    ],
    topSources: [
      { source: "WhatsApp", count: 45 },
      { source: "Facebook", count: 32 },
      { source: "Website Resmi", count: 28 },
      { source: "Instagram", count: 24 },
      { source: "Twitter", count: 18 },
    ],
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">Gagal memuat data analytics</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Time Range Selector */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">
          Analytics & Reports
        </h2>
        <select
          value={timeRange}
          onChange={(e) => setTimeRange(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
        >
          <option value="7d">7 Hari Terakhir</option>
          <option value="30d">30 Hari Terakhir</option>
          <option value="90d">3 Bulan Terakhir</option>
          <option value="1y">1 Tahun Terakhir</option>
        </select>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="card bg-gradient-to-r from-blue-500 to-blue-600 text-white">
          <div className="flex items-center">
            <MessageSquare className="h-8 w-8 mr-3" />
            <div>
              <p className="text-blue-100">Total Entries</p>
              <p className="text-2xl font-bold">{data.totalEntries}</p>
            </div>
          </div>
        </div>

        <div className="card bg-gradient-to-r from-red-500 to-red-600 text-white">
          <div className="flex items-center">
            <AlertTriangle className="h-8 w-8 mr-3" />
            <div>
              <p className="text-red-100">Item Mendesak</p>
              <p className="text-2xl font-bold">{data.urgentItems}</p>
            </div>
          </div>
        </div>

        <div className="card bg-gradient-to-r from-orange-500 to-orange-600 text-white">
          <div className="flex items-center">
            <Activity className="h-8 w-8 mr-3" />
            <div>
              <p className="text-orange-100">Potensi Hoax</p>
              <p className="text-2xl font-bold">{data.hoaxItems}</p>
            </div>
          </div>
        </div>

        <div className="card bg-gradient-to-r from-green-500 to-green-600 text-white">
          <div className="flex items-center">
            <TrendingUp className="h-8 w-8 mr-3" />
            <div>
              <p className="text-green-100">Completion Rate</p>
              <p className="text-2xl font-bold">
                {data.totalEntries > 0 &&
                data.statusBreakdown.selesai !== undefined
                  ? Math.round(
                      (data.statusBreakdown.selesai / data.totalEntries) * 100
                    )
                  : 0}
                %
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Categories Breakdown */}
        <div className="card">
          <h3 className="text-lg font-semibold mb-4 flex items-center">
            <PieChart className="h-5 w-5 mr-2" />
            Breakdown Kategori
          </h3>
          <div className="space-y-3">
            {Object.entries(data.categoriesBreakdown).map(
              ([category, count]) => (
                <div
                  key={category}
                  className="flex items-center justify-between"
                >
                  <div className="flex items-center">
                    <div className="w-3 h-3 rounded-full bg-primary-500 mr-3"></div>
                    <span className="capitalize text-sm font-medium">
                      {category}
                    </span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-24 bg-gray-200 rounded-full h-2 mr-3">
                      <div
                        className="bg-primary-500 h-2 rounded-full"
                        style={{
                          width: `${
                            data.totalEntries > 0
                              ? (count / data.totalEntries) * 100
                              : 0
                          }%`,
                        }}
                      ></div>
                    </div>
                    <span className="text-sm font-bold w-8">{count}</span>
                  </div>
                </div>
              )
            )}
          </div>
        </div>

        {/* Sentiment Analysis */}
        <div className="card">
          <h3 className="text-lg font-semibold mb-4 flex items-center">
            <Activity className="h-5 w-5 mr-2" />
            Analisis Sentimen
          </h3>
          <div className="space-y-4">
            {Object.entries(data.sentimentBreakdown).map(
              ([sentiment, count]) => {
                const colors = {
                  positif: "bg-green-500",
                  netral: "bg-gray-500",
                  negatif: "bg-red-500",
                };
                return (
                  <div
                    key={sentiment}
                    className="flex items-center justify-between"
                  >
                    <div className="flex items-center">
                      <div
                        className={`w-3 h-3 rounded-full ${
                          colors[sentiment as keyof typeof colors]
                        } mr-3`}
                      ></div>
                      <span className="capitalize text-sm font-medium">
                        {sentiment}
                      </span>
                    </div>
                    <div className="flex items-center">
                      <div className="w-24 bg-gray-200 rounded-full h-2 mr-3">
                        <div
                          className={`${
                            colors[sentiment as keyof typeof colors]
                          } h-2 rounded-full`}
                          style={{
                            width: `${
                              data.totalEntries > 0
                                ? (count / data.totalEntries) * 100
                                : 0
                            }%`,
                          }}
                        ></div>
                      </div>
                      <span className="text-sm font-bold w-8">{count}</span>
                    </div>
                  </div>
                );
              }
            )}
          </div>
        </div>
      </div>

      {/* Status Progress & Top Sources */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Status Progress */}
        <div className="card">
          <h3 className="text-lg font-semibold mb-4 flex items-center">
            <BarChart3 className="h-5 w-5 mr-2" />
            Progress Status
          </h3>
          <div className="space-y-3">
            {Object.entries(data.statusBreakdown).map(([status, count]) => {
              const statusColors = {
                baru: "bg-blue-500",
                diverifikasi: "bg-yellow-500",
                diteruskan: "bg-purple-500",
                dikerjakan: "bg-orange-500",
                selesai: "bg-green-500",
              };
              return (
                <div key={status} className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div
                      className={`w-3 h-3 rounded-full ${
                        statusColors[status as keyof typeof statusColors]
                      } mr-3`}
                    ></div>
                    <span className="capitalize text-sm font-medium">
                      {status}
                    </span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-24 bg-gray-200 rounded-full h-2 mr-3">
                      <div
                        className={`${
                          statusColors[status as keyof typeof statusColors]
                        } h-2 rounded-full`}
                        style={{
                          width: `${
                            data.totalEntries > 0
                              ? (count / data.totalEntries) * 100
                              : 0
                          }%`,
                        }}
                      ></div>
                    </div>
                    <span className="text-sm font-bold w-8">{count}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Top Sources */}
        <div className="card">
          <h3 className="text-lg font-semibold mb-4 flex items-center">
            <Users className="h-5 w-5 mr-2" />
            Sumber Teratas
          </h3>
          <div className="space-y-3">
            {data.topSources.map((source, index) => (
              <div
                key={source.source}
                className="flex items-center justify-between"
              >
                <div className="flex items-center">
                  <span className="w-6 h-6 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center text-xs font-bold mr-3">
                    {index + 1}
                  </span>
                  <span className="text-sm font-medium">{source.source}</span>
                </div>
                <div className="flex items-center">
                  <div className="w-16 bg-gray-200 rounded-full h-2 mr-3">
                    <div
                      className="bg-primary-500 h-2 rounded-full"
                      style={{
                        width: `${
                          data.topSources[0]?.count > 0
                            ? (source.count / data.topSources[0].count) * 100
                            : 0
                        }%`,
                      }}
                    ></div>
                  </div>
                  <span className="text-sm font-bold w-8">{source.count}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Daily Trends */}
      <div className="card">
        <h3 className="text-lg font-semibold mb-4 flex items-center">
          <Calendar className="h-5 w-5 mr-2" />
          Tren Harian (7 Hari Terakhir)
        </h3>
        {data.dailyTrends && data.dailyTrends.length > 0 ? (
          <div className="h-64 flex items-end justify-between space-x-1 px-2 border border-gray-200 rounded">
            {data.dailyTrends.map((day, index) => {
              const maxCount = Math.max(
                ...data.dailyTrends.map((d) => d.count)
              );
              // Calculate height as percentage, with minimum 15% for visibility
              let height = 0;
              if (maxCount > 0 && day.count > 0) {
                height = Math.max((day.count / maxCount) * 85, 15); // 85% max, 15% min
              } else if (day.count === 0) {
                height = 3; // Small bar for zero values
              }

              console.log(
                `Day ${index}: date=${day.date}, count=${day.count}, maxCount=${maxCount}, height=${height}%`
              );

              return (
                <div key={index} className="flex-1 flex flex-col items-center">
                  <div
                    className={`w-full rounded-t transition-all duration-300 hover:opacity-80 ${
                      day.count > 0
                        ? "bg-blue-500 hover:bg-blue-600"
                        : "bg-gray-300"
                    }`}
                    style={{
                      height:
                        day.count > 0 ? `${Math.max(height, 20)}px` : "8px",
                      maxHeight: "200px",
                    }}
                    title={`${day.count} entries pada ${new Date(
                      day.date
                    ).toLocaleDateString("id-ID")}`}
                  ></div>
                  <span className="text-xs text-gray-500 mt-2">
                    {new Date(day.date).toLocaleDateString("id-ID", {
                      month: "short",
                      day: "numeric",
                    })}
                  </span>
                  <span className="text-xs font-bold text-gray-700">
                    {day.count}
                  </span>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="h-64 flex items-center justify-center">
            <div className="text-center">
              <Calendar className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">
                Belum ada data untuk 7 hari terakhir
              </p>
              <p className="text-sm text-gray-400 mt-1">
                Data akan muncul setelah ada entries baru
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
