"use client";

import { useState } from "react";
import {
  Trash2,
  Database,
  RefreshCw,
  AlertTriangle,
  CheckCircle,
} from "lucide-react";

interface DatabaseStats {
  total_entries: number;
  test_data_entries: number;
  real_data_entries: number;
  sources: Record<string, number>;
  categories: Record<string, number>;
}

export default function DatabaseManager() {
  const [stats, setStats] = useState<DatabaseStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const fetchStats = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/admin/database-stats");
      const data = await response.json();
      if (data.success) {
        setStats(data.database_stats);
      }
    } catch (error) {
      console.error("Error fetching stats:", error);
    } finally {
      setLoading(false);
    }
  };

  const cleanupDatabase = async () => {
    if (
      !confirm("Apakah Anda yakin ingin membersihkan data lama dan test data?")
    ) {
      return;
    }

    setLoading(true);
    setMessage("");
    try {
      const response = await fetch("/api/admin/cleanup-database", {
        method: "POST",
      });
      const data = await response.json();

      if (data.success) {
        setMessage(
          `✅ Cleanup berhasil! ${data.cleanup_summary.total_deleted} entries dihapus`
        );
        fetchStats(); // Refresh stats
      } else {
        setMessage(`❌ Cleanup gagal: ${data.error}`);
      }
    } catch (error) {
      setMessage(
        `❌ Error: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    } finally {
      setLoading(false);
    }
  };

  const resetDatabase = async () => {
    const confirmText = prompt(
      'PERINGATAN: Ini akan menghapus SEMUA data!\nKetik "DELETE ALL" untuk konfirmasi:'
    );
    if (confirmText !== "DELETE ALL") {
      return;
    }

    setLoading(true);
    setMessage("");
    try {
      const response = await fetch("/api/admin/cleanup-database", {
        method: "DELETE",
        headers: {
          "X-Confirm-Reset": "YES_DELETE_ALL",
        },
      });
      const data = await response.json();

      if (data.success) {
        setMessage(
          `🚨 Database reset berhasil! ${data.reset_summary.entries_deleted} entries dihapus`
        );
        fetchStats(); // Refresh stats
      } else {
        setMessage(`❌ Reset gagal: ${data.error}`);
      }
    } catch (error) {
      setMessage(
        `❌ Error: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="card">
        <h3 className="text-lg font-semibold mb-4 flex items-center">
          <Database className="h-5 w-5 mr-2" />
          Database Management
        </h3>

        {/* Stats Section */}
        <div className="mb-6">
          <button
            onClick={fetchStats}
            disabled={loading}
            className="btn-secondary flex items-center mb-4"
          >
            <RefreshCw
              className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`}
            />
            {loading ? "Loading..." : "Refresh Stats"}
          </button>

          {stats && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div className="bg-blue-50 p-4 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">
                  {stats.total_entries}
                </div>
                <div className="text-sm text-blue-600">Total Entries</div>
              </div>
              <div className="bg-green-50 p-4 rounded-lg">
                <div className="text-2xl font-bold text-green-600">
                  {stats.real_data_entries}
                </div>
                <div className="text-sm text-green-600">Real Data</div>
              </div>
              <div className="bg-yellow-50 p-4 rounded-lg">
                <div className="text-2xl font-bold text-yellow-600">
                  {stats.test_data_entries}
                </div>
                <div className="text-sm text-yellow-600">Test Data</div>
              </div>
            </div>
          )}

          {stats && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h4 className="font-medium mb-2">Sources:</h4>
                <div className="space-y-1">
                  {Object.entries(stats.sources).map(([source, count]) => (
                    <div key={source} className="flex justify-between text-sm">
                      <span>{source}</span>
                      <span className="font-medium">{count}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <h4 className="font-medium mb-2">Categories:</h4>
                <div className="space-y-1">
                  {Object.entries(stats.categories).map(([category, count]) => (
                    <div
                      key={category}
                      className="flex justify-between text-sm"
                    >
                      <span className="capitalize">{category}</span>
                      <span className="font-medium">{count}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Actions Section */}
        <div className="border-t pt-4">
          <h4 className="font-medium mb-4">Database Actions</h4>

          <div className="space-y-3">
            <button
              onClick={cleanupDatabase}
              disabled={loading}
              className="w-full flex items-center justify-center px-4 py-2 bg-yellow-600 hover:bg-yellow-700 text-white rounded-lg transition-colors disabled:opacity-50"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              {loading ? "Processing..." : "Cleanup Old & Test Data"}
            </button>

            <button
              onClick={resetDatabase}
              disabled={loading}
              className="w-full flex items-center justify-center px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors disabled:opacity-50"
            >
              <AlertTriangle className="h-4 w-4 mr-2" />
              {loading ? "Processing..." : "RESET ALL DATA (Dangerous!)"}
            </button>
          </div>

          {message && (
            <div
              className={`mt-4 p-3 rounded-lg ${
                message.startsWith("✅")
                  ? "bg-green-50 text-green-700"
                  : "bg-red-50 text-red-700"
              }`}
            >
              {message}
            </div>
          )}
        </div>

        {/* Warning */}
        <div className="mt-4 p-3 bg-gray-50 rounded-lg">
          <div className="flex items-start">
            <AlertTriangle className="h-4 w-4 text-yellow-600 mr-2 mt-0.5" />
            <div className="text-sm text-gray-600">
              <strong>Peringatan:</strong> Cleanup akan menghapus data lama
              (&gt;1 jam) dan test data. Reset akan menghapus SEMUA data.
              Gunakan dengan hati-hati!
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
