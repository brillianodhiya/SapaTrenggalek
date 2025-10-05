import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Penghapusan Data Pengguna - Sapa Trenggalek",
  description:
    "Panduan penghapusan data pengguna untuk aplikasi Sapa Trenggalek - Sistem Aspirasi & Pengaduan Analitik Pemerintah Kabupaten Trenggalek",
};

export default function DataDeletionPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white shadow-lg rounded-lg p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">
            Penghapusan Data Pengguna
          </h1>

          <div className="prose prose-lg max-w-none">
            <p className="text-gray-600 mb-6">
              <strong>Terakhir diperbarui:</strong>{" "}
              {new Date().toLocaleDateString("id-ID")}
            </p>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">
                1. Hak Penghapusan Data
              </h2>
              <p className="text-gray-700 mb-4">
                Sesuai dengan prinsip perlindungan data pribadi, pengguna
                memiliki hak untuk meminta penghapusan data pribadi mereka dari
                sistem Sapa Trenggalek dalam kondisi tertentu.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">
                2. Data yang Dapat Dihapus
              </h2>
              <p className="text-gray-700 mb-4">
                Jenis data yang dapat diminta untuk dihapus meliputi:
              </p>
              <ul className="list-disc pl-6 text-gray-700 space-y-2">
                <li>
                  Data pribadi yang diberikan secara langsung melalui formulir
                </li>
                <li>Riwayat interaksi dengan platform</li>
                <li>Data analitik yang dapat diidentifikasi secara personal</li>
                <li>Konten yang dikirimkan oleh pengguna</li>
              </ul>

              <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mt-4">
                <p className="text-yellow-800">
                  <strong>Catatan:</strong> Data publik yang dikumpulkan dari
                  media sosial dan platform publik lainnya mungkin tidak dapat
                  dihapus sepenuhnya karena sifat publiknya dan kepentingan
                  analisis kebijakan publik.
                </p>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">
                3. Kondisi Penghapusan Data
              </h2>
              <p className="text-gray-700 mb-4">
                Permintaan penghapusan data akan diproses jika:
              </p>
              <ul className="list-disc pl-6 text-gray-700 space-y-2">
                <li>
                  Data tidak lagi diperlukan untuk tujuan awal pengumpulan
                </li>
                <li>
                  Pengguna menarik persetujuan dan tidak ada dasar hukum lain
                </li>
                <li>Data telah diproses secara tidak sah</li>
                <li>Penghapusan diperlukan untuk mematuhi kewajiban hukum</li>
                <li>
                  Data dikumpulkan dari anak di bawah umur tanpa persetujuan
                  yang sah
                </li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">
                4. Pengecualian Penghapusan
              </h2>
              <p className="text-gray-700 mb-4">
                Data tidak akan dihapus jika diperlukan untuk:
              </p>
              <ul className="list-disc pl-6 text-gray-700 space-y-2">
                <li>Mematuhi kewajiban hukum</li>
                <li>Melaksanakan tugas kepentingan publik</li>
                <li>Keperluan arsip, penelitian, atau statistik</li>
                <li>Menegakkan atau mempertahankan klaim hukum</li>
                <li>Melindungi kebebasan berekspresi dan informasi</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">
                5. Cara Mengajukan Permintaan
              </h2>
              <p className="text-gray-700 mb-4">
                Untuk mengajukan permintaan penghapusan data, ikuti langkah
                berikut:
              </p>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
                <h3 className="text-lg font-semibold text-blue-800 mb-4">
                  📧 Kirim Email Permintaan
                </h3>
                <p className="text-blue-700 mb-4">
                  Kirim email ke: <strong>privacy@trenggalekkab.go.id</strong>
                </p>
                <p className="text-blue-700 mb-4">
                  <strong>Subject:</strong> Permintaan Penghapusan Data - Sapa
                  Trenggalek
                </p>
                <p className="text-blue-700 mb-4">
                  <strong>Sertakan informasi berikut:</strong>
                </p>
                <ul className="list-disc pl-6 text-blue-700 space-y-1">
                  <li>Nama lengkap</li>
                  <li>Email yang terdaftar (jika ada)</li>
                  <li>Username atau identifier lainnya</li>
                  <li>Jenis data yang ingin dihapus</li>
                  <li>Alasan permintaan penghapusan</li>
                  <li>Dokumen identitas (KTP/SIM) untuk verifikasi</li>
                </ul>
              </div>

              <div className="bg-green-50 border border-green-200 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-green-800 mb-4">
                  📞 Kontak Langsung
                </h3>
                <p className="text-green-700">
                  <strong>Telepon:</strong> (0355) 791019
                  <br />
                  <strong>Alamat:</strong> Jl. Raya Trenggalek-Tulungagung KM 4,
                  Trenggalek, Jawa Timur
                  <br />
                  <strong>Jam Kerja:</strong> Senin - Jumat, 08:00 - 16:00 WIB
                </p>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">
                6. Proses Penghapusan
              </h2>
              <div className="space-y-4">
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0 w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center font-semibold">
                    1
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-800">
                      Verifikasi Identitas
                    </h3>
                    <p className="text-gray-700">
                      Kami akan memverifikasi identitas Anda untuk memastikan
                      keamanan data.
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0 w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center font-semibold">
                    2
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-800">
                      Evaluasi Permintaan
                    </h3>
                    <p className="text-gray-700">
                      Tim kami akan mengevaluasi permintaan sesuai dengan
                      ketentuan yang berlaku.
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0 w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center font-semibold">
                    3
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-800">Konfirmasi</h3>
                    <p className="text-gray-700">
                      Anda akan menerima konfirmasi mengenai status permintaan
                      dalam 7 hari kerja.
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0 w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center font-semibold">
                    4
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-800">Penghapusan</h3>
                    <p className="text-gray-700">
                      Jika disetujui, data akan dihapus dalam 30 hari kerja.
                    </p>
                  </div>
                </div>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">
                7. Waktu Pemrosesan
              </h2>
              <ul className="list-disc pl-6 text-gray-700 space-y-2">
                <li>
                  <strong>Konfirmasi penerimaan:</strong> 1-2 hari kerja
                </li>
                <li>
                  <strong>Evaluasi permintaan:</strong> 5-7 hari kerja
                </li>
                <li>
                  <strong>Penghapusan data:</strong> 14-30 hari kerja (jika
                  disetujui)
                </li>
                <li>
                  <strong>Konfirmasi penyelesaian:</strong> 1-2 hari kerja
                  setelah penghapusan
                </li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">
                8. Backup dan Arsip
              </h2>
              <p className="text-gray-700 mb-4">Perlu diketahui bahwa:</p>
              <ul className="list-disc pl-6 text-gray-700 space-y-2">
                <li>
                  Data dalam backup sistem akan dihapus dalam siklus backup
                  berikutnya (maksimal 90 hari)
                </li>
                <li>
                  Data yang telah diarsipkan untuk kepentingan hukum mungkin
                  tidak dapat dihapus
                </li>
                <li>
                  Data agregat yang tidak dapat diidentifikasi secara personal
                  akan tetap dipertahankan
                </li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">
                9. Hak Lainnya
              </h2>
              <p className="text-gray-700 mb-4">
                Selain penghapusan data, Anda juga memiliki hak untuk:
              </p>
              <ul className="list-disc pl-6 text-gray-700 space-y-2">
                <li>Mengakses data pribadi yang kami miliki</li>
                <li>Meminta koreksi data yang tidak akurat</li>
                <li>Membatasi pemrosesan data</li>
                <li>Meminta portabilitas data</li>
                <li>Mengajukan keberatan terhadap pemrosesan</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">
                10. Kontak dan Bantuan
              </h2>
              <p className="text-gray-700 mb-4">
                Jika Anda memiliki pertanyaan atau memerlukan bantuan terkait
                penghapusan data:
              </p>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-gray-700">
                  <strong>Data Protection Officer</strong>
                  <br />
                  <strong>Pemerintah Kabupaten Trenggalek</strong>
                  <br />
                  Email: privacy@trenggalekkab.go.id
                  <br />
                  Email alternatif: humas@trenggalekkab.go.id
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
    </div>
  );
}
