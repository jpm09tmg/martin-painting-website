"use client";

import Link from "next/link";
import Image from "next/image";
import { User, UserCog } from "lucide-react";
import { useState, useEffect } from "react";
import CustomerLoginModal from "../customer/CustomerLoginModal";
import CustomerSignupModal from "../customer/CustomerSignupModal";
import { useAuth } from "@/src/app/providers/AuthProvider";
import { supabase } from "@/src/lib/db/supabase-client";
import { useTheme } from "@/src/app/providers/ThemeProvider";
import { btnOutline, btnPrimary } from "../ui/buttons";
import ThemeSwitch from "@/src/components/ui/themeSwitch";

export default function Header({ currentPage = "home" }) {
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showSignupModal, setShowSignupModal] = useState(false);
  const [isCustomer, setIsCustomer] = useState(false);
  const [userName, setUserName] = useState("Profile");
  const { session } = useAuth();
  const isActive = (page) => currentPage === page;
  const { theme, toggleTheme } = useTheme();

  // Check if user has a client record (simpler than role checking)
  useEffect(() => {
    const checkIfCustomer = async () => {
      if (session) {
        const { data } = await supabase
          .from("clients")
          .select("first_name")
          .eq("user_id", session.user.id)
          .single();

        if (data) {
          setIsCustomer(true);
          setUserName(data.first_name || "Profile");
        } else {
          setIsCustomer(false);
          setUserName("Profile");
        }
      } else {
        setIsCustomer(false);
        setUserName("Profile");
      }
    };

    checkIfCustomer();
  }, [session]);

  const switchToSignup = () => {
    setShowLoginModal(false);
    setShowSignupModal(true);
  };

  const switchToLogin = () => {
    setShowSignupModal(false);
    setShowLoginModal(true);
  };

  return (
    <div className="fixed top-0 left-0 right-0 w-full h-16 bg-background z-50 d-shadow">
      <div className="max-w-7xl mx-auto px-4 h-full flex items-center justify-between">
        <div className="flex items-center">
          <div className="w-24  rounded-lg overflow-hidden ">
            <Link href="/" className="hover:opacity-80 transition-opacity">
              <div className="w-24  rounded-lg overflow-hidden shadow-md">
                <Image
                  src="/martinPainting_v2.png"
                  alt="Martin Painting Logo"
                  width={144}
                  height={69}
                  className="w-full h-full object-cover"
                />
              </div>
            </Link>
          </div>
        </div>

        <nav className="flex space-x-0">
          <Link
            href="/"
            className={`px-6 py-4 text-sm transition-colors ${
              isActive("home")
                ? "text-text bg-background-dark font-bold border-b-2 border-primary"
                : "text-text-muted hover:bg-white/10"
            }`}
          >
            Home
          </Link>
          <Link
            href="/services"
            className={`px-6 py-4 text-sm transition-colors ${
              isActive("services")
                ? "text-text bg-background-dark font-bold border-b-2 border-primary"
                : "text-text-muted hover:bg-white/10"
            }`}
          >
            Services
          </Link>
          <Link
            href="/gallery"
            className={`px-6 py-4 text-sm transition-colors ${
              isActive("gallery")
                ? "text-text bg-background-dark font-bold border-b-2 border-primary"
                : "text-text-muted hover:bg-white/10"
            }`}
          >
            Gallery
          </Link>
          <Link
            href="/quote"
            className={`px-6 py-4 text-sm transition-colors ${
              isActive("quote")
                ? "text-text bg-background-dark font-bold border-b-2 border-primary"
                : "text-text-muted hover:bg-white/10"
            }`}
          >
            Quote
          </Link>
          <Link
            href="/contact"
            className={`px-6 py-4 text-sm transition-colors ${
              isActive("contact")
                ? "text-text bg-background-dark font-bold border-b-2 border-primary"
                : "text-text-muted hover:bg-white/10"
            }`}
          >
            Contact
          </Link>

          {/* Customer Sign In / Profile */}
          <Link
            href={isCustomer ? "/customer" : "#"}
            onClick={
              isCustomer
                ? undefined
                : (e) => {
                    e.preventDefault();
                    setShowLoginModal(true);
                  }
            }
            className={`px-6 py-4 text-sm transition-colors ${
              isActive("profile")
                ? "text-text bg-background-dark font-bold border-b-2 border-primary"
                : "text-text-muted hover:bg-white/10"
            }`}
          >
            {isCustomer ? userName : "Sign In"}
          </Link>

          {/* Admin Link */}
          <Link
            href="/login"
            className={`px-6 py-4 text-sm transition-colors flex items-center gap-2 ${
              isActive("admin")
                ? "text-text bg-background-dark font-bold border-b-2 border-primary"
                : "text-text-muted hover:bg-white/10"
            }`}
          >
            <UserCog className="w-4 h-4" />
            Admin
          </Link>

          {/* Theme Toggle */}
          <div className="px-4 flex items-center">
            <ThemeSwitch />
          </div>
        </nav>
      </div>

      {/* Login Modal */}
      <CustomerLoginModal
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
        onSwitchToSignup={switchToSignup}
      />

      {/* Signup Modal */}
      <CustomerSignupModal
        isOpen={showSignupModal}
        onClose={() => setShowSignupModal(false)}
        onSwitchToLogin={switchToLogin}
      />
    </div>
  );
}
