"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/src/lib/db/supabase-client";
import { useAuth } from "../providers/AuthProvider";
import AdminHeader from "../../components/admin/adminHeader";
import Sidebar from "../../components/admin/Sidebar";

export default function AdminLayout({ children }) {
  const router = useRouter();
  const { session, loading } = useAuth();
  const [isAdmin, setIsAdmin] = useState(null);

  useEffect(() => {
    const checkAdminAccess = async () => {
      // Redirect to login if not authenticated
      if (!loading && !session) {
        router.push("/login");
        return;
      }

      // If authenticated, check if user is in admins table
      if (session) {
        const { data: adminData } = await supabase
          .from("admins")
          .select("id")
          .eq("user_id", session.user.id)
          .maybeSingle();

        if (adminData) {
          // User is in admins table = they're an admin
          setIsAdmin(true);
        } else {
          // Not an admin, redirect to home
          router.push("/");
        }
      }
    };

    checkAdminAccess();
  }, [session, loading, router]);

  if (loading || isAdmin === null)
    return (
      <p className="bg-background-dark text-text-muted text-center mt-20">
        Loading...
      </p>
    );

  if (!session || !isAdmin) return null;

  return (
    <div className="flex flex-col min-h-screen bg-background-dark">
      <AdminHeader />
      <div className="flex flex-1">
        <Sidebar />
        <main className="flex-1 p-4">{children}</main>
      </div>
    </div>
  );
}
