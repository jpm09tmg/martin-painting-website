'use client' // Tells Next.js this component runs on the client side (browser)

// ============================================
// IMPORTS - React hooks, UI icons, and database client
// ============================================
import React, { useState, useEffect } from 'react';
import { Calendar, Clock, Phone, Mail, MapPin, User, Building, Home, CheckCircle, XCircle, AlertCircle, Filter, Search } from 'lucide-react';
import { supabase } from '../../../lib/supabase-client';

const AdminAppointments = () => {
  // ============================================
  // STATE MANAGEMENT - All component state variables
  // ============================================
  
  // Stores all appointments fetched from database
  const [appointments, setAppointments] = useState([]);
  
  // Current filter selection (active, pending, confirmed, etc.)
  const [filter, setFilter] = useState('active');
  
  // Search term for filtering appointments by name, email, or address
  const [searchTerm, setSearchTerm] = useState('');
  
  // Loading state - shows spinner while fetching data
  const [loading, setLoading] = useState(true);
  
  // Stores the appointment currently being edited/confirmed (null when modal is closed)
  const [editingAppointment, setEditingAppointment] = useState(null);
  
  // Stores the confirmed date selected by admin
  const [confirmedDate, setConfirmedDate] = useState('');
  
  // Stores the confirmed time selected by admin
  const [confirmedTime, setConfirmedTime] = useState('');

  // ============================================
  // LOAD APPOINTMENTS ON COMPONENT MOUNT
  // ============================================
  
  // useEffect runs once when component loads (empty dependency array [])
  useEffect(() => {
    fetchAppointments(); // Fetch all appointments from database
  }, []);

  // ============================================
  // FETCH APPOINTMENTS FROM DATABASE
  // ============================================
  
  // Async function to load appointments with customer details
  const fetchAppointments = async () => {
    try {
      // Query Supabase database for appointments with related customer data
      const { data, error } = await supabase
        .from('appointments_test')      // Select from appointments_test table
        .select(`
          *,                           // Get all columns from appointments_test
          clients (                    // Join with clients table to get customer info
            first_name,
            last_name,
            email,
            phone,
            address
          )
        `)
        .order('created_at', { ascending: false }); // Sort by creation date (newest first)

      if (error) throw error; // If database returns error, throw it to catch block
      
      // Transform database data to match component structure
      // Add status field if missing and map database columns to display properties
      const appointmentsWithStatus = data.map(apt => ({
        ...apt,                                      // Spread all original properties
        status: apt.status || 'pending',            // Default status to 'pending' if not set
        
        // Map joined client data to easier-to-use property names
        firstName: apt.clients?.first_name,
        lastName: apt.clients?.last_name,
        email: apt.clients?.email,
        phone: apt.clients?.phone,
        address: apt.clients?.address,
        
        // Map database snake_case to camelCase for consistency
        propertyType: apt.property_type,
        locationType: apt.location_type,
        preferredDate: apt.preferred_date,          // Customer's requested date
        preferredTime: apt.preferred_time,          // Customer's requested time
        appointmentDate: apt.appointment_date,      // Admin confirmed date
        appointmentTime: apt.appointment_time,      // Admin confirmed time
        projectDetails: apt.details,
        createdAt: apt.created_at
      }));
      
      // Update state with transformed appointments data
      setAppointments(appointmentsWithStatus);
    } catch (error) {
      console.error('Error fetching appointments:', error);
    } finally {
      // Always set loading to false, whether successful or not
      setLoading(false);
    }
  };

  // ============================================
  // UTILITY FUNCTIONS - Get icons and colors based on status
  // ============================================
  
  // Returns the appropriate icon component for each appointment status
  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending': return <AlertCircle className="w-4 h-4 text-yellow-500" />;     // Yellow alert for pending
      case 'confirmed': return <CheckCircle className="w-4 h-4 text-blue-500" />;     // Blue check for confirmed
      case 'completed': return <CheckCircle className="w-4 h-4 text-green-500" />;    // Green check for completed
      case 'cancelled': return <XCircle className="w-4 h-4 text-red-500" />;          // Red X for cancelled
      default: return <AlertCircle className="w-4 h-4 text-gray-500" />;              // Gray alert for unknown
    }
  };

  // Returns CSS classes for status badge colors
  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';       // Yellow background
      case 'confirmed': return 'bg-blue-100 text-blue-800';         // Blue background
      case 'completed': return 'bg-green-100 text-green-800';       // Green background
      case 'cancelled': return 'bg-red-100 text-red-800';           // Red background
      default: return 'bg-gray-100 text-gray-800';                  // Gray as fallback
    }
  };

  // ============================================
  // FILTER AND SEARCH LOGIC
  // ============================================
  
  // Filter appointments based on selected filter and search term
  const filteredAppointments = appointments.filter(appointment => {
    // Determine if appointment matches the selected filter
    let matchesFilter;
    if (filter === 'active') {
      // 'active' shows both pending and confirmed appointments
      matchesFilter = appointment.status === 'pending' || appointment.status === 'confirmed';
    } else if (filter === 'all') {
      // 'all' shows every appointment regardless of status
      matchesFilter = true;
    } else {
      // For specific status filters (pending, confirmed, completed, cancelled)
      matchesFilter = appointment.status === filter;
    }
    
    // Check if appointment matches the search term (case-insensitive)
    // Searches in: first name, last name, email, and property address
    const matchesSearch = 
      appointment.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      appointment.lastName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      appointment.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      appointment.propertyAddress?.toLowerCase().includes(searchTerm.toLowerCase());
    
    // Return true only if both filter AND search conditions are met
    return matchesFilter && matchesSearch;
  });

  // ============================================
  // UPDATE APPOINTMENT STATUS
  // ============================================
  
  // Function to update an appointment's status in the database
  const updateStatus = async (id, newStatus) => {
    try {
      // Update status in Supabase database
      const { error } = await supabase
        .from('appointments_test')     // Target appointments table
        .update({ status: newStatus }) // Set new status value
        .eq('id', id);                 // Only update where id matches

      if (error) throw error;

      // Update local state to reflect the change immediately (optimistic update)
      setAppointments(prev => 
        prev.map(apt => apt.id === id ? { ...apt, status: newStatus } : apt)
      );
    } catch (error) {
      console.error('Error updating appointment status:', error);
    }
  };

  // ============================================
  // OPEN CONFIRMATION MODAL
  // ============================================
  
  // Opens the modal to set/edit appointment date and time
  const openConfirmModal = (appointment) => {
    setEditingAppointment(appointment); // Store which appointment is being edited
    
    // Pre-fill the date/time inputs with existing confirmed values,
    // or fall back to customer's preferred date/time
    setConfirmedDate(appointment.confirmedDate || appointment.preferredDate || '');
    setConfirmedTime(appointment.confirmedTime || appointment.preferredTime || '');
  };

  // ============================================
  // CONFIRM APPOINTMENT WITH DATE/TIME
  // ============================================
  
  // Saves the confirmed date/time and updates status to 'confirmed'
  const confirmAppointment = async () => {
    if (!editingAppointment) return; // Safety check - exit if no appointment selected

    try {
      // Update database with confirmed date, time, and status
      const { error } = await supabase
        .from('appointments_test')
        .update({ 
          appointment_date: confirmedDate,    // Admin's confirmed date
          appointment_time: confirmedTime,    // Admin's confirmed time
          status: 'confirmed'                 // Change status to confirmed
        })
        .eq('id', editingAppointment.id);

      if (error) throw error;

      // Update local state to reflect changes
      setAppointments(prev => 
        prev.map(apt => apt.id === editingAppointment.id 
          ? { 
              ...apt, 
              confirmedDate,                  // Update confirmed date
              confirmedTime,                  // Update confirmed time
              status: 'confirmed',            // Update status
              appointmentDate: confirmedDate, // Update display date
              appointmentTime: confirmedTime  // Update display time
            } 
          : apt
        )
      );

      // Close the modal and reset form fields
      setEditingAppointment(null);
      setConfirmedDate('');
      setConfirmedTime('');
    } catch (error) {
      console.error('Error confirming appointment:', error);
    }
  };

  // ============================================
  // CALCULATE STATISTICS FOR DASHBOARD
  // ============================================
  
  // Calculates counts for stats cards (today, this week, completed, cancelled)
  const getStatsData = () => {
    // Get today's date in YYYY-MM-DD format
    const today = new Date().toISOString().split('T')[0];
    
    // Calculate date 7 days from now
    const thisWeek = new Date();
    thisWeek.setDate(thisWeek.getDate() + 7);
    
    return {
      // Count appointments scheduled for today
      today: appointments.filter(apt => apt.appointmentDate === today).length,
      
      // Count appointments within the next 7 days
      thisWeek: appointments.filter(apt => 
        apt.appointmentDate <= thisWeek.toISOString().split('T')[0]
      ).length,
      
      // Count completed appointments
      completed: appointments.filter(apt => apt.status === 'completed').length,
      
      // Count cancelled appointments
      cancelled: appointments.filter(apt => apt.status === 'cancelled').length
    };
  };

  // Get statistics for display in stats cards
  const stats = getStatsData();

  // ============================================
  // LOADING STATE - Show spinner while fetching data
  // ============================================
  if (loading) {
    return (
      <div className="p-6 bg-gray-50 min-h-screen flex items-center justify-center">
        <div className="text-center">
          {/* Animated loading spinner */}
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading appointments...</p>
        </div>
      </div>
    );
  }

  // ============================================
  // MAIN UI RENDER
  // ============================================
  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      
      {/* ============================================ */}
      {/* PAGE HEADER */}
      {/* ============================================ */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Appointments</h1>
        <p className="text-gray-600">Manage customer appointments and consultations</p>
      </div>

      {/* ============================================ */}
      {/* STATISTICS CARDS - Dashboard overview */}
      {/* ============================================ */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        
        {/* Today's Appointments Card */}
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center">
            <Calendar className="w-8 h-8 text-blue-500 mr-3" />
            <div>
              <p className="text-2xl font-bold text-gray-900">{stats.today}</p>
              <p className="text-sm text-gray-600">Today's Appointments</p>
            </div>
          </div>
        </div>
        
        {/* This Week Card */}
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center">
            <Clock className="w-8 h-8 text-yellow-500 mr-3" />
            <div>
              <p className="text-2xl font-bold text-gray-900">{stats.thisWeek}</p>
              <p className="text-sm text-gray-600">This Week</p>
            </div>
          </div>
        </div>

        {/* Completed Appointments Card */}
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center">
            <CheckCircle className="w-8 h-8 text-green-500 mr-3" />
            <div>
              <p className="text-2xl font-bold text-gray-900">{stats.completed}</p>
              <p className="text-sm text-gray-600">Completed</p>
            </div>
          </div>
        </div>

        {/* Cancelled Appointments Card */}
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center">
            <XCircle className="w-8 h-8 text-red-500 mr-3" />
            <div>
              <p className="text-2xl font-bold text-gray-900">{stats.cancelled}</p>
              <p className="text-sm text-gray-600">Cancelled</p>
            </div>
          </div>
        </div>
      </div>

      {/* ============================================ */}
      {/* FILTERS AND SEARCH BAR */}
      {/* ============================================ */}
      <div className="bg-white p-4 rounded-lg shadow-sm border mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          
          {/* Status Filter Dropdown */}
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-gray-500" />
            <select 
              value={filter} 
              onChange={(e) => setFilter(e.target.value)} // Update filter when user selects
              className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              <option value="active">Active Appointments</option>     {/* Pending + Confirmed */}
              <option value="all">All Appointments</option>           {/* Show everything */}
              <option value="pending">Pending</option>                {/* Only pending */}
              <option value="confirmed">Confirmed</option>            {/* Only confirmed */}
              <option value="completed">Completed</option>            {/* Only completed */}
              <option value="cancelled">Cancelled</option>            {/* Only cancelled */}
            </select>
          </div>
          
          {/* Search Input Field */}
          <div className="flex items-center gap-2 flex-1">
            <Search className="w-4 h-4 text-gray-500" />
            <input
              type="text"
              placeholder="Search by name, email, or address..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)} // Update search term as user types
              className="border border-gray-300 rounded-md px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>
        </div>
      </div>

      {/* ============================================ */}
      {/* APPOINTMENTS LIST - Display all filtered appointments */}
      {/* ============================================ */}
      <div className="space-y-4">
        {/* Empty State - No appointments found */}
        {filteredAppointments.length === 0 ? (
          <div className="bg-white p-8 rounded-lg shadow-sm border text-center">
            <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">No appointments found</p>
            <p className="text-sm text-gray-400">Customer appointment requests will appear here when submitted through the website</p>
          </div>
        ) : (
          // Map through filtered appointments and create a card for each
          filteredAppointments.map((appointment) => (
            <div key={appointment.id} className="bg-white p-6 rounded-lg shadow-sm border hover:shadow-md transition-shadow">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between">
                
                {/* ============================================ */}
                {/* APPOINTMENT DETAILS SECTION */}
                {/* ============================================ */}
                <div className="flex-1">
                  
                  {/* Status Badge and Creation Date */}
                  <div className="flex items-center gap-3 mb-3">
                    <div className="flex items-center gap-2">
                      {getStatusIcon(appointment.status)}  {/* Status icon */}
                      {/* Status badge with dynamic color */}
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(appointment.status)}`}>
                        {/* Capitalize first letter of status */}
                        {appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
                      </span>
                    </div>
                    {/* Show when appointment was requested */}
                    <span className="text-sm text-gray-500">
                      Requested: {new Date(appointment.createdAt).toLocaleDateString()}
                    </span>
                  </div>

                  {/* Three-column grid for appointment information */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    
                    {/* ============================================ */}
                    {/* CUSTOMER INFO COLUMN */}
                    {/* ============================================ */}
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                        <User className="w-4 h-4" />
                        Customer Details
                      </h3>
                      <div className="space-y-1 text-sm">
                        {/* Customer name */}
                        <p className="font-medium">{appointment.firstName} {appointment.lastName}</p>
                        {/* Email with icon */}
                        <div className="flex items-center gap-1">
                          <Mail className="w-3 h-3 text-gray-400" />
                          <span className="text-gray-600">{appointment.email}</span>
                        </div>
                        {/* Phone with icon */}
                        <div className="flex items-center gap-1">
                          <Phone className="w-3 h-3 text-gray-400" />
                          <span className="text-gray-600">{appointment.phone}</span>
                        </div>
                      </div>
                    </div>

                    {/* ============================================ */}
                    {/* SERVICE DETAILS COLUMN */}
                    {/* ============================================ */}
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                        {/* Show building icon for commercial, home icon for residential */}
                        {appointment.propertyType === 'Commercial' ? 
                          <Building className="w-4 h-4" /> : 
                          <Home className="w-4 h-4" />
                        }
                        Service Details
                      </h3>
                      <div className="space-y-1 text-sm">
                        <p><span className="text-gray-500">Type:</span> {appointment.propertyType}</p>
                        <p><span className="text-gray-500">Location:</span> {appointment.locationType}</p>
                        {/* Property address with map pin icon */}
                        <div className="flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-gray-400" />
                          <span className="text-gray-600">{appointment.propertyAddress}</span>
                        </div>
                      </div>
                    </div>

                    {/* ============================================ */}
                    {/* SCHEDULE COLUMN */}
                    {/* ============================================ */}
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        Schedule
                      </h3>
                      <div className="space-y-2 text-sm">
                        {/* Customer's requested date/time */}
                        <div>
                          <p className="font-medium text-gray-700">Requested:</p>
                          <p><span className="text-gray-500">Date:</span> {new Date(appointment.preferredDate).toLocaleDateString()}</p>
                          <p><span className="text-gray-500">Time:</span> {appointment.preferredTime}</p>
                        </div>
                        {/* Show confirmed date/time only if it exists */}
                        {appointment.confirmedDate && (
                          <div className="pt-2 border-t">
                            <p className="font-medium text-green-700">Confirmed:</p>
                            <p><span className="text-gray-500">Date:</span> {new Date(appointment.confirmedDate).toLocaleDateString()}</p>
                            <p><span className="text-gray-500">Time:</span> {appointment.confirmedTime}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* ============================================ */}
                  {/* PROJECT DETAILS - Optional section */}
                  {/* ============================================ */}
                  {appointment.projectDetails && (
                    <div className="mt-4">
                      <h4 className="font-medium text-gray-900 mb-2">Project Details:</h4>
                      <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded">{appointment.projectDetails}</p>
                    </div>
                  )}
                </div>

                {/* ============================================ */}
                {/* ACTION BUTTONS - Status-specific buttons */}
                {/* ============================================ */}
                <div className="mt-4 lg:mt-0 lg:ml-6 flex flex-col gap-2">
                  
                  {/* Buttons for PENDING appointments */}
                  {appointment.status === 'pending' && (
                    <>
                      {/* Confirm button - opens modal to set date/time */}
                      <button 
                        onClick={() => openConfirmModal(appointment)}
                        className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded text-sm flex items-center justify-center"
                      >
                        <Calendar className="w-4 h-4 mr-1" />
                        Set Date & Confirm
                      </button>
                      {/* Decline button - changes status to cancelled */}
                      <button 
                        onClick={() => updateStatus(appointment.id, 'cancelled')}
                        className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded text-sm"
                      >
                        Decline
                      </button>
                    </>
                  )}
                  
                  {/* Buttons for CONFIRMED appointments */}
                  {appointment.status === 'confirmed' && (
                    <>
                      {/* Edit date/time button - reopens confirmation modal */}
                      <button 
                        onClick={() => openConfirmModal(appointment)}
                        className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded text-sm text-xs"
                      >
                        Edit Date/Time
                      </button>
                      {/* Mark complete button - changes status to completed */}
                      <button 
                        onClick={() => updateStatus(appointment.id, 'completed')}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded text-sm"
                      >
                        Mark Complete
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* ============================================ */}
      {/* CONFIRMATION MODAL - Set/edit appointment date and time */}
      {/* ============================================ */}
      {editingAppointment && (
        // Modal overlay - dark background covering entire screen
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          {/* Modal content container */}
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Confirm Appointment
            </h2>
            
            {/* Customer Info Display */}
            <div className="mb-4 p-3 bg-gray-50 rounded">
              <p className="font-medium text-gray-900">
                {editingAppointment.firstName} {editingAppointment.lastName}
              </p>
              <p className="text-sm text-gray-600">{editingAppointment.email}</p>
              <p className="text-sm text-gray-600">{editingAppointment.phone}</p>
            </div>

            {/* Customer's Requested Date/Time */}
            <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded">
              <p className="text-sm font-medium text-blue-900 mb-2">Customer Requested:</p>
              <p className="text-sm text-blue-800">
                <strong>Date:</strong> {new Date(editingAppointment.preferredDate).toLocaleDateString()}
              </p>
              <p className="text-sm text-blue-800">
                <strong>Time:</strong> {editingAppointment.preferredTime}
              </p>
            </div>

            {/* Date/Time Input Fields */}
            <div className="space-y-4 mb-6">
              {/* Confirmed Date Input */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Confirmed Appointment Date
                </label>
                <input
                  type="date"
                  value={confirmedDate}
                  onChange={(e) => setConfirmedDate(e.target.value)}
                  min={new Date().toISOString().split('T')[0]} // Can't select dates in the past
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>

              {/* Confirmed Time Input */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Confirmed Appointment Time
                </label>
                <input
                  type="time"
                  value={confirmedTime}
                  onChange={(e) => setConfirmedTime(e.target.value)}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
            </div>

            {/* Modal Action Buttons */}
            <div className="flex gap-3">
              {/* Cancel button - closes modal without saving */}
              <button
                onClick={() => {
                  setEditingAppointment(null);  // Close modal
                  setConfirmedDate('');         // Clear date input
                  setConfirmedTime('');         // Clear time input
                }}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              {/* Confirm button - saves date/time and updates status */}
              <button
                onClick={confirmAppointment}
                disabled={!confirmedDate || !confirmedTime} // Disabled if date or time is empty
                className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Confirm Appointment
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminAppointments;