"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/src/lib/db/supabase-client";
import { useAuth } from "../providers/AuthProvider";
import AdminHeader from "../../components/admin/adminHeader";
import Sidebar from "../../components/admin/Sidebar";

export default function AdminLayout({ children }) {
  const router = useRouter();
  const { session, loading } = useAuth();

  useEffect(() => {
    // Redirect to login if not authenticated
    if (!loading && !session) {
      router.push("/login");
    }
  }, [session, loading, router]);

  if (loading) return <p className="text-center mt-20">Loading...</p>;

  if (!session) return null;

  return (
    <div className="flex flex-col min-h-screen bg-white">
      <AdminHeader />
      <div className="flex flex-1">
        <Sidebar />
        <main className="flex-1 p-4">{children}</main>
      </div>
    </div>
  );
}
