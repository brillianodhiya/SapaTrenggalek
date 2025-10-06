"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import ImageExtractionManager from "@/components/ImageExtractionManager";
import AdminLayout from "@/components/AdminLayout";

export default function AdminImagesPage() {
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
    <AdminLayout title="Image Management" activeTab="images">
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Image Management</h1>
          <p className="text-gray-600 mt-2">
            Extract and manage images for news articles automatically.
          </p>
        </div>

        <ImageExtractionManager />
      </div>
    </AdminLayout>
  );
}
