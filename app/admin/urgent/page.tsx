"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import AdminLayout from "@/components/AdminLayout";

export default function AdminUrgentPage() {
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
    <AdminLayout title="Item Mendesak" activeTab="urgent">
      <div className="card">
        <h2 className="text-xl font-bold mb-4">Item Mendesak</h2>
        <p className="text-gray-600">
          Fitur ini akan menampilkan item dengan tingkat urgensi tinggi.
        </p>
      </div>
    </AdminLayout>
  );
}
