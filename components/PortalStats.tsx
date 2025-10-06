"use client";

import { useState, useEffect } from "react";
import { MessageSquare, TrendingUp, Users, MapPin } from "lucide-react";

interface PortalStatsData {
  totalAspirasi: number;
  totalBerita: number;
  responseRate: number;
  totalKecamatan: number;
  recentActivity: {
    aspirasi: number;
    berita: number;
  };
}

export default function PortalStats() {
  const [stats, setStats] = useState<PortalStatsData>({
    totalAspirasi: 0,
    totalBerita: 0,
    responseRate: 0,
    totalKecamatan: 14,
    recentActivity: { aspirasi: 0, berita: 0 },
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await fetch("/api/portal-stats");
      const result = await response.json();

      if (result.success) {
        setStats(result.data);
      }
    } catch (error) {
      console.error("Error fetching stats:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatNumber = (num: number) => {
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + "k";
    }
    return num.toString();
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        {[1, 2, 3, 4].map((item) => (
          <div key={item} className="text-center">
            <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
              <div className="w-8 h-8 bg-gray-300 rounded"></div>
            </div>
            <div className="h-8 bg-gray-200 rounded mb-2 animate-pulse"></div>
            <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
      <div className="text-center">
        <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <MessageSquare className="h-8 w-8 text-blue-600" />
        </div>
        <div className="text-3xl font-bold text-gray-900 mb-2">
          {formatNumber(stats.totalAspirasi)}
        </div>
        <div className="text-gray-600">Total Aspirasi</div>
      </div>

      <div className="text-center">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <TrendingUp className="h-8 w-8 text-green-600" />
        </div>
        <div className="text-3xl font-bold text-gray-900 mb-2">
          {formatNumber(stats.totalBerita)}
        </div>
        <div className="text-gray-600">Berita Dianalisis</div>
      </div>

      <div className="text-center">
        <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Users className="h-8 w-8 text-yellow-600" />
        </div>
        <div className="text-3xl font-bold text-gray-900 mb-2">
          {stats.responseRate}%
        </div>
        <div className="text-gray-600">Tingkat Respons</div>
      </div>

      <div className="text-center">
        <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <MapPin className="h-8 w-8 text-purple-600" />
        </div>
        <div className="text-3xl font-bold text-gray-900 mb-2">
          {stats.totalKecamatan}
        </div>
        <div className="text-gray-600">Kecamatan</div>
      </div>
    </div>
  );
}
