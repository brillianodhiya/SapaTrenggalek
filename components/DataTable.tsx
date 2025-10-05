"use client";

import { useState, useEffect } from "react";
import {
  Search,
  Filter,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  AlertTriangle,
} from "lucide-react";
import ManualEntryForm from "./ManualEntryForm";

interface DataEntry {
  id: string;
  content: string;
  source: string;
  source_url: string;
  author: string;
  category: string;
  sentiment: string;
  urgency_level: number;
  hoax_probability: number;
  status: string;
  created_at: string;
  ai_analysis?: any;
}

interface DataTableProps {
  onStatusUpdate?: (id: string, status: string) => void;
}

export default function DataTable({ onStatusUpdate }: DataTableProps) {
  const [entries, setEntries] = useState<DataEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    category: "all",
    status: "all",
    search: "",
  });
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
  });

  useEffect(() => {
    fetchEntries();
  }, [filters, pagination.page]);

  const fetchEntries = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
        ...(filters.category !== "all" && { category: filters.category }),
        ...(filters.status !== "all" && { status: filters.status }),
        ...(filters.search && { search: filters.search }),
      });

      const response = await fetch(`/api/entries?${params}`);
      const data = await response.json();

      setEntries(data.data || []);
      setPagination((prev) => ({ ...prev, ...data.pagination }));
    } catch (error) {
      console.error("Error fetching entries:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (id: string, newStatus: string) => {
    try {
      const response = await fetch("/api/entries", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status: newStatus }),
      });

      if (response.ok) {
        setEntries((prev) =>
          prev.map((entry) =>
            entry.id === id ? { ...entry, status: newStatus } : entry
          )
        );
        onStatusUpdate?.(id, newStatus);
      }
    } catch (error) {
      console.error("Error updating status:", error);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusMap = {
      baru: "status-new",
      diverifikasi: "status-verified",
      diteruskan: "status-forwarded",
      dikerjakan: "status-in-progress",
      selesai: "status-completed",
    };
    return statusMap[status as keyof typeof statusMap] || "status-new";
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "berita":
        return "📰";
      case "laporan":
        return "📋";
      case "aspirasi":
        return "💡";
      default:
        return "📄";
    }
  };

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment) {
      case "positif":
        return "text-green-600";
      case "negatif":
        return "text-red-600";
      default:
        return "text-gray-600";
    }
  };

  const handleEntryAdded = () => {
    fetchEntries(); // Refresh data after new entry
  };

  return (
    <div className="space-y-6">
      {/* Header with Add Button */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-900">Data Monitoring</h2>
        <ManualEntryForm onEntryAdded={handleEntryAdded} />
      </div>

      {/* Filters */}
      <div className="card">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <input
                type="text"
                placeholder="Cari konten, penulis..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                value={filters.search}
                onChange={(e) =>
                  setFilters((prev) => ({ ...prev, search: e.target.value }))
                }
                onKeyPress={(e) => e.key === "Enter" && fetchEntries()}
              />
            </div>
          </div>

          <select
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
            value={filters.category}
            onChange={(e) =>
              setFilters((prev) => ({ ...prev, category: e.target.value }))
            }
          >
            <option value="all">Semua Kategori</option>
            <option value="berita">Berita</option>
            <option value="laporan">Laporan</option>
            <option value="aspirasi">Aspirasi</option>
            <option value="lainnya">Lainnya</option>
          </select>

          <select
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
            value={filters.status}
            onChange={(e) =>
              setFilters((prev) => ({ ...prev, status: e.target.value }))
            }
          >
            <option value="all">Semua Status</option>
            <option value="baru">Baru</option>
            <option value="diverifikasi">Diverifikasi</option>
            <option value="diteruskan">Diteruskan</option>
            <option value="dikerjakan">Dikerjakan</option>
            <option value="selesai">Selesai</option>
          </select>
        </div>
      </div>

      {/* Data Table */}
      <div className="card overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Konten
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Kategori
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Sumber
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Analisis
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Aksi
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {entries.map((entry) => (
                    <tr key={entry.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="max-w-xs">
                          <p className="text-sm text-gray-900 line-clamp-3">
                            {entry.content}
                          </p>
                          <div className="mt-1 flex items-center text-xs text-gray-500">
                            <span>{entry.author}</span>
                            <span className="mx-1">•</span>
                            <span>
                              {new Date(entry.created_at).toLocaleDateString(
                                "id-ID"
                              )}
                            </span>
                          </div>
                        </div>
                      </td>

                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <span className="mr-2">
                            {getCategoryIcon(entry.category)}
                          </span>
                          <span className="text-sm font-medium text-gray-900 capitalize">
                            {entry.category}
                          </span>
                        </div>
                      </td>

                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {entry.source}
                        </div>
                        {entry.source_url && (
                          <a
                            href={entry.source_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs text-primary-600 hover:text-primary-800 flex items-center mt-1"
                          >
                            <ExternalLink className="h-3 w-3 mr-1" />
                            Lihat sumber
                          </a>
                        )}
                      </td>

                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="space-y-1">
                          <div
                            className={`text-xs ${getSentimentColor(
                              entry.sentiment
                            )} font-medium`}
                          >
                            Sentimen: {entry.sentiment}
                          </div>
                          <div className="text-xs text-gray-600">
                            Urgensi: {entry.urgency_level}/10
                          </div>
                          {entry.hoax_probability > 50 && (
                            <div className="flex items-center text-xs text-red-600">
                              <AlertTriangle className="h-3 w-3 mr-1" />
                              Hoaks: {entry.hoax_probability}%
                            </div>
                          )}
                        </div>
                      </td>

                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`status-badge ${getStatusBadge(
                            entry.status
                          )}`}
                        >
                          {entry.status}
                        </span>
                      </td>

                      <td className="px-6 py-4 whitespace-nowrap">
                        <select
                          className="text-sm border border-gray-300 rounded px-2 py-1"
                          value={entry.status}
                          onChange={(e) =>
                            handleStatusChange(entry.id, e.target.value)
                          }
                        >
                          <option value="baru">Baru</option>
                          <option value="diverifikasi">Diverifikasi</option>
                          <option value="diteruskan">Diteruskan</option>
                          <option value="dikerjakan">Dikerjakan</option>
                          <option value="selesai">Selesai</option>
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
              <div className="flex-1 flex justify-between sm:hidden">
                <button
                  onClick={() =>
                    setPagination((prev) => ({
                      ...prev,
                      page: Math.max(1, prev.page - 1),
                    }))
                  }
                  disabled={pagination.page === 1}
                  className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                >
                  Previous
                </button>
                <button
                  onClick={() =>
                    setPagination((prev) => ({
                      ...prev,
                      page: Math.min(prev.totalPages, prev.page + 1),
                    }))
                  }
                  disabled={pagination.page === pagination.totalPages}
                  className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                >
                  Next
                </button>
              </div>
              <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm text-gray-700">
                    Menampilkan{" "}
                    <span className="font-medium">
                      {(pagination.page - 1) * pagination.limit + 1}
                    </span>{" "}
                    sampai{" "}
                    <span className="font-medium">
                      {Math.min(
                        pagination.page * pagination.limit,
                        pagination.total
                      )}
                    </span>{" "}
                    dari <span className="font-medium">{pagination.total}</span>{" "}
                    hasil
                  </p>
                </div>
                <div>
                  <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                    <button
                      onClick={() =>
                        setPagination((prev) => ({
                          ...prev,
                          page: Math.max(1, prev.page - 1),
                        }))
                      }
                      disabled={pagination.page === 1}
                      className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                    >
                      <ChevronLeft className="h-5 w-5" />
                    </button>
                    <span className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700">
                      {pagination.page} / {pagination.totalPages}
                    </span>
                    <button
                      onClick={() =>
                        setPagination((prev) => ({
                          ...prev,
                          page: Math.min(prev.totalPages, prev.page + 1),
                        }))
                      }
                      disabled={pagination.page === pagination.totalPages}
                      className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                    >
                      <ChevronRight className="h-5 w-5" />
                    </button>
                  </nav>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
