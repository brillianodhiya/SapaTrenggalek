"use client";

import { useState } from "react";
import {
  Shield,
  AlertTriangle,
  CheckCircle,
  ExternalLink,
  Search,
  Info,
  TrendingUp,
  Clock,
} from "lucide-react";

interface HoaxAnalysis {
  hoax_probability: number;
  credibility_score: number;
  analysis: {
    red_flags: string[];
    positive_indicators: string[];
    fact_check_suggestions: string[];
    source_reliability: string;
  };
  verdict: "HOAX" | "MISLEADING" | "QUESTIONABLE" | "CREDIBLE";
  confidence: number;
  recommendations: string[];
  summary: string;
}

interface HoaxCheckResult {
  success: boolean;
  url?: string;
  analysis: HoaxAnalysis;
  analyzed_at: string;
}

export default function HoaxChecker() {
  const [url, setUrl] = useState("");
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<HoaxCheckResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"url" | "content">("url");

  const handleCheck = async () => {
    if (!url && !content) {
      setError("Silakan masukkan URL atau konten yang ingin diperiksa");
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch("/api/check-hoax", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ url, content }),
      });

      const data = await response.json();

      if (data.success) {
        setResult(data);
      } else {
        setError(data.error || "Gagal menganalisis konten");
      }
    } catch (err) {
      console.error("Error checking hoax:", err);
      setError("Terjadi kesalahan saat menganalisis. Silakan coba lagi.");
    } finally {
      setLoading(false);
    }
  };

  const getVerdictColor = (verdict: string) => {
    switch (verdict) {
      case "HOAX":
        return "text-red-600 bg-red-50 border-red-200";
      case "MISLEADING":
        return "text-orange-600 bg-orange-50 border-orange-200";
      case "QUESTIONABLE":
        return "text-yellow-600 bg-yellow-50 border-yellow-200";
      case "CREDIBLE":
        return "text-green-600 bg-green-50 border-green-200";
      default:
        return "text-gray-600 bg-gray-50 border-gray-200";
    }
  };

  const getVerdictIcon = (verdict: string) => {
    switch (verdict) {
      case "HOAX":
        return <AlertTriangle className="h-5 w-5" />;
      case "MISLEADING":
        return <AlertTriangle className="h-5 w-5" />;
      case "QUESTIONABLE":
        return <Info className="h-5 w-5" />;
      case "CREDIBLE":
        return <CheckCircle className="h-5 w-5" />;
      default:
        return <Shield className="h-5 w-5" />;
    }
  };

  const getVerdictText = (verdict: string) => {
    switch (verdict) {
      case "HOAX":
        return "Kemungkinan Hoax";
      case "MISLEADING":
        return "Menyesatkan";
      case "QUESTIONABLE":
        return "Perlu Verifikasi";
      case "CREDIBLE":
        return "Dapat Dipercaya";
      default:
        return "Tidak Diketahui";
    }
  };

  return (
    <div className="bg-white p-8 rounded-lg shadow-md">
      <div className="flex items-center mb-6">
        <Shield className="h-6 w-6 text-primary-600 mr-3" />
        <h3 className="text-xl font-semibold text-gray-900">
          Cek Hoax & Misinformasi
        </h3>
      </div>

      <p className="text-gray-600 mb-6">
        Periksa kredibilitas berita atau informasi dari URL website atau konten
        teks menggunakan analisis AI untuk mendeteksi potensi hoax dan
        misinformasi.
      </p>

      {/* Tab Navigation */}
      <div className="flex border-b border-gray-200 mb-6">
        <button
          onClick={() => setActiveTab("url")}
          className={`px-4 py-2 font-medium text-sm border-b-2 transition-colors ${
            activeTab === "url"
              ? "border-primary-600 text-primary-600"
              : "border-transparent text-gray-500 hover:text-gray-700"
          }`}
        >
          Cek dari URL
        </button>
        <button
          onClick={() => setActiveTab("content")}
          className={`px-4 py-2 font-medium text-sm border-b-2 transition-colors ${
            activeTab === "content"
              ? "border-primary-600 text-primary-600"
              : "border-transparent text-gray-500 hover:text-gray-700"
          }`}
        >
          Cek dari Teks
        </button>
      </div>

      {/* Input Form */}
      <div className="space-y-4 mb-6">
        {activeTab === "url" ? (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              URL Website atau Media Sosial
            </label>
            <div className="relative">
              <ExternalLink className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="https://example.com/berita-atau-postingan"
              />
            </div>
            <p className="mt-1 text-sm text-gray-500">
              Masukkan URL dari website berita, Facebook, Twitter, Instagram,
              atau platform lainnya
            </p>
          </div>
        ) : (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Konten Teks
            </label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={6}
              className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              placeholder="Paste konten berita, postingan, atau informasi yang ingin diperiksa..."
            />
            <p className="mt-1 text-sm text-gray-500">
              Copy-paste teks berita atau informasi yang ingin Anda verifikasi
            </p>
          </div>
        )}

        <button
          onClick={handleCheck}
          disabled={loading || (!url && !content)}
          className="w-full bg-primary-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
        >
          {loading ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              Menganalisis...
            </>
          ) : (
            <>
              <Search className="h-4 w-4 mr-2" />
              Periksa Sekarang
            </>
          )}
        </button>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center text-red-800">
          <AlertTriangle className="h-5 w-5 mr-2 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Results */}
      {result && (
        <div className="space-y-6">
          {/* Header */}
          <div className="border-t border-gray-200 pt-6">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-lg font-semibold text-gray-900">
                Hasil Analisis
              </h4>
              <div className="flex items-center text-sm text-gray-500">
                <Clock className="h-4 w-4 mr-1" />
                <span>
                  {new Date(result.analyzed_at).toLocaleString("id-ID")}
                </span>
              </div>
            </div>

            {result.url && (
              <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600 mb-1">
                  URL yang dianalisis:
                </p>
                <a
                  href={result.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary-600 hover:text-primary-700 text-sm break-all"
                >
                  {result.url}
                </a>
              </div>
            )}
          </div>

          {/* Verdict */}
          <div
            className={`p-4 rounded-lg border ${getVerdictColor(
              result.analysis.verdict
            )}`}
          >
            <div className="flex items-center mb-2">
              {getVerdictIcon(result.analysis.verdict)}
              <span className="ml-2 font-semibold text-lg">
                {getVerdictText(result.analysis.verdict)}
              </span>
            </div>
            <p className="text-sm opacity-90">{result.analysis.summary}</p>
          </div>

          {/* Scores */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-gray-50 p-4 rounded-lg text-center">
              <div className="text-2xl font-bold text-red-600 mb-1">
                {result.analysis.hoax_probability}%
              </div>
              <div className="text-sm text-gray-600">Probabilitas Hoax</div>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg text-center">
              <div className="text-2xl font-bold text-green-600 mb-1">
                {result.analysis.credibility_score}%
              </div>
              <div className="text-sm text-gray-600">Skor Kredibilitas</div>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg text-center">
              <div className="text-2xl font-bold text-blue-600 mb-1">
                {result.analysis.confidence}%
              </div>
              <div className="text-sm text-gray-600">Tingkat Keyakinan</div>
            </div>
          </div>

          {/* Analysis Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Red Flags */}
            {result.analysis.analysis.red_flags.length > 0 && (
              <div className="bg-red-50 p-4 rounded-lg border border-red-200">
                <h5 className="font-semibold text-red-800 mb-3 flex items-center">
                  <AlertTriangle className="h-4 w-4 mr-2" />
                  Indikator Bermasalah
                </h5>
                <ul className="space-y-1">
                  {result.analysis.analysis.red_flags.map((flag, index) => (
                    <li
                      key={index}
                      className="text-sm text-red-700 flex items-start"
                    >
                      <span className="text-red-500 mr-2">•</span>
                      <span>{flag}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Positive Indicators */}
            {result.analysis.analysis.positive_indicators.length > 0 && (
              <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                <h5 className="font-semibold text-green-800 mb-3 flex items-center">
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Indikator Positif
                </h5>
                <ul className="space-y-1">
                  {result.analysis.analysis.positive_indicators.map(
                    (indicator, index) => (
                      <li
                        key={index}
                        className="text-sm text-green-700 flex items-start"
                      >
                        <span className="text-green-500 mr-2">•</span>
                        <span>{indicator}</span>
                      </li>
                    )
                  )}
                </ul>
              </div>
            )}
          </div>

          {/* Recommendations */}
          {result.analysis.recommendations.length > 0 && (
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
              <h5 className="font-semibold text-blue-800 mb-3 flex items-center">
                <Info className="h-4 w-4 mr-2" />
                Rekomendasi
              </h5>
              <ul className="space-y-1">
                {result.analysis.recommendations.map((rec, index) => (
                  <li
                    key={index}
                    className="text-sm text-blue-700 flex items-start"
                  >
                    <span className="text-blue-500 mr-2">•</span>
                    <span>{rec}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Fact Check Suggestions */}
          {result.analysis.analysis.fact_check_suggestions.length > 0 && (
            <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
              <h5 className="font-semibold text-yellow-800 mb-3 flex items-center">
                <TrendingUp className="h-4 w-4 mr-2" />
                Saran Verifikasi Fakta
              </h5>
              <ul className="space-y-1">
                {result.analysis.analysis.fact_check_suggestions.map(
                  (suggestion, index) => (
                    <li
                      key={index}
                      className="text-sm text-yellow-700 flex items-start"
                    >
                      <span className="text-yellow-500 mr-2">•</span>
                      <span>{suggestion}</span>
                    </li>
                  )
                )}
              </ul>
            </div>
          )}

          {/* Source Reliability */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h5 className="font-semibold text-gray-800 mb-2">
              Penilaian Sumber
            </h5>
            <p className="text-sm text-gray-700">
              {result.analysis.analysis.source_reliability}
            </p>
          </div>
        </div>
      )}

      {/* Disclaimer */}
      <div className="mt-8 p-4 bg-gray-50 rounded-lg border border-gray-200">
        <p className="text-xs text-gray-600">
          <strong>Disclaimer:</strong> Hasil analisis ini menggunakan AI dan
          bersifat indikatif. Selalu verifikasi informasi dari multiple sumber
          terpercaya sebelum menyebarkan atau mengambil keputusan berdasarkan
          informasi tersebut.
        </p>
      </div>
    </div>
  );
}
