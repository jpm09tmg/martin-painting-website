"use client";
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
  ChevronLeft,
  ChevronRight,
  List,
  X,
} from "lucide-react";
import { supabase } from "../../../lib/supabase-client";

const AdminAppointments = () => {
  const [appointments, setAppointments] = useState([]);
  const [filter, setFilter] = useState("active");
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [editingAppointment, setEditingAppointment] = useState(null);
  const [confirmedDate, setConfirmedDate] = useState("");
  const [confirmedTime, setConfirmedTime] = useState("");
  const [viewMode, setViewMode] = useState("list"); // 'list' or 'calendar'
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedAppointment, setSelectedAppointment] = useState(null);

  // Fetch appointments from Supabase
  useEffect(() => {
    fetchAppointments();
  }, []);

  const fetchAppointments = async () => {
    try {
      const { data, error } = await supabase
        .from("appointments_test")
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

      if (error) throw error;

      const appointmentsWithStatus = data.map((apt) => ({
        ...apt,
        status: apt.status || "pending",
        firstName: apt.clients?.first_name,
        lastName: apt.clients?.last_name,
        email: apt.clients?.email,
        phone: apt.clients?.phone,
        address: apt.clients?.address,
        propertyType: apt.property_type,
        locationType: apt.location_type,
        preferredDate: apt.preferred_date,
        preferredTime: apt.preferred_time,
        appointmentDate: apt.appointment_date,
        appointmentTime: apt.appointment_time,
        projectDetails: apt.details,
        createdAt: apt.created_at,
      }));

      setAppointments(appointmentsWithStatus);
    } catch (error) {
      console.error("Error fetching appointments:", error);
    } finally {
      setLoading(false);
    }
  };

  // Calendar functions
  const getCalendarDays = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];

    const prevMonthLastDay = new Date(year, month, 0).getDate();
    for (let i = startingDayOfWeek - 1; i >= 0; i--) {
      days.push({
        day: prevMonthLastDay - i,
        isCurrentMonth: false,
        date: new Date(year, month - 1, prevMonthLastDay - i),
      });
    }

    for (let i = 1; i <= daysInMonth; i++) {
      days.push({
        day: i,
        isCurrentMonth: true,
        date: new Date(year, month, i),
      });
    }

    const remainingDays = 42 - days.length;
    for (let i = 1; i <= remainingDays; i++) {
      days.push({
        day: i,
        isCurrentMonth: false,
        date: new Date(year, month + 1, i),
      });
    }

    return days;
  };

  const getAppointmentsForDate = (date) => {
    const dateStr = date.toISOString().split("T")[0];
    return appointments.filter((apt) => {
      const aptDate = apt.appointmentDate || apt.preferredDate;
      return aptDate === dateStr;
    });
  };

  const previousMonth = () => {
    setCurrentDate(
      new Date(currentDate.getFullYear(), currentDate.getMonth() - 1)
    );
  };

  const nextMonth = () => {
    setCurrentDate(
      new Date(currentDate.getFullYear(), currentDate.getMonth() + 1)
    );
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  const isToday = (date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  const monthYear = currentDate.toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });
  const weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

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

  const filteredAppointments = appointments.filter((appointment) => {
    let matchesFilter;
    if (filter === "active") {
      matchesFilter =
        appointment.status === "pending" || appointment.status === "confirmed";
    } else if (filter === "all") {
      matchesFilter = true;
    } else {
      matchesFilter = appointment.status === filter;
    }

    const matchesSearch =
      appointment.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      appointment.lastName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      appointment.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      appointment.propertyAddress
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const updateStatus = async (id, newStatus) => {
    try {
      const { error } = await supabase
        .from("appointments_test")
        .update({ status: newStatus })
        .eq("id", id);

      if (error) throw error;

      setAppointments((prev) =>
        prev.map((apt) => (apt.id === id ? { ...apt, status: newStatus } : apt))
      );
    } catch (error) {
      console.error("Error updating appointment status:", error);
    }
  };

  const openConfirmModal = (appointment) => {
    setEditingAppointment(appointment);
    setConfirmedDate(
      appointment.confirmedDate || appointment.preferredDate || ""
    );
    setConfirmedTime(
      appointment.confirmedTime || appointment.preferredTime || ""
    );
  };

  const confirmAppointment = async () => {
    if (!editingAppointment) return;

    try {
      const { error } = await supabase
        .from("appointments_test")
        .update({
          appointment_date: confirmedDate,
          appointment_time: confirmedTime,
          status: "confirmed",
        })
        .eq("id", editingAppointment.id);

      if (error) throw error;

      setAppointments((prev) =>
        prev.map((apt) =>
          apt.id === editingAppointment.id
            ? {
                ...apt,
                confirmedDate,
                confirmedTime,
                status: "confirmed",
                appointmentDate: confirmedDate,
                appointmentTime: confirmedTime,
              }
            : apt
        )
      );

      setEditingAppointment(null);
      setConfirmedDate("");
      setConfirmedTime("");
    } catch (error) {
      console.error("Error confirming appointment:", error);
    }
  };

  const getStatsData = () => {
    const today = new Date().toISOString().split("T")[0];
    const thisWeek = new Date();
    thisWeek.setDate(thisWeek.getDate() + 7);

    return {
      today: appointments.filter((apt) => apt.appointmentDate === today).length,
      thisWeek: appointments.filter(
        (apt) => apt.appointmentDate <= thisWeek.toISOString().split("T")[0]
      ).length,
      completed: appointments.filter((apt) => apt.status === "completed")
        .length,
      cancelled: appointments.filter((apt) => apt.status === "cancelled")
        .length,
    };
  };

  const stats = getStatsData();

  if (loading) {
    return (
      <div className="p-6 bg-gray-50 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading appointments...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="mb-6 flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Appointments</h1>
          <p className="text-gray-600">
            Manage customer appointments and consultations
          </p>
        </div>
        <button
          onClick={() => setViewMode(viewMode === "list" ? "calendar" : "list")}
          className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
        >
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

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center">
            <Calendar className="w-8 h-8 text-blue-500 mr-3" />
            <div>
              <p className="text-2xl font-bold text-gray-900">{stats.today}</p>
              <p className="text-sm text-gray-600">Today's Appointments</p>
            </div>
          </div>
        </div>

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

      {/* Calendar View */}
      {viewMode === "calendar" ? (
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <button
                onClick={previousMonth}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ChevronLeft className="w-5 h-5 text-gray-700" />
              </button>
              <h2 className="text-2xl font-semibold text-gray-900 min-w-[200px] text-center">
                {monthYear}
              </h2>
              <button
                onClick={nextMonth}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ChevronRight className="w-5 h-5 text-gray-700" />
              </button>
            </div>
            <button
              onClick={goToToday}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              Today
            </button>
          </div>

          {/* Calendar Grid */}
          <div className="grid grid-cols-7 gap-2">
            {weekDays.map((day) => (
              <div
                key={day}
                className="text-center font-semibold text-gray-700 py-2"
              >
                {day}
              </div>
            ))}

            {getCalendarDays().map((dayInfo, index) => {
              const dayAppointments = getAppointmentsForDate(dayInfo.date);
              const isTodayDate = isToday(dayInfo.date);

              return (
                <div
                  key={index}
                  className={`min-h-[100px] border rounded-lg p-2 ${
                    dayInfo.isCurrentMonth ? "bg-white" : "bg-gray-50"
                  } ${
                    isTodayDate
                      ? "border-green-600 border-2"
                      : "border-gray-200"
                  }`}
                >
                  <div
                    className={`text-sm font-medium mb-1 ${
                      dayInfo.isCurrentMonth ? "text-gray-900" : "text-gray-400"
                    } ${isTodayDate ? "text-green-600 font-bold" : ""}`}
                  >
                    {dayInfo.day}
                  </div>

                  <div className="space-y-1">
                    {dayAppointments.slice(0, 3).map((apt) => (
                      <button
                        key={apt.id}
                        onClick={() => setSelectedAppointment(apt)}
                        className={`w-full text-left px-2 py-1 rounded text-xs font-medium truncate border ${getStatusColor(
                          apt.status
                        )} hover:opacity-80 transition-opacity`}
                      >
                        {apt.appointmentTime || apt.preferredTime} -{" "}
                        {apt.firstName} {apt.lastName}
                      </button>
                    ))}
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
          {/* Filters and Search */}
          <div className="bg-white p-4 rounded-lg shadow-sm border mb-6">
            <div className="flex flex-col md:flex-row gap-4">
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

          {/* Appointments List */}
          <div className="space-y-4">
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
              filteredAppointments.map((appointment) => (
                <div
                  key={appointment.id}
                  className="bg-white p-6 rounded-lg shadow-sm border hover:shadow-md transition-shadow"
                >
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between">
                    <div className="flex-1">
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

                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
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
                                {appointment.propertyAddress}
                              </span>
                            </div>
                          </div>
                        </div>

                        <div>
                          <h3 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                            <Calendar className="w-4 h-4" />
                            Schedule
                          </h3>
                          <div className="space-y-2 text-sm">
                            <div>
                              <p className="font-medium text-gray-700">
                                Requested:
                              </p>
                              <p>
                                <span className="text-gray-500">Date:</span>{" "}
                                {new Date(
                                  appointment.preferredDate
                                ).toLocaleDateString()}
                              </p>
                              <p>
                                <span className="text-gray-500">Time:</span>{" "}
                                {appointment.preferredTime}
                              </p>
                            </div>
                            {appointment.confirmedDate && (
                              <div className="pt-2 border-t">
                                <p className="font-medium text-green-700">
                                  Confirmed:
                                </p>
                                <p>
                                  <span className="text-gray-500">Date:</span>{" "}
                                  {new Date(
                                    appointment.confirmedDate
                                  ).toLocaleDateString()}
                                </p>
                                <p>
                                  <span className="text-gray-500">Time:</span>{" "}
                                  {appointment.confirmedTime}
                                </p>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

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

                    <div className="mt-4 lg:mt-0 lg:ml-6 flex flex-col gap-2">
                      {appointment.status === "pending" && (
                        <>
                          <button
                            onClick={() => openConfirmModal(appointment)}
                            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded text-sm flex items-center justify-center"
                          >
                            <Calendar className="w-4 h-4 mr-1" />
                            Set Date & Confirm
                          </button>
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

                      {appointment.status === "confirmed" && (
                        <>
                          <button
                            onClick={() => openConfirmModal(appointment)}
                            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded text-sm text-xs"
                          >
                            Edit Date/Time
                          </button>
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

      {/* Appointment Details Modal (from calendar) */}
      {selectedAppointment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b flex justify-between items-center">
              <h3 className="text-xl font-semibold text-gray-900">
                Appointment Details
              </h3>
              <button
                onClick={() => setSelectedAppointment(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6 space-y-4">
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

              <div className="flex items-start">
                <Mail className="w-5 h-5 text-gray-400 mr-3 mt-0.5" />
                <div>
                  <p className="text-sm text-gray-600">Email</p>
                  <p className="font-medium text-gray-900">
                    {selectedAppointment.email}
                  </p>
                </div>
              </div>

              <div className="flex items-start">
                <Phone className="w-5 h-5 text-gray-400 mr-3 mt-0.5" />
                <div>
                  <p className="text-sm text-gray-600">Phone</p>
                  <p className="font-medium text-gray-900">
                    {selectedAppointment.phone}
                  </p>
                </div>
              </div>

              <div className="flex items-start">
                <MapPin className="w-5 h-5 text-gray-400 mr-3 mt-0.5" />
                <div>
                  <p className="text-sm text-gray-600">Address</p>
                  <p className="font-medium text-gray-900">
                    {selectedAppointment.propertyAddress}
                  </p>
                </div>
              </div>

              <div className="flex items-start">
                <Calendar className="w-5 h-5 text-gray-400 mr-3 mt-0.5" />
                <div>
                  <p className="text-sm text-gray-600">Date & Time</p>
                  <p className="font-medium text-gray-900">
                    {new Date(
                      selectedAppointment.appointmentDate ||
                        selectedAppointment.preferredDate
                    ).toLocaleDateString("en-US", {
                      weekday: "long",
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}{" "}
                    at{" "}
                    {selectedAppointment.appointmentTime ||
                      selectedAppointment.preferredTime}
                  </p>
                </div>
              </div>

              <div className="flex items-start">
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

              <div>
                <p className="text-sm text-gray-600 mb-1">Status</p>
                <span
                  className={`inline-block px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(
                    selectedAppointment.status
                  )}`}
                >
                  {selectedAppointment.status.charAt(0).toUpperCase() +
                    selectedAppointment.status.slice(1)}
                </span>
              </div>

              {selectedAppointment.projectDetails && (
                <div>
                  <p className="text-sm text-gray-600 mb-1">Project Details</p>
                  <p className="text-gray-900 bg-gray-50 p-3 rounded-lg">
                    {selectedAppointment.projectDetails}
                  </p>
                </div>
              )}
            </div>

            <div className="p-6 border-t flex gap-3">
              {selectedAppointment.status === "pending" && (
                <button
                  onClick={() => {
                    setSelectedAppointment(null);
                    openConfirmModal(selectedAppointment);
                  }}
                  className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  Confirm Appointment
                </button>
              )}
              {selectedAppointment.status === "confirmed" && (
                <button
                  onClick={() => {
                    updateStatus(selectedAppointment.id, "completed");
                    setSelectedAppointment(null);
                  }}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Mark Complete
                </button>
              )}
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

      {/* Confirmation Modal */}
      {editingAppointment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Confirm Appointment
            </h2>

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

            <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded">
              <p className="text-sm font-medium text-blue-900 mb-2">
                Customer Requested:
              </p>
              <p className="text-sm text-blue-800">
                <strong>Date:</strong>{" "}
                {new Date(
                  editingAppointment.preferredDate
                ).toLocaleDateString()}
              </p>
              <p className="text-sm text-blue-800">
                <strong>Time:</strong> {editingAppointment.preferredTime}
              </p>
            </div>

            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Confirmed Appointment Date
                </label>
                <input
                  type="date"
                  value={confirmedDate}
                  onChange={(e) => setConfirmedDate(e.target.value)}
                  min={new Date().toISOString().split("T")[0]}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>

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

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setEditingAppointment(null);
                  setConfirmedDate("");
                  setConfirmedTime("");
                }}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={confirmAppointment}
                disabled={!confirmedDate || !confirmedTime}
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
