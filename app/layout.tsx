import type { Metadata } from "next";
import AuthProvider from "@/components/AuthProvider";
import "./globals.css";

export const metadata: Metadata = {
  title: "Sapa Trenggalek - Sistem Aspirasi & Pengaduan Analitik",
  description:
    "Sistem Intelijen dan Agregasi Informasi Publik untuk Pemerintah Kabupaten Trenggalek",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id">
      <body className="bg-gray-50 min-h-screen">
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
