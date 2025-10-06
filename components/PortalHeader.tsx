import Link from "next/link";

interface PortalHeaderProps {
  showBackButton?: boolean;
  currentPage?: string;
}

export default function PortalHeader({
  showBackButton = false,
  currentPage,
}: PortalHeaderProps) {
  return (
    <header className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          <div className="flex items-center">
            {showBackButton && (
              <Link
                href="/"
                className="flex items-center text-gray-600 hover:text-gray-900 mr-4"
              >
                <svg
                  className="h-5 w-5 mr-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 19l-7-7 7-7"
                  />
                </svg>
                Kembali
              </Link>
            )}
            <Link href="/" className="flex items-center">
              <div className="w-10 h-10 bg-primary-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">ST</span>
              </div>
              <div className="ml-3">
                <h1 className="text-xl font-bold text-gray-900">
                  Sapa Trenggalek
                </h1>
                <p className="text-sm text-gray-500">Portal Informasi Publik</p>
              </div>
            </Link>
          </div>

          <nav className="hidden md:flex space-x-8">
            <Link
              href="/#berita"
              className={`hover:text-gray-900 ${
                currentPage === "berita"
                  ? "text-primary-600 font-medium"
                  : "text-gray-600"
              }`}
            >
              Berita
            </Link>
            <Link
              href="/search"
              className={`hover:text-gray-900 ${
                currentPage === "search"
                  ? "text-primary-600 font-medium"
                  : "text-gray-600"
              }`}
            >
              Cari Berita
            </Link>
            <Link
              href="/aspirasi"
              className={`hover:text-gray-900 ${
                currentPage === "aspirasi"
                  ? "text-primary-600 font-medium"
                  : "text-gray-600"
              }`}
            >
              Aspirasi
            </Link>
            <Link
              href="/hoax-checker"
              className={`hover:text-gray-900 ${
                currentPage === "hoax-checker"
                  ? "text-primary-600 font-medium"
                  : "text-gray-600"
              }`}
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

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              type="button"
              className="text-gray-600 hover:text-gray-900 focus:outline-none focus:text-gray-900"
            >
              <svg
                className="h-6 w-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
