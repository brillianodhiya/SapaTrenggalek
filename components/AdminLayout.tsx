"use client";

import { useSession, signOut } from "next-auth/react";
import { ReactNode } from "react";
import AdminSidebar from "@/components/AdminSidebar";
import { LogOut, User } from "lucide-react";

interface AdminLayoutProps {
  children: ReactNode;
  title: string;
  activeTab: string;
}

export default function AdminLayout({
  children,
  title,
  activeTab,
}: AdminLayoutProps) {
  const { data: session } = useSession();

  const handleSignOut = async () => {
    await signOut({ callbackUrl: "/admin/login" });
  };

  return (
    <div className="flex h-screen bg-gray-50">
      <AdminSidebar activeTab={activeTab} />

      <main className="flex-1 overflow-auto">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-semibold text-gray-900">{title}</h1>
            </div>

            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <User className="h-4 w-4" />
                <span>{session?.user?.name}</span>
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

        <div className="p-6 lg:p-8">{children}</div>
      </main>
    </div>
  );
}
