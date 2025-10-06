import Link from "next/link";
import Footer from "@/components/Footer";
import NewsPortal from "@/components/NewsPortal";
import PortalStats from "@/components/PortalStats";
import { MessageSquare, Shield, Search } from "lucide-react";

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
              <Link
                href="/search"
                className="text-gray-600 hover:text-gray-900"
              >
                Cari Berita
              </Link>
              <Link
                href="/aspirasi"
                className="text-gray-600 hover:text-gray-900"
              >
                Aspirasi
              </Link>
              <Link
                href="/hoax-checker"
                className="text-gray-600 hover:text-gray-900"
              >
                Cek Hoax
              </Link>
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
              <Link
                href="/aspirasi"
                className="border-2 border-white text-white px-8 py-3 rounded-lg font-medium hover:bg-white hover:text-primary-600 transition-colors"
              >
                Sampaikan Aspirasi
              </Link>
              <Link
                href="/hoax-checker"
                className="border-2 border-white text-white px-8 py-3 rounded-lg font-medium hover:bg-white hover:text-primary-600 transition-colors flex items-center"
              >
                <Shield className="h-4 w-4 mr-2" />
                Cek Hoax
              </Link>
              <Link
                href="/search"
                className="border-2 border-white text-white px-8 py-3 rounded-lg font-medium hover:bg-white hover:text-primary-600 transition-colors flex items-center"
              >
                <Search className="h-4 w-4 mr-2" />
                Cari Berita
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <PortalStats />
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
              Informasi terbaru seputar Kabupaten Trenggalek dengan analisis AI
            </p>
          </div>

          <NewsPortal />
        </div>
      </section>

      {/* Quick Links Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Layanan Kami
            </h2>
            <p className="text-lg text-gray-600">
              Akses berbagai layanan digital Kabupaten Trenggalek
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Link href="/search" className="group">
              <div className="bg-white p-8 rounded-lg shadow-md hover:shadow-lg transition-shadow">
                <div className="w-16 h-16 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-6 group-hover:bg-blue-200 transition-colors">
                  <Search className="h-8 w-8 text-blue-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4 text-center">
                  Pencarian Berita Cerdas
                </h3>
                <p className="text-gray-600 text-center">
                  Cari berita berdasarkan makna dan konteks menggunakan
                  teknologi AI
                </p>
              </div>
            </Link>

            <Link href="/aspirasi" className="group">
              <div className="bg-white p-8 rounded-lg shadow-md hover:shadow-lg transition-shadow">
                <div className="w-16 h-16 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-6 group-hover:bg-green-200 transition-colors">
                  <MessageSquare className="h-8 w-8 text-green-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4 text-center">
                  Aspirasi Masyarakat
                </h3>
                <p className="text-gray-600 text-center">
                  Sampaikan aspirasi, saran, dan keluhan kepada Pemerintah
                  Kabupaten
                </p>
              </div>
            </Link>

            <Link href="/hoax-checker" className="group">
              <div className="bg-white p-8 rounded-lg shadow-md hover:shadow-lg transition-shadow">
                <div className="w-16 h-16 bg-red-100 rounded-lg flex items-center justify-center mx-auto mb-6 group-hover:bg-red-200 transition-colors">
                  <Shield className="h-8 w-8 text-red-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4 text-center">
                  Cek Hoax & Misinformasi
                </h3>
                <p className="text-gray-600 text-center">
                  Verifikasi kredibilitas berita dan informasi dengan teknologi
                  AI
                </p>
              </div>
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
