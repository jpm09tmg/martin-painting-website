"use client"; // Tells Next.js this component runs on the client side (browser)

// ============================================
// IMPORTS - React hooks, routing, and database client
// ============================================
import { useState, useEffect } from "react";
import Link from "next/link"; // Next.js Link component for client-side navigation
import { supabase } from "../../lib/supabase-client";

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
          .from("appointments")                          // Select from appointments table
          .select("*")                                   // Get all columns
          .order("created_at", { ascending: false })     // Sort by creation date (newest first)
          .limit(10);                                    // Only get 10 most recent

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
        .from("projects")                            // Select from projects table
        .select("*")                                 // Get all columns
        .order("created_at", { ascending: false })   // Sort by creation date (newest first)
        .limit(5);                                   // Only get 5 most recent

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
    .filter((apt) => apt.status === "pending")  // Only pending appointments
    .slice(0, 2);                                // Take first 2 results

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
      month: "short",  // "May" instead of "05"
      day: "numeric",  // "20" instead of "20th"
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
        return "bg-yellow-100 text-yellow-800";   // Yellow background with dark yellow text
      case "In Progress":
        return "bg-blue-100 text-blue-800";       // Blue background with dark blue text
      case "Completed":
        return "bg-green-100 text-green-800";     // Green background with dark green text
      case "On Hold":
        return "bg-red-100 text-red-800";         // Red background with dark red text
      default:
        return "bg-gray-100 text-gray-800";       // Gray as fallback
    }
  };

  // ============================================
  // JSX RETURN - The actual UI/HTML structure
  // ============================================
  return (
    <div className="flex flex-col min-h-screen bg-white">
      
      {/* ============================================ */}
      {/* MAIN CONTENT AREA - Dashboard layout */}
      {/* ============================================ */}
      <div className="flex-1 p-8 bg-gray-50">
        
        {/* ============================================ */}
        {/* PAGE HEADER - Title and welcome message */}
        {/* ============================================ */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-600">
            {/* Using &apos; instead of ' to avoid JSX syntax issues */}
            Welcome back! Here&apos;s what&apos;s happening with Martin Painting.
          </p>
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
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              {/* Icon container with blue background */}
              <div className="p-2 bg-blue-100 rounded-lg">
                {/* Shopping cart SVG icon (represents projects/orders) */}
                <svg
                  className="w-6 h-6 text-blue-600"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M4 3a1 1 0 000 2h1.22l.305 1.222a.997.997 0 00.01.042l1.358 5.43-.893.892C3.74 12.846 4.632 15 6.414 15H15a1 1 0 000-2H6.414l1-1H14a1 1 0 00.894-.553l3-6A1 1 0 0017 5H6.28l-.31-1.243A1 1 0 005 3H4zM16 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM6.5 18a1.5 1.5 0 100-3 1.5 1.5 0 000 3z" />
                </svg>
              </div>
              {/* Stat value and label */}
              <div className="ml-4">
                <p className="text-2xl font-bold text-gray-900">
                  {stats.totalProjects}
                </p>
                <p className="text-gray-600">Total Projects</p>
              </div>
            </div>
          </div>

          {/* ============================================ */}
          {/* STAT CARD 2: Total Appointments */}
          {/* ============================================ */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              {/* Icon container with yellow background */}
              <div className="p-2 bg-yellow-100 rounded-lg">
                {/* Calendar SVG icon (represents scheduled appointments) */}
                <svg
                  className="w-6 h-6 text-yellow-600"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              {/* Stat value and label */}
              <div className="ml-4">
                <p className="text-2xl font-bold text-gray-900">
                  {stats.totalAppointments}
                </p>
                <p className="text-gray-600">Total Appointments</p>
              </div>
            </div>
          </div>

          {/* ============================================ */}
          {/* STAT CARD 3: Completed This Month */}
          {/* ============================================ */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              {/* Icon container with green background */}
              <div className="p-2 bg-green-100 rounded-lg">
                {/* Checkmark SVG icon (represents completion) */}
                <svg
                  className="w-6 h-6 text-green-600"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              {/* Stat value and label */}
              <div className="ml-4">
                <p className="text-2xl font-bold text-gray-900">
                  {stats.completedThisMonth}
                </p>
                <p className="text-gray-600">Completed This Month</p>
              </div>
            </div>
          </div>

          {/* ============================================ */}
          {/* STAT CARD 4: Pending Appointments */}
          {/* ============================================ */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              {/* Icon container with brand green background */}
              <div className="p-2 bg-[#74A744] bg-opacity-20 rounded-lg">
                {/* Clock SVG icon (represents pending/waiting) */}
                <svg
                  className="w-6 h-6 text-[#74A744]"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              {/* Stat value and label */}
              <div className="ml-4">
                <p className="text-2xl font-bold text-gray-900">
                  {stats.pendingAppointments}
                </p>
                <p className="text-gray-600">Pending Appointments</p>
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
        <div className="bg-white rounded-lg shadow mb-8">
          
          {/* Section Header */}
          <div className="p-6 border-b border-gray-200">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold text-gray-900">
                Recent Projects
              </h3>
              {/* Link to full projects page using Next.js Link component */}
              <Link
                href="/admin/projects"
                className="text-[#74A744] hover:text-[#5F9136] font-medium"
              >
                View All
              </Link>
            </div>
          </div>
          
          {/* Section Content */}
          <div className="p-6">
            {/* ============================================ */}
            {/* LOADING STATE - Shows while fetching data */}
            {/* ============================================ */}
            {loading ? (
              <div className="text-center py-8">
                <p className="text-gray-500">Loading projects...</p>
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
                    className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                  >
                    {/* Project header with name and status badge */}
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-semibold text-gray-900">
                        {project.name}
                      </h4>
                      {/* Status badge with dynamic color based on project status */}
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                          project.status
                        )}`}
                      >
                        {project.status}
                      </span>
                    </div>
                    
                    {/* Project details */}
                    <div className="text-sm text-gray-600 space-y-1">
                      {/* Client name */}
                      <p>
                        <span className="font-medium">Client:</span>{" "}
                        {project.client}
                      </p>
                      {/* Project address */}
                      <p>
                        <span className="font-medium">Address:</span>{" "}
                        {project.address}
                      </p>
                      {/* Budget with currency formatting (adds commas) */}
                      <p>
                        <span className="font-medium">Budget:</span> $
                        {project.budget?.toLocaleString()}
                      </p>
                      
                      {/* ============================================ */}
                      {/* PROGRESS BAR - Visual completion indicator */}
                      {/* ============================================ */}
                      <div className="mt-2">
                        {/* Progress label and percentage */}
                        <div className="flex justify-between text-xs mb-1">
                          <span>Progress</span>
                          <span>{project.progress || 0}%</span>
                        </div>
                        {/* Progress bar container (gray background) */}
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          {/* Filled portion (brand green) with dynamic width */}
                          <div
                            className="bg-[#74A744] h-2 rounded-full transition-all"
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
              <div className="text-center py-8">
                {/* Briefcase/folder icon */}
                <svg
                  className="w-12 h-12 text-gray-400 mx-auto mb-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                  />
                </svg>
                <p className="text-gray-500 font-medium">No projects yet</p>
                <p className="text-gray-400 text-sm">
                  Projects will appear here once you start adding them
                </p>
                {/* Call-to-action button to add first project */}
                <Link
                  href="/admin/projects"
                  className="inline-block mt-3 px-4 py-2 bg-[#74A744] text-white rounded-lg hover:bg-[#5F9136] text-sm"
                >
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
        <div className="bg-white rounded-lg shadow mb-8">
          
          {/* Section Header */}
          <div className="p-6 border-b border-gray-200">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold text-gray-900">
                Upcoming Appointments
              </h3>
              {/* Link to full appointments page */}
              <Link
                href="/admin/appointments"
                className="text-[#74A744] hover:text-[#5F9136] font-medium"
              >
                View All
              </Link>
            </div>
          </div>
          
          {/* Section Content */}
          <div className="p-6">
            {/* ============================================ */}
            {/* LOADING STATE */}
            {/* ============================================ */}
            {loading ? (
              <div className="text-center py-8">
                <p className="text-gray-500">Loading appointments...</p>
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
                    className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start justify-between">
                      
                      {/* ============================================ */}
                      {/* LEFT SIDE - Customer info with avatar */}
                      {/* ============================================ */}
                      <div className="flex items-start space-x-3">
                        {/* Avatar circle with user icon */}
                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                          {/* User profile SVG icon */}
                          <svg
                            className="w-5 h-5 text-blue-600"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path
                              fillRule="evenodd"
                              d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
                              clipRule="evenodd"
                            />
                          </svg>
                        </div>
                        
                        {/* Customer details */}
                        <div>
                          {/* Customer name */}
                          <h4 className="font-semibold text-gray-900">
                            {appointment.first_name} {appointment.last_name}
                          </h4>
                          {/* Email address */}
                          <p className="text-sm text-gray-600">
                            {appointment.email}
                          </p>
                          {/* Phone number */}
                          <p className="text-sm text-gray-600">
                            Phone: {appointment.phone}
                          </p>
                          {/* Property details (type and location) */}
                          <p className="text-sm text-gray-600 mt-1">
                            {appointment.property_type} -{" "}
                            {appointment.location_type}
                          </p>
                        </div>
                      </div>
                      
                      {/* ============================================ */}
                      {/* RIGHT SIDE - Appointment date/time and status */}
                      {/* ============================================ */}
                      <div className="text-right">
                        {/* Formatted appointment date (e.g., "May 20, 2024") */}
                        <p className="text-sm font-medium text-gray-900">
                          {formatDate(appointment.appointment_date)}
                        </p>
                        {/* Appointment time (e.g., "10:00 AM") */}
                        <p className="text-sm text-gray-600">
                          {appointment.appointment_time}
                        </p>
                        {/* Status badge (pending = yellow) */}
                        <span className="inline-block mt-2 px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full">
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
              <div className="text-center py-8">
                {/* Calendar icon */}
                <svg
                  className="w-12 h-12 text-gray-400 mx-auto mb-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
                <p className="text-gray-500 font-medium">
                  No upcoming appointments
                </p>
                <p className="text-gray-400 text-sm">
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