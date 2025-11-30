"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/src/app/providers/AuthProvider";
import { supabase } from "@/src/lib/db/supabase-client";
import { Loader2, LogOut } from "lucide-react";

export default function CustomerHome() {
  const { session, loading } = useAuth();
  const router = useRouter();
  const [userName, setUserName] = useState("");

  useEffect(() => {
    if (!loading && !session) {
      router.push("/");
    } else if (session) {
      const firstName = session.user?.user_metadata?.first_name || "User";
      setUserName(firstName);
    }
  }, [session, loading, router]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background-dark">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!session) {
    return null;
  }

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/");
  };

  return (
    <div className="min-h-screen bg-background-dark flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-text mb-4">
          Welcome, {userName}!
        </h1>
        <p className="text-text-muted mb-8">You're successfully signed in.</p>
        
        <button
          onClick={handleLogout}
          className="px-6 py-3 bg-primary text-background rounded-lg hover:bg-primary/80 transition-colors font-medium flex items-center gap-2 mx-auto"
        >
          <LogOut className="w-4 h-4" />
          Sign Out
        </button>
      </div>
    </div>
  );
}

