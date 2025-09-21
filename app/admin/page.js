import Link from 'next/link'
/**
 * Admin Dashboard - Main Overview Page
 * 
 * This is the central hub for managing Martin Painting business operations.
 * Shows key metrics, recent activity, and provides quick access to common tasks.
 * All data starts at zero and will populate as real projects/quotes are added.
 */
export default function AdminDashboard() {
  

  
  // currently zero because there is nothing connected to database

  // In production, these would be calculated from database queries
  const stats = {
    totalProjects: 0,
    pendingQuotes: 0, 
    completedThisMonth: 0,
    revenue: '$0'
  };

  // Recent activity empty until real data is added
  // These will show the latest projects, quotes, and appointments
  const recentProjects = [];
  const pendingQuotes = [];
  const upcomingAppointments = [];

  

  return (
    <div className="flex flex-col min-h-screen bg-white">
      

        {/* Main content area with dashboard widgets */}
        <div className="flex-1 p-8 bg-gray-50">
          
          {/* Page title and welcome message */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
            <p className="text-gray-600">Welcome back! Here&apos;s what&apos;s happening with Martin Painting.</p>
          </div>

          {/* Few important areas in admin dashboard */}
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

            {/* Pending Quotes panel no current data on display*/}
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="p-2 bg-yellow-100 rounded-lg">
                  <svg className="w-6 h-6 text-yellow-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd"/>
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-2xl font-bold text-gray-900">{stats.pendingQuotes}</p>
                  <p className="text-gray-600">Pending Quotes</p>
                </div>
              </div>
            </div>

            {/* Monthly Completed panel  no current data on display */}
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

            {/* Revenue panel  no current data on display*/}
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="p-2 bg-[#74A744] bg-opacity-20 rounded-lg">
                  <svg className="w-6 h-6 text-[#74A744]" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z"/>
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z" clipRule="evenodd"/>
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-2xl font-bold text-gray-900">{stats.revenue}</p>
                  <p className="text-gray-600">Monthly Revenue</p>
                </div>
              </div>
            </div>
          </div>

          {/* Two-column layout showing recent activity summaries */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            
            {/* Recent Projects Panel   no current data on display*/}
            <div className="bg-white rounded-lg shadow">
              <div className="p-6 border-b border-gray-200">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-semibold text-gray-900">Recent Projects</h3>
                  <Link href="/admin/projects" className="text-[#74A744] hover:text-[#5F9136] font-medium">
                    View All
                  </Link>
                </div>
              </div>
              <div className="p-6">
                {/* Show projects if any exist, otherwise show empty/null stats */}
                {recentProjects.length > 0 ? (
                  <div className="space-y-4">
                    {recentProjects.map(function(project) {
                      return (
                        <div key={project.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                          <div>
                            <p className="font-medium text-gray-900">{project.name}</p>
                            <p className="text-sm text-gray-600">{project.date}</p>
                          </div>
                          <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                            project.status === 'Completed' ? 'bg-green-100 text-green-800' :
                            project.status === 'In Progress' ? 'bg-blue-100 text-blue-800' :
                            'bg-yellow-100 text-yellow-800'
                          }`}>
                            {project.status}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  /* Empty stat with call-to-action */
                  <div className="text-center py-8">
                    <svg className="w-12 h-12 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                    </svg>
                    <p className="text-gray-500 font-medium">No projects yet</p>
                    <p className="text-gray-400 text-sm">Projects will appear here once you start adding them</p>
                    <Link href="/admin/projects/add" className="inline-block mt-3 px-4 py-2 bg-[#74A744] text-white rounded-lg hover:bg-[#5F9136] text-sm">
                      Add Your First Project
                    </Link>
                  </div>
                )}
              </div>
            </div>

            {/* Pending Quotes Panel */}
            <div className="bg-white rounded-lg shadow">
              <div className="p-6 border-b border-gray-200">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-semibold text-gray-900">Pending Quotes</h3>
                  <Link href="/admin/quotes" className="text-[#74A744] hover:text-[#5F9136] font-medium">
                    View All
                  </Link>
                </div>
              </div>
              <div className="p-6">
                {pendingQuotes.length > 0 ? (
                  <div className="space-y-4">
                    {pendingQuotes.map(function(quote) {
                      return (
                        <div key={quote.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                          <div>
                            <p className="font-medium text-gray-900">{quote.customer}</p>
                            <p className="text-sm text-gray-600">{quote.service}</p>
                            <p className="text-xs text-gray-500">{quote.date}</p>
                          </div>
                          <div className="text-right">
                            <p className="font-bold text-[#74A744]">{quote.amount}</p>
                            <button className="text-sm text-blue-600 hover:text-blue-800">
                              Respond
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <svg className="w-12 h-12 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <p className="text-gray-500 font-medium">No quote requests</p>
                    <p className="text-gray-400 text-sm">Customer quote requests will appear here</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Upcoming Appointments Section */}
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
              {upcomingAppointments.length > 0 ? (
                <div className="space-y-4">
                  {upcomingAppointments.map(function(appointment) {
                    return (
                      <div key={appointment.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                        <div>
                          <p className="font-medium text-gray-900">{appointment.customer}</p>
                          <p className="text-sm text-gray-600">{appointment.service}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-medium text-gray-900">{appointment.date}</p>
                          <p className="text-sm text-[#74A744]">{appointment.time}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-8">
                  <svg className="w-12 h-12 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3a4 4 0 118 0v4m-4 6v6m1-10V4a1 1 0 00-1-1H9a1 1 0 00-1 1v3M6 7h8" />
                  </svg>
                  <p className="text-gray-500 font-medium">No appointments scheduled</p>
                  <p className="text-gray-400 text-sm">Upcoming appointments will appear here</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
  );
}