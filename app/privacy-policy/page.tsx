import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Kebijakan Privasi - Sapa Trenggalek",
  description:
    "Kebijakan Privasi untuk aplikasi Sapa Trenggalek - Sistem Aspirasi & Pengaduan Analitik Pemerintah Kabupaten Trenggalek",
};

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white shadow-lg rounded-lg p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">
            Kebijakan Privasi
          </h1>

          <div className="prose prose-lg max-w-none">
            <p className="text-gray-600 mb-6">
              <strong>Terakhir diperbarui:</strong>{" "}
              {new Date().toLocaleDateString("id-ID")}
            </p>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">
                1. Informasi yang Kami Kumpulkan
              </h2>
              <p className="text-gray-700 mb-4">
                Sapa Trenggalek mengumpulkan informasi publik dari media sosial
                dan platform online untuk tujuan monitoring aspirasi dan
                pengaduan masyarakat Kabupaten Trenggalek.
              </p>
              <ul className="list-disc pl-6 text-gray-700 space-y-2">
                <li>
                  Konten publik dari media sosial (Instagram, Facebook, Twitter)
                </li>
                <li>Informasi yang tersedia secara publik di portal berita</li>
                <li>Data analitik untuk meningkatkan layanan</li>
                <li>
                  Informasi yang diberikan secara sukarela melalui formulir
                  kontak
                </li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">
                2. Bagaimana Kami Menggunakan Informasi
              </h2>
              <p className="text-gray-700 mb-4">
                Informasi yang dikumpulkan digunakan untuk:
              </p>
              <ul className="list-disc pl-6 text-gray-700 space-y-2">
                <li>Menganalisis aspirasi dan pengaduan masyarakat</li>
                <li>
                  Mengidentifikasi isu-isu penting di Kabupaten Trenggalek
                </li>
                <li>Mendukung pengambilan keputusan pemerintah daerah</li>
                <li>Melawan penyebaran misinformasi</li>
                <li>Meningkatkan pelayanan publik</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">
                3. Perlindungan Data
              </h2>
              <p className="text-gray-700 mb-4">
                Kami berkomitmen melindungi informasi yang dikumpulkan dengan:
              </p>
              <ul className="list-disc pl-6 text-gray-700 space-y-2">
                <li>Enkripsi data saat transmisi dan penyimpanan</li>
                <li>Akses terbatas hanya untuk personel yang berwenang</li>
                <li>Audit keamanan berkala</li>
                <li>Kepatuhan terhadap regulasi perlindungan data</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">
                4. Berbagi Informasi
              </h2>
              <p className="text-gray-700 mb-4">
                Kami tidak menjual, menyewakan, atau membagikan informasi
                pribadi kepada pihak ketiga, kecuali dalam situasi berikut:
              </p>
              <ul className="list-disc pl-6 text-gray-700 space-y-2">
                <li>Dengan persetujuan eksplisit dari pengguna</li>
                <li>Untuk mematuhi kewajiban hukum</li>
                <li>Untuk melindungi keamanan dan integritas layanan</li>
                <li>
                  Dalam bentuk data agregat yang tidak dapat diidentifikasi
                </li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">
                5. Hak Pengguna
              </h2>
              <p className="text-gray-700 mb-4">Pengguna memiliki hak untuk:</p>
              <ul className="list-disc pl-6 text-gray-700 space-y-2">
                <li>Mengakses informasi yang kami miliki tentang mereka</li>
                <li>Meminta koreksi data yang tidak akurat</li>
                <li>Meminta penghapusan data pribadi</li>
                <li>Membatasi pemrosesan data</li>
                <li>Portabilitas data</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">
                6. Cookies dan Teknologi Pelacakan
              </h2>
              <p className="text-gray-700 mb-4">
                Kami menggunakan cookies dan teknologi serupa untuk:
              </p>
              <ul className="list-disc pl-6 text-gray-700 space-y-2">
                <li>Meningkatkan pengalaman pengguna</li>
                <li>Menganalisis penggunaan website</li>
                <li>Menyediakan fitur keamanan</li>
                <li>Mengingat preferensi pengguna</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">
                7. Kontak
              </h2>
              <p className="text-gray-700 mb-4">
                Untuk pertanyaan tentang kebijakan privasi ini, hubungi kami:
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

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">
                8. Perubahan Kebijakan
              </h2>
              <p className="text-gray-700">
                Kebijakan privasi ini dapat diperbarui dari waktu ke waktu.
                Perubahan akan dinotifikasi melalui website ini dengan tanggal
                pembaruan yang jelas.
              </p>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
