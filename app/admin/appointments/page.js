/**
 * Appointments Management Page
 * 
 * This page helps manage all customer appointments for Martin Painting.
 * Customers can schedule consultations, assessments, and other meetings through the main website.
 * The admin can view upcoming appointments, track completion status, and schedule new meetings.
 * Right now it shows zero appointments because none have been scheduled yet.
 */
export default function AppointmentsPage() {
  
  /*
   * Appointments Data Setup
   * 
   * This empty array will store all scheduled appointments when customers book meetings.
   * In a real system, this data would come from a database and include customer details,
   * appointment types like consultations or color selection meetings, and scheduling info.
   * Each appointment would have status tracking from scheduled to completed.
   */
  const appointments = [];

  return (
    <div className="flex flex-col min-h-screen bg-white">

        {/* 
         * Main Content Area
         * 
         * This section contains all the appointment management functionality.
         * It uses a light gray background to create visual separation from the sidebar
         * and includes padding for comfortable viewing and interaction.
         */}
        <div className="flex-1 p-8 bg-gray-50">
          
          {/* 
           * Page Header Section
           * 
           * The header introduces the page with a clear title and description.
           * It also includes the main action button for scheduling new appointments,
           * making it easy for admins to quickly add meetings when customers call.
           */}
          <div className="mb-8">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Appointments</h1>
                <p className="text-gray-600">Manage customer appointments and consultations</p>
              </div>
              <button className="bg-[#74A744] text-white px-6 py-3 rounded-lg hover:bg-[#5F9136] font-medium flex items-center">
                <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd"/>
                </svg>
                Schedule Appointment
              </button>
            </div>
          </div>

          {/* 
           * Appointment Statistics Cards
           * 
           * These four cards show key metrics about the appointment system.
           * They help admins quickly see today's schedule, weekly overview, and completion rates.
           * The cards use different colors to represent different types of information
           * and all show zero since no appointments have been scheduled yet.
           */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <svg className="w-6 h-6 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd"/>
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-2xl font-bold text-gray-900">0</p>
                  <p className="text-gray-600">Today&apos;s Appointments</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="p-2 bg-yellow-100 rounded-lg">
                  <svg className="w-6 h-6 text-yellow-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd"/>
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-2xl font-bold text-gray-900">0</p>
                  <p className="text-gray-600">This Week</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="p-2 bg-green-100 rounded-lg">
                  <svg className="w-6 h-6 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-2xl font-bold text-gray-900">0</p>
                  <p className="text-gray-600">Completed</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="p-2 bg-red-100 rounded-lg">
                  <svg className="w-6 h-6 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd"/>
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-2xl font-bold text-gray-900">0</p>
                  <p className="text-gray-600">Cancelled</p>
                </div>
              </div>
            </div>
          </div>

          {/* 
           * Appointments List Section
           * 
           * This is the main area where all scheduled appointments will be displayed.
           * It includes filtering options by appointment type and date selection for easy navigation.
           * Each appointment will show customer details, meeting type, and scheduling information.
           * Currently shows an empty state with a helpful message since no appointments exist yet.
           */}
          <div className="bg-white rounded-lg shadow">
            
            {/* 
             * List Header with Controls
             * 
             * The header provides the section title and useful filtering tools.
             * Admins can filter by appointment type like consultation or assessment,
             * and also select specific dates to view appointments for particular days.
             */}
            <div className="p-6 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold text-gray-900">Upcoming Appointments</h3>
                <div className="flex space-x-2">
                  <select className="border border-gray-300 rounded-lg px-3 py-2 text-sm">
                    <option>All Types</option>
                    <option>Consultation</option>
                    <option>Assessment</option>
                    <option>Color Selection</option>
                    <option>Final Walkthrough</option>
                  </select>
                  <input 
                    type="date" 
                    className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
                  />
                </div>
              </div>
            </div>
            
            {/* 
             * Appointments Content Area
             * 
             * This section uses conditional rendering to either show a list of appointments
             * or display an empty state message when no appointments are scheduled.
             * When appointments exist, they'll be shown as cards with customer information,
             * appointment details, and action buttons for editing or managing the meetings.
             */}
            <div className="p-6">
              {appointments.length > 0 ? (
                /*
                 * Appointments List Display
                 * 
                 * When appointments exist, this code creates a list of appointment cards.
                 * Each card shows the customer name, appointment type, date and time,
                 * and includes action buttons for managing the appointment.
                 * The cards use a clean layout with status indicators and easy-to-read information.
                 */
                <div className="space-y-4">
                  {appointments.map(function(appointment) {
                    return (
                      <div key={appointment.id} className="flex items-center justify-between p-6 bg-gray-50 rounded-lg border">
                        <div className="flex-1">
                          <div className="flex items-start justify-between">
                            <div>
                              <h4 className="text-lg font-semibold text-gray-900">{appointment.customer}</h4>
                              <p className="text-gray-600">{appointment.service}</p>
                              <div className="flex items-center mt-2 space-x-4">
                                <span className="text-sm text-gray-500">
                                  <strong>Date:</strong> {appointment.date}
                                </span>
                                <span className="text-sm text-gray-500">
                                  <strong>Time:</strong> {appointment.time}
                                </span>
                                <span className="text-sm text-gray-500">
                                  <strong>Phone:</strong> {appointment.phone}
                                </span>
                              </div>
                            </div>
                            <div className="flex items-center space-x-3">
                              <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                                appointment.status === 'Completed' ? 'bg-green-100 text-green-800' :
                                appointment.status === 'Confirmed' ? 'bg-blue-100 text-blue-800' :
                                appointment.status === 'Cancelled' ? 'bg-red-100 text-red-800' :
                                'bg-yellow-100 text-yellow-800'
                              }`}>
                                {appointment.status}
                              </span>
                              <button className="px-4 py-2 bg-[#74A744] text-white rounded-lg hover:bg-[#5F9136] text-sm">
                                Edit
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                /*
                 * Empty State Display
                 * 
                 * This section appears when no appointments have been scheduled yet.
                 * It provides a friendly message explaining that appointments will appear here,
                 * along with a call-to-action button to schedule the first appointment.
                 * The empty state helps new users understand what this section is for.
                 */
                <div className="text-center py-12">
                  <svg className="w-16 h-16 text-black mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3a4 4 0 118 0v4m-4 6v6m1-10V4a1 1 0 00-1-1H9a1 1 0 00-1 1v3M6 7h8" />
                  </svg>
                  <h3 className="text-lg font-medium text-black mb-2">No appointments scheduled</h3>
                  <p className="text-black mb-6">Your scheduled appointments will appear here</p>
                  <button className="inline-flex items-center px-6 py-3 bg-[#74A744] text-white rounded-lg hover:bg-[#5F9136] font-medium">
                    <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd"/>
                    </svg>
                    Schedule First Appointment
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
  );
}