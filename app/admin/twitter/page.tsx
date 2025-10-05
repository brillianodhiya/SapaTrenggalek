"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import TwitterManager from "@/components/TwitterManager";
import AdminLayout from "@/components/AdminLayout";

export default function AdminTwitterPage() {
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
    <AdminLayout title="Twitter/X Manager" activeTab="twitter">
      <div className="space-y-6">
        <TwitterManager />
      </div>
    </AdminLayout>
  );
}
