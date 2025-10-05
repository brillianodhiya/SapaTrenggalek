"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import DatabaseManager from "@/components/DatabaseManager";
import AdminLayout from "@/components/AdminLayout";

export default function AdminSettingsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/admin/login");
    }
  }, [status, router]);

  if (status === "loading") {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!session) {
    return null;
  }

  return (
    <AdminLayout title="Pengaturan Sistem" activeTab="settings">
      <div className="space-y-6">
        <div className="card">
          <h2 className="text-xl font-bold mb-4">Pengaturan Sistem</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Kata Kunci Monitoring
              </label>
              <textarea
                className="w-full p-3 border border-gray-300 rounded-lg"
                rows={4}
                placeholder="trenggalek, pemkab trenggalek, bupati trenggalek..."
                defaultValue="trenggalek, pemkab trenggalek, bupati trenggalek, dinas trenggalek, kecamatan trenggalek"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Interval Scraping (jam)
              </label>
              <select
                className="w-full p-3 border border-gray-300 rounded-lg"
                defaultValue="6"
              >
                <option value="1">Setiap 1 jam</option>
                <option value="3">Setiap 3 jam</option>
                <option value="6">Setiap 6 jam</option>
                <option value="12">Setiap 12 jam</option>
                <option value="24">Setiap 24 jam</option>
              </select>
            </div>
            <button className="btn-primary">Simpan Pengaturan</button>
          </div>
        </div>
        <DatabaseManager />
      </div>
    </AdminLayout>
  );
}
