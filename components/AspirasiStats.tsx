"use client";

import { useState, useEffect } from "react";
import { MessageSquare, Clock, CheckCircle, Users } from "lucide-react";

interface AspirasiStatsData {
  total: number;
  pending: number;
  in_progress: number;
  resolved: number;
  rejected: number;
}

export default function AspirasiStats() {
  const [stats, setStats] = useState<AspirasiStatsData>({
    total: 0,
    pending: 0,
    in_progress: 0,
    resolved: 0,
    rejected: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await fetch("/api/aspirasi?limit=1000"); // Get all to calculate stats
      const result = await response.json();

      if (result.success) {
        // Calculate stats from all data
        const statsData = result.data.reduce(
          (acc: AspirasiStatsData, item: any) => {
            acc.total++;
            acc[item.status as keyof AspirasiStatsData]++;
            return acc;
          },
          { total: 0, pending: 0, in_progress: 0, resolved: 0, rejected: 0 }
        );

        setStats(statsData);
      }
    } catch (error) {
      console.error("Error fetching aspirasi stats:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[1, 2, 3, 4].map((item) => (
          <div
            key={item}
            className="bg-white p-6 rounded-lg shadow-sm text-center"
          >
            <div className="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center mx-auto mb-3 animate-pulse">
              <div className="w-6 h-6 bg-gray-300 rounded"></div>
            </div>
            <div className="h-8 bg-gray-200 rounded mb-1 animate-pulse"></div>
            <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
      <div className="bg-white p-6 rounded-lg shadow-sm text-center">
        <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-3">
          <MessageSquare className="h-6 w-6 text-blue-600" />
        </div>
        <div className="text-2xl font-bold text-gray-900 mb-1">
          {stats.total}
        </div>
        <div className="text-gray-600 text-sm">Total Aspirasi</div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-sm text-center">
        <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center mx-auto mb-3">
          <Clock className="h-6 w-6 text-yellow-600" />
        </div>
        <div className="text-2xl font-bold text-gray-900 mb-1">
          {stats.pending + stats.in_progress}
        </div>
        <div className="text-gray-600 text-sm">Dalam Proses</div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-sm text-center">
        <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-3">
          <CheckCircle className="h-6 w-6 text-green-600" />
        </div>
        <div className="text-2xl font-bold text-gray-900 mb-1">
          {stats.resolved}
        </div>
        <div className="text-gray-600 text-sm">Selesai</div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-sm text-center">
        <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-3">
          <Users className="h-6 w-6 text-purple-600" />
        </div>
        <div className="text-2xl font-bold text-gray-900 mb-1">14</div>
        <div className="text-gray-600 text-sm">Kecamatan</div>
      </div>
    </div>
  );
}
