import VectorSearch from "@/components/VectorSearch";
import PortalHeader from "@/components/PortalHeader";
import Footer from "@/components/Footer";
import { Search } from "lucide-react";

export default function SearchPage() {
  return (
    <div className="min-h-screen bg-white">
      <PortalHeader showBackButton={true} currentPage="search" />

      {/* Main Content */}
      <main className="py-12 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Hero Section */}
          <div className="text-center mb-12">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Search className="h-8 w-8 text-blue-600" />
            </div>
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Pencarian Berita Cerdas
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Cari berita berdasarkan makna dan konteks menggunakan teknologi
              AI. Temukan informasi yang relevan dengan pencarian semantik yang
              canggih.
            </p>
          </div>

          {/* Search Component */}
          <div className="max-w-4xl mx-auto">
            <VectorSearch />
          </div>

          {/* Features */}
          <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Search className="h-6 w-6 text-green-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Pencarian Semantik
              </h3>
              <p className="text-gray-600">
                Cari berdasarkan makna, bukan hanya kata kunci. AI memahami
                konteks pencarian Anda.
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <div className="w-6 h-6 bg-purple-600 rounded-full"></div>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Hasil Relevan
              </h3>
              <p className="text-gray-600">
                Dapatkan hasil yang paling relevan dengan scoring similarity
                yang akurat.
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <div className="w-6 h-6 bg-yellow-600 rounded"></div>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Database Lengkap
              </h3>
              <p className="text-gray-600">
                Pencarian meliputi seluruh database berita Trenggalek yang telah
                dianalisis.
              </p>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
