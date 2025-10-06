import { Suspense } from "react";
import AdminLayout from "@/components/AdminLayout";
import AspirasiManager from "@/components/AspirasiManager";

export default function AdminAspirasiPage() {
  return (
    <AdminLayout title="Manajemen Aspirasi" activeTab="aspirasi">
      <div className="space-y-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Aspirasi Masyarakat
          </h2>
          <p className="text-gray-600 mb-6">
            Kelola dan tanggapi aspirasi, saran, dan keluhan dari masyarakat
            Trenggalek.
          </p>

          <Suspense
            fallback={
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
              </div>
            }
          >
            <AspirasiManager />
          </Suspense>
        </div>
      </div>
    </AdminLayout>
  );
}
