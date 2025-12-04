"use client";

import Link from "next/link";
import Image from "next/image";
import { LogOut } from "lucide-react";
import { supabase } from "@/src/lib/db/supabase-client";
import { useRouter } from "next/navigation";
import { ThemeProvider } from "@/src/app/providers/ThemeProvider";
import ThemeSwitch from "../ui/themeSwitch";

export default function AdminHeader() {
  const router = useRouter();

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error("Error logging out:", error.message);
    } else {
      router.push("/login");
    }
  };

  return (
    <div className="w-full h-16 bg-background-light justify-center flex items-center relative">
      <Link href="/" className="hover:opacity-80 transition-opacity">
        <div className="w-24  rounded-lg overflow-hidden ">
          <Image
            src="/martinPainting_v2.png"
            alt="Martin Painting Logo"
            width={144}
            height={69}
            className="w-full h-full object-cover"
          />
        </div>
      </Link>

      <div className="absolute right-20">
        <ThemeSwitch />
      </div>
      <button
        onClick={handleLogout}
        className="absolute right-6 p-2 rounded-full hover:bg-background-light transition-colors"
        aria-label="Logout"
      >
        <LogOut className="w-6 h-6 text-text-muted" />
      </button>
      {/* TODO: add admin icon + notification bell? + logout option */}
    </div>
  );
}
