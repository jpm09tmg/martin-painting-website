"use client";

import Link from "next/link";
import Image from "next/image";
import { User, UserCog } from "lucide-react";
import { useState } from "react";
import CustomerLoginModal from "../customer/CustomerLoginModal";
import CustomerSignupModal from "../customer/CustomerSignupModal";
import { useAuth } from "@/src/app/providers/AuthProvider";
import { useTheme } from "@/src/app/providers/ThemeProvider";
import { btnOutline, btnPrimary } from "../ui/buttons";
import ThemeSwitch from "@/src/components/ui/themeSwitch";

export default function Header({ currentPage = "home" }) {
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showSignupModal, setShowSignupModal] = useState(false);
  const { session } = useAuth();
  const isActive = (page) => currentPage === page;
  const { theme, toggleTheme } = useTheme();

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
                : "text-text-muted hover:bg-highlight"
            }`}
          >
            Home
          </Link>
          <Link
            href="/services"
            className={`px-6 py-4 text-sm transition-colors ${
              isActive("services")
                ? "text-text bg-background-dark font-bold border-b-2 border-primary"
                : "text-text-muted hover:bg-highlight"
            }`}
          >
            Services
          </Link>
          <Link
            href="/gallery"
            className={`px-6 py-4 text-sm transition-colors ${
              isActive("gallery")
                ? "text-text bg-background-dark font-bold border-b-2 border-primary"
                : "text-text-muted hover:bg-highlight"
            }`}
          >
            Gallery
          </Link>
          <Link
            href="/quote"
            className={`px-6 py-4 text-sm transition-colors ${
              isActive("quote")
                ? "text-text bg-background-dark font-bold border-b-2 border-primary"
                : "text-text-muted hover:bg-highlight"
            }`}
          >
            Quote
          </Link>
          <Link
            href="/contact"
            className={`px-6 py-4 text-sm transition-colors ${
              isActive("contact")
                ? "text-text bg-background-dark font-bold border-b-2 border-primary"
                : "text-text-muted hover:bg-highlight"
            }`}
          >
            Contact
          </Link>
          <Link
            href="/appointments"
            className={`px-6 py-4 text-sm transition-colors ${
              isActive("appointments")
                ? "text-text bg-background-dark font-bold border-b-2 border-primary"
                : "text-text-muted hover:bg-highlight"
            }`}
          >
            Appointments
          </Link>

          {/* Customer Sign In / Profile */}
          <Link
            href={session ? "/customer" : "#"}
            onClick={
              session
                ? undefined
                : (e) => {
                    e.preventDefault();
                    setShowLoginModal(true);
                  }
            }
            className={`px-6 py-4 text-sm transition-colors ${
              isActive("profile")
                ? "text-text bg-background-dark font-bold border-b-2 border-primary"
                : "text-text-muted hover:bg-highlight"
            }`}
          >
            Profile
          </Link>

          {/* Admin Link */}
          <Link
            href="/login"
            className={`px-6 py-4 text-sm transition-colors flex items-center gap-2 ${
              isActive("admin")
                ? "text-text bg-background-dark font-bold border-b-2 border-primary"
                : "text-text-muted hover:bg-highlight"
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
