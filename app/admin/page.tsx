"use client";

import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Sidebar from "@/components/Sidebar";
import Dashboard from "@/components/Dashboard";
import DataTable from "@/components/DataTable";
import DatabaseManager from "@/components/DatabaseManager";
import { LogOut, User } from "lucide-react";

export default function AdminPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("dashboard");

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

  const handleSignOut = async () => {
    await signOut({ callbackUrl: "/admin/login" });
  };

  const renderContent = () => {
    switch (activeTab) {
      case "dashboard":
        return <Dashboard />;
      case "data":
        return <DataTable />;
      case "analytics":
        return <Dashboard />;
      case "urgent":
        return (
          <div className="card">
            <h2 className="text-xl font-bold mb-4">Item Mendesak</h2>
            <p className="text-gray-600">
              Fitur ini akan menampilkan item dengan tingkat urgensi tinggi.
            </p>
          </div>
        );
      case "trends":
        return (
          <div className="card">
            <h2 className="text-xl font-bold mb-4">Tren & Isu Viral</h2>
            <p className="text-gray-600">
              Fitur ini akan menampilkan analisis tren dan isu yang sedang
              viral.
            </p>
          </div>
        );
      case "settings":
        return (
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
                  <select className="w-full p-3 border border-gray-300 rounded-lg">
                    <option value="1">Setiap 1 jam</option>
                    <option value="3">Setiap 3 jam</option>
                    <option value="6" selected>
                      Setiap 6 jam
                    </option>
                    <option value="12">Setiap 12 jam</option>
                    <option value="24">Setiap 24 jam</option>
                  </select>
                </div>
                <button className="btn-primary">Simpan Pengaturan</button>
              </div>
            </div>
            <DatabaseManager />
          </div>
        );
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar activeTab={activeTab} onTabChange={setActiveTab} />

      <main className="flex-1 overflow-auto">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-semibold text-gray-900">
                {activeTab === "dashboard" && "Dashboard Monitoring"}
                {activeTab === "data" && "Data Monitoring"}
                {activeTab === "analytics" && "Analitik & Laporan"}
                {activeTab === "urgent" && "Item Mendesak"}
                {activeTab === "trends" && "Tren & Isu Viral"}
                {activeTab === "settings" && "Pengaturan Sistem"}
              </h1>
            </div>

            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <User className="h-4 w-4" />
                <span>{session.user?.name}</span>
              </div>
              <button
                onClick={handleSignOut}
                className="flex items-center space-x-2 text-sm text-gray-600 hover:text-gray-900 transition-colors"
              >
                <LogOut className="h-4 w-4" />
                <span>Keluar</span>
              </button>
            </div>
          </div>
        </div>

        <div className="p-6 lg:p-8">{renderContent()}</div>
      </main>
    </div>
  );
}
