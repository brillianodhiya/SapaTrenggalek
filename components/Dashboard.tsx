"use client";

import { useState, useEffect } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
} from "recharts";
import {
  AlertTriangle,
  TrendingUp,
  MessageSquare,
  FileText,
  Users,
  Clock,
} from "lucide-react";

interface AnalyticsData {
  categoryStats: Record<string, number>;
  statusStats: Record<string, number>;
  sentimentStats: Record<string, number>;
  urgentItems: any[];
  hoaxItems: any[];
  dailyTrends: any[];
}

const COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6"];

export default function Dashboard() {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      const response = await fetch("/api/analytics");
      const data = await response.json();
      setAnalytics(data);
    } catch (error) {
      console.error("Error fetching analytics:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Gagal memuat data analitik</p>
      </div>
    );
  }

  const categoryData = Object.entries(analytics.categoryStats).map(
    ([key, value]) => ({
      name: key.charAt(0).toUpperCase() + key.slice(1),
      value,
    })
  );

  const statusData = Object.entries(analytics.statusStats).map(
    ([key, value]) => ({
      name: key.charAt(0).toUpperCase() + key.slice(1),
      value,
    })
  );

  const totalEntries = Object.values(analytics.categoryStats).reduce(
    (a, b) => a + b,
    0
  );
  const urgentCount = analytics.urgentItems.length;
  const hoaxCount = analytics.hoaxItems.length;

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="card">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <FileText className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Entri</p>
              <p className="text-2xl font-bold text-gray-900">{totalEntries}</p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="p-2 bg-red-100 rounded-lg">
              <AlertTriangle className="h-6 w-6 text-red-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Mendesak</p>
              <p className="text-2xl font-bold text-gray-900">{urgentCount}</p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <TrendingUp className="h-6 w-6 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Potensi Hoaks</p>
              <p className="text-2xl font-bold text-gray-900">{hoaxCount}</p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <Clock className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Selesai</p>
              <p className="text-2xl font-bold text-gray-900">
                {analytics.statusStats.selesai || 0}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Category Distribution */}
        <div className="card">
          <h3 className="text-lg font-semibold mb-4">Distribusi Kategori</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={categoryData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) =>
                  `${name} ${(percent * 100).toFixed(0)}%`
                }
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {categoryData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={COLORS[index % COLORS.length]}
                  />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Status Distribution */}
        <div className="card">
          <h3 className="text-lg font-semibold mb-4">Status Penanganan</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={statusData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="value" fill="#3b82f6" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Daily Trends */}
      <div className="card">
        <h3 className="text-lg font-semibold mb-4">
          Tren Harian (7 Hari Terakhir)
        </h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={analytics.dailyTrends}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Line
              type="monotone"
              dataKey="berita"
              stroke="#3b82f6"
              name="Berita"
            />
            <Line
              type="monotone"
              dataKey="laporan"
              stroke="#ef4444"
              name="Laporan"
            />
            <Line
              type="monotone"
              dataKey="aspirasi"
              stroke="#10b981"
              name="Aspirasi"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Urgent Items */}
      {urgentCount > 0 && (
        <div className="card">
          <h3 className="text-lg font-semibold mb-4 flex items-center">
            <AlertTriangle className="h-5 w-5 text-red-500 mr-2" />
            Item Mendesak
          </h3>
          <div className="space-y-3">
            {analytics.urgentItems.slice(0, 5).map((item) => (
              <div
                key={item.id}
                className="border-l-4 border-red-500 pl-4 py-2"
              >
                <p className="font-medium text-sm">
                  {item.content.substring(0, 100)}...
                </p>
                <div className="flex items-center mt-1 text-xs text-gray-500">
                  <span>Urgensi: {item.urgency_level}/10</span>
                  <span className="mx-2">•</span>
                  <span>{item.source}</span>
                  <span className="mx-2">•</span>
                  <span>
                    {new Date(item.created_at).toLocaleDateString("id-ID")}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
