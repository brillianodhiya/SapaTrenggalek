"use client";

import { useState } from "react";
import { Search, AlertTriangle, Copy } from "lucide-react";

interface SearchResult {
  id: string;
  content: string;
  source: string;
  category: string;
  similarity_score: number;
}

interface HoaxResult {
  isPotentialHoax: boolean;
  confidence: number;
  similarContent: any[];
}

export default function VectorSearch() {
  const [query, setQuery] = useState("");
  const [searchType, setSearchType] = useState<
    "similar" | "hoax" | "duplicate"
  >("similar");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [hoaxResults, setHoaxResults] = useState<HoaxResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [threshold, setThreshold] = useState(0.8);

  const handleSearch = async () => {
    if (!query.trim()) return;

    setLoading(true);
    console.log("🔍 Frontend: Starting search...", {
      query: query.trim(),
      type: searchType,
      threshold,
      maxResults: 10,
    });

    try {
      const response = await fetch("/api/search-debug", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          query: query.trim(),
          type: searchType,
          threshold,
          maxResults: 10,
        }),
      });

      console.log("📡 Frontend: Response status:", response.status);
      const data = await response.json();
      console.log("📥 Frontend: Response data:", data);

      if (searchType === "hoax") {
        console.log("🚫 Frontend: Setting hoax results");
        setHoaxResults(data.results);
        setResults([]);
      } else {
        console.log(
          "✅ Frontend: Setting search results, count:",
          data.results?.length || 0
        );
        setResults(data.results || []);
        setHoaxResults(null);
      }
    } catch (error) {
      console.error("Search error:", error);
    } finally {
      setLoading(false);
    }
  };

  const getSimilarityColor = (score: number) => {
    if (score >= 0.9) return "text-green-600 bg-green-50";
    if (score >= 0.8) return "text-blue-600 bg-blue-50";
    if (score >= 0.7) return "text-yellow-600 bg-yellow-50";
    return "text-gray-600 bg-gray-50";
  };

  return (
    <div className="space-y-6">
      {/* Search Form */}
      <div className="card">
        <h3 className="text-lg font-semibold mb-4 flex items-center">
          <Search className="h-5 w-5 mr-2" />
          Vector Similarity Search
        </h3>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Teks untuk dicari
            </label>
            <textarea
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              rows={3}
              placeholder="Masukkan teks berita, laporan, atau konten yang ingin dicari kemiripannya..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Jenis Pencarian
              </label>
              <select
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                value={searchType}
                onChange={(e) => setSearchType(e.target.value as any)}
              >
                <option value="similar">Konten Serupa</option>
                <option value="hoax">Deteksi Hoax</option>
                <option value="duplicate">Duplikasi</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Threshold Similarity
              </label>
              <select
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                value={threshold}
                onChange={(e) => setThreshold(parseFloat(e.target.value))}
              >
                <option value={0.95}>95% - Sangat Mirip</option>
                <option value={0.9}>90% - Mirip</option>
                <option value={0.8}>80% - Cukup Mirip</option>
                <option value={0.7}>70% - Agak Mirip</option>
              </select>
            </div>

            <div className="flex items-end">
              <button
                onClick={handleSearch}
                disabled={loading || !query.trim()}
                className="w-full btn-primary flex items-center justify-center"
              >
                {loading ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                ) : (
                  <Search className="h-4 w-4 mr-2" />
                )}
                Cari
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Results */}
      {results.length > 0 && (
        <div className="card">
          <h4 className="text-lg font-semibold mb-4">
            Hasil Pencarian ({results.length} konten ditemukan)
          </h4>

          <div className="space-y-4">
            {results.map((result, index) => (
              <div
                key={result.id}
                className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50"
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <div className="flex items-center mb-2">
                      <span className="text-sm font-medium text-gray-600 mr-2">
                        #{index + 1}
                      </span>
                      <span className="text-sm bg-blue-100 text-blue-700 px-2 py-1 rounded capitalize">
                        {result.category}
                      </span>
                      <span className="text-sm text-gray-500 ml-2">
                        {result.source}
                      </span>
                    </div>

                    <p className="text-gray-800 mb-2">
                      {result.content.length > 200
                        ? `${result.content.substring(0, 200)}...`
                        : result.content}
                    </p>
                  </div>

                  <div className="ml-4 flex flex-col items-end">
                    <span
                      className={`text-sm font-medium px-2 py-1 rounded ${getSimilarityColor(
                        result.similarity_score
                      )}`}
                    >
                      {Math.round(result.similarity_score * 100)}%
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs text-gray-500">
                  <span>ID: {result.id}</span>
                  <button
                    onClick={() =>
                      navigator.clipboard.writeText(result.content)
                    }
                    className="flex items-center hover:text-gray-700"
                  >
                    <Copy className="h-3 w-3 mr-1" />
                    Copy
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* No Results */}
      {!loading && query && results.length === 0 && !hoaxResults && (
        <div className="card text-center py-8">
          <Search className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500">Tidak ada konten serupa ditemukan</p>
          <p className="text-sm text-gray-400 mt-1">
            Coba kurangi threshold similarity atau gunakan kata kunci yang
            berbeda
          </p>
        </div>
      )}
    </div>
  );
}
