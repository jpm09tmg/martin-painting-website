"use client";

import Link from "next/link";
import Image from "next/image";
import { User, UserCog } from "lucide-react";
import { useState } from "react";
import CustomerLoginModal from "../customer/CustomerLoginModal";
import CustomerSignupModal from "../customer/CustomerSignupModal";
import { useAuth } from "@/src/app/providers/AuthProvider";

export default function Header({ currentPage = "home" }) {
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showSignupModal, setShowSignupModal] = useState(false);
  const { session } = useAuth();
  const isActive = (page) => currentPage === page;
  
  // Check if user is logged in and is a customer (not admin)
  const isCustomer = session && session.user?.user_metadata?.role !== "admin";
  const userName = session?.user?.user_metadata?.first_name || "Profile";

  const switchToSignup = () => {
    setShowLoginModal(false);
    setShowSignupModal(true);
  };

  const switchToLogin = () => {
    setShowSignupModal(false);
    setShowLoginModal(true);
  };

  return (
    <div className="fixed top-0 left-0 right-0 w-full h-16 bg-background z-50">
      <div className="max-w-7xl mx-auto px-4 h-full flex items-center justify-between">
        <div className="flex items-center">
          <div className="w-24  rounded-lg overflow-hidden shadow-md">
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
                ? "text-text bg-white/10 border-b-2 border-text"
                : "text-white hover:bg-white/10"
            }`}
          >
            Home
          </Link>
          <Link
            href="/services"
            className={`px-6 py-4 text-sm transition-colors ${
              isActive("services")
                ? "text-black bg-white/10 border-b-2 border-text"
                : "text-white hover:bg-white/10"
            }`}
          >
            Services
          </Link>
          <Link
            href="/gallery"
            className={`px-6 py-4 text-sm transition-colors ${
              isActive("gallery")
                ? "text-black bg-white/10 border-b-2 border-text"
                : "text-white hover:bg-white/10"
            }`}
          >
            Gallery
          </Link>
          <Link
            href="/quote"
            className={`px-6 py-4 text-sm transition-colors ${
              isActive("quote")
                ? "text-black bg-white/10 border-b-2 border-text"
                : "text-white hover:bg-white/10"
            }`}
          >
            Quote
          </Link>
          <Link
            href="/contact"
            className={`px-6 py-4 text-sm transition-colors ${
              isActive("contact")
                ? "text-black bg-white/10 border-b-2 border-text"
                : "text-white hover:bg-white/10"
            }`}
          >
            Contact
          </Link>
          
          {/* Customer Sign In / Profile */}
          <Link
            href={isCustomer ? "/customer" : "#"}
            onClick={isCustomer ? undefined : (e) => {
              e.preventDefault();
              setShowLoginModal(true);
            }}
            className={`px-6 py-4 text-sm transition-colors text-white hover:bg-white/10`}
          >
            {isCustomer ? userName : "Sign In"}
          </Link>

          {/* Admin Link */}
          <Link
            href="/login"
            className={`px-6 py-4 text-sm transition-colors flex items-center gap-2 ${
              isActive("admin")
                ? "text-black bg-white/10 border-b-2 border-text"
                : "text-white hover:bg-white/10"
            }`}
          >
            <UserCog className="w-4 h-4" />
            Admin
          </Link>
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
