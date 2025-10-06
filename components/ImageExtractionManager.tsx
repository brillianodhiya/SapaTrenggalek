"use client";

import { useState } from "react";

interface ExtractionResult {
  id: string;
  title: string;
  status: "success" | "error" | "no_image";
  image_url?: string;
  quality?: string;
  error?: string;
}

export default function ImageExtractionManager() {
  const [isExtracting, setIsExtracting] = useState(false);
  const [results, setResults] = useState<ExtractionResult[]>([]);
  const [stats, setStats] = useState<{
    processed: number;
    successful: number;
    total: number;
  } | null>(null);

  const runImageExtraction = async () => {
    setIsExtracting(true);
    setResults([]);
    setStats(null);

    try {
      const response = await fetch("/api/cron/extract-images", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${
            process.env.NEXT_PUBLIC_CRON_SECRET || "dev-secret"
          }`,
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setResults(data.results || []);
      setStats({
        processed: data.processed || 0,
        successful: data.successful || 0,
        total: data.results?.length || 0,
      });
    } catch (error) {
      console.error("Error running image extraction:", error);
      alert("Error running image extraction. Check console for details.");
    } finally {
      setIsExtracting(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "success":
        return "text-green-600";
      case "error":
        return "text-red-600";
      case "no_image":
        return "text-yellow-600";
      default:
        return "text-gray-600";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "success":
        return "✅";
      case "error":
        return "❌";
      case "no_image":
        return "⚠️";
      default:
        return "❓";
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-gray-900">
          Image Extraction Manager
        </h2>
        <button
          onClick={runImageExtraction}
          disabled={isExtracting}
          className={`px-4 py-2 rounded-md font-medium ${
            isExtracting
              ? "bg-gray-300 text-gray-500 cursor-not-allowed"
              : "bg-blue-600 text-white hover:bg-blue-700"
          }`}
        >
          {isExtracting ? "Extracting Images..." : "Run Image Extraction"}
        </button>
      </div>

      {isExtracting && (
        <div className="mb-6">
          <div className="flex items-center space-x-2">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
            <span className="text-sm text-gray-600">
              Extracting images from news articles... This may take a few
              minutes.
            </span>
          </div>
        </div>
      )}

      {stats && (
        <div className="mb-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-blue-50 p-4 rounded-lg">
            <div className="text-2xl font-bold text-blue-600">
              {stats.processed}
            </div>
            <div className="text-sm text-blue-800">Processed</div>
          </div>
          <div className="bg-green-50 p-4 rounded-lg">
            <div className="text-2xl font-bold text-green-600">
              {stats.successful}
            </div>
            <div className="text-sm text-green-800">Successful</div>
          </div>
          <div className="bg-purple-50 p-4 rounded-lg">
            <div className="text-2xl font-bold text-purple-600">
              {stats.processed > 0
                ? Math.round((stats.successful / stats.processed) * 100)
                : 0}
              %
            </div>
            <div className="text-sm text-purple-800">Success Rate</div>
          </div>
        </div>
      )}

      {results.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-gray-900">
            Extraction Results
          </h3>
          <div className="max-h-96 overflow-y-auto space-y-2">
            {results.map((result, index) => (
              <div
                key={result.id || index}
                className="border border-gray-200 rounded-lg p-4"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <span className="text-lg">
                        {getStatusIcon(result.status)}
                      </span>
                      <span
                        className={`font-medium ${getStatusColor(
                          result.status
                        )}`}
                      >
                        {result.status.replace("_", " ").toUpperCase()}
                      </span>
                      {result.quality && (
                        <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                          {result.quality} quality
                        </span>
                      )}
                    </div>
                    <h4 className="font-medium text-gray-900 mb-2">
                      {result.title}
                    </h4>
                    {result.image_url && (
                      <div className="flex items-center space-x-3">
                        <img
                          src={result.image_url}
                          alt="Extracted"
                          className="w-16 h-16 object-cover rounded"
                          onError={(e) => {
                            (e.target as HTMLImageElement).style.display =
                              "none";
                          }}
                        />
                        <a
                          href={result.image_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-800 text-sm truncate"
                        >
                          {result.image_url}
                        </a>
                      </div>
                    )}
                    {result.error && (
                      <div className="text-red-600 text-sm mt-2">
                        Error: {result.error}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="mt-6 p-4 bg-gray-50 rounded-lg">
        <h4 className="font-medium text-gray-900 mb-2">How it works:</h4>
        <ul className="text-sm text-gray-600 space-y-1">
          <li>• Finds news articles without images in the database</li>
          <li>• Scrapes each article's webpage for high-quality images</li>
          <li>
            • Prioritizes Open Graph images, featured images, and article
            content images
          </li>
          <li>
            • Filters out low-quality images, logos, avatars, and placeholders
          </li>
          <li>
            • <strong>Only saves real extracted images</strong> - no placeholder
            images
          </li>
          <li>• Leaves image_url empty if no suitable image is found</li>
          <li>• Processes up to 20 articles at a time to avoid timeouts</li>
        </ul>
      </div>
    </div>
  );
}
