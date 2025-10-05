"use client";

import { useState } from "react";
import { Trash2, Search, AlertTriangle, CheckCircle } from "lucide-react";

interface DuplicateItem {
  originalId: string;
  duplicateId: string;
  similarity: number;
  originalPreview: string;
  duplicatePreview: string;
}

interface DeduplicationResult {
  success: boolean;
  totalEntries: number;
  duplicatesFound: number;
  duplicates: DuplicateItem[];
  dryRun: boolean;
  deletedCount: number;
}

export default function DeduplicationManager() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<DeduplicationResult | null>(null);
  const [threshold, setThreshold] = useState(0.9);
  const [dryRun, setDryRun] = useState(true);
  const [hashUpdateResult, setHashUpdateResult] = useState<any>(null);

  const handleDeduplication = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/admin/deduplicate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ threshold, dryRun }),
      });

      const data = await response.json();
      setResult(data);
    } catch (error) {
      console.error("Deduplication error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateHashes = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/admin/update-hashes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });

      const data = await response.json();
      setHashUpdateResult(data);
    } catch (error) {
      console.error("Hash update error:", error);
    } finally {
      setLoading(false);
    }
  };

  const getSimilarityColor = (similarity: number) => {
    if (similarity >= 0.95) return "text-red-600 bg-red-50";
    if (similarity >= 0.9) return "text-orange-600 bg-orange-50";
    return "text-yellow-600 bg-yellow-50";
  };

  return (
    <div className="space-y-6">
      {/* Control Panel */}
      <div className="card">
        <h3 className="text-lg font-semibold mb-4 flex items-center">
          <Trash2 className="h-5 w-5 mr-2" />
          Deduplication Manager
        </h3>

        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Similarity Threshold
              </label>
              <select
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                value={threshold}
                onChange={(e) => setThreshold(parseFloat(e.target.value))}
              >
                <option value={0.95}>95% - Very Similar</option>
                <option value={0.9}>90% - Similar</option>
                <option value={0.85}>85% - Somewhat Similar</option>
                <option value={0.8}>80% - Moderately Similar</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Mode
              </label>
              <select
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                value={dryRun ? "dry" : "delete"}
                onChange={(e) => setDryRun(e.target.value === "dry")}
              >
                <option value="dry">Dry Run (Preview Only)</option>
                <option value="delete">Delete Duplicates</option>
              </select>
            </div>

            <div className="flex items-end">
              <button
                onClick={handleDeduplication}
                disabled={loading}
                className="w-full btn-primary flex items-center justify-center"
              >
                {loading ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                ) : (
                  <Search className="h-4 w-4 mr-2" />
                )}
                {dryRun ? "Analyze Duplicates" : "Remove Duplicates"}
              </button>
            </div>
          </div>

          {dryRun && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <div className="flex items-center">
                <AlertTriangle className="h-4 w-4 text-blue-600 mr-2" />
                <span className="text-sm text-blue-700">
                  Dry run mode: No data will be deleted. Switch to "Delete
                  Duplicates" mode to actually remove duplicates.
                </span>
              </div>
            </div>
          )}

          <div className="mt-4 pt-4 border-t border-gray-200">
            <h4 className="text-sm font-medium text-gray-700 mb-2">
              Content Hash Management
            </h4>
            <p className="text-xs text-gray-500 mb-3">
              Update content hashes for existing entries to improve future
              deduplication.
            </p>
            <button
              onClick={handleUpdateHashes}
              disabled={loading}
              className="btn-secondary text-sm"
            >
              {loading ? "Updating..." : "Update Content Hashes"}
            </button>
          </div>
        </div>
      </div>

      {/* Results */}
      {result && (
        <div className="card">
          <h4 className="text-lg font-semibold mb-4 flex items-center">
            {result.success ? (
              <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
            ) : (
              <AlertTriangle className="h-5 w-5 text-red-600 mr-2" />
            )}
            Deduplication Results
          </h4>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">
                {result.totalEntries}
              </div>
              <div className="text-sm text-blue-700">Total Entries</div>
            </div>

            <div className="bg-orange-50 p-4 rounded-lg">
              <div className="text-2xl font-bold text-orange-600">
                {result.duplicatesFound}
              </div>
              <div className="text-sm text-orange-700">Duplicates Found</div>
            </div>

            <div className="bg-red-50 p-4 rounded-lg">
              <div className="text-2xl font-bold text-red-600">
                {result.deletedCount}
              </div>
              <div className="text-sm text-red-700">Deleted</div>
            </div>

            <div className="bg-green-50 p-4 rounded-lg">
              <div className="text-2xl font-bold text-green-600">
                {result.totalEntries - result.duplicatesFound}
              </div>
              <div className="text-sm text-green-700">Unique Entries</div>
            </div>
          </div>

          {result.duplicates && result.duplicates.length > 0 && (
            <div className="space-y-4">
              <h5 className="font-medium text-gray-900">
                Duplicate Pairs Found:
              </h5>

              {result.duplicates.map((duplicate, index) => (
                <div
                  key={`${duplicate.originalId}-${duplicate.duplicateId}`}
                  className="border border-gray-200 rounded-lg p-4"
                >
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm font-medium text-gray-600">
                      Duplicate Pair #{index + 1}
                    </span>
                    <span
                      className={`text-sm font-medium px-2 py-1 rounded ${getSimilarityColor(
                        duplicate.similarity
                      )}`}
                    >
                      {Math.round(duplicate.similarity * 100)}% similar
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-green-50 p-3 rounded border-l-4 border-green-400">
                      <div className="text-xs text-green-600 font-medium mb-1">
                        ORIGINAL (Kept) - ID: {duplicate.originalId}
                      </div>
                      <p className="text-sm text-gray-800">
                        {duplicate.originalPreview}...
                      </p>
                    </div>

                    <div className="bg-red-50 p-3 rounded border-l-4 border-red-400">
                      <div className="text-xs text-red-600 font-medium mb-1">
                        DUPLICATE{" "}
                        {result.dryRun ? "(Would be deleted)" : "(Deleted)"} -
                        ID: {duplicate.duplicateId}
                      </div>
                      <p className="text-sm text-gray-800">
                        {duplicate.duplicatePreview}...
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {result.duplicatesFound === 0 && (
            <div className="text-center py-8">
              <CheckCircle className="h-12 w-12 text-green-400 mx-auto mb-4" />
              <p className="text-gray-500">No duplicates found!</p>
              <p className="text-sm text-gray-400 mt-1">
                Your database is clean at the current similarity threshold.
              </p>
            </div>
          )}
        </div>
      )}

      {/* Hash Update Results */}
      {hashUpdateResult && (
        <div className="card">
          <h4 className="text-lg font-semibold mb-4">
            Content Hash Update Results
          </h4>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">
                {hashUpdateResult.processed}
              </div>
              <div className="text-sm text-blue-700">Processed</div>
            </div>

            <div className="bg-green-50 p-4 rounded-lg">
              <div className="text-2xl font-bold text-green-600">
                {hashUpdateResult.updated}
              </div>
              <div className="text-sm text-green-700">Updated</div>
            </div>

            <div className="bg-red-50 p-4 rounded-lg">
              <div className="text-2xl font-bold text-red-600">
                {hashUpdateResult.errors}
              </div>
              <div className="text-sm text-red-700">Errors</div>
            </div>
          </div>

          {hashUpdateResult.errorDetails &&
            hashUpdateResult.errorDetails.length > 0 && (
              <div className="bg-red-50 p-3 rounded-lg">
                <h5 className="text-sm font-medium text-red-800 mb-2">
                  Error Details:
                </h5>
                <ul className="text-xs text-red-700 space-y-1">
                  {hashUpdateResult.errorDetails.map(
                    (error: any, index: number) => (
                      <li key={index}>
                        ID: {error.id} - {error.error}
                      </li>
                    )
                  )}
                </ul>
              </div>
            )}
        </div>
      )}
    </div>
  );
}
