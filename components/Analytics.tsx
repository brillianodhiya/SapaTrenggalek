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
  Eye,
  X,
  ExternalLink,
} from "lucide-react";

interface AnalyticsData {
  totalEntries: number;
  categoriesBreakdown: Record<string, number>;
  sentimentBreakdown: Record<string, number>;
  urgentItems: any[]; // Array of urgent items
  urgentItemsCount?: number; // Count of urgent items
  hoaxItems: any[]; // Array of hoax items
  hoaxItemsCount?: number; // Count of hoax items
  statusBreakdown: Record<string, number>;
  dailyTrends: Array<{ date: string; count: number }>;
  topSources: Array<{ source: string; count: number }>;
}

export default function Analytics() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState("7d");
  const [modalData, setModalData] = useState<{
    type: string;
    title: string;
    items: any[];
  } | null>(null);

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

  const openModal = async (type: string, title: string) => {
    try {
      let items: any[] = [];

      switch (type) {
        case "urgent":
          if (data?.urgentItems && data.urgentItems.length > 0) {
            items = data.urgentItems;
          } else {
            // Fetch urgent items from API
            const response = await fetch("/api/entries?urgency_min=7&limit=20");
            const result = await response.json();
            items = result.data || [];
          }
          break;

        case "hoax":
          if (data?.hoaxItems && data.hoaxItems.length > 0) {
            items = data.hoaxItems;
          } else {
            // Fetch hoax items from API
            const response = await fetch("/api/entries?hoax_min=70&limit=20");
            const result = await response.json();
            items = result.data || [];
          }
          break;

        case "category":
          // Fetch entries by category
          const response = await fetch("/api/entries?limit=50");
          const result = await response.json();
          items = result.data || [];
          break;

        case "recent":
          // Fetch recent entries
          const recentResponse = await fetch(
            "/api/entries?limit=30&sort=created_at"
          );
          const recentResult = await recentResponse.json();
          items = recentResult.data || [];
          break;

        default:
          items = [];
      }

      setModalData({ type, title, items });
    } catch (error) {
      console.error("Error fetching modal data:", error);
      setModalData({ type, title, items: [] });
    }
  };

  const closeModal = () => {
    setModalData(null);
  };

  const exportToCSV = () => {
    if (!modalData || modalData.items.length === 0) {
      alert("Tidak ada data untuk di-export");
      return;
    }

    // Prepare CSV headers
    const headers = [
      "ID",
      "Konten",
      "Sumber",
      "Kategori",
      "Sentimen",
      "Tingkat Urgensi",
      "Probabilitas Hoax (%)",
      "Status",
      "Author",
      "Tanggal Dibuat",
      "URL Sumber",
    ];

    // Prepare CSV rows
    const rows = modalData.items.map((item) => [
      item.id || "",
      `"${(item.content || "").replace(/"/g, '""')}"`, // Escape quotes
      item.source || "",
      item.category || "",
      item.sentiment || "",
      item.urgency_level || "",
      item.hoax_probability || "",
      item.status || "",
      item.author || "",
      item.created_at
        ? new Date(item.created_at).toLocaleDateString("id-ID")
        : "",
      item.source_url || "",
    ]);

    // Create CSV content
    const csvContent = [
      headers.join(","),
      ...rows.map((row) => row.join(",")),
    ].join("\n");

    // Create and download file
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");

    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute("href", url);

      // Generate filename with timestamp
      const timestamp = new Date().toISOString().split("T")[0];
      const filename = `analytics-${modalData.type}-${timestamp}.csv`;
      link.setAttribute("download", filename);

      link.style.visibility = "hidden";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      console.log(`✅ Data exported to ${filename}`);
    } else {
      alert("Browser Anda tidak mendukung download otomatis");
    }
  };

  const exportToJSON = () => {
    if (!modalData || modalData.items.length === 0) {
      alert("Tidak ada data untuk di-export");
      return;
    }

    // Prepare JSON data
    const exportData = {
      title: modalData.title,
      type: modalData.type,
      exported_at: new Date().toISOString(),
      total_items: modalData.items.length,
      data: modalData.items.map((item) => ({
        id: item.id,
        content: item.content,
        source: item.source,
        category: item.category,
        sentiment: item.sentiment,
        urgency_level: item.urgency_level,
        hoax_probability: item.hoax_probability,
        status: item.status,
        author: item.author,
        created_at: item.created_at,
        source_url: item.source_url,
      })),
    };

    // Create and download JSON file
    const jsonContent = JSON.stringify(exportData, null, 2);
    const blob = new Blob([jsonContent], {
      type: "application/json;charset=utf-8;",
    });
    const link = document.createElement("a");

    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute("href", url);

      const timestamp = new Date().toISOString().split("T")[0];
      const filename = `analytics-${modalData.type}-${timestamp}.json`;
      link.setAttribute("download", filename);

      link.style.visibility = "hidden";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      console.log(`✅ JSON data exported to ${filename}`);
    } else {
      alert("Browser Anda tidak mendukung download otomatis");
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
    urgentItems: [],
    urgentItemsCount: 12,
    hoaxItems: [],
    hoaxItemsCount: 8,
    statusBreakdown: {
      baru: 34,
      diverifikasi: 45,
      diteruskan: 38,
      dikerjakan: 25,
      selesai: 14,
    },
    dailyTrends: [
      { date: "2025-01-01", count: 12 },
      { date: "2025-01-02", count: 18 },
      { date: "2025-01-03", count: 15 },
      { date: "2025-01-04", count: 22 },
      { date: "2025-01-05", count: 19 },
      { date: "2025-01-06", count: 25 },
      { date: "2025-01-07", count: 21 },
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

  // Modal Component
  const Modal = () => {
    if (!modalData) return null;

    return (
      <div
        className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-2 sm:p-4"
        onClick={closeModal}
      >
        <div
          className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[95vh] overflow-hidden animate-in fade-in duration-200"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Modal Header */}
          <div className="flex items-center justify-between p-4 sm:p-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
            <div className="flex items-center min-w-0 flex-1">
              <div className="p-2 bg-blue-100 rounded-lg mr-3 flex-shrink-0">
                <MessageSquare className="h-5 w-5 text-blue-600" />
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="text-lg sm:text-xl font-bold text-gray-900 truncate">
                  {modalData.title}
                </h3>
                <p className="text-sm text-gray-600 mt-1">
                  {modalData.items.length} item ditemukan
                </p>
              </div>
            </div>
            <button
              onClick={closeModal}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-all duration-200"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          {/* Modal Content */}
          <div className="overflow-y-auto max-h-[calc(95vh-180px)]">
            {modalData.items.length > 0 ? (
              <div className="p-4 sm:p-6">
                <div className="space-y-4">
                  {modalData.items.map((item, index) => (
                    <div
                      key={item.id || index}
                      className="bg-white border border-gray-200 rounded-xl p-4 sm:p-5 hover:shadow-md hover:border-blue-200 transition-all duration-200"
                    >
                      {/* Content */}
                      <div className="mb-4">
                        <p className="text-gray-900 leading-relaxed text-sm break-words overflow-hidden">
                          {item.content.length > 150
                            ? `${item.content.substring(0, 150)}...`
                            : item.content}
                        </p>
                      </div>

                      {/* Metadata Tags */}
                      <div className="flex flex-wrap gap-1 sm:gap-2 mb-3 overflow-hidden">
                        {/* Source */}
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 max-w-[120px] truncate">
                          <MessageSquare className="h-3 w-3 mr-1 flex-shrink-0" />
                          <span className="truncate">{item.source}</span>
                        </span>

                        {/* Category */}
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                          <PieChart className="h-3 w-3 mr-1 flex-shrink-0" />
                          {item.category}
                        </span>

                        {/* Sentiment */}
                        <span
                          className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                            item.sentiment === "positif"
                              ? "bg-green-100 text-green-800"
                              : item.sentiment === "negatif"
                              ? "bg-red-100 text-red-800"
                              : "bg-gray-100 text-gray-800"
                          }`}
                        >
                          <Activity className="h-3 w-3 mr-1 flex-shrink-0" />
                          {item.sentiment}
                        </span>

                        {/* Urgency Level */}
                        {item.urgency_level && item.urgency_level >= 7 && (
                          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                            <AlertTriangle className="h-3 w-3 mr-1" />
                            Urgensi: {item.urgency_level}/10
                          </span>
                        )}

                        {/* Hoax Probability */}
                        {item.hoax_probability &&
                          item.hoax_probability >= 70 && (
                            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                              <TrendingUp className="h-3 w-3 mr-1" />
                              Hoax: {item.hoax_probability}%
                            </span>
                          )}

                        {/* Date */}
                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
                          <Calendar className="h-3 w-3 mr-1" />
                          {new Date(item.created_at).toLocaleDateString(
                            "id-ID",
                            {
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                            }
                          )}
                        </span>
                      </div>

                      {/* Footer */}
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pt-3 border-t border-gray-100 gap-2">
                        <div className="flex items-center text-sm text-gray-500 min-w-0">
                          {item.author && (
                            <span className="mr-2 sm:mr-4 flex items-center">
                              <Users className="h-4 w-4 mr-1 flex-shrink-0" />
                              <span className="truncate max-w-[100px]">
                                {item.author}
                              </span>
                            </span>
                          )}
                          <span className="text-xs">
                            ID: {item.id?.substring(0, 8)}...
                          </span>
                        </div>

                        {item.source_url && (
                          <a
                            href={item.source_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center px-2 sm:px-3 py-1.5 text-xs sm:text-sm font-medium text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-colors duration-200 flex-shrink-0"
                          >
                            <ExternalLink className="h-4 w-4 mr-1" />
                            <span className="hidden sm:inline">
                              Lihat Sumber
                            </span>
                            <span className="sm:hidden">Sumber</span>
                          </a>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="text-center py-16">
                <div className="p-4 bg-gray-100 rounded-full w-20 h-20 mx-auto mb-4 flex items-center justify-center">
                  <MessageSquare className="h-10 w-10 text-gray-400" />
                </div>
                <h4 className="text-lg font-medium text-gray-900 mb-2">
                  Tidak Ada Data
                </h4>
                <p className="text-gray-500 max-w-sm mx-auto">
                  Tidak ada data yang sesuai dengan kriteria yang dipilih saat
                  ini.
                </p>
              </div>
            )}
          </div>

          {/* Modal Footer */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-4 sm:p-6 border-t border-gray-200 bg-gray-50 gap-3">
            <div className="flex items-center text-sm text-gray-600">
              <BarChart3 className="h-4 w-4 mr-2 flex-shrink-0" />
              <span className="font-medium">{modalData.items.length}</span>
              <span className="ml-1">item ditampilkan</span>
            </div>
            <div className="flex gap-2 sm:gap-3">
              <div className="relative">
                <select
                  onChange={(e) => {
                    if (e.target.value === "csv") {
                      exportToCSV();
                    } else if (e.target.value === "json") {
                      exportToJSON();
                    }
                    e.target.value = ""; // Reset selection
                  }}
                  className="px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors duration-200 cursor-pointer"
                  defaultValue=""
                >
                  <option value="" disabled>
                    📊 Export
                  </option>
                  <option value="csv">📄 Export CSV</option>
                  <option value="json">📋 Export JSON</option>
                </select>
              </div>
              <button
                onClick={closeModal}
                className="px-4 sm:px-6 py-2 text-xs sm:text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors duration-200"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

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
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <MessageSquare className="h-8 w-8 mr-3" />
              <div>
                <p className="text-blue-100">Total Entries</p>
                <p className="text-2xl font-bold">{data.totalEntries}</p>
              </div>
            </div>
            <button
              onClick={() => openModal("recent", "Semua Entries Terbaru")}
              className="text-blue-100 hover:text-white transition-colors"
              title="Lihat Detail"
            >
              <Eye className="h-5 w-5" />
            </button>
          </div>
        </div>

        <div className="card bg-gradient-to-r from-red-500 to-red-600 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <AlertTriangle className="h-8 w-8 mr-3" />
              <div>
                <p className="text-red-100">Item Mendesak</p>
                <p className="text-2xl font-bold">
                  {data.urgentItemsCount || data.urgentItems?.length || 0}
                </p>
              </div>
            </div>
            <button
              onClick={() => openModal("urgent", "Item Mendesak (Urgensi ≥ 7)")}
              className="text-red-100 hover:text-white transition-colors"
              title="Lihat Detail"
            >
              <Eye className="h-5 w-5" />
            </button>
          </div>
        </div>

        <div className="card bg-gradient-to-r from-orange-500 to-orange-600 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Activity className="h-8 w-8 mr-3" />
              <div>
                <p className="text-orange-100">Potensi Hoax</p>
                <p className="text-2xl font-bold">
                  {data.hoaxItemsCount || data.hoaxItems?.length || 0}
                </p>
              </div>
            </div>
            <button
              onClick={() => openModal("hoax", "Potensi Hoax (≥ 70%)")}
              className="text-orange-100 hover:text-white transition-colors"
              title="Lihat Detail"
            >
              <Eye className="h-5 w-5" />
            </button>
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
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold flex items-center">
              <PieChart className="h-5 w-5 mr-2" />
              Breakdown Kategori
            </h3>
            <button
              onClick={() => openModal("category", "Data Berdasarkan Kategori")}
              className="text-gray-600 hover:text-gray-800 transition-colors"
              title="Lihat Detail"
            >
              <Eye className="h-5 w-5" />
            </button>
          </div>
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
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold flex items-center">
              <Activity className="h-5 w-5 mr-2" />
              Analisis Sentimen
            </h3>
            <button
              onClick={() => openModal("category", "Data Berdasarkan Sentimen")}
              className="text-gray-600 hover:text-gray-800 transition-colors"
              title="Lihat Detail"
            >
              <Eye className="h-5 w-5" />
            </button>
          </div>
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

      {/* Modal */}
      <Modal />
    </div>
  );
}
