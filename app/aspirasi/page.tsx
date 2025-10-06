import AspirasiForm from "@/components/AspirasiForm";
import AspirasiList from "@/components/AspirasiList";
import AspirasiStats from "@/components/AspirasiStats";
import PortalHeader from "@/components/PortalHeader";
import Footer from "@/components/Footer";
import { MessageSquare } from "lucide-react";

export default function AspirasiPage() {
  return (
    <div className="min-h-screen bg-white">
      <PortalHeader showBackButton={true} currentPage="aspirasi" />
      {/* Main Content */}
      <main className="py-12 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Hero Section */}
          <div className="text-center mb-12">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <MessageSquare className="h-8 w-8 text-blue-600" />
            </div>
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Aspirasi Masyarakat
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Sampaikan aspirasi, saran, kritik, atau keluhan Anda kepada
              Pemerintah Kabupaten Trenggalek. Suara Anda adalah bagian penting
              dalam pembangunan daerah.
            </p>
          </div>

          {/* Stats */}
          <div className="mb-12">
            <AspirasiStats />
          </div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Form Section */}
            <div>
              <AspirasiForm />
            </div>

            {/* Recent Aspirasi Section */}
            <div>
              <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-4">
                  Aspirasi Terbaru
                </h3>
                <p className="text-gray-600 mb-6">
                  Lihat aspirasi terbaru dari masyarakat dan status
                  penanganannya
                </p>
                <AspirasiList />
              </div>
            </div>
          </div>

          {/* Process Info */}
          <div className="mt-16 bg-white rounded-lg shadow-sm border p-8">
            <h2 className="text-2xl font-bold text-gray-900 text-center mb-8">
              Proses Penanganan Aspirasi
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <span className="text-blue-600 font-bold">1</span>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Pengajuan
                </h3>
                <p className="text-gray-600 text-sm">
                  Masyarakat mengajukan aspirasi melalui form online
                </p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <span className="text-yellow-600 font-bold">2</span>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Verifikasi
                </h3>
                <p className="text-gray-600 text-sm">
                  Tim admin melakukan verifikasi dan kategorisasi aspirasi
                </p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <span className="text-purple-600 font-bold">3</span>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Penanganan
                </h3>
                <p className="text-gray-600 text-sm">
                  Aspirasi diteruskan ke instansi terkait untuk ditindaklanjuti
                </p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <span className="text-green-600 font-bold">4</span>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Tanggapan
                </h3>
                <p className="text-gray-600 text-sm">
                  Masyarakat mendapat tanggapan dan update status penanganan
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
