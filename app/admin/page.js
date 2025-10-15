'use client' // Next.js App Router directive for client-side rendering
import { useState, useEffect } from 'react' // React hooks for state and side effects
import Link from 'next/link' // Next.js optimized navigation component
import { supabase } from '../../lib/supabase-client' // Supabase client for database operations

/**
 * Admin Dashboard - Main Overview Page
 * 
 * This is the central hub for managing Martin Painting business operations.
 * Shows key metrics, recent activity, and provides quick access to common tasks.
 * Connected to both appointments and projects databases.
 */
export default function AdminDashboard() {
  // State to store fetched appointments from database
  const [appointments, setAppointments] = useState([])
  // State to store fetched projects from database
  const [projects, setProjects] = useState([])
  // Loading state to show/hide loading indicators
  const [loading, setLoading] = useState(true)

  // Load data on component mount - runs once after first render
  useEffect(() => {
    loadDashboardData()
  }, []) // Empty dependency array = run only once

  // Async function to fetch data from Supabase
  const loadDashboardData = async () => {
    try {
      // Fetch appointments: get all columns, newest first, limit to 10
      const { data: appointmentsData, error: appointmentsError } = await supabase
        .from('appointments') // Target the appointments table
        .select('*') // Select all columns
        .order('created_at', { ascending: false }) // Sort by newest first
        .limit(10) // Only get latest 10 records

      // Handle any errors from appointments query
      if (appointmentsError) {
        console.error('Appointments error:', appointmentsError)
        setAppointments([]) // Set empty array on error
      } else {
        setAppointments(appointmentsData || []) // Set data or empty array if null
      }

      // Fetch projects: get all columns, newest first, limit to 5
      const { data: projectsData, error: projectsError } = await supabase
        .from('projects') // Target the projects table
        .select('*') // Select all columns
        .order('created_at', { ascending: false }) // Sort by newest first
        .limit(5) // Only get latest 5 records

      // Handle any errors from projects query
      if (projectsError) {
        console.error('Projects error:', projectsError)
        setProjects([]) // Set empty array on error
      } else {
        setProjects(projectsData || []) // Set data or empty array if null
      }

    } catch (err) {
      // Catch any unexpected errors (network issues, etc.)
      console.error('Error loading dashboard data:', err)
      setAppointments([]) // Reset to empty state
      setProjects([]) // Reset to empty state
    } finally {
      // Always run this block - stop loading spinner
      setLoading(false)
    }
  }

  // Filter appointments to show only pending ones, then take first 2
  const upcomingAppointments = appointments
    .filter(apt => apt.status === 'pending') // Only pending status
    .slice(0, 2) // Show only latest 2

  // Calculate dashboard statistics from loaded data
  const stats = {
    totalProjects: projects.length, // Count of loaded projects (max 5)
    totalAppointments: appointments.length, // Count of loaded appointments (max 10)
    // Count appointments completed in current month
    completedThisMonth: appointments.filter(apt => 
      apt.status === 'completed' && // Must be completed status
      new Date(apt.created_at).getMonth() === new Date().getMonth() // Same month as today
    ).length,
    pendingAppointments: upcomingAppointments.length // Count of filtered pending appointments
  }

  // Helper function to format date strings into readable format
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short', // "Jan", "Feb", etc.
      day: 'numeric', // 1, 2, 3, etc.
      year: 'numeric' // 2025
    })
  }

  // Helper function to return Tailwind CSS classes based on status
  const getStatusColor = (status) => {
    switch (status) {
      case 'Planning': return 'bg-yellow-100 text-yellow-800' // Yellow for planning
      case 'In Progress': return 'bg-blue-100 text-blue-800' // Blue for in progress
      case 'Completed': return 'bg-green-100 text-green-800' // Green for completed
      case 'On Hold': return 'bg-red-100 text-red-800' // Red for on hold
      default: return 'bg-gray-100 text-gray-800' // Gray for unknown status
    }
  }

  return (
    // Main container: flex column, full height, white background
    <div className="flex flex-col min-h-screen bg-white">
      {/* Content area: grows to fill space, padding, light gray background */}
      <div className="flex-1 p-8 bg-gray-50">
        
        {/* Header section with title and subtitle */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          {/* Note: Using &apos; instead of apostrophe for HTML entity */}
          <p className="text-gray-600">Welcome back! Here&apos;s what&apos;s happening with Martin Painting.</p>
        </div>

        {/* Stats Cards Grid: 1 col mobile, 2 cols tablet, 4 cols desktop */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          
          {/* Stat Card 1: Total Projects */}
          <div className="bg-white rounded-lg shadow p-6">
            {/* Horizontal flex layout for icon and content */}
            <div className="flex items-center">
              {/* Icon container with blue background */}
              <div className="p-2 bg-blue-100 rounded-lg">
                {/* Shopping cart SVG icon */}
                <svg className="w-6 h-6 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M4 3a1 1 0 000 2h1.22l.305 1.222a.997.997 0 00.01.042l1.358 5.43-.893.892C3.74 12.846 4.632 15 6.414 15H15a1 1 0 000-2H6.414l1-1H14a1 1 0 00.894-.553l3-6A1 1 0 0017 5H6.28l-.31-1.243A1 1 0 005 3H4zM16 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM6.5 18a1.5 1.5 0 100-3 1.5 1.5 0 000 3z"/>
                </svg>
              </div>
              {/* Text content area */}
              <div className="ml-4">
                {/* Large number display */}
                <p className="text-2xl font-bold text-gray-900">{stats.totalProjects}</p>
                {/* Label text */}
                <p className="text-gray-600">Total Projects</p>
              </div>
            </div>
          </div>

          {/* Stat Card 2: Total Appointments */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              {/* Icon container with yellow background */}
              <div className="p-2 bg-yellow-100 rounded-lg">
                {/* Calendar SVG icon */}
                <svg className="w-6 h-6 text-yellow-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd"/>
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-2xl font-bold text-gray-900">{stats.totalAppointments}</p>
                <p className="text-gray-600">Total Appointments</p>
              </div>
            </div>
          </div>

          {/* Stat Card 3: Completed This Month */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              {/* Icon container with green background */}
              <div className="p-2 bg-green-100 rounded-lg">
                {/* Checkmark SVG icon */}
                <svg className="w-6 h-6 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-2xl font-bold text-gray-900">{stats.completedThisMonth}</p>
                <p className="text-gray-600">Completed This Month</p>
              </div>
            </div>
          </div>

          {/* Stat Card 4: Pending Appointments */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              {/* Icon container with brand green color at 20% opacity */}
              <div className="p-2 bg-[#74A744] bg-opacity-20 rounded-lg">
                {/* Clock SVG icon in brand green */}
                <svg className="w-6 h-6 text-[#74A744]" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd"/>
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-2xl font-bold text-gray-900">{stats.pendingAppointments}</p>
                <p className="text-gray-600">Pending Appointments</p>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Projects Section */}
        <div className="bg-white rounded-lg shadow mb-8">
          {/* Section header with border bottom */}
          <div className="p-6 border-b border-gray-200">
            {/* Flex container for title and link */}
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold text-gray-900">Recent Projects</h3>
              {/* Link to full projects page in brand green */}
              <Link href="/admin/projects" className="text-[#74A744] hover:text-[#5F9136] font-medium">
                View All
              </Link>
            </div>
          </div>
          {/* Projects content area */}
          <div className="p-6">
            {/* Conditional rendering based on loading state */}
            {loading ? (
              // Loading state: centered message
              <div className="text-center py-8">
                <p className="text-gray-500">Loading projects...</p>
              </div>
            ) : projects.length > 0 ? (
              // Projects exist: map through and display cards
              <div className="space-y-4"> {/* Vertical spacing between cards */}
                {projects.map((project) => (
                  // Individual project card with hover effect
                  <div key={project.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                    {/* Header row: project name and status badge */}
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-semibold text-gray-900">{project.name}</h4>
                      {/* Status badge with dynamic color based on status */}
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(project.status)}`}>
                        {project.status}
                      </span>
                    </div>
                    {/* Project details section */}
                    <div className="text-sm text-gray-600 space-y-1">
                      {/* Client name */}
                      <p><span className="font-medium">Client:</span> {project.client}</p>
                      {/* Project address */}
                      <p><span className="font-medium">Address:</span> {project.address}</p>
                      {/* Budget with thousand separators, optional chaining for safety */}
                      <p><span className="font-medium">Budget:</span> ${project.budget?.toLocaleString()}</p>
                      {/* Progress bar section */}
                      <div className="mt-2">
                        {/* Progress label and percentage */}
                        <div className="flex justify-between text-xs mb-1">
                          <span>Progress</span>
                          {/* Default to 0% if progress is null/undefined */}
                          <span>{project.progress || 0}%</span>
                        </div>
                        {/* Progress bar container (gray background) */}
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          {/* Filled portion in brand green, width based on progress */}
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
              // Empty state: no projects available
              <div className="text-center py-8">
                {/* Empty state icon */}
                <svg className="w-12 h-12 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
                {/* Empty state message */}
                <p className="text-gray-500 font-medium">No projects yet</p>
                <p className="text-gray-400 text-sm">Projects will appear here once you start adding them</p>
                {/* CTA button to add first project */}
                <Link href="/admin/projects" className="inline-block mt-3 px-4 py-2 bg-[#74A744] text-white rounded-lg hover:bg-[#5F9136] text-sm">
                  Add Your First Project
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Upcoming Appointments Section */}
        <div className="bg-white rounded-lg shadow mb-8">
          {/* Section header (same structure as projects) */}
          <div className="p-6 border-b border-gray-200">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold text-gray-900">Upcoming Appointments</h3>
              {/* Link to full appointments page */}
              <Link href="/admin/appointments" className="text-[#74A744] hover:text-[#5F9136] font-medium">
                View All
              </Link>
            </div>
          </div>
          {/* Appointments content area */}
          <div className="p-6">
            {loading ? (
              // Loading state
              <div className="text-center py-8">
                <p className="text-gray-500">Loading appointments...</p>
              </div>
            ) : upcomingAppointments.length > 0 ? (
              // Appointments exist: display cards
              <div className="space-y-4">
                {upcomingAppointments.map((appointment) => (
                  // Individual appointment card
                  <div key={appointment.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                    {/* Flex container: left side (avatar + info) and right side (date/time) */}
                    <div className="flex items-start justify-between">
                      {/* Left side: avatar and customer details */}
                      <div className="flex items-start space-x-3">
                        {/* User avatar circle with icon */}
                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                          {/* User icon SVG */}
                          <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd"/>
                          </svg>
                        </div>
                        {/* Customer information */}
                        <div>
                          {/* Full name */}
                          <h4 className="font-semibold text-gray-900">{appointment.first_name} {appointment.last_name}</h4>
                          {/* Email address */}
                          <p className="text-sm text-gray-600">{appointment.email}</p>
                          {/* Phone number */}
                          <p className="text-sm text-gray-600">Phone: {appointment.phone}</p>
                          {/* Property and location type */}
                          <p className="text-sm text-gray-600 mt-1">{appointment.property_type} - {appointment.location_type}</p>
                        </div>
                      </div>
                      {/* Right side: appointment date, time, and status */}
                      <div className="text-right">
                        {/* Formatted date */}
                        <p className="text-sm font-medium text-gray-900">{formatDate(appointment.appointment_date)}</p>
                        {/* Time */}
                        <p className="text-sm text-gray-600">{appointment.appointment_time}</p>
                        {/* Status badge in yellow (pending appointments) */}
                        <span className="inline-block mt-2 px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full">
                          {appointment.status}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              // Empty state: no upcoming appointments
              <div className="text-center py-8">
                {/* Calendar icon */}
                <svg className="w-12 h-12 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                {/* Empty state message (no CTA since appointments come from customer bookings) */}
                <p className="text-gray-500 font-medium">No upcoming appointments</p>
                <p className="text-gray-400 text-sm">New appointments will appear here</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}