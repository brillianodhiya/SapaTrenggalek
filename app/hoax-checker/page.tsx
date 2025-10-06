import HoaxChecker from "@/components/HoaxChecker";
import PortalHeader from "@/components/PortalHeader";
import Footer from "@/components/Footer";
import { Shield, AlertTriangle, CheckCircle, Info } from "lucide-react";

export default function HoaxCheckerPage() {
  return (
    <div className="min-h-screen bg-white">
      <PortalHeader showBackButton={true} currentPage="hoax-checker" />
      {/* Main Content */}
      <main className="py-12 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Hero Section */}
          <div className="text-center mb-12">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Shield className="h-8 w-8 text-red-600" />
            </div>
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Cek Hoax & Misinformasi
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Verifikasi kredibilitas berita dan informasi dengan teknologi AI.
              Lindungi diri dari hoax dan misinformasi yang beredar di media
              sosial.
            </p>
          </div>

          {/* Checker Component */}
          <div className="max-w-4xl mx-auto mb-16">
            <HoaxChecker />
          </div>

          {/* How It Works */}
          <div className="max-w-6xl mx-auto">
            <h2 className="text-2xl font-bold text-gray-900 text-center mb-8">
              Bagaimana Cara Kerjanya?
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <span className="text-blue-600 font-bold">1</span>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Input URL/Teks
                </h3>
                <p className="text-gray-600 text-sm">
                  Masukkan URL berita atau copy-paste teks yang ingin
                  diverifikasi
                </p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <span className="text-purple-600 font-bold">2</span>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Analisis AI
                </h3>
                <p className="text-gray-600 text-sm">
                  AI menganalisis konten untuk mendeteksi indikator hoax dan
                  misinformasi
                </p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <span className="text-green-600 font-bold">3</span>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Scoring
                </h3>
                <p className="text-gray-600 text-sm">
                  Dapatkan skor kredibilitas dan probabilitas hoax dengan
                  tingkat keyakinan
                </p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <span className="text-yellow-600 font-bold">4</span>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Rekomendasi
                </h3>
                <p className="text-gray-600 text-sm">
                  Terima rekomendasi dan saran untuk verifikasi lebih lanjut
                </p>
              </div>
            </div>
          </div>

          {/* Verdict Types */}
          <div className="max-w-4xl mx-auto mt-16">
            <h2 className="text-2xl font-bold text-gray-900 text-center mb-8">
              Jenis Penilaian
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white p-6 rounded-lg border border-green-200">
                <div className="flex items-center mb-4">
                  <CheckCircle className="h-6 w-6 text-green-600 mr-3" />
                  <h3 className="text-lg font-semibold text-green-800">
                    Dapat Dipercaya
                  </h3>
                </div>
                <p className="text-gray-600">
                  Informasi memiliki kredibilitas tinggi dengan sumber yang
                  jelas dan dapat diverifikasi.
                </p>
              </div>
              <div className="bg-white p-6 rounded-lg border border-yellow-200">
                <div className="flex items-center mb-4">
                  <Info className="h-6 w-6 text-yellow-600 mr-3" />
                  <h3 className="text-lg font-semibold text-yellow-800">
                    Perlu Verifikasi
                  </h3>
                </div>
                <p className="text-gray-600">
                  Informasi memerlukan verifikasi lebih lanjut dari sumber
                  terpercaya.
                </p>
              </div>
              <div className="bg-white p-6 rounded-lg border border-orange-200">
                <div className="flex items-center mb-4">
                  <AlertTriangle className="h-6 w-6 text-orange-600 mr-3" />
                  <h3 className="text-lg font-semibold text-orange-800">
                    Menyesatkan
                  </h3>
                </div>
                <p className="text-gray-600">
                  Informasi mengandung elemen yang dapat menyesatkan atau tidak
                  akurat.
                </p>
              </div>
              <div className="bg-white p-6 rounded-lg border border-red-200">
                <div className="flex items-center mb-4">
                  <AlertTriangle className="h-6 w-6 text-red-600 mr-3" />
                  <h3 className="text-lg font-semibold text-red-800">
                    Kemungkinan Hoax
                  </h3>
                </div>
                <p className="text-gray-600">
                  Informasi memiliki indikator kuat sebagai hoax atau
                  misinformasi.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
