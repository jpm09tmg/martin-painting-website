"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { supabase } from "../../lib/db/supabase-client";
import {
  RefreshCw,
  BarChart3,
  Calendar,
  CheckCircle2,
  Clock,
  FolderOpen,
  Users,
  TrendingUp,
  ArrowRight
} from "lucide-react";

/**
 * ============================================
 * ADMIN DASHBOARD - Main Overview Page
 * ============================================
 *
 * PURPOSE:
 * This is the central hub for managing Martin Painting business operations.
 * It serves as the homepage when admin logs in, showing a bird's-eye view
 * of all important metrics and recent activity.
 *
 * KEY FEATURES:
 * - Real-time statistics from database (projects, appointments, completions)
 * - Recent projects list with progress bars and status badges
 * - Upcoming appointments with customer details
 * - Quick navigation links to detailed pages
 * - Responsive grid layout for mobile/desktop
 *
 * DATABASE CONNECTIONS:
 * - Fetches from 'appointments' table
 * - Fetches from 'projects' table
 * - Displays aggregated statistics and recent entries
 */
export default function AdminDashboard() {
  // ============================================
  // STATE MANAGEMENT - Component state variables
  // ============================================

  // Stores all appointments fetched from database
  const [appointments, setAppointments] = useState([]);

  // Stores all projects fetched from database
  const [projects, setProjects] = useState([]);

  // Loading state - shows loading message while fetching data
  const [loading, setLoading] = useState(true);

  // ============================================
  // LOAD DATA ON COMPONENT MOUNT
  // ============================================

  // useEffect runs once when component loads (empty dependency array [])
  useEffect(() => {
    loadDashboardData(); // Fetch all dashboard data from database
  }, []);

  // ============================================
  // LOAD DASHBOARD DATA FROM DATABASE
  // ============================================

  /**
   * Fetches appointments and projects from Supabase database
   *
   * APPOINTMENTS:
   * - Gets 10 most recent appointments (ordered by creation date)
   * - Used for statistics and upcoming appointments section
   *
   * PROJECTS:
   * - Gets 5 most recent projects (ordered by creation date)
   * - Displayed in "Recent Projects" section with progress bars
   *
   * ERROR HANDLING:
   * - Each query has independent error handling
   * - If one fails, the other still loads
   * - Sets empty arrays on error to prevent crashes
   */
  const loadDashboardData = async () => {
    try {
      // ============================================
      // LOAD APPOINTMENTS
      // ============================================
      const { data: appointmentsData, error: appointmentsError } =
        await supabase
          .from("appointments") // Select from appointments table
          .select("*") // Get all columns
          .order("created_at", { ascending: false }) // Sort by creation date (newest first)
          .limit(10); // Only get 10 most recent

      // Handle appointments error
      if (appointmentsError) {
        console.error("Appointments error:", appointmentsError);
        setAppointments([]); // Set empty array to prevent crashes
      } else {
        setAppointments(appointmentsData || []); // Update state with fetched data
      }

      // ============================================
      // LOAD PROJECTS
      // ============================================
      const { data: projectsData, error: projectsError } = await supabase
        .from("projects") // Select from projects table
        .select("*") // Get all columns
        .order("created_at", { ascending: false }) // Sort by creation date (newest first)
        .limit(5); // Only get 5 most recent

      // Handle projects error
      if (projectsError) {
        console.error("Projects error:", projectsError);
        setProjects([]); // Set empty array to prevent crashes
      } else {
        setProjects(projectsData || []); // Update state with fetched data
      }
    } catch (err) {
      // Catch any unexpected errors (network issues, etc.)
      console.error("Error loading dashboard data:", err);
      setAppointments([]);
      setProjects([]);
    } finally {
      // Always run this - set loading to false whether successful or not
      setLoading(false);
    }
  };

  // ============================================
  // FILTER UPCOMING APPOINTMENTS
  // ============================================

  /**
   * Filters appointments to show only pending ones
   *
   * LOGIC:
   * - Only shows appointments with "pending" status
   * - These are appointments that haven't been confirmed or completed yet
   * - Limits to 2 most recent for dashboard overview
   * - Full list available on appointments page
   */
  const upcomingAppointments = appointments
    .filter((apt) => apt.status === "pending") // Only pending appointments
    .slice(0, 2); // Take first 2 results

  // ============================================
  // CALCULATE STATISTICS
  // ============================================

  /**
   * Computes real-time statistics from loaded data
   *
   * METRICS:
   * - totalProjects: Count of all projects
   * - totalAppointments: Count of all appointments
   * - completedThisMonth: Appointments marked complete in current month
   * - pendingAppointments: Count of pending appointments (max 2 shown)
   *
   * NOTE: These numbers update automatically when data reloads
   */
  const stats = {
    // Total number of projects in database
    totalProjects: projects.length,

    // Total number of appointments in database
    totalAppointments: appointments.length,

    // Count appointments completed in current month
    // Filters by: status='completed' AND same month as today
    completedThisMonth: appointments.filter(
      (apt) =>
        apt.status === "completed" &&
        new Date(apt.created_at).getMonth() === new Date().getMonth()
    ).length,

    // Count of pending appointments (limited to 2 for display)
    pendingAppointments: upcomingAppointments.length,
  };

  // ============================================
  // UTILITY FUNCTIONS - Formatting and styling helpers
  // ============================================

  /**
   * Formats date string into readable format
   *
   * INPUT: "2024-05-20T10:30:00Z" (ISO date string)
   * OUTPUT: "May 20, 2024" (human-readable)
   *
   * USAGE: Used for displaying appointment dates in a friendly format
   */
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short", // "May" instead of "05"
      day: "numeric", // "20" instead of "20th"
      year: "numeric", // "2024"
    });
  };

  /**
   * Returns CSS classes for status badge colors
   *
   * PURPOSE: Visual differentiation of project statuses
   *
   * COLOR SCHEME:
   * - Planning: Yellow (project not started yet)
   * - In Progress: Blue (active work happening)
   * - Completed: Green (project finished)
   * - On Hold: Red (project paused/delayed)
   * - Default: Gray (unknown/undefined status)
   */
  const getStatusColor = (status) => {
    switch (status) {
      case "Planning":
        return "bg-yellow-100 text-yellow-800"; // Yellow background with dark yellow text
      case "In Progress":
        return "bg-blue-100 text-blue-800"; // Blue background with dark blue text
      case "Completed":
        return "bg-green-100 text-green-800"; // Green background with dark green text
      case "On Hold":
        return "bg-red-100 text-red-800"; // Red background with dark red text
      default:
        return "bg-gray-100 text-gray-800"; // Gray as fallback
    }
  };

  // ============================================
  // JSX RETURN - The actual UI/HTML structure
  // ============================================
  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50">
      {/* ============================================ */}
      {/* MAIN CONTENT AREA - Dashboard layout */}
      {/* ============================================ */}
      <div className="flex-1 p-8">
        {/* ============================================ */}
        {/* PAGE HEADER - Title and welcome message */}
        {/* ============================================ */}
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-blue-600 bg-clip-text text-transparent">
              Admin Dashboard
            </h1>
            <p className="text-gray-600 mt-2 flex items-center">
              {/* Using &apos; instead of ' to avoid JSX syntax issues */}
              <TrendingUp className="w-4 h-4 mr-2 text-green-500" />
              Welcome back! Here&apos;s what&apos;s happening with Martin
              Painting.
            </p>
          </div>
          <button
            onClick={loadDashboardData}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 font-medium inline-flex items-center shadow-md hover:shadow-lg transition-all"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </button>
        </div>

        {/* ============================================ */}
        {/* STATISTICS CARDS - Key metrics overview */}
        {/* ============================================ */}
        {/*
          LAYOUT:
          - 1 column on mobile
          - 2 columns on medium screens (md:)
          - 4 columns on large screens (lg:)
          - Gap of 6 units between cards
        */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* ============================================ */}
          {/* STAT CARD 1: Total Projects */}
          {/* ============================================ */}
          <div className="bg-gradient-to-br from-blue-50 to-white p-6 rounded-xl shadow-md border border-blue-200 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-600 mb-1">Total Projects</p>
                <p className="text-3xl font-bold text-gray-900">
                  {stats.totalProjects}
                </p>
              </div>
              {/* Icon container with blue background */}
              <div className="p-3 bg-blue-500 rounded-full shadow-lg">
                <FolderOpen className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>

          {/* ============================================ */}
          {/* STAT CARD 2: Total Appointments */}
          {/* ============================================ */}
          <div className="bg-gradient-to-br from-amber-50 to-white p-6 rounded-xl shadow-md border border-amber-200 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-amber-600 mb-1">Total Appointments</p>
                <p className="text-3xl font-bold text-gray-900">
                  {stats.totalAppointments}
                </p>
              </div>
              {/* Icon container with amber background */}
              <div className="p-3 bg-amber-500 rounded-full shadow-lg">
                <Calendar className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>

          {/* ============================================ */}
          {/* STAT CARD 3: Completed This Month */}
          {/* ============================================ */}
          <div className="bg-gradient-to-br from-green-50 to-white p-6 rounded-xl shadow-md border border-green-200 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-600 mb-1">Completed This Month</p>
                <p className="text-3xl font-bold text-gray-900">
                  {stats.completedThisMonth}
                </p>
              </div>
              {/* Icon container with green background */}
              <div className="p-3 bg-green-500 rounded-full shadow-lg">
                <CheckCircle2 className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>

          {/* ============================================ */}
          {/* STAT CARD 4: Pending Appointments */}
          {/* ============================================ */}
          <div className="bg-gradient-to-br from-purple-50 to-white p-6 rounded-xl shadow-md border border-purple-200 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-purple-600 mb-1">Pending Appointments</p>
                <p className="text-3xl font-bold text-gray-900">
                  {stats.pendingAppointments}
                </p>
              </div>
              {/* Icon container with purple background */}
              <div className="p-3 bg-purple-500 rounded-full shadow-lg">
                <Clock className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>
        </div>

        {/* ============================================ */}
        {/* RECENT PROJECTS SECTION */}
        {/* ============================================ */}
        {/*
          STRUCTURE:
          - White card with shadow
          - Header with title and "View All" link
          - List of recent projects with details
          - Progress bars showing completion percentage
          - Empty state if no projects exist
        */}
        <div className="bg-white rounded-xl shadow-lg mb-8 border border-gray-100">
          {/* Section Header */}
          <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-white">
            <div className="flex justify-between items-center">
              <div className="flex items-center">
                <BarChart3 className="w-5 h-5 text-blue-600 mr-2" />
                <h3 className="text-lg font-semibold text-gray-900">
                  Recent Projects
                </h3>
              </div>
              {/* Link to full projects page using Next.js Link component */}
              <Link
                href="/admin/projects"
                className="text-blue-600 hover:text-blue-700 font-medium inline-flex items-center transition-colors"
              >
                View All
                <ArrowRight className="w-4 h-4 ml-1" />
              </Link>
            </div>
          </div>

          {/* Section Content */}
          <div className="p-6">
            {/* ============================================ */}
            {/* LOADING STATE - Shows while fetching data */}
            {/* ============================================ */}
            {loading ? (
              <div className="text-center py-12">
                <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
                <p className="text-gray-500 font-medium">Loading projects...</p>
              </div>
            ) : projects.length > 0 ? (
              // ============================================
              // PROJECTS LIST - Display recent projects
              // ============================================
              <div className="space-y-4">
                {/* Loop through projects array and create card for each */}
                {projects.map((project) => (
                  <div
                    key={project.id}
                    className="border border-gray-200 rounded-lg p-5 hover:shadow-xl transition-all duration-300 hover:border-blue-300 bg-gradient-to-br from-gray-50 to-white"
                  >
                    {/* Project header with name and status badge */}
                    <div className="flex justify-between items-start mb-3">
                      <h4 className="font-semibold text-gray-900 text-lg">
                        {project.name}
                      </h4>
                      {/* Status badge with dynamic color based on project status */}
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold shadow-sm ${getStatusColor(
                          project.status
                        )}`}
                      >
                        {project.status}
                      </span>
                    </div>

                    {/* Project details */}
                    <div className="text-sm text-gray-600 space-y-2">
                      {/* Client name */}
                      <div className="flex items-center">
                        <Users className="w-4 h-4 mr-2 text-gray-400" />
                        <span className="font-medium">Client:</span>
                        <span className="ml-1">{project.client}</span>
                      </div>
                      {/* Project address */}
                      <p>
                        <span className="font-medium">Address:</span>{" "}
                        {project.address}
                      </p>
                      {/* Budget with currency formatting (adds commas) */}
                      <p className="text-green-700 font-semibold">
                        <span className="font-medium text-gray-600">Budget:</span> $
                        {project.budget?.toLocaleString()}
                      </p>

                      {/* ============================================ */}
                      {/* PROGRESS BAR - Visual completion indicator */}
                      {/* ============================================ */}
                      <div className="mt-3">
                        {/* Progress label and percentage */}
                        <div className="flex justify-between text-xs mb-2 font-medium">
                          <span className="text-gray-600">Progress</span>
                          <span className="text-blue-600">{project.progress || 0}%</span>
                        </div>
                        {/* Progress bar container (gray background) */}
                        <div className="w-full bg-gray-200 rounded-full h-2.5 shadow-inner">
                          {/* Filled portion with gradient and dynamic width */}
                          <div
                            className="bg-gradient-to-r from-blue-500 to-blue-600 h-2.5 rounded-full transition-all duration-500 shadow-sm"
                            style={{ width: `${project.progress || 0}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              // ============================================
              // EMPTY STATE - No projects exist yet
              // ============================================
              <div className="text-center py-12">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
                  <FolderOpen className="w-8 h-8 text-blue-600" />
                </div>
                <p className="text-gray-700 font-semibold text-lg mb-2">No projects yet</p>
                <p className="text-gray-500 text-sm mb-4">
                  Projects will appear here once you start adding them
                </p>
                {/* Call-to-action button to add first project */}
                <Link
                  href="/admin/projects"
                  className="inline-flex items-center px-5 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 shadow-md hover:shadow-lg transition-all font-medium"
                >
                  <FolderOpen className="w-4 h-4 mr-2" />
                  Add Your First Project
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* ============================================ */}
        {/* UPCOMING APPOINTMENTS SECTION */}
        {/* ============================================ */}
        {/*
          STRUCTURE:
          - White card with shadow
          - Header with title and "View All" link
          - List of pending appointments (max 2)
          - Customer details and appointment info
          - Empty state if no pending appointments
        */}
        <div className="bg-white rounded-xl shadow-lg mb-8 border border-gray-100">
          {/* Section Header */}
          <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-purple-50 to-white">
            <div className="flex justify-between items-center">
              <div className="flex items-center">
                <Calendar className="w-5 h-5 text-purple-600 mr-2" />
                <h3 className="text-lg font-semibold text-gray-900">
                  Upcoming Appointments
                </h3>
              </div>
              {/* Link to full appointments page */}
              <Link
                href="/admin/appointments"
                className="text-purple-600 hover:text-purple-700 font-medium inline-flex items-center transition-colors"
              >
                View All
                <ArrowRight className="w-4 h-4 ml-1" />
              </Link>
            </div>
          </div>

          {/* Section Content */}
          <div className="p-6">
            {/* ============================================ */}
            {/* LOADING STATE */}
            {/* ============================================ */}
            {loading ? (
              <div className="text-center py-12">
                <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mb-4"></div>
                <p className="text-gray-500 font-medium">Loading appointments...</p>
              </div>
            ) : upcomingAppointments.length > 0 ? (
              // ============================================
              // APPOINTMENTS LIST - Display pending appointments
              // ============================================
              <div className="space-y-4">
                {/* Loop through upcomingAppointments array (max 2 items) */}
                {upcomingAppointments.map((appointment) => (
                  <div
                    key={appointment.id}
                    className="border border-gray-200 rounded-lg p-5 hover:shadow-xl transition-all duration-300 hover:border-purple-300 bg-gradient-to-br from-purple-50 to-white"
                  >
                    <div className="flex items-start justify-between">
                      {/* ============================================ */}
                      {/* LEFT SIDE - Customer info with avatar */}
                      {/* ============================================ */}
                      <div className="flex items-start space-x-4">
                        {/* Avatar circle with user icon */}
                        <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-full flex items-center justify-center shadow-md">
                          <Users className="w-6 h-6 text-white" />
                        </div>

                        {/* Customer details */}
                        <div>
                          {/* Customer name */}
                          <h4 className="font-semibold text-gray-900 text-lg mb-1">
                            {appointment.first_name} {appointment.last_name}
                          </h4>
                          {/* Email address */}
                          <p className="text-sm text-gray-600 mb-1">
                            {appointment.email}
                          </p>
                          {/* Phone number */}
                          <p className="text-sm text-gray-600 mb-2">
                            Phone: {appointment.phone}
                          </p>
                          {/* Property details (type and location) */}
                          <p className="text-sm text-gray-700 font-medium">
                            {appointment.property_type} - {appointment.location_type}
                          </p>
                        </div>
                      </div>

                      {/* ============================================ */}
                      {/* RIGHT SIDE - Appointment date/time and status */}
                      {/* ============================================ */}
                      <div className="text-right">
                        {/* Formatted appointment date (e.g., "May 20, 2024") */}
                        <p className="text-sm font-semibold text-gray-900 mb-1">
                          {formatDate(appointment.appointment_date)}
                        </p>
                        {/* Appointment time (e.g., "10:00 AM") */}
                        <p className="text-sm text-gray-600 mb-3">
                          {appointment.appointment_time}
                        </p>
                        {/* Status badge (pending = amber) */}
                        <span className="inline-block px-3 py-1.5 bg-gradient-to-r from-amber-100 to-amber-200 text-amber-800 text-xs font-semibold rounded-full shadow-sm">
                          {appointment.status}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              // ============================================
              // EMPTY STATE - No upcoming appointments
              // ============================================
              <div className="text-center py-12">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-purple-100 rounded-full mb-4">
                  <Calendar className="w-8 h-8 text-purple-600" />
                </div>
                <p className="text-gray-700 font-semibold text-lg mb-2">
                  No upcoming appointments
                </p>
                <p className="text-gray-500 text-sm">
                  New appointments will appear here
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
