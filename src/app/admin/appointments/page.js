"use client"; // Tells Next.js this component runs on the client side (browser)

// ============================================
// IMPORTS - React hooks, UI icons, and database client
// ============================================
import React, { useState, useEffect } from "react";
import {
  Calendar,
  Clock,
  Phone,
  Mail,
  MapPin,
  User,
  Building,
  Home,
  CheckCircle,
  XCircle,
  AlertCircle,
  Filter,
  Search,
  ChevronLeft, // Left arrow for previous month
  ChevronRight, // Right arrow for next month
  List, // Icon for list view
  X, // Close/exit icon
} from "lucide-react";
import { supabase } from "../../../lib/db/supabase-client";

const AdminAppointments = () => {
  // ============================================
  // STATE MANAGEMENT - All component state variables
  // ============================================

  // Stores all appointments fetched from database
  const [appointments, setAppointments] = useState([]);

  // Current filter selection (active, pending, confirmed, etc.)
  const [filter, setFilter] = useState("active");

  // Search term for filtering appointments by name, email, or address
  const [searchTerm, setSearchTerm] = useState("");

  // Loading state - shows spinner while fetching data
  const [loading, setLoading] = useState(true);

  // Stores the appointment currently being edited/confirmed (null when modal is closed)
  const [editingAppointment, setEditingAppointment] = useState(null);

  // Stores the confirmed date selected by admin
  const [confirmedDate, setConfirmedDate] = useState("");

  // Stores the confirmed time selected by admin
  const [confirmedTime, setConfirmedTime] = useState("");
  
  // Stores active client filter (from clients page navigation)
  const [clientFilter, setClientFilter] = useState(null);
  
  // View mode toggle: 'list' shows appointments in a list, 'calendar' shows monthly calendar view
  const [viewMode, setViewMode] = useState("list");

  // Currently displayed month/year in calendar view
  const [currentDate, setCurrentDate] = useState(new Date());

  // Stores appointment clicked from calendar (for detail modal)
  const [selectedAppointment, setSelectedAppointment] = useState(null);

  // ============================================
  // LOAD APPOINTMENTS ON COMPONENT MOUNT
  // ============================================

  // useEffect runs once when component loads (empty dependency array [])
  useEffect(() => {
    fetchAppointments(); // Fetch all appointments from database
    
    // Check if we have a client filter from sessionStorage
    const storedFilter = sessionStorage.getItem("appointmentClientFilter");
    if (storedFilter) {
      try {
        const filterData = JSON.parse(storedFilter);
        setClientFilter(filterData);
        setFilter("all"); // Show all statuses when filtering by client
        // Clear the filter from storage after reading
        sessionStorage.removeItem("appointmentClientFilter");
      } catch (e) {
        console.error("Error parsing client filter:", e);
      }
    }
  }, []);

  // ============================================
  // FETCH APPOINTMENTS FROM DATABASE
  // ============================================

  // Async function to load appointments with customer details
  const fetchAppointments = async () => {
    try {
      // Query Supabase database for appointments with related customer data
      const { data, error } = await supabase
        .from("appointments")
        .select(
          `
          *,
          clients (
            first_name,
            last_name,
            email,
            phone,
            address
          )
        `
        )
        .order("created_at", { ascending: false });

      if (error) throw error; // If database returns error, throw it to catch block

      // Transform database data to match component structure
      // Add status field if missing and map database columns to display properties
      const appointmentsWithStatus = data.map((apt) => ({
        ...apt, // Spread all original properties
        status: apt.status || "pending", // Default status to 'pending' if not set

        // Map joined client data to easier-to-use property names
        firstName: apt.clients?.first_name,
        lastName: apt.clients?.last_name,
        email: apt.clients?.email,
        phone: apt.clients?.phone,
        address: apt.clients?.address,

        // Map database snake_case to camelCase for consistency
        propertyType: apt.property_type,
        locationType: apt.location_type,
        preferredDate: apt.preferred_date, // Customer's requested date
        preferredTime: apt.preferred_time, // Customer's requested time
        appointmentDate: apt.appointment_date, // Admin confirmed date
        appointmentTime: apt.appointment_time, // Admin confirmed time
        projectDetails: apt.details,
        createdAt: apt.created_at,
      }));

      // Update state with transformed appointments data
      setAppointments(appointmentsWithStatus);
    } catch (error) {
      console.error("Error fetching appointments:", error);
    } finally {
      // Always set loading to false, whether successful or not
      setLoading(false);
    }
  };

  // ============================================
  // CALENDAR FUNCTIONS - Generate and navigate calendar
  // ============================================

  // Generates array of all days to display in calendar grid (42 days = 6 rows x 7 columns)
  const getCalendarDays = () => {
    const year = currentDate.getFullYear(); // Get current year from state
    const month = currentDate.getMonth(); // Get current month (0-11)

    // First day of the month (e.g., May 1, 2024)
    const firstDay = new Date(year, month, 1);

    // Last day of the month (e.g., May 31, 2024)
    const lastDay = new Date(year, month + 1, 0);

    // Total number of days in this month
    const daysInMonth = lastDay.getDate();

    // Day of week for first day (0=Sunday, 1=Monday, etc.)
    const startingDayOfWeek = firstDay.getDay();

    const days = []; // Array to hold all calendar days

    // ============================================
    // Add previous month's trailing days
    // ============================================
    // If month starts on Wednesday (3), we need to show Sun, Mon, Tue from previous month
    const prevMonthLastDay = new Date(year, month, 0).getDate();
    for (let i = startingDayOfWeek - 1; i >= 0; i--) {
      days.push({
        day: prevMonthLastDay - i, // Day number
        isCurrentMonth: false, // Mark as not current month (grayed out)
        date: new Date(year, month - 1, prevMonthLastDay - i), // Actual date object
      });
    }

    // ============================================
    // Add current month's days
    // ============================================
    for (let i = 1; i <= daysInMonth; i++) {
      days.push({
        day: i, // Day number
        isCurrentMonth: true, // Mark as current month (full color)
        date: new Date(year, month, i), // Actual date object
      });
    }

    // ============================================
    // Add next month's leading days to fill grid
    // ============================================
    // Calendar always shows 42 days (6 rows), so fill remaining slots with next month
    const remainingDays = 42 - days.length;
    for (let i = 1; i <= remainingDays; i++) {
      days.push({
        day: i, // Day number
        isCurrentMonth: false, // Mark as not current month (grayed out)
        date: new Date(year, month + 1, i), // Actual date object
      });
    }

    return days; // Return complete array of 42 days
  };

  // ============================================
  // Get appointments for a specific calendar date
  // ============================================
  const getAppointmentsForDate = (date) => {
    // Convert date to YYYY-MM-DD string for comparison
    const dateStr = date.toISOString().split("T")[0];

    // Filter appointments that match this date
    return appointments.filter((apt) => {
      // Use confirmed date if exists, otherwise use requested date
      const aptDate = apt.appointmentDate || apt.preferredDate;
      return aptDate === dateStr;
    });
  };

  // ============================================
  // Calendar Navigation Functions
  // ============================================

  // Go to previous month
  const previousMonth = () => {
    setCurrentDate(
      new Date(currentDate.getFullYear(), currentDate.getMonth() - 1)
    );
  };

  // Go to next month
  const nextMonth = () => {
    setCurrentDate(
      new Date(currentDate.getFullYear(), currentDate.getMonth() + 1)
    );
  };

  // Jump back to current month (today)
  const goToToday = () => {
    setCurrentDate(new Date());
  };

  // Check if a given date is today
  const isToday = (date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  // Format current month and year for display (e.g., "May 2024")
  const monthYear = currentDate.toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });

  // Array of weekday names for calendar header
  const weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  // ============================================
  // UTILITY FUNCTIONS - Format dates and get icons/colors
  // ============================================

  // Format date string without timezone issues
  // Dates from database are in YYYY-MM-DD format, we need to display them without timezone conversion
  const formatDate = (dateString) => {
    if (!dateString) return "";
    // Split the date string and create date in local timezone
    const [year, month, day] = dateString.split("-");
    const date = new Date(year, month - 1, day); // month is 0-indexed
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "numeric",
      day: "numeric",
    });
  };

  // Format date with full details (weekday, month, day, year)
  const formatDateLong = (dateString) => {
    if (!dateString) return "";
    const [year, month, day] = dateString.split("-");
    const date = new Date(year, month - 1, day);
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  // Returns the appropriate icon component for each appointment status
  const getStatusIcon = (status) => {
    switch (status) {
      case "pending":
        return <AlertCircle className="w-4 h-4 text-yellow-500" />;
      case "confirmed":
        return <CheckCircle className="w-4 h-4 text-blue-500" />;
      case "completed":
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case "cancelled":
        return <XCircle className="w-4 h-4 text-red-500" />;
      default:
        return <AlertCircle className="w-4 h-4 text-gray-500" />;
    }
  };

  // Returns CSS classes for status badge colors (includes border for calendar view)
  const getStatusColor = (status) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800 border-yellow-300";
      case "confirmed":
        return "bg-blue-100 text-blue-800 border-blue-300";
      case "completed":
        return "bg-green-100 text-green-800 border-green-300";
      case "cancelled":
        return "bg-red-100 text-red-800 border-red-300";
      default:
        return "bg-gray-100 text-gray-800 border-gray-300";
    }
  };

  // ============================================
  // FILTER AND SEARCH LOGIC
  // ============================================
  
  // Filter appointments based on selected filter, search term, and client filter
  const filteredAppointments = appointments.filter((appointment) => {
    // Determine if appointment matches the selected filter
    let matchesFilter;
    if (filter === "active") {
      // 'active' shows both pending and confirmed appointments
      matchesFilter =
        appointment.status === "pending" || appointment.status === "confirmed";
    } else if (filter === "all") {
      // 'all' shows every appointment regardless of status
      matchesFilter = true;
    } else {
      // For specific status filters (pending, confirmed, completed, cancelled)
      matchesFilter = appointment.status === filter;
    }

    // Check if appointment matches the search term (case-insensitive)
    const matchesSearch =
      appointment.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      appointment.lastName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      appointment.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      appointment.address
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase());
    
    // Check if appointment matches the client filter (if active)
    const matchesClient = clientFilter ? appointment.client_id === clientFilter.id : true;
    
    // Return true only if all conditions are met
    return matchesFilter && matchesSearch && matchesClient;
  });

  // ============================================
  // UPDATE APPOINTMENT STATUS
  // ============================================

  // Function to update an appointment's status in the database
  const updateStatus = async (id, newStatus) => {
    try {
      // Update status in Supabase database
      const { error } = await supabase
        .from("appointments") // Target appointments table
        .update({ status: newStatus }) // Set new status value
        .eq("id", id); // Only update where id matches

      if (error) throw error;

      // Update local state to reflect the change immediately (optimistic update)
      setAppointments((prev) =>
        prev.map((apt) => (apt.id === id ? { ...apt, status: newStatus } : apt))
      );
    } catch (error) {
      console.error("Error updating appointment status:", error);
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
    setConfirmedDate(
      appointment.appointmentDate || appointment.preferredDate || ""
    );
    setConfirmedTime(
      appointment.appointmentTime || appointment.preferredTime || ""
    );
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
        .from("appointments")
        .update({
          appointment_date: confirmedDate, // Admin's confirmed date
          appointment_time: confirmedTime, // Admin's confirmed time
          status: "confirmed", // Change status to confirmed
        })
        .eq("id", editingAppointment.id);

      if (error) throw error;

      // Close the modal and reset form fields
      setEditingAppointment(null);
      setConfirmedDate("");
      setConfirmedTime("");

      // Refetch appointments to get the latest data from database
      await fetchAppointments();
    } catch (error) {
      console.error("Error confirming appointment:", error);
    }
  };

  // ============================================
  // CALCULATE STATISTICS FOR DASHBOARD
  // ============================================

  // Calculates counts for stats cards (today, this week, completed, cancelled)
  const getStatsData = () => {
    // Get today's date in YYYY-MM-DD format
    const today = new Date().toISOString().split("T")[0];

    // Calculate date 7 days from now
    const thisWeek = new Date();
    thisWeek.setDate(thisWeek.getDate() + 7);

    return {
      // Count appointments scheduled for today
      today: appointments.filter((apt) => apt.appointmentDate === today).length,

      // Count appointments within the next 7 days
      thisWeek: appointments.filter(
        (apt) => apt.appointmentDate <= thisWeek.toISOString().split("T")[0]
      ).length,

      // Count completed appointments
      completed: appointments.filter((apt) => apt.status === "completed")
        .length,

      // Count cancelled appointments
      cancelled: appointments.filter((apt) => apt.status === "cancelled")
        .length,
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
      {/* PAGE HEADER WITH VIEW TOGGLE */}
      {/* ============================================ */}
      <div className="mb-6 flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Appointments</h1>
          <p className="text-gray-600">
            Manage customer appointments and consultations
          </p>
          {/* Show active client filter badge */}
          {clientFilter && (
            <div className="mt-2 inline-flex items-center gap-2 px-3 py-1.5 bg-blue-50 text-blue-700 rounded-lg text-sm">
              <User className="w-4 h-4" />
              <span>
                Showing appointments for: <strong>{clientFilter.name}</strong>
              </span>
              <button
                onClick={() => setClientFilter(null)}
                className="ml-1 hover:bg-blue-100 rounded p-0.5"
                title="Clear filter"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>

        {/* Toggle button to switch between list and calendar view */}
        <button
          onClick={() => setViewMode(viewMode === "list" ? "calendar" : "list")}
          className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
        >
          {/* Show different icon and text based on current view */}
          {viewMode === "list" ? (
            <>
              <Calendar className="w-5 h-5" />
              Calendar View
            </>
          ) : (
            <>
              <List className="w-5 h-5" />
              List View
            </>
          )}
        </button>
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
              <p className="text-sm text-gray-600">Todays Appointments</p>
            </div>
          </div>
        </div>

        {/* This Week Card */}
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center">
            <Clock className="w-8 h-8 text-yellow-500 mr-3" />
            <div>
              <p className="text-2xl font-bold text-gray-900">
                {stats.thisWeek}
              </p>
              <p className="text-sm text-gray-600">This Week</p>
            </div>
          </div>
        </div>

        {/* Completed Appointments Card */}
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center">
            <CheckCircle className="w-8 h-8 text-green-500 mr-3" />
            <div>
              <p className="text-2xl font-bold text-gray-900">
                {stats.completed}
              </p>
              <p className="text-sm text-gray-600">Completed</p>
            </div>
          </div>
        </div>

        {/* Cancelled Appointments Card */}
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center">
            <XCircle className="w-8 h-8 text-red-500 mr-3" />
            <div>
              <p className="text-2xl font-bold text-gray-900">
                {stats.cancelled}
              </p>
              <p className="text-sm text-gray-600">Cancelled</p>
            </div>
          </div>
        </div>
      </div>

      {/* ============================================ */}
      {/* CALENDAR VIEW - Monthly calendar with appointments */}
      {/* ============================================ */}
      {viewMode === "calendar" ? (
        <div className="bg-white rounded-lg shadow-lg p-6">
          {/* Calendar Header - Month/Year and Navigation */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              {/* Previous Month Button */}
              <button
                onClick={previousMonth}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ChevronLeft className="w-5 h-5 text-gray-700" />
              </button>

              {/* Current Month and Year Display */}
              <h2 className="text-2xl font-semibold text-gray-900 min-w-[200px] text-center">
                {monthYear}
              </h2>

              {/* Next Month Button */}
              <button
                onClick={nextMonth}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ChevronRight className="w-5 h-5 text-gray-700" />
              </button>
            </div>

            {/* Today Button - Jump to current month */}
            <button
              onClick={goToToday}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              Today
            </button>
          </div>

          {/* ============================================ */}
          {/* CALENDAR GRID - 7 columns (days) x 6 rows */}
          {/* ============================================ */}
          <div className="grid grid-cols-7 gap-2">
            {/* Weekday Headers (Sun, Mon, Tue, etc.) */}
            {weekDays.map((day) => (
              <div
                key={day}
                className="text-center font-semibold text-gray-700 py-2"
              >
                {day}
              </div>
            ))}

            {/* Calendar Days - Loop through all 42 days */}
            {getCalendarDays().map((dayInfo, index) => {
              // Get appointments for this specific day
              const dayAppointments = getAppointmentsForDate(dayInfo.date);

              // Check if this day is today
              const isTodayDate = isToday(dayInfo.date);

              return (
                <div
                  key={index}
                  className={`min-h-[100px] border rounded-lg p-2 ${
                    // Gray background for days not in current month
                    dayInfo.isCurrentMonth ? "bg-white" : "bg-gray-50"
                  } ${
                    // Green border for today's date
                    isTodayDate
                      ? "border-green-600 border-2"
                      : "border-gray-200"
                  }`}
                >
                  {/* Day Number */}
                  <div
                    className={`text-sm font-medium mb-1 ${
                      // Lighter color for days not in current month
                      dayInfo.isCurrentMonth ? "text-gray-900" : "text-gray-400"
                    } ${
                      // Green and bold for today
                      isTodayDate ? "text-green-600 font-bold" : ""
                    }`}
                  >
                    {dayInfo.day}
                  </div>

                  {/* Appointments for this day */}
                  <div className="space-y-1">
                    {/* Show maximum 3 appointments per day */}
                    {dayAppointments.slice(0, 3).map((apt) => (
                      <button
                        key={apt.id}
                        onClick={() => setSelectedAppointment(apt)} // Open detail modal on click
                        className={`w-full text-left px-2 py-1 rounded text-xs font-medium truncate border ${getStatusColor(
                          apt.status
                        )} hover:opacity-80 transition-opacity`}
                      >
                        {/* Display time and customer name */}
                        {apt.appointmentTime || apt.preferredTime} -{" "}
                        {apt.firstName} {apt.lastName}
                      </button>
                    ))}

                    {/* Show "+X more" if there are more than 3 appointments */}
                    {dayAppointments.length > 3 && (
                      <div className="text-xs text-gray-500 text-center">
                        +{dayAppointments.length - 3} more
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <>
          {/* ============================================ */}
          {/* LIST VIEW - Traditional list of appointments */}
          {/* ============================================ */}

          {/* Filters and Search Bar */}
          <div className="bg-white p-4 rounded-lg shadow-sm border mb-6">
            <div className="flex flex-col md:flex-row gap-4">
              {/* Status Filter Dropdown */}
              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-gray-500" />
                <select
                  value={filter}
                  onChange={(e) => setFilter(e.target.value)}
                  className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  <option value="active">Active Appointments</option>
                  <option value="all">All Appointments</option>
                  <option value="pending">Pending</option>
                  <option value="confirmed">Confirmed</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>

              {/* Search Input Field */}
              <div className="flex items-center gap-2 flex-1">
                <Search className="w-4 h-4 text-gray-500" />
                <input
                  type="text"
                  placeholder="Search by name, email, or address..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="border border-gray-300 rounded-md px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
            </div>
          </div>

          {/* ============================================ */}
          {/* APPOINTMENTS LIST */}
          {/* ============================================ */}
          <div className="space-y-4">
            {/* Empty State - No appointments found */}
            {filteredAppointments.length === 0 ? (
              <div className="bg-white p-8 rounded-lg shadow-sm border text-center">
                <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">No appointments found</p>
                <p className="text-sm text-gray-400">
                  Customer appointment requests will appear here when submitted
                  through the website
                </p>
              </div>
            ) : (
              // Map through filtered appointments and create a card for each
              filteredAppointments.map((appointment) => (
                <div
                  key={appointment.id}
                  className="bg-white p-6 rounded-lg shadow-sm border hover:shadow-md transition-shadow"
                >
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between">
                    {/* Appointment Details Section */}
                    <div className="flex-1">
                      {/* Status Badge and Creation Date */}
                      <div className="flex items-center gap-3 mb-3">
                        <div className="flex items-center gap-2">
                          {getStatusIcon(appointment.status)}
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                              appointment.status
                            )}`}
                          >
                            {appointment.status.charAt(0).toUpperCase() +
                              appointment.status.slice(1)}
                          </span>
                        </div>
                        <span className="text-sm text-gray-500">
                          Requested:{" "}
                          {new Date(appointment.createdAt).toLocaleDateString()}
                        </span>
                      </div>

                      {/* Three-column grid for appointment information */}
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {/* Customer Info Column */}
                        <div>
                          <h3 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                            <User className="w-4 h-4" />
                            Customer Details
                          </h3>
                          <div className="space-y-1 text-sm">
                            <p className="font-medium">
                              {appointment.firstName} {appointment.lastName}
                            </p>
                            <div className="flex items-center gap-1">
                              <Mail className="w-3 h-3 text-gray-400" />
                              <span className="text-gray-600">
                                {appointment.email}
                              </span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Phone className="w-3 h-3 text-gray-400" />
                              <span className="text-gray-600">
                                {appointment.phone}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Service Details Column */}
                        <div>
                          <h3 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                            {appointment.propertyType === "Commercial" ? (
                              <Building className="w-4 h-4" />
                            ) : (
                              <Home className="w-4 h-4" />
                            )}
                            Service Details
                          </h3>
                          <div className="space-y-1 text-sm">
                            <p>
                              <span className="text-gray-500">Type:</span>{" "}
                              {appointment.propertyType}
                            </p>
                            <p>
                              <span className="text-gray-500">Location:</span>{" "}
                              {appointment.locationType}
                            </p>
                            <div className="flex items-center gap-1">
                              <MapPin className="w-3 h-3 text-gray-400" />
                              <span className="text-gray-600">
                                {appointment.address}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Schedule Column */}
                        <div>
                          <h3 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                            <Calendar className="w-4 h-4" />
                            Schedule
                          </h3>
                          <div className="space-y-2 text-sm">
                            {/* Customer's requested date/time */}
                            <div>
                              <p className="font-medium text-gray-700">
                                Requested:
                              </p>
                              <p>
                                <span className="text-gray-500">Date:</span>{" "}
                                {formatDate(appointment.preferredDate)}
                              </p>
                              <p>
                                <span className="text-gray-500">Time:</span>{" "}
                                {appointment.preferredTime}
                              </p>
                            </div>

                            {/* Show confirmed date/time only if it exists */}
                            {appointment.appointmentDate && (
                              <div className="pt-2 border-t">
                                <p className="font-medium text-green-700">
                                  Confirmed:
                                </p>
                                <p>
                                  <span className="text-gray-500">Date:</span>{" "}
                                  {formatDate(appointment.appointmentDate)}
                                </p>
                                <p>
                                  <span className="text-gray-500">Time:</span>{" "}
                                  {appointment.appointmentTime}
                                </p>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Project Details - Optional section */}
                      {appointment.projectDetails && (
                        <div className="mt-4">
                          <h4 className="font-medium text-gray-900 mb-2">
                            Project Details:
                          </h4>
                          <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded">
                            {appointment.projectDetails}
                          </p>
                        </div>
                      )}
                    </div>

                    {/* ============================================ */}
                    {/* ACTION BUTTONS - Status-specific buttons */}
                    {/* ============================================ */}
                    <div className="mt-4 lg:mt-0 lg:ml-6 flex flex-col gap-2">
                      {/* Buttons for PENDING appointments */}
                      {appointment.status === "pending" && (
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
                            onClick={() =>
                              updateStatus(appointment.id, "cancelled")
                            }
                            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded text-sm"
                          >
                            Decline
                          </button>
                        </>
                      )}

                      {/* Buttons for CONFIRMED appointments */}
                      {appointment.status === "confirmed" && (
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
                            onClick={() =>
                              updateStatus(appointment.id, "completed")
                            }
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
        </>
      )}

      {/* ============================================ */}
      {/* APPOINTMENT DETAILS MODAL - Opened from calendar view */}
      {/* ============================================ */}
      {selectedAppointment && (
        // Modal overlay - blurred background covering entire screen
        <div className="fixed inset-0 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          {/* Modal content container - scrollable */}
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-gray-200">
            
            {/* Modal Header with Close Button */}
            <div className="p-6 border-b flex justify-between items-center">
              <h3 className="text-xl font-semibold text-gray-900">
                Appointment Details
              </h3>
              {/* Close button (X icon) */}
              <button
                onClick={() => setSelectedAppointment(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* ============================================ */}
            {/* APPOINTMENT DETAILS - All information */}
            {/* ============================================ */}
            <div className="p-6 space-y-4">
              {/* Customer Name */}
              <div className="flex items-start">
                <User className="w-5 h-5 text-gray-400 mr-3 mt-0.5" />
                <div>
                  <p className="text-sm text-gray-600">Customer</p>
                  <p className="font-medium text-gray-900">
                    {selectedAppointment.firstName}{" "}
                    {selectedAppointment.lastName}
                  </p>
                </div>
              </div>

              {/* Email */}
              <div className="flex items-start">
                <Mail className="w-5 h-5 text-gray-400 mr-3 mt-0.5" />
                <div>
                  <p className="text-sm text-gray-600">Email</p>
                  <p className="font-medium text-gray-900">
                    {selectedAppointment.email}
                  </p>
                </div>
              </div>

              {/* Phone */}
              <div className="flex items-start">
                <Phone className="w-5 h-5 text-gray-400 mr-3 mt-0.5" />
                <div>
                  <p className="text-sm text-gray-600">Phone</p>
                  <p className="font-medium text-gray-900">
                    {selectedAppointment.phone}
                  </p>
                </div>
              </div>

              {/* Address */}
              <div className="flex items-start">
                <MapPin className="w-5 h-5 text-gray-400 mr-3 mt-0.5" />
                <div>
                  <p className="text-sm text-gray-600">Address</p>
                  <p className="font-medium text-gray-900">
                    {selectedAppointment.address}
                  </p>
                </div>
              </div>

              {/* Date & Time - Formatted in long format */}
              <div className="flex items-start">
                <Calendar className="w-5 h-5 text-gray-400 mr-3 mt-0.5" />
                <div>
                  <p className="text-sm text-gray-600">Date & Time</p>
                  <p className="font-medium text-gray-900">
                    {/* Format: "Monday, May 20, 2024 at 10:00 AM" */}
                    {formatDateLong(
                      selectedAppointment.appointmentDate ||
                        selectedAppointment.preferredDate
                    )}{" "}
                    at{" "}
                    {selectedAppointment.appointmentTime ||
                      selectedAppointment.preferredTime}
                  </p>
                </div>
              </div>

              {/* Property Type */}
              <div className="flex items-start">
                {/* Show building icon for commercial, home icon for residential */}
                {selectedAppointment.propertyType === "Commercial" ? (
                  <Building className="w-5 h-5 text-gray-400 mr-3 mt-0.5" />
                ) : (
                  <Home className="w-5 h-5 text-gray-400 mr-3 mt-0.5" />
                )}
                <div>
                  <p className="text-sm text-gray-600">Property Type</p>
                  <p className="font-medium text-gray-900">
                    {selectedAppointment.propertyType} -{" "}
                    {selectedAppointment.locationType}
                  </p>
                </div>
              </div>

              {/* Status Badge */}
              <div>
                <p className="text-sm text-gray-600 mb-1">Status</p>
                <span
                  className={`inline-block px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(
                    selectedAppointment.status
                  )}`}
                >
                  {/* Capitalize first letter of status */}
                  {selectedAppointment.status.charAt(0).toUpperCase() +
                    selectedAppointment.status.slice(1)}
                </span>
              </div>

              {/* Project Details - Only show if exists */}
              {selectedAppointment.projectDetails && (
                <div>
                  <p className="text-sm text-gray-600 mb-1">Project Details</p>
                  <p className="text-gray-900 bg-gray-50 p-3 rounded-lg">
                    {selectedAppointment.projectDetails}
                  </p>
                </div>
              )}
            </div>

            {/* ============================================ */}
            {/* MODAL ACTION BUTTONS - Status-specific */}
            {/* ============================================ */}
            <div className="p-6 border-t flex gap-3">
              {/* Show Confirm button only for pending appointments */}
              {selectedAppointment.status === "pending" && (
                <button
                  onClick={() => {
                    setSelectedAppointment(null); // Close detail modal
                    openConfirmModal(selectedAppointment); // Open confirm modal
                  }}
                  className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  Confirm Appointment
                </button>
              )}

              {/* Show Mark Complete button only for confirmed appointments */}
              {selectedAppointment.status === "confirmed" && (
                <button
                  onClick={() => {
                    updateStatus(selectedAppointment.id, "completed"); // Update status
                    setSelectedAppointment(null); // Close modal
                  }}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Mark Complete
                </button>
              )}

              {/* Close button - always visible */}
              <button
                onClick={() => setSelectedAppointment(null)}
                className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================ */}
      {/* CONFIRMATION MODAL - Set/edit appointment date and time */}
      {/* ============================================ */}
      {editingAppointment && (
        // Modal overlay - blurred background covering entire screen
        <div className="fixed inset-0 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          {/* Modal content container */}
          <div className="bg-white rounded-lg max-w-md w-full p-6 shadow-2xl border border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Confirm Appointment
            </h2>

            {/* Customer Info Display */}
            <div className="mb-4 p-3 bg-gray-50 rounded">
              <p className="font-medium text-gray-900">
                {editingAppointment.firstName} {editingAppointment.lastName}
              </p>
              <p className="text-sm text-gray-600">
                {editingAppointment.email}
              </p>
              <p className="text-sm text-gray-600">
                {editingAppointment.phone}
              </p>
            </div>

            {/* Customer's Requested Date/Time */}
            <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded">
              <p className="text-sm font-medium text-blue-900 mb-2">
                Customer Requested:
              </p>
              <p className="text-sm text-blue-800">
                <strong>Date:</strong>{" "}
                {formatDate(editingAppointment.preferredDate)}
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
                  min={new Date().toISOString().split("T")[0]} // Can't select dates in the past
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
                  setEditingAppointment(null); // Close modal
                  setConfirmedDate(""); // Clear date input
                  setConfirmedTime(""); // Clear time input
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
