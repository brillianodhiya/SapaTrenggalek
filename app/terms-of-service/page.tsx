import { Metadata } from "next";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title: "Ketentuan Layanan - Sapa Trenggalek",
  description:
    "Ketentuan Layanan untuk aplikasi Sapa Trenggalek - Sistem Aspirasi & Pengaduan Analitik Pemerintah Kabupaten Trenggalek",
};

export default function TermsOfServicePage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white shadow-lg rounded-lg p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">
            Ketentuan Layanan
          </h1>

          <div className="prose prose-lg max-w-none">
            <p className="text-gray-600 mb-6">
              <strong>Terakhir diperbarui:</strong>{" "}
              {new Date().toLocaleDateString("id-ID")}
            </p>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">
                1. Penerimaan Ketentuan
              </h2>
              <p className="text-gray-700 mb-4">
                Dengan mengakses dan menggunakan layanan Sapa Trenggalek, Anda
                menyetujui untuk terikat oleh ketentuan layanan ini. Jika Anda
                tidak setuju dengan ketentuan ini, mohon untuk tidak menggunakan
                layanan kami.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">
                2. Deskripsi Layanan
              </h2>
              <p className="text-gray-700 mb-4">
                Sapa Trenggalek adalah platform digital yang dikembangkan oleh
                Pemerintah Kabupaten Trenggalek untuk:
              </p>
              <ul className="list-disc pl-6 text-gray-700 space-y-2">
                <li>Mengumpulkan dan menganalisis aspirasi masyarakat</li>
                <li>Memantau pengaduan dan keluhan publik</li>
                <li>Mengidentifikasi dan melawan misinformasi</li>
                <li>Mendukung pengambilan keputusan berbasis data</li>
                <li>Meningkatkan transparansi pemerintahan</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">
                3. Penggunaan yang Diizinkan
              </h2>
              <p className="text-gray-700 mb-4">
                Anda diizinkan untuk menggunakan layanan ini untuk:
              </p>
              <ul className="list-disc pl-6 text-gray-700 space-y-2">
                <li>Menyampaikan aspirasi dan pengaduan yang konstruktif</li>
                <li>Mengakses informasi publik yang tersedia</li>
                <li>Berpartisipasi dalam dialog publik yang sehat</li>
                <li>Memberikan masukan untuk perbaikan layanan</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">
                4. Penggunaan yang Dilarang
              </h2>
              <p className="text-gray-700 mb-4">Anda dilarang untuk:</p>
              <ul className="list-disc pl-6 text-gray-700 space-y-2">
                <li>Menyebarkan informasi palsu atau menyesatkan</li>
                <li>
                  Menggunakan bahasa yang kasar, ofensif, atau diskriminatif
                </li>
                <li>Melakukan spam atau flooding</li>
                <li>Mencoba mengakses sistem tanpa otorisasi</li>
                <li>Mengganggu operasional layanan</li>
                <li>Melanggar hak kekayaan intelektual</li>
                <li>Menggunakan layanan untuk tujuan ilegal</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">
                5. Konten Pengguna
              </h2>
              <p className="text-gray-700 mb-4">
                Dengan mengirimkan konten ke platform ini, Anda:
              </p>
              <ul className="list-disc pl-6 text-gray-700 space-y-2">
                <li>
                  Menjamin bahwa konten tersebut adalah milik Anda atau Anda
                  memiliki hak untuk menggunakannya
                </li>
                <li>
                  Memberikan izin kepada Pemerintah Kabupaten Trenggalek untuk
                  menggunakan konten tersebut untuk tujuan layanan publik
                </li>
                <li>Bertanggung jawab penuh atas konten yang Anda kirimkan</li>
                <li>
                  Memahami bahwa konten dapat dimoderasi atau dihapus jika
                  melanggar ketentuan
                </li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">
                6. Privasi dan Perlindungan Data
              </h2>
              <p className="text-gray-700 mb-4">
                Penggunaan data pribadi Anda diatur dalam
                <a
                  href="/privacy-policy"
                  className="text-blue-600 hover:text-blue-800 underline ml-1"
                >
                  Kebijakan Privasi
                </a>
                kami. Dengan menggunakan layanan ini, Anda menyetujui praktik
                pengumpulan dan penggunaan data sebagaimana dijelaskan dalam
                kebijakan tersebut.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">
                7. Ketersediaan Layanan
              </h2>
              <p className="text-gray-700 mb-4">
                Kami berusaha menyediakan layanan yang stabil dan dapat
                diandalkan, namun:
              </p>
              <ul className="list-disc pl-6 text-gray-700 space-y-2">
                <li>Layanan dapat mengalami gangguan untuk pemeliharaan</li>
                <li>Kami tidak menjamin ketersediaan layanan 100%</li>
                <li>
                  Fitur dapat berubah atau dihentikan dengan pemberitahuan
                </li>
                <li>Kami berhak membatasi akses jika diperlukan</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">
                8. Batasan Tanggung Jawab
              </h2>
              <p className="text-gray-700 mb-4">
                Pemerintah Kabupaten Trenggalek tidak bertanggung jawab atas:
              </p>
              <ul className="list-disc pl-6 text-gray-700 space-y-2">
                <li>Kerugian yang timbul dari penggunaan layanan</li>
                <li>Konten yang dibuat oleh pengguna lain</li>
                <li>Gangguan teknis atau kehilangan data</li>
                <li>
                  Keputusan yang diambil berdasarkan informasi dari platform
                </li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">
                9. Moderasi dan Penegakan
              </h2>
              <p className="text-gray-700 mb-4">Kami berhak untuk:</p>
              <ul className="list-disc pl-6 text-gray-700 space-y-2">
                <li>Memoderasi konten yang dikirimkan pengguna</li>
                <li>Menghapus konten yang melanggar ketentuan</li>
                <li>Memblokir akses pengguna yang melanggar</li>
                <li>Melaporkan aktivitas ilegal kepada pihak berwenang</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">
                10. Perubahan Ketentuan
              </h2>
              <p className="text-gray-700 mb-4">
                Ketentuan layanan ini dapat diubah sewaktu-waktu. Perubahan akan
                dinotifikasi melalui platform dengan tanggal pembaruan yang
                jelas. Penggunaan berkelanjutan setelah perubahan dianggap
                sebagai persetujuan terhadap ketentuan yang baru.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">
                11. Hukum yang Berlaku
              </h2>
              <p className="text-gray-700 mb-4">
                Ketentuan layanan ini diatur oleh hukum Republik Indonesia.
                Setiap sengketa akan diselesaikan melalui pengadilan yang
                berwenang di Kabupaten Trenggalek.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">
                12. Kontak
              </h2>
              <p className="text-gray-700 mb-4">
                Untuk pertanyaan tentang ketentuan layanan ini, hubungi kami:
              </p>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-gray-700">
                  <strong>Pemerintah Kabupaten Trenggalek</strong>
                  <br />
                  Email: humas@trenggalekkab.go.id
                  <br />
                  Telepon: (0355) 791019
                  <br />
                  Alamat: Jl. Raya Trenggalek-Tulungagung KM 4, Trenggalek, Jawa
                  Timur
                </p>
              </div>
            </section>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
