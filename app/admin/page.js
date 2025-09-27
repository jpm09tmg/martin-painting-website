'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { supabase } from '../../lib/supabase-client'

/**
 * Admin Dashboard - Main Overview Page
 * 
 * This is the central hub for managing Martin Painting business operations.
 * Shows key metrics, recent activity, and provides quick access to common tasks.
 * Connected to appointments database only (quotes removed for debugging).
 */
export default function AdminDashboard() {
  const [appointments, setAppointments] = useState([])
  const [loading, setLoading] = useState(true)

  // Load data on component mount
  useEffect(() => {
    loadDashboardData()
  }, [])

  const loadDashboardData = async () => {
    try {
      const { data: appointmentsData, error: appointmentsError } = await supabase
        .from('appointments')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10)

      console.log('Appointments data:', appointmentsData)
      console.log('Appointments error:', appointmentsError)

      if (appointmentsError) {
        console.error('Appointments error:', appointmentsError)
        setAppointments([])
      } else {
        setAppointments(appointmentsData || [])
      }

    } catch (err) {
      console.error('Error loading dashboard data:', err)
      setAppointments([])
    } finally {
      setLoading(false)
    }
  }

  // Filter upcoming appointments (pending status)
  const upcomingAppointments = appointments
    .filter(apt => apt.status === 'pending')
    .slice(0, 2) // Show only latest 2

  // Calculate stats from real data (appointments only)
  const stats = {
    totalProjects: 0, // Still not connected to projects database
    pendingQuotes: 0, // Removed quotes query
    completedThisMonth: appointments.filter(apt => 
      apt.status === 'completed' && 
      new Date(apt.created_at).getMonth() === new Date().getMonth()
    ).length,
    revenue: '$0' // Still needs revenue calculation
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  }

  return (
    <div className="flex flex-col min-h-screen bg-white">
      {/* Main content area with dashboard widgets */}
      <div className="flex-1 p-8 bg-gray-50">
        
        {/* Page title and welcome message */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-600">Welcome back! Here&apos;s what&apos;s happening with Martin Painting.</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          
          {/* Total Projects panel */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <svg className="w-6 h-6 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M4 3a1 1 0 000 2h1.22l.305 1.222a.997.997 0 00.01.042l1.358 5.43-.893.892C3.74 12.846 4.632 15 6.414 15H15a1 1 0 000-2H6.414l1-1H14a1 1 0 00.894-.553l3-6A1 1 0 0017 5H6.28l-.31-1.243A1 1 0 005 3H4zM16 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM6.5 18a1.5 1.5 0 100-3 1.5 1.5 0 000 3z"/>
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-2xl font-bold text-gray-900">{stats.totalProjects}</p>
                <p className="text-gray-600">Total Projects</p>
              </div>
            </div>
          </div>

          {/* Total Appointments panel */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <svg className="w-6 h-6 text-yellow-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd"/>
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-2xl font-bold text-gray-900">{appointments.length}</p>
                <p className="text-gray-600">Total Appointments</p>
              </div>
            </div>
          </div>

          {/* Monthly Completed panel */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
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

          {/* Pending Appointments panel */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-[#74A744] bg-opacity-20 rounded-lg">
                <svg className="w-6 h-6 text-[#74A744]" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd"/>
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-2xl font-bold text-gray-900">{upcomingAppointments.length}</p>
                <p className="text-gray-600">Pending Appointments</p>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Projects Section */}
        <div className="bg-white rounded-lg shadow mb-8">
          <div className="p-6 border-b border-gray-200">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold text-gray-900">Recent Projects</h3>
              <Link href="/admin/projects" className="text-[#74A744] hover:text-[#5F9136] font-medium">
                View All
              </Link>
            </div>
          </div>
          <div className="p-6">
            <div className="text-center py-8">
              <svg className="w-12 h-12 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
              <p className="text-gray-500 font-medium">No projects yet</p>
              <p className="text-gray-400 text-sm">Projects will appear here once you start adding them</p>
              <Link href="/admin/projects" className="inline-block mt-3 px-4 py-2 bg-[#74A744] text-white rounded-lg hover:bg-[#5F9136] text-sm">
                Add Your First Project
              </Link>
            </div>
          </div>
        </div>

        {/* Upcoming Appointments Section - shows real data */}
        <div className="bg-white rounded-lg shadow mb-8">
          <div className="p-6 border-b border-gray-200">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold text-gray-900">Upcoming Appointments</h3>
              <Link href="/admin/appointments" className="text-[#74A744] hover:text-[#5F9136] font-medium">
                View All
              </Link>
            </div>
          </div>
          <div className="p-6">
            {loading ? (
              <div className="text-center py-8">
                <p className="text-gray-500">Loading appointments...</p>
              </div>
            ) : upcomingAppointments.length > 0 ? (
              <div className="space-y-4">
                {upcomingAppointments.map((appointment) => (
                  <div key={appointment.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mr-4">
                        <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{appointment.first_name} {appointment.last_name}</p>
                        <p className="text-sm text-gray-600">{appointment.email}</p>
                        <p className="text-xs text-gray-500">Phone: {appointment.phone}</p>
                        <p className="text-xs text-gray-500">{appointment.property_type} - {appointment.location_type}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-gray-900">{appointment.appointment_date}</p>
                      <p className="text-sm text-[#74A744]">{appointment.appointment_time}</p>
                      <span className="inline-block mt-1 px-2 py-1 bg-yellow-100 text-yellow-800 text-xs font-medium rounded-full">
                        {appointment.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <svg className="w-12 h-12 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3a4 4 0 118 0v4m-4 6v6m1-10V4a1 1 0 00-1-1H9a1 1 0 00-1 1v3M6 7h8" />
                </svg>
                <p className="text-gray-500 font-medium">No pending appointments</p>
                <p className="text-gray-400 text-sm">Pending appointments will appear here</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}