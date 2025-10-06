"use client";

import { useState, useEffect } from "react";
import {
  MessageSquare,
  Filter,
  Search,
  Calendar,
  User,
  MapPin,
  Tag,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Send,
  Eye,
} from "lucide-react";

interface Aspirasi {
  id: number;
  name: string;
  kecamatan: string;
  category: string;
  content: string;
  email: string;
  phone: string;
  status: "pending" | "in_progress" | "resolved" | "rejected";
  admin_response: string;
  admin_id: number;
  created_at: string;
  updated_at: string;
}

interface AspirasiStats {
  total: number;
  pending: number;
  in_progress: number;
  resolved: number;
  rejected: number;
}

export default function AspirasiManager() {
  const [aspirasi, setAspirasi] = useState<Aspirasi[]>([]);
  const [stats, setStats] = useState<AspirasiStats>({
    total: 0,
    pending: 0,
    in_progress: 0,
    resolved: 0,
    rejected: 0,
  });
  const [loading, setLoading] = useState(true);
  const [selectedAspirasi, setSelectedAspirasi] = useState<Aspirasi | null>(
    null
  );
  const [responseText, setResponseText] = useState("");
  const [responseLoading, setResponseLoading] = useState(false);

  // Filters
  const [statusFilter, setStatusFilter] = useState("");
  const [kecamatanFilter, setKecamatanFilter] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchAspirasi = async (page = 1) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: "10",
      });

      if (statusFilter) params.append("status", statusFilter);
      if (kecamatanFilter) params.append("kecamatan", kecamatanFilter);
      if (categoryFilter) params.append("category", categoryFilter);
      if (searchTerm) params.append("search", searchTerm);

      const response = await fetch(`/api/aspirasi?${params}`);
      const result = await response.json();

      if (result.success) {
        setAspirasi(result.data);
        setTotalPages(result.pagination.totalPages);
        setCurrentPage(page);

        // Calculate stats
        const statsData = result.data.reduce(
          (acc: AspirasiStats, item: Aspirasi) => {
            acc.total++;
            acc[item.status as keyof AspirasiStats]++;
            return acc;
          },
          { total: 0, pending: 0, in_progress: 0, resolved: 0, rejected: 0 }
        );

        setStats(statsData);
      }
    } catch (error) {
      console.error("Error fetching aspirasi:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAspirasi();
  }, [statusFilter, kecamatanFilter, categoryFilter, searchTerm]);

  const handleStatusChange = async (id: number, newStatus: string) => {
    try {
      const response = await fetch(`/api/aspirasi/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

      if (response.ok) {
        fetchAspirasi(currentPage);
        if (selectedAspirasi?.id === id) {
          setSelectedAspirasi((prev) =>
            prev ? { ...prev, status: newStatus as any } : null
          );
        }
      }
    } catch (error) {
      console.error("Error updating status:", error);
    }
  };

  const handleResponse = async () => {
    if (!selectedAspirasi || !responseText.trim()) return;

    setResponseLoading(true);
    try {
      const response = await fetch(`/api/aspirasi/${selectedAspirasi.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          admin_response: responseText,
          status: "resolved",
        }),
      });

      if (response.ok) {
        setResponseText("");
        fetchAspirasi(currentPage);
        setSelectedAspirasi((prev) =>
          prev
            ? {
                ...prev,
                admin_response: responseText,
                status: "resolved",
              }
            : null
        );
      }
    } catch (error) {
      console.error("Error sending response:", error);
    } finally {
      setResponseLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "in_progress":
        return "bg-blue-100 text-blue-800";
      case "resolved":
        return "bg-green-100 text-green-800";
      case "rejected":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pending":
        return <Clock className="h-4 w-4" />;
      case "in_progress":
        return <AlertCircle className="h-4 w-4" />;
      case "resolved":
        return <CheckCircle className="h-4 w-4" />;
      case "rejected":
        return <XCircle className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "pending":
        return "Menunggu";
      case "in_progress":
        return "Diproses";
      case "resolved":
        return "Selesai";
      case "rejected":
        return "Ditolak";
      default:
        return status;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <div className="bg-white p-4 rounded-lg border">
          <div className="flex items-center">
            <MessageSquare className="h-8 w-8 text-blue-600" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">Total</p>
              <p className="text-2xl font-semibold text-gray-900">
                {stats.total}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg border">
          <div className="flex items-center">
            <Clock className="h-8 w-8 text-yellow-600" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">Menunggu</p>
              <p className="text-2xl font-semibold text-gray-900">
                {stats.pending}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg border">
          <div className="flex items-center">
            <AlertCircle className="h-8 w-8 text-blue-600" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">Diproses</p>
              <p className="text-2xl font-semibold text-gray-900">
                {stats.in_progress}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg border">
          <div className="flex items-center">
            <CheckCircle className="h-8 w-8 text-green-600" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">Selesai</p>
              <p className="text-2xl font-semibold text-gray-900">
                {stats.resolved}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg border">
          <div className="flex items-center">
            <XCircle className="h-8 w-8 text-red-600" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">Ditolak</p>
              <p className="text-2xl font-semibold text-gray-900">
                {stats.rejected}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-6 rounded-lg border">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Status
            </label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              <option value="">Semua Status</option>
              <option value="pending">Menunggu</option>
              <option value="in_progress">Diproses</option>
              <option value="resolved">Selesai</option>
              <option value="rejected">Ditolak</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Kecamatan
            </label>
            <select
              value={kecamatanFilter}
              onChange={(e) => setKecamatanFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              <option value="">Semua Kecamatan</option>
              <option value="Bendungan">Bendungan</option>
              <option value="Dongko">Dongko</option>
              <option value="Durenan">Durenan</option>
              <option value="Gandusari">Gandusari</option>
              <option value="Kampak">Kampak</option>
              <option value="Karangan">Karangan</option>
              <option value="Munjungan">Munjungan</option>
              <option value="Panggul">Panggul</option>
              <option value="Pogalan">Pogalan</option>
              <option value="Pule">Pule</option>
              <option value="Suruh">Suruh</option>
              <option value="Trenggalek">Trenggalek</option>
              <option value="Tugu">Tugu</option>
              <option value="Watulimo">Watulimo</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Kategori
            </label>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              <option value="">Semua Kategori</option>
              <option value="Infrastruktur">Infrastruktur</option>
              <option value="Pendidikan">Pendidikan</option>
              <option value="Kesehatan">Kesehatan</option>
              <option value="Ekonomi">Ekonomi</option>
              <option value="Lingkungan">Lingkungan</option>
              <option value="Sosial">Sosial</option>
              <option value="Keamanan">Keamanan</option>
              <option value="Transportasi">Transportasi</option>
              <option value="Lainnya">Lainnya</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Pencarian
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Cari aspirasi..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Aspirasi List */}
      <div className="bg-white rounded-lg border overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
          </div>
        ) : aspirasi.length === 0 ? (
          <div className="text-center py-12">
            <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Tidak ada aspirasi
            </h3>
            <p className="text-gray-600">
              Belum ada aspirasi yang masuk atau sesuai filter
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {aspirasi.map((item) => (
              <div key={item.id} className="p-6 hover:bg-gray-50">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-4 mb-3">
                      <div className="flex items-center">
                        <User className="h-4 w-4 text-gray-400 mr-1" />
                        <span className="font-medium text-gray-900">
                          {item.name}
                        </span>
                      </div>
                      {item.kecamatan && (
                        <div className="flex items-center">
                          <MapPin className="h-4 w-4 text-gray-400 mr-1" />
                          <span className="text-sm text-gray-600">
                            {item.kecamatan}
                          </span>
                        </div>
                      )}
                      {item.category && (
                        <div className="flex items-center">
                          <Tag className="h-4 w-4 text-gray-400 mr-1" />
                          <span className="text-sm text-gray-600">
                            {item.category}
                          </span>
                        </div>
                      )}
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 text-gray-400 mr-1" />
                        <span className="text-sm text-gray-500">
                          {formatDate(item.created_at)}
                        </span>
                      </div>
                    </div>

                    <p className="text-gray-700 mb-4 line-clamp-3">
                      {item.content}
                    </p>

                    {item.email && (
                      <p className="text-sm text-gray-500 mb-2">
                        Email: {item.email}
                      </p>
                    )}
                    {item.phone && (
                      <p className="text-sm text-gray-500 mb-4">
                        Telepon: {item.phone}
                      </p>
                    )}

                    {item.admin_response && (
                      <div className="bg-blue-50 p-3 rounded-lg mb-4">
                        <p className="text-sm font-medium text-blue-900 mb-1">
                          Tanggapan Admin:
                        </p>
                        <p className="text-sm text-blue-800">
                          {item.admin_response}
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center space-x-3 ml-6">
                    <div
                      className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                        item.status
                      )}`}
                    >
                      {getStatusIcon(item.status)}
                      <span className="ml-1">{getStatusText(item.status)}</span>
                    </div>

                    <select
                      value={item.status}
                      onChange={(e) =>
                        handleStatusChange(item.id, e.target.value)
                      }
                      className="text-sm border border-gray-300 rounded px-2 py-1 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    >
                      <option value="pending">Menunggu</option>
                      <option value="in_progress">Diproses</option>
                      <option value="resolved">Selesai</option>
                      <option value="rejected">Ditolak</option>
                    </select>

                    <button
                      onClick={() => setSelectedAspirasi(item)}
                      className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
                    >
                      <Eye className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-700">
            Halaman {currentPage} dari {totalPages}
          </div>
          <div className="flex space-x-2">
            <button
              onClick={() => fetchAspirasi(currentPage - 1)}
              disabled={currentPage === 1}
              className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Sebelumnya
            </button>
            <button
              onClick={() => fetchAspirasi(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Selanjutnya
            </button>
          </div>
        </div>
      )}

      {/* Detail Modal */}
      {selectedAspirasi && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">
                  Detail Aspirasi
                </h2>
                <button
                  onClick={() => setSelectedAspirasi(null)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-6">
                {/* Header Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Nama
                    </label>
                    <p className="mt-1 text-sm text-gray-900">
                      {selectedAspirasi.name}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Kecamatan
                    </label>
                    <p className="mt-1 text-sm text-gray-900">
                      {selectedAspirasi.kecamatan || "-"}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Kategori
                    </label>
                    <p className="mt-1 text-sm text-gray-900">
                      {selectedAspirasi.category || "-"}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Status
                    </label>
                    <div
                      className={`mt-1 inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                        selectedAspirasi.status
                      )}`}
                    >
                      {getStatusIcon(selectedAspirasi.status)}
                      <span className="ml-1">
                        {getStatusText(selectedAspirasi.status)}
                      </span>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Email
                    </label>
                    <p className="mt-1 text-sm text-gray-900">
                      {selectedAspirasi.email || "-"}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Telepon
                    </label>
                    <p className="mt-1 text-sm text-gray-900">
                      {selectedAspirasi.phone || "-"}
                    </p>
                  </div>
                </div>

                {/* Content */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Aspirasi
                  </label>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-gray-900 whitespace-pre-wrap">
                      {selectedAspirasi.content}
                    </p>
                  </div>
                </div>

                {/* Existing Response */}
                {selectedAspirasi.admin_response && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Tanggapan Sebelumnya
                    </label>
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <p className="text-blue-900 whitespace-pre-wrap">
                        {selectedAspirasi.admin_response}
                      </p>
                    </div>
                  </div>
                )}

                {/* Response Form */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {selectedAspirasi.admin_response
                      ? "Tanggapan Baru"
                      : "Tanggapan Admin"}
                  </label>
                  <textarea
                    value={responseText}
                    onChange={(e) => setResponseText(e.target.value)}
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="Tulis tanggapan untuk aspirasi ini..."
                  />
                  <div className="mt-3 flex justify-end space-x-3">
                    <button
                      onClick={() => setSelectedAspirasi(null)}
                      className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                    >
                      Tutup
                    </button>
                    <button
                      onClick={handleResponse}
                      disabled={!responseText.trim() || responseLoading}
                      className="px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                    >
                      {responseLoading ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          Mengirim...
                        </>
                      ) : (
                        <>
                          <Send className="h-4 w-4 mr-2" />
                          Kirim Tanggapan
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {/* Timestamps */}
                <div className="text-sm text-gray-500 border-t pt-4">
                  <p>Dibuat: {formatDate(selectedAspirasi.created_at)}</p>
                  {selectedAspirasi.updated_at !==
                    selectedAspirasi.created_at && (
                    <p>Diperbarui: {formatDate(selectedAspirasi.updated_at)}</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
