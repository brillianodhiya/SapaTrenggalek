import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-gray-800 text-white py-8 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* About Section */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Sapa Trenggalek</h3>
            <p className="text-gray-300 text-sm">
              Sistem Aspirasi & Pengaduan Analitik untuk Pemerintah Kabupaten
              Trenggalek. Platform digital untuk mendengar suara masyarakat dan
              meningkatkan pelayanan publik.
            </p>
          </div>

          {/* Legal Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4">
              Kebijakan & Ketentuan
            </h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link
                  href="/privacy-policy"
                  className="text-gray-300 hover:text-white transition-colors"
                >
                  Kebijakan Privasi
                </Link>
              </li>
              <li>
                <Link
                  href="/terms-of-service"
                  className="text-gray-300 hover:text-white transition-colors"
                >
                  Ketentuan Layanan
                </Link>
              </li>
              <li>
                <Link
                  href="/data-deletion"
                  className="text-gray-300 hover:text-white transition-colors"
                >
                  Penghapusan Data Pengguna
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Kontak</h3>
            <div className="text-gray-300 text-sm space-y-2">
              <p>
                <strong>Pemerintah Kabupaten Trenggalek</strong>
              </p>
              <p>
                Jl. Raya Trenggalek-Tulungagung KM 4<br />
                Trenggalek, Jawa Timur
              </p>
              <p>
                Telepon: (0355) 791019
                <br />
                Email: humas@trenggalekkab.go.id
              </p>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-700 mt-8 pt-6">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-400 text-sm">
              © {new Date().getFullYear()} Pemerintah Kabupaten Trenggalek. All
              rights reserved.
            </p>
            <div className="flex space-x-4 mt-4 md:mt-0">
              <Link
                href="/privacy-policy"
                className="text-gray-400 hover:text-white text-sm transition-colors"
              >
                Privacy
              </Link>
              <Link
                href="/terms-of-service"
                className="text-gray-400 hover:text-white text-sm transition-colors"
              >
                Terms
              </Link>
              <Link
                href="/data-deletion"
                className="text-gray-400 hover:text-white text-sm transition-colors"
              >
                Data Deletion
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
