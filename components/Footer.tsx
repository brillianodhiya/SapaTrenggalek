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
              Platform digital untuk mendengar suara masyarakat Trenggalek.
              Dikembangkan sebagai project volunteer untuk membantu membangun
              Trenggalek dan mengenalkan teknologi kepada masyarakat.
            </p>
          </div>

          {/* Project Info */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Tentang Project</h3>
            <ul className="space-y-2 text-sm">
              <li className="text-gray-300">
                🎯 <strong>Tujuan:</strong> Membangun Trenggalek
              </li>
              <li className="text-gray-300">
                💡 <strong>Misi:</strong> Mengenalkan teknologi
              </li>
              <li className="text-gray-300">
                🤝 <strong>Status:</strong> Volunteer project
              </li>
              <li>
                <Link
                  href="/privacy-policy"
                  className="text-blue-400 hover:text-blue-300 transition-colors"
                >
                  Kebijakan Privasi
                </Link>
              </li>
              <li>
                <Link
                  href="/terms-of-service"
                  className="text-blue-400 hover:text-blue-300 transition-colors"
                >
                  Ketentuan Layanan
                </Link>
              </li>
            </ul>
          </div>

          {/* Developer Info */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Dikembangkan Oleh</h3>
            <div className="text-gray-300 text-sm space-y-2">
              <p>
                <strong>TitaniaLabs</strong>
              </p>
              <p className="text-xs text-gray-400">
                Volunteer Project untuk Trenggalek
              </p>
              <div className="space-y-1">
                <p>
                  <a
                    href="https://www.linkedin.com/in/brilliano-dhiya-ulhaq-44b196194/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-400 hover:text-blue-300 transition-colors"
                  >
                    @brillianodhiya
                  </a>
                </p>
                <p>
                  <a
                    href="https://www.linkedin.com/in/aulia-zulfaa-144b78259/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-400 hover:text-blue-300 transition-colors"
                  >
                    @auliazulfa
                  </a>
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-700 mt-8 pt-6">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-400 text-sm">
              © {new Date().getFullYear()} TitaniaLabs. Volunteer project untuk
              membangun Trenggalek.
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
