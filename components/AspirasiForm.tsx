"use client";

import { useState } from "react";
import { MessageSquare, Send, CheckCircle, AlertCircle } from "lucide-react";

interface AspirasiFormProps {
  onSuccess?: () => void;
}

export default function AspirasiForm({ onSuccess }: AspirasiFormProps) {
  const [formData, setFormData] = useState({
    name: "",
    kecamatan: "",
    category: "",
    content: "",
    email: "",
    phone: "",
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const kecamatanList = [
    "Bendungan",
    "Dongko",
    "Durenan",
    "Gandusari",
    "Kampak",
    "Karangan",
    "Munjungan",
    "Panggul",
    "Pogalan",
    "Pule",
    "Suruh",
    "Trenggalek",
    "Tugu",
    "Watulimo",
  ];

  const categoryList = [
    "Infrastruktur",
    "Pendidikan",
    "Kesehatan",
    "Ekonomi",
    "Lingkungan",
    "Sosial",
    "Keamanan",
    "Transportasi",
    "Lainnya",
  ];

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || !formData.content) {
      setMessage({ type: "error", text: "Nama dan aspirasi harus diisi" });
      return;
    }

    setLoading(true);
    setMessage(null);

    try {
      const response = await fetch("/api/aspirasi", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (result.success) {
        setMessage({
          type: "success",
          text: "Aspirasi berhasil dikirim! Terima kasih atas partisipasi Anda.",
        });
        setFormData({
          name: "",
          kecamatan: "",
          category: "",
          content: "",
          email: "",
          phone: "",
        });
        onSuccess?.();
      } else {
        setMessage({
          type: "error",
          text: result.error || "Gagal mengirim aspirasi",
        });
      }
    } catch (error) {
      console.error("Error submitting aspirasi:", error);
      setMessage({
        type: "error",
        text: "Terjadi kesalahan. Silakan coba lagi.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white p-8 rounded-lg shadow-md">
      <div className="flex items-center mb-6">
        <MessageSquare className="h-6 w-6 text-primary-600 mr-3" />
        <h3 className="text-xl font-semibold text-gray-900">
          Sampaikan Aspirasi Anda
        </h3>
      </div>

      {message && (
        <div
          className={`mb-6 p-4 rounded-lg flex items-center ${
            message.type === "success"
              ? "bg-green-50 text-green-800 border border-green-200"
              : "bg-red-50 text-red-800 border border-red-200"
          }`}
        >
          {message.type === "success" ? (
            <CheckCircle className="h-5 w-5 mr-2 flex-shrink-0" />
          ) : (
            <AlertCircle className="h-5 w-5 mr-2 flex-shrink-0" />
          )}
          <span>{message.text}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Nama */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nama Lengkap <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              placeholder="Masukkan nama lengkap"
              required
            />
          </div>

          {/* Kecamatan */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Kecamatan
            </label>
            <select
              name="kecamatan"
              value={formData.kecamatan}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              <option value="">Pilih Kecamatan</option>
              {kecamatanList.map((kecamatan) => (
                <option key={kecamatan} value={kecamatan}>
                  {kecamatan}
                </option>
              ))}
            </select>
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              placeholder="email@example.com"
            />
          </div>

          {/* Phone */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nomor Telepon
            </label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              placeholder="08xxxxxxxxxx"
            />
          </div>
        </div>

        {/* Category */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Kategori
          </label>
          <select
            name="category"
            value={formData.category}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          >
            <option value="">Pilih Kategori</option>
            {categoryList.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        </div>

        {/* Content */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Aspirasi <span className="text-red-500">*</span>
          </label>
          <textarea
            name="content"
            value={formData.content}
            onChange={handleChange}
            rows={6}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            placeholder="Sampaikan aspirasi, saran, kritik, atau keluhan Anda di sini..."
            required
          />
          <p className="mt-1 text-sm text-gray-500">
            Jelaskan aspirasi Anda dengan detail agar dapat ditindaklanjuti
            dengan baik.
          </p>
        </div>

        {/* Submit Button */}
        <div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Mengirim...
              </>
            ) : (
              <>
                <Send className="h-4 w-4 mr-2" />
                Kirim Aspirasi
              </>
            )}
          </button>
        </div>

        {/* Privacy Notice */}
        <div className="text-xs text-gray-500 text-center">
          <p>
            Dengan mengirim aspirasi ini, Anda menyetujui bahwa data yang
            diberikan akan digunakan untuk keperluan penanganan aspirasi dan
            komunikasi terkait.
          </p>
        </div>
      </form>
    </div>
  );
}
