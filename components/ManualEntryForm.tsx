"use client";

import { useState } from "react";
import { Plus, AlertTriangle, CheckCircle, X } from "lucide-react";

interface DuplicateInfo {
  id: string;
  created_at: string;
  content_preview: string;
}

export default function ManualEntryForm({
  onEntryAdded,
}: {
  onEntryAdded?: () => void;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [duplicate, setDuplicate] = useState<DuplicateInfo | null>(null);
  const [success, setSuccess] = useState(false);

  const [formData, setFormData] = useState({
    content: "",
    source: "",
    author: "",
    category: "lainnya",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setDuplicate(null);
    setSuccess(false);

    try {
      const response = await fetch("/api/entries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.status === 409) {
        // Duplicate detected
        setDuplicate(data.duplicate);
      } else if (response.ok) {
        // Success
        setSuccess(true);
        setFormData({
          content: "",
          source: "",
          author: "",
          category: "lainnya",
        });

        if (onEntryAdded) {
          onEntryAdded();
        }

        // Auto close after success
        setTimeout(() => {
          setIsOpen(false);
          setSuccess(false);
        }, 2000);
      } else {
        console.error("Error creating entry:", data.error);
      }
    } catch (error) {
      console.error("Submit error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    // Clear duplicate warning when content changes
    if (name === "content" && duplicate) {
      setDuplicate(null);
    }
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="btn-primary flex items-center"
      >
        <Plus className="h-4 w-4 mr-2" />
        Tambah Entry Manual
      </button>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold">Tambah Entry Manual</h3>
            <button
              onClick={() => setIsOpen(false)}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          {/* Success Message */}
          {success && (
            <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center">
              <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
              <span className="text-green-700">
                Entry berhasil ditambahkan!
              </span>
            </div>
          )}

          {/* Duplicate Warning */}
          {duplicate && (
            <div className="mb-4 p-4 bg-orange-50 border border-orange-200 rounded-lg">
              <div className="flex items-center mb-2">
                <AlertTriangle className="h-5 w-5 text-orange-600 mr-2" />
                <span className="font-medium text-orange-700">
                  Konten Duplikat Terdeteksi
                </span>
              </div>
              <p className="text-sm text-orange-600 mb-2">
                Konten serupa sudah ada di database:
              </p>
              <div className="bg-white p-3 rounded border text-sm">
                <p className="text-gray-600 mb-1">
                  <strong>ID:</strong> {duplicate.id}
                </p>
                <p className="text-gray-600 mb-1">
                  <strong>Dibuat:</strong>{" "}
                  {new Date(duplicate.created_at).toLocaleString("id-ID")}
                </p>
                <p className="text-gray-600">
                  <strong>Preview:</strong> {duplicate.content_preview}
                </p>
              </div>
              <p className="text-xs text-orange-500 mt-2">
                Silakan edit konten atau batalkan jika ini memang duplikat.
              </p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Konten *
              </label>
              <textarea
                name="content"
                value={formData.content}
                onChange={handleInputChange}
                required
                rows={4}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="Masukkan konten laporan, aspirasi, atau berita..."
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Sumber *
                </label>
                <input
                  type="text"
                  name="source"
                  value={formData.source}
                  onChange={handleInputChange}
                  required
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="WhatsApp, Facebook, Email, dll."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Penulis/Pelapor
                </label>
                <input
                  type="text"
                  name="author"
                  value={formData.author}
                  onChange={handleInputChange}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="Nama penulis atau pelapor"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Kategori
              </label>
              <select
                name="category"
                value={formData.category}
                onChange={handleInputChange}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                <option value="laporan">Laporan</option>
                <option value="aspirasi">Aspirasi</option>
                <option value="berita">Berita</option>
                <option value="pengaduan">Pengaduan</option>
                <option value="lainnya">Lainnya</option>
              </select>
            </div>

            <div className="flex items-center justify-end space-x-3 pt-4">
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={
                  loading || !formData.content.trim() || !formData.source.trim()
                }
                className="btn-primary flex items-center"
              >
                {loading ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                ) : (
                  <Plus className="h-4 w-4 mr-2" />
                )}
                {loading ? "Menyimpan..." : "Simpan Entry"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
