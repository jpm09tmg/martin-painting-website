"use client";
import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  Calendar,
  FileText,
  MessageSquare,
  DollarSign,
  Settings,
  Star,
  Image,
} from "lucide-react";

/**
 * Admin Sidebar Navigation Component
 *
 * This sidebar provides navigation between all admin sections of Martin Painting.
 * It shows the current active page and uses consistent styling across all links.
 * Each section has its own icon and clear labeling for easy identification.
 * Projects and Quotes are now completely separate menu items for better organization.
 */
export default function Sidebar() {
  /*
   * Current Page Detection
   *
   * This tracks which page the user is currently viewing to highlight the active menu item.
   * Uses Next.js usePathname hook to detect the current URL and match it to menu items.
   * The active state helps users understand where they are in the admin system.
   */
  const pathname = usePathname();

  const isDashboardActive = pathname === "/admin";
  const isClientsActive = pathname.startsWith("/admin/clients");
  const isAppointmentsActive = pathname.startsWith("/admin/appointments");
  const isProjectsActive = pathname.startsWith("/admin/projects");
  const isQuotesActive = pathname.startsWith("/admin/quotes");
  const isGalleryActive = pathname.startsWith("/admin/gallery");
  const isPaymentsActive = pathname.startsWith("/admin/payments");
  const isReviewsActive = pathname.startsWith("/admin/reviews");
  const isSettingsActive = pathname.startsWith("/admin/settings");

  return (
    <aside className="w-[250px] bg-background min-h-screen sticky top-0">
      {/*
       * Navigation Menu
       *
       * Each menu item links to a different admin section and shows an active state
       * when that section is currently being viewed. The green background color
       * matches Martin Painting's brand colors and provides good contrast for the white text.
       */}
      <nav className="p-4 space-y-2">
        {/* Dashboard Link */}
        <Link
          href="/admin"
          className={`flex items-center space-x-3 px-4 py-3 text-text rounded-lg transition-colors hover:bg-white/10 ${
            isDashboardActive ? "bg-background-light" : ""
          }`}
        >
          <Home className="w-5 h-5 text-text" />
          <span>Dashboard</span>
        </Link>

        {/* Clients Link */}
        <Link
          href="/admin/clients"
          className={`flex items-center space-x-3 px-4 py-3 text-text rounded-lg transition-colors hover:bg-white/10 ${
            isClientsActive ? "bg-background-light" : ""
          }`}
        >
          <Home className="w-5 h-5 text-text" />
          <span>Clients</span>
        </Link>

        {/* Appointments Link */}
        <Link
          href="/admin/appointments"
          className={`flex items-center space-x-3 px-4 py-3 text-text rounded-lg transition-colors hover:bg-white/10 ${
            isAppointmentsActive ? "bg-background-light" : ""
          }`}
        >
          <Calendar className="w-5 h-5 text-text" />
          <span>Appointments</span>
        </Link>

        {/* Projects */}
        <Link
          href="/admin/projects"
          className={`flex items-center space-x-3 px-4 py-3 text-text rounded-lg transition-colors hover:bg-white/10 ${
            isProjectsActive ? "bg-background-light" : ""
          }`}
        >
          <FileText className="w-5 h-5 text-text" />
          <span>Projects</span>
        </Link>

        {/* Quotes */}
        <Link
          href="/admin/quotes"
          className={`flex items-center space-x-3 px-4 py-3 text-text rounded-lg transition-colors hover:bg-white/10 ${
            isQuotesActive ? "bg-background-light" : ""
          }`}
        >
          <FileText className="w-5 h-5 text-text" />
          <span>Quotes</span>
        </Link>

        {/* Gallery Link */}
        <Link
          href="/admin/gallery"
          className={`flex items-center space-x-3 px-4 py-3 text-text rounded-lg transition-colors hover:bg-white/10 ${
            isGalleryActive ? "bg-background-light" : ""
          }`}
        >
          <Image className="w-5 h-5 text-text" />
          <span>Gallery</span>
        </Link>

        {/* Payments Link */}
        <Link
          href="/admin/payments"
          className={`flex items-center space-x-3 px-4 py-3 text-text rounded-lg transition-colors hover:bg-white/10 ${
            isPaymentsActive ? "bg-background-light" : ""
          }`}
        >
          <DollarSign className="w-5 h-5 text-text" />
          <span>Payments</span>
        </Link>

        {/* Reviews Link */}
        <Link
          href="/admin/reviews"
          className={`flex items-center space-x-3 px-4 py-3 text-text rounded-lg transition-colors hover:bg-white/10 ${
            isReviewsActive ? "bg-background-light" : ""
          }`}
        >
          <Star className="w-5 h-5 text-text" />
          <span>Reviews</span>
        </Link>

        {/* Settings Link */}
        <Link
          href="/admin/settings"
          className={`flex items-center space-x-3 px-4 py-3 text-text rounded-lg transition-colors hover:bg-white/10 ${
            isSettingsActive ? "bg-background-light" : ""
          }`}
        >
          <Settings className="w-5 h-5 text-text  " />
          <span>Settings</span>
        </Link>
      </nav>
    </aside>
  );
}
