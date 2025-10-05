"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import AdminLayout from "@/components/AdminLayout";

interface UrgentItem {
  id: string;
  content: string;
  source: string;
  source_url: string;
  author: string;
  category: string;
  sentiment: string;
  urgency_level: number;
  status: string;
  assigned_to?: string;
  handled_by?: string;
  handled_at?: string;
  escalated_at?: string;
  escalation_reason?: string;
  ai_analysis?: any;
  created_at: string;
  updated_at: string;
}

interface UrgentItemsStats {
  total_urgent: number;
  by_category: Record<string, number>;
  by_source: Record<string, number>;
  by_status: Record<string, number>;
  avg_response_time_minutes: number;
  handled_today: number;
  escalated_today: number;
  trends_hourly: Record<string, number>;
}

interface FilterState {
  categories: string[];
  sources: string[];
  timeRange: string;
  status: string[];
  search: string;
}

export default function UrgentItemsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [items, setItems] = useState<UrgentItem[]>([]);
  const [stats, setStats] = useState<UrgentItemsStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const [filters, setFilters] = useState<FilterState>({
    categories: [],
    sources: [],
    timeRange: "24",
    status: [],
    search: "",
  });

  // Redirect if not authenticated
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/admin/login");
    }
  }, [status, router]);

  const fetchUrgentItems = async () => {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams({
        urgencyMin: "7",
        limit: "50",
        offset: "0",
      });

      if (filters.categories.length > 0) {
        params.set("categories", filters.categories.join(","));
      }
      if (filters.sources.length > 0) {
        params.set("sources", filters.sources.join(","));
      }
      if (filters.timeRange !== "all") {
        params.set("timeRange", filters.timeRange);
      }
      if (filters.status.length > 0) {
        params.set("status", filters.status.join(","));
      }
      if (filters.search) {
        params.set("search", filters.search);
      }

      const response = await fetch(`/api/urgent-items?${params}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to fetch urgent items");
      }

      setItems(data.data || []);
      setLastUpdated(new Date());
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const params = new URLSearchParams({
        urgencyMin: "7",
        timeRange: filters.timeRange === "all" ? "168" : filters.timeRange, // 1 week for "all"
      });

      const response = await fetch(`/api/urgent-items/stats?${params}`);
      const data = await response.json();

      if (response.ok) {
        setStats(data.data);
      }
    } catch (err) {
      console.error("Failed to fetch stats:", err);
    }
  };

  const handleAction = async (
    itemId: string,
    action: string,
    payload: any = {}
  ) => {
    try {
      const response = await fetch(`/api/urgent-items/${itemId}/${action}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          user_id: session?.user?.email || "admin",
          ...payload,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || `Failed to ${action} item`);
      }

      // Refresh items after successful action
      await fetchUrgentItems();
      await fetchStats();

      // Show success message (you can implement toast notifications here)
      alert(`Item ${action}d successfully!`);
    } catch (err) {
      alert(`Error: ${err instanceof Error ? err.message : "Unknown error"}`);
    }
  };

  const getUrgencyColor = (level: number) => {
    if (level >= 9) return "bg-red-500";
    if (level >= 8) return "bg-orange-500";
    if (level >= 7) return "bg-yellow-500";
    return "bg-gray-500";
  };

  const getUrgencyLabel = (level: number) => {
    if (level >= 9) return "KRITIS";
    if (level >= 8) return "TINGGI";
    if (level >= 7) return "MENDESAK";
    return "NORMAL";
  };

  const formatTimeAgo = (dateString: string) => {
    const now = new Date();
    const date = new Date(dateString);
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return "Baru saja";
    if (diffMins < 60) return `${diffMins} menit lalu`;
    if (diffHours < 24) return `${diffHours} jam lalu`;
    return `${diffDays} hari lalu`;
  };

  useEffect(() => {
    fetchUrgentItems();
    fetchStats();
  }, [filters]);

  // Auto-refresh every 5 minutes
  useEffect(() => {
    const interval = setInterval(() => {
      fetchUrgentItems();
      fetchStats();
    }, 5 * 60 * 1000);

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
    <AdminLayout title="Item Mendesak" activeTab="urgent">
      <div className="space-y-6">
        {/* Overview Stats */}
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-gray-900 flex items-center">
                🚨 Monitoring Item Mendesak
              </h2>
              <p className="text-gray-600 mt-1">
                Penanganan item dengan tingkat urgensi tinggi
              </p>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-red-600">
                {stats?.total_urgent || 0}
              </div>
              <div className="text-sm text-gray-500">Total Item Mendesak</div>
              <div className="text-xs text-gray-400 mt-1">
                Update: {lastUpdated.toLocaleTimeString()}
              </div>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="card">
              <div className="text-2xl font-bold text-green-600">
                {stats.handled_today}
              </div>
              <div className="text-sm text-gray-600">Ditangani Hari Ini</div>
            </div>
            <div className="card">
              <div className="text-2xl font-bold text-orange-600">
                {stats.escalated_today}
              </div>
              <div className="text-sm text-gray-600">Dieskalasi Hari Ini</div>
            </div>
            <div className="card">
              <div className="text-2xl font-bold text-blue-600">
                {Math.round(stats.avg_response_time_minutes)}m
              </div>
              <div className="text-sm text-gray-600">Rata-rata Response</div>
            </div>
            <div className="card">
              <div className="text-2xl font-bold text-purple-600">
                {Object.keys(stats.by_category).length}
              </div>
              <div className="text-sm text-gray-600">Kategori Aktif</div>
            </div>
          </div>
        )}

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
              <option value="1">1 Jam Terakhir</option>
              <option value="6">6 Jam Terakhir</option>
              <option value="24">24 Jam Terakhir</option>
              <option value="72">3 Hari Terakhir</option>
              <option value="all">Semua</option>
            </select>

            <input
              type="text"
              placeholder="Cari item..."
              value={filters.search}
              onChange={(e) =>
                setFilters((prev) => ({ ...prev, search: e.target.value }))
              }
              className="border border-gray-300 rounded-md px-3 py-2 flex-1 min-w-64"
            />

            <button
              onClick={() => {
                fetchUrgentItems();
                fetchStats();
              }}
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
            >
              🔄 Refresh
            </button>
          </div>
        </div>

        {/* Items List */}
        <div className="space-y-4">
          {loading && (
            <div className="text-center py-8">
              <div className="text-gray-600">Memuat item mendesak...</div>
            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="text-red-800">Error: {error}</div>
            </div>
          )}

          {!loading && !error && items.length === 0 && (
            <div className="card bg-green-50 border-green-200 text-center">
              <div className="text-green-800 text-lg font-medium">
                🎉 Tidak ada item mendesak saat ini
              </div>
              <div className="text-green-600 mt-2">
                Semua situasi terkendali dengan baik
              </div>
            </div>
          )}

          {items.map((item) => (
            <div key={item.id} className="card border-l-4 border-red-500">
              <div className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <span
                        className={`px-2 py-1 rounded-full text-white text-xs font-bold ${getUrgencyColor(
                          item.urgency_level
                        )}`}
                      >
                        LEVEL {item.urgency_level} -{" "}
                        {getUrgencyLabel(item.urgency_level)}
                      </span>
                      <span className="text-sm text-gray-500">
                        📰 {item.source}
                      </span>
                      <span className="text-sm text-gray-500">
                        🕐 {formatTimeAgo(item.created_at)}
                      </span>
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          item.status === "handled"
                            ? "bg-green-100 text-green-800"
                            : item.status === "escalated"
                            ? "bg-red-100 text-red-800"
                            : item.status === "assigned"
                            ? "bg-blue-100 text-blue-800"
                            : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {item.status.toUpperCase()}
                      </span>
                    </div>

                    <div className="text-gray-900 mb-3 leading-relaxed">
                      {item.content.length > 200
                        ? `${item.content.substring(0, 200)}...`
                        : item.content}
                    </div>

                    <div className="text-sm text-gray-600 mb-4">
                      <span className="font-medium">Sumber:</span> {item.author}{" "}
                      |<span className="font-medium"> Kategori:</span>{" "}
                      {item.category} |
                      <span className="font-medium"> Sentimen:</span>{" "}
                      {item.sentiment}
                      {item.assigned_to && (
                        <>
                          {" | "}
                          <span className="font-medium">
                            Ditugaskan ke:
                          </span>{" "}
                          {item.assigned_to}
                        </>
                      )}
                    </div>

                    <div className="flex gap-2">
                      {item.status === "baru" && (
                        <>
                          <button
                            onClick={() => handleAction(item.id, "handle")}
                            className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700"
                          >
                            ✅ Tangani
                          </button>
                          <button
                            onClick={() => {
                              const reason = prompt("Alasan eskalasi:");
                              if (reason) {
                                handleAction(item.id, "escalate", { reason });
                              }
                            }}
                            className="bg-orange-600 text-white px-3 py-1 rounded text-sm hover:bg-orange-700"
                          >
                            ⬆️ Eskalasi
                          </button>
                          <button
                            onClick={() => {
                              const assignedTo = prompt("Tugaskan kepada:");
                              const department = prompt("Departemen:");
                              if (assignedTo) {
                                handleAction(item.id, "assign", {
                                  assigned_to: assignedTo,
                                  department,
                                });
                              }
                            }}
                            className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700"
                          >
                            👤 Tugaskan
                          </button>
                        </>
                      )}

                      <a
                        href={item.source_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="bg-gray-600 text-white px-3 py-1 rounded text-sm hover:bg-gray-700"
                      >
                        🔗 Lihat Sumber
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </AdminLayout>
  );
}
