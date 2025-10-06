"use client";

import { useState, useEffect } from "react";
import {
  MessageSquare,
  Calendar,
  User,
  MapPin,
  Tag,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
} from "lucide-react";

interface Aspirasi {
  id: number;
  name: string;
  kecamatan: string;
  category: string;
  content: string;
  status: "pending" | "in_progress" | "resolved" | "rejected";
  created_at: string;
  admin_response?: string;
}

export default function AspirasiList() {
  const [aspirasi, setAspirasi] = useState<Aspirasi[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    in_progress: 0,
    resolved: 0,
    rejected: 0,
  });

  useEffect(() => {
    fetchAspirasi();
  }, []);

  const fetchAspirasi = async () => {
    try {
      const response = await fetch("/api/aspirasi?limit=5");
      const result = await response.json();

      if (result.success) {
        setAspirasi(result.data);

        // Calculate stats
        const statsData = result.data.reduce(
          (acc: any, item: Aspirasi) => {
            acc.total++;
            acc[item.status]++;
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
    });
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {/* Stats Summary Loading */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-gray-100 p-3 rounded-lg animate-pulse">
            <div className="h-6 bg-gray-200 rounded mb-1"></div>
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
          </div>
          <div className="bg-gray-100 p-3 rounded-lg animate-pulse">
            <div className="h-6 bg-gray-200 rounded mb-1"></div>
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
          </div>
        </div>

        {/* Aspirasi List Loading with Fixed Height */}
        <div className="max-h-96 overflow-y-auto space-y-4 pr-2">
          {[1, 2, 3].map((item) => (
            <div key={item} className="bg-gray-50 p-4 rounded-lg animate-pulse">
              <div className="flex items-start space-x-3">
                <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                  <div className="h-3 bg-gray-200 rounded w-full"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (aspirasi.length === 0) {
    return (
      <div className="space-y-4">
        {/* Stats Summary - Empty */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-blue-50 p-3 rounded-lg">
            <div className="text-lg font-semibold text-blue-900">0</div>
            <div className="text-sm text-blue-700">Total Aspirasi</div>
          </div>
          <div className="bg-green-50 p-3 rounded-lg">
            <div className="text-lg font-semibold text-green-900">0</div>
            <div className="text-sm text-green-700">Selesai Ditangani</div>
          </div>
        </div>

        {/* Empty State with Fixed Height */}
        <div className="max-h-96 flex items-center justify-center">
          <div className="text-center py-8">
            <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Belum ada aspirasi
            </h3>
            <p className="text-gray-600">
              Jadilah yang pertama menyampaikan aspirasi
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Stats Summary */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-blue-50 p-3 rounded-lg">
          <div className="text-lg font-semibold text-blue-900">
            {stats.total}
          </div>
          <div className="text-sm text-blue-700">Total Aspirasi</div>
        </div>
        <div className="bg-green-50 p-3 rounded-lg">
          <div className="text-lg font-semibold text-green-900">
            {stats.resolved}
          </div>
          <div className="text-sm text-green-700">Selesai Ditangani</div>
        </div>
      </div>

      {/* Aspirasi List with Fixed Height */}
      <div className="max-h-96 overflow-y-auto space-y-4 pr-2">
        {aspirasi.map((item) => (
          <div
            key={item.id}
            className="bg-gray-50 p-4 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <div className="flex items-start space-x-3">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                <MessageSquare className="h-5 w-5 text-blue-600" />
              </div>
              <div className="flex-1 min-w-0">
                {/* Header */}
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <User className="h-4 w-4" />
                    <span className="font-medium">{item.name}</span>
                    {item.kecamatan && (
                      <>
                        <span>•</span>
                        <MapPin className="h-4 w-4" />
                        <span>{item.kecamatan}</span>
                      </>
                    )}
                  </div>
                  <div
                    className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                      item.status
                    )}`}
                  >
                    {getStatusIcon(item.status)}
                    <span className="ml-1">{getStatusText(item.status)}</span>
                  </div>
                </div>

                {/* Content */}
                <p className="text-gray-700 text-sm mb-3 line-clamp-2">
                  {item.content}
                </p>

                {/* Footer */}
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <div className="flex items-center space-x-3">
                    <div className="flex items-center">
                      <Calendar className="h-3 w-3 mr-1" />
                      <span>{formatDate(item.created_at)}</span>
                    </div>
                    {item.category && (
                      <div className="flex items-center">
                        <Tag className="h-3 w-3 mr-1" />
                        <span>{item.category}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Admin Response */}
                {item.admin_response && (
                  <div className="mt-3 p-3 bg-blue-50 rounded-lg">
                    <p className="text-sm font-medium text-blue-900 mb-1">
                      Tanggapan:
                    </p>
                    <p className="text-sm text-blue-800">
                      {item.admin_response}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* View All Link */}
      <div className="text-center pt-4">
        <button className="text-primary-600 hover:text-primary-700 text-sm font-medium">
          Lihat Semua Aspirasi →
        </button>
      </div>
    </div>
  );
}
