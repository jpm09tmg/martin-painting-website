'use client'

import React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, Calendar, FileText, DollarSign, Settings } from 'lucide-react'

export default function Sidebar() {
  const pathname = usePathname()

  const isDashboardActive = pathname === '/admin'
  const isAppointmentsActive = pathname.startsWith('/admin/appointments')
  const isProjectsActive = pathname.startsWith('/admin/projects')
  const isPaymentsActive = pathname.startsWith('/admin/payments')
  const isSettingsActive = pathname.startsWith('/admin/settings')

  return (
    <aside className="w-[250px] bg-[#547d32] min-h-screen sticky top-0">
      <nav className="p-4 space-y-2">
        {/* Dashboard */}
        <Link href="/admin" 
          className={`flex items-center space-x-3 px-4 py-3 text-white rounded-lg transition-colors hover:bg-white/10 ${isDashboardActive ? 'bg-[#3F652B]' : ''}`}>
          <Home className="w-5 h-5 text-white" />
          <span>Dashboard</span>
        </Link>

        {/* Appointments */}
        <Link href="/admin/appointments" 
          className={`flex items-center space-x-3 px-4 py-3 text-white rounded-lg transition-colors hover:bg-white/10 ${isAppointmentsActive ? 'bg-[#3F652B]' : ''}`}>
          <Calendar className="w-5 h-5 text-white" />
          <span>Appointments</span>
        </Link>

        {/* Projects / Quotes */}
        <Link href="/admin/projects" 
          className={`flex items-center space-x-3 px-4 py-3 text-white rounded-lg transition-colors hover:bg-white/10 ${isProjectsActive ? 'bg-[#3F652B]' : ''}`}>
          <FileText className="w-5 h-5 text-white" />
          <span>Projects / Quotes</span>
        </Link>

        {/* Payments */}
        <Link href="/admin/payments" 
          className={`flex items-center space-x-3 px-4 py-3 text-white rounded-lg transition-colors hover:bg-white/10 ${isPaymentsActive ? 'bg-[#3F652B]' : ''}`}>
          <DollarSign className="w-5 h-5 text-white" />
          <span>Payments</span>
        </Link>

        {/* Settings */}
        <Link href="/admin/settings" 
          className={`flex items-center space-x-3 px-4 py-3 text-white rounded-lg transition-colors hover:bg-white/10 ${isSettingsActive ? 'bg-[#3F652B]' : ''}`}>
          <Settings className="w-5 h-5 text-white" />
          <span>Settings</span>
        </Link>
      </nav>
    </aside>
  )
}
