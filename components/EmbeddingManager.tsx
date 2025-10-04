"use client";

import { useState, useEffect } from "react";
import {
  Zap,
  Database,
  RefreshCw,
  CheckCircle,
  AlertCircle,
  BarChart3,
} from "lucide-react";

interface EmbeddingStats {
  totalEntries: number;
  entriesWithEmbeddings: number;
  entriesWithoutEmbeddings: number;
  completionPercentage: number;
}

interface RecentEntry {
  id: string;
  content: string;
  source: string;
  created_at: string;
}

export default function EmbeddingManager() {
  const [stats, setStats] = useState<EmbeddingStats | null>(null);
  const [recentEntries, setRecentEntries] = useState<RecentEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<string | null>(null);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/admin/update-embeddings");
      const data = await response.json();

      if (data.statistics) {
        setStats(data.statistics);
        setRecentEntries(data.recentWithoutEmbeddings || []);
      }
    } catch (error) {
      console.error("Error fetching embedding stats:", error);
    } finally {
      setLoading(false);
    }
  };

  const updateEmbeddings = async (force = false, limit = 50) => {
    setUpdating(true);
    try {
      const response = await fetch("/api/admin/update-embeddings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ limit, force }),
      });

      const data = await response.json();

      if (data.success) {
        setLastUpdate(`Updated ${data.updatedCount} embeddings`);
        await fetchStats(); // Refresh stats
      } else {
        setLastUpdate(`Error: ${data.error}`);
      }
    } catch (error) {
      console.error("Error updating embeddings:", error);
      setLastUpdate("Error updating embeddings");
    } finally {
      setUpdating(false);
    }
  };

  const getProgressColor = (percentage: number) => {
    if (percentage >= 90) return "bg-green-500";
    if (percentage >= 70) return "bg-blue-500";
    if (percentage >= 50) return "bg-yellow-500";
    return "bg-red-500";
  };

  const getStatusIcon = (percentage: number) => {
    if (percentage >= 90)
      return <CheckCircle className="h-5 w-5 text-green-500" />;
    if (percentage >= 50)
      return <AlertCircle className="h-5 w-5 text-yellow-500" />;
    return <AlertCircle className="h-5 w-5 text-red-500" />;
  };

  return (
    <div className="space-y-6">
      {/* Statistics Overview */}
      <div className="card">
        <h3 className="text-lg font-semibold mb-4 flex items-center">
          <BarChart3 className="h-5 w-5 mr-2" />
          Vector Embedding Statistics
        </h3>

        {loading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600" />
            <span className="ml-2">Loading statistics...</span>
          </div>
        ) : stats ? (
          <div className="space-y-4">
            {/* Progress Bar */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">
                  Embedding Progress
                </span>
                <div className="flex items-center">
                  {getStatusIcon(stats.completionPercentage)}
                  <span className="ml-1 text-sm font-medium">
                    {stats.completionPercentage}%
                  </span>
                </div>
              </div>

              <div className="w-full bg-gray-200 rounded-full h-3">
                <div
                  className={`h-3 rounded-full transition-all duration-300 ${getProgressColor(
                    stats.completionPercentage
                  )}`}
                  style={{ width: `${stats.completionPercentage}%` }}
                />
              </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-blue-50 p-4 rounded-lg">
                <div className="flex items-center">
                  <Database className="h-8 w-8 text-blue-600" />
                  <div className="ml-3">
                    <p className="text-sm font-medium text-blue-600">
                      Total Entries
                    </p>
                    <p className="text-2xl font-bold text-blue-900">
                      {stats.totalEntries}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-green-50 p-4 rounded-lg">
                <div className="flex items-center">
                  <CheckCircle className="h-8 w-8 text-green-600" />
                  <div className="ml-3">
                    <p className="text-sm font-medium text-green-600">
                      With Embeddings
                    </p>
                    <p className="text-2xl font-bold text-green-900">
                      {stats.entriesWithEmbeddings}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-red-50 p-4 rounded-lg">
                <div className="flex items-center">
                  <AlertCircle className="h-8 w-8 text-red-600" />
                  <div className="ml-3">
                    <p className="text-sm font-medium text-red-600">
                      Missing Embeddings
                    </p>
                    <p className="text-2xl font-bold text-red-900">
                      {stats.entriesWithoutEmbeddings}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <p className="text-gray-500">Failed to load statistics</p>
        )}
      </div>

      {/* Update Actions */}
      <div className="card">
        <h3 className="text-lg font-semibold mb-4 flex items-center">
          <Zap className="h-5 w-5 mr-2" />
          Update Embeddings
        </h3>

        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <button
              onClick={() => updateEmbeddings(false, 50)}
              disabled={updating || stats?.entriesWithoutEmbeddings === 0}
              className="btn-primary flex items-center justify-center"
            >
              {updating ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
              ) : (
                <RefreshCw className="h-4 w-4 mr-2" />
              )}
              Update Missing (Batch 50)
            </button>

            <button
              onClick={() => updateEmbeddings(true, 25)}
              disabled={updating}
              className="btn-secondary flex items-center justify-center"
            >
              {updating ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-600 mr-2" />
              ) : (
                <Zap className="h-4 w-4 mr-2" />
              )}
              Force Update All (Batch 25)
            </button>
          </div>

          {lastUpdate && (
            <div
              className={`p-3 rounded-lg ${
                lastUpdate.includes("Error")
                  ? "bg-red-50 text-red-700 border border-red-200"
                  : "bg-green-50 text-green-700 border border-green-200"
              }`}
            >
              <p className="text-sm">{lastUpdate}</p>
            </div>
          )}
        </div>
      </div>

      {/* Refresh Button */}
      <div className="flex justify-center">
        <button
          onClick={fetchStats}
          disabled={loading}
          className="btn-secondary flex items-center"
        >
          {loading ? (
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-600 mr-2" />
          ) : (
            <RefreshCw className="h-4 w-4 mr-2" />
          )}
          Refresh Statistics
        </button>
      </div>
    </div>
  );
}
