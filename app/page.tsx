import Link from "next/link";
import Footer from "@/components/Footer";
import {
  Calendar,
  MapPin,
  TrendingUp,
  Users,
  MessageSquare,
  ExternalLink,
  ArrowRight,
} from "lucide-react";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-primary-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">ST</span>
              </div>
              <div className="ml-3">
                <h1 className="text-xl font-bold text-gray-900">
                  Sapa Trenggalek
                </h1>
                <p className="text-sm text-gray-500">Portal Informasi Publik</p>
              </div>
            </div>

            <nav className="hidden md:flex space-x-8">
              <a href="#berita" className="text-gray-600 hover:text-gray-900">
                Berita
              </a>
              <a href="#aspirasi" className="text-gray-600 hover:text-gray-900">
                Aspirasi
              </a>
              <a
                href="#statistik"
                className="text-gray-600 hover:text-gray-900"
              >
                Statistik
              </a>
              <Link
                href="/admin/login"
                className="text-primary-600 hover:text-primary-700 font-medium"
              >
                Admin
              </Link>
            </nav>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-gradient-to-r from-primary-600 to-primary-800 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              Sapa Trenggalek
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-primary-100">
              Sistem Aspirasi & Pengaduan Analitik Kabupaten Trenggalek
            </p>
            <p className="text-lg mb-8 max-w-3xl mx-auto text-primary-50">
              Platform digital untuk memantau, menganalisis, dan merespons
              informasi publik serta aspirasi masyarakat secara real-time dengan
              dukungan kecerdasan buatan.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="#berita"
                className="bg-white text-primary-600 px-8 py-3 rounded-lg font-medium hover:bg-gray-50 transition-colors"
              >
                Lihat Berita Terkini
              </a>
              <a
                href="#aspirasi"
                className="border-2 border-white text-white px-8 py-3 rounded-lg font-medium hover:bg-white hover:text-primary-600 transition-colors"
              >
                Sampaikan Aspirasi
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <MessageSquare className="h-8 w-8 text-blue-600" />
              </div>
              <div className="text-3xl font-bold text-gray-900 mb-2">1,234</div>
              <div className="text-gray-600">Total Aspirasi</div>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <TrendingUp className="h-8 w-8 text-green-600" />
              </div>
              <div className="text-3xl font-bold text-gray-900 mb-2">856</div>
              <div className="text-gray-600">Berita Dianalisis</div>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="h-8 w-8 text-yellow-600" />
              </div>
              <div className="text-3xl font-bold text-gray-900 mb-2">92%</div>
              <div className="text-gray-600">Tingkat Respons</div>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <MapPin className="h-8 w-8 text-purple-600" />
              </div>
              <div className="text-3xl font-bold text-gray-900 mb-2">14</div>
              <div className="text-gray-600">Kecamatan</div>
            </div>
          </div>
        </div>
      </section>

      {/* News Section */}
      <section id="berita" className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Berita Terkini
            </h2>
            <p className="text-lg text-gray-600">
              Informasi terbaru seputar Kabupaten Trenggalek
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Sample News Items */}
            {[1, 2, 3, 4, 5, 6].map((item) => (
              <article
                key={item}
                className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
              >
                <div className="h-48 bg-gray-200"></div>
                <div className="p-6">
                  <div className="flex items-center text-sm text-gray-500 mb-2">
                    <Calendar className="h-4 w-4 mr-1" />
                    <span>15 Desember 2025</span>
                    <span className="mx-2">•</span>
                    <span>Berita</span>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
                    Pembangunan Infrastruktur Jalan di Kecamatan Panggul
                    Mencapai 80%
                  </h3>
                  <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                    Proyek pembangunan infrastruktur jalan sepanjang 5 kilometer
                    di Kecamatan Panggul telah mencapai progres 80% dan
                    diperkirakan akan selesai pada akhir tahun ini.
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                      Positif
                    </span>
                    <a
                      href="#"
                      className="text-primary-600 hover:text-primary-700 text-sm font-medium flex items-center"
                    >
                      Baca selengkapnya
                      <ArrowRight className="h-4 w-4 ml-1" />
                    </a>
                  </div>
                </div>
              </article>
            ))}
          </div>

          <div className="text-center mt-12">
            <button className="bg-primary-600 text-white px-8 py-3 rounded-lg font-medium hover:bg-primary-700 transition-colors">
              Lihat Semua Berita
            </button>
          </div>
        </div>
      </section>

      {/* Aspirasi Section */}
      <section id="aspirasi" className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Aspirasi Masyarakat
            </h2>
            <p className="text-lg text-gray-600">
              Suara dan harapan masyarakat Trenggalek
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="space-y-6">
              {[1, 2, 3].map((item) => (
                <div key={item} className="bg-white p-6 rounded-lg shadow-md">
                  <div className="flex items-start space-x-4">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <MessageSquare className="h-5 w-5 text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-gray-900">
                          Warga Kecamatan Dongko
                        </span>
                        <span className="text-xs text-gray-500">
                          2 hari lalu
                        </span>
                      </div>
                      <p className="text-gray-700 mb-3">
                        "Mohon perhatian untuk perbaikan jalan di desa kami yang
                        sudah rusak parah. Terima kasih atas perhatiannya."
                      </p>
                      <div className="flex items-center space-x-2">
                        <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full">
                          Dalam Proses
                        </span>
                        <span className="text-xs text-gray-500">
                          Infrastruktur
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="bg-white p-8 rounded-lg shadow-md">
              <h3 className="text-xl font-semibold text-gray-900 mb-6">
                Sampaikan Aspirasi Anda
              </h3>
              <form className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nama
                  </label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="Nama lengkap"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Kecamatan
                  </label>
                  <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent">
                    <option>Pilih Kecamatan</option>
                    <option>Panggul</option>
                    <option>Dongko</option>
                    <option>Pogalan</option>
                    <option>Trenggalek</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Aspirasi
                  </label>
                  <textarea
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="Sampaikan aspirasi, saran, atau keluhan Anda..."
                  ></textarea>
                </div>
                <button
                  type="submit"
                  className="w-full bg-primary-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-primary-700 transition-colors"
                >
                  Kirim Aspirasi
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
