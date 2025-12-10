"use client";
import { useState, useEffect } from "react";
import { supabase } from "../../../lib/db/supabase-client";
import { useRouter } from "next/navigation";
import {
  Search,
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Plus,
  Save,
  X,
  FileText,
  ExternalLink,
  Trash2,
  AlertTriangle,
} from "lucide-react";

export default function ClientsPage() {
  const router = useRouter();
  const [clients, setClients] = useState([]);
  const [appointmentCounts, setAppointmentCounts] = useState({});
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [message, setMessage] = useState("");
  const [editingClient, setEditingClient] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [clientToDelete, setClientToDelete] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [deleteType, setDeleteType] = useState(null); // 'client-only' or 'all-related'

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    address: "",
  });

  // Load clients on component mount
  useEffect(() => {
    loadClients();
  }, []);

  const loadClients = async () => {
    try {
      // Load clients
      const { data: clientsData, error: clientsError } = await supabase
        .from("clients")
        .select("*")
        .order("created_at", { ascending: false });

      if (clientsError) throw clientsError;
      setClients(clientsData || []);

      // Load appointment counts for each client
      const { data: appointmentsData, error: appointmentsError } =
        await supabase.from("appointments").select("client_id");

      if (appointmentsError) throw appointmentsError;

      // Count appointments per client
      const counts = {};
      appointmentsData?.forEach((apt) => {
        counts[apt.client_id] = (counts[apt.client_id] || 0) + 1;
      });
      setAppointmentCounts(counts);
    } catch (err) {
      console.error("Error loading clients:", err.message);
      setMessage(
        `Error loading clients: ${err.message}. Please refresh the page.`
      );
    } finally {
      setLoading(false);
    }
  };

  const filteredClients = clients.filter((client) => {
    const matchesSearch =
      client.first_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.last_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.address?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.phone?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  // Format phone number as user types
  const formatPhoneNumber = (value) => {
    // Remove all non-digits
    const phoneNumber = value.replace(/\D/g, "");

    // Format as (XXX) XXX-XXXX
    if (phoneNumber.length <= 3) {
      return phoneNumber;
    } else if (phoneNumber.length <= 6) {
      return `(${phoneNumber.slice(0, 3)}) ${phoneNumber.slice(3)}`;
    } else {
      return `(${phoneNumber.slice(0, 3)}) ${phoneNumber.slice(
        3,
        6
      )}-${phoneNumber.slice(6, 10)}`;
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    // Format phone number field
    if (name === "phone") {
      setFormData({
        ...formData,
        [name]: formatPhoneNumber(value),
      });
    } else {
      setFormData({
        ...formData,
        [name]: value,
      });
    }

    // Clear error message when user starts typing (especially for email field)
    if (message.includes("Error") && name === "email") {
      setMessage("");
    }
  };

  const resetForm = () => {
    setFormData({
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      address: "",
    });
    setEditingClient(null);
    setMessage(""); // Clear any messages when resetting form
  };

  const openEditForm = (client) => {
    setFormData({
      firstName: client.first_name || "",
      lastName: client.last_name || "",
      email: client.email || "",
      phone: client.phone ? formatPhoneNumber(client.phone) : "", // Format for display
      address: client.address || "",
    });
    setEditingClient(client);
    setMessage(""); // Clear any previous messages
    setShowForm(true);
  };

  const saveClient = async () => {
    setMessage("");

    try {
      if (editingClient) {
        // Update existing client - check if email is being changed to one that already exists
        if (formData.email && formData.email !== editingClient.email) {
          const { data: existingClient } = await supabase
            .from("clients")
            .select("id, first_name, last_name")
            .eq("email", formData.email)
            .neq("id", editingClient.id)
            .single();
          if (existingClient) {
            setMessage(
              `Error: Email already exists for ${existingClient.first_name} ${existingClient.last_name}. Please use a different email.`
            );
            return;
          }
        }

        const { error } = await supabase
          .from("clients")
          .update({
            first_name: formData.firstName,
            last_name: formData.lastName,
            email: formData.email,
            phone: formData.phone.replace(/\D/g, ""), // Store digits only
            address: formData.address,
          })
          .eq("id", editingClient.id);

        if (error) throw error;
        setMessage("Client updated successfully!");
      } else {
        // Insert new client - check for duplicate email first
        if (formData.email) {
          const { data: existingClient } = await supabase
            .from("clients")
            .select("id, first_name, last_name")
            .eq("email", formData.email)
            .single();

          if (existingClient) {
            setMessage(
              `Error: Email already exists for ${existingClient.first_name} ${existingClient.last_name}. ` +
                `Please edit the existing client instead of creating a new one.`
            );
            return;
          }
        }

        const { error } = await supabase.from("clients").insert({
          first_name: formData.firstName,
          last_name: formData.lastName,
          email: formData.email,
          phone: formData.phone.replace(/\D/g, ""), // Store digits only
          address: formData.address,
        });

        if (error) throw error;
        setMessage("Client added successfully!");
      }

      resetForm();
      setShowForm(false);
      loadClients(); // Reload clients
    } catch (err) {
      setMessage(`Error: ${err.message}`);
    }
  };

  // Navigate to appointments page filtered by client
  const viewClientAppointments = (client) => {
    // Store client filter in sessionStorage so appointments page can read it
    sessionStorage.setItem(
      "appointmentClientFilter",
      JSON.stringify({
        id: client.id,
        name: `${client.first_name} ${client.last_name}`,
      })
    );
    router.push("/admin/appointments");
  };

  // Open delete confirmation modal
  const openDeleteModal = (client) => {
    setClientToDelete(client);
    setShowDeleteModal(true);
  };

  // Open final confirmation modal
  const confirmDeleteType = (type) => {
    setDeleteType(type);
    setShowDeleteModal(false);
    setShowConfirmModal(true);
  };

  // Execute the delete based on type
  const executeDelete = () => {
    if (deleteType === "client-only") {
      deleteClientOnly();
    } else if (deleteType === "all-related") {
      deleteAllRelated();
    }
    setShowConfirmModal(false);
  };

  // Delete client info only (keep related data but remove client reference)
  const deleteClientOnly = async () => {
    if (!clientToDelete) return;

    setDeleteLoading(true);
    try {
      // First, update all related tables to remove client reference
      // Update appointments - set client_id to null
      const { error: appointmentsError } = await supabase
        .from("appointments")
        .update({ client_id: null })
        .eq("client_id", clientToDelete.id);

      if (appointmentsError) {
        console.error("Appointments error:", appointmentsError);
        throw new Error(
          `Failed to update appointments: ${
            appointmentsError.message ||
            appointmentsError.hint ||
            "client_id might be required. Run fix-client-delete.sql first."
          }`
        );
      }

      // Update quotes - set client_id to null
      const { error: quotesError } = await supabase
        .from("quotes")
        .update({ client_id: null })
        .eq("client_id", clientToDelete.id);

      if (quotesError) {
        console.error("Quotes error:", quotesError);
        throw new Error(
          `Failed to update quotes: ${
            quotesError.message ||
            quotesError.hint ||
            "client_id might be required. Run fix-client-delete.sql first."
          }`
        );
      }

      // Update projects - set client_id to null
      const { error: projectsError } = await supabase
        .from("projects")
        .update({ client_id: null })
        .eq("client_id", clientToDelete.id);

      if (projectsError) {
        console.error("Projects error:", projectsError);
        throw new Error(
          `Failed to update projects: ${
            projectsError.message ||
            projectsError.hint ||
            "client_id might be required. Run fix-client-delete.sql first."
          }`
        );
      }

      // Delete the client
      const { error: deleteError } = await supabase
        .from("clients")
        .delete()
        .eq("id", clientToDelete.id);

      if (deleteError) {
        console.error("Delete error:", deleteError);
        throw new Error(
          `Failed to delete client: ${
            deleteError.message || deleteError.hint || "Unknown error"
          }`
        );
      }

      setMessage(
        `Client "${clientToDelete.first_name} ${clientToDelete.last_name}" deleted successfully. Related data preserved.`
      );
      setClientToDelete(null);
      setDeleteType(null);
      loadClients();
    } catch (err) {
      console.error("Error deleting client:", err);
      setMessage(
        `Error: ${
          err.message || "Failed to delete client. Check console for details."
        }`
      );
    } finally {
      setDeleteLoading(false);
    }
  };

  // Delete all related information (cascade delete)
  const deleteAllRelated = async () => {
    if (!clientToDelete) return;

    setDeleteLoading(true);
    try {
      // Delete in order: quote_items -> quotes, then appointments, then projects, then client

      // First get all quotes for this client
      const { data: quotes, error: quotesQueryError } = await supabase
        .from("quotes")
        .select("id")
        .eq("client_id", clientToDelete.id);

      if (quotesQueryError) throw quotesQueryError;

      // Delete quote items for each quote
      if (quotes && quotes.length > 0) {
        const quoteIds = quotes.map((q) => q.id);
        const { error: quoteItemsError } = await supabase
          .from("quote_items")
          .delete()
          .in("quote_id", quoteIds);

        if (quoteItemsError) throw quoteItemsError;
      }

      // Delete quotes
      const { error: quotesError } = await supabase
        .from("quotes")
        .delete()
        .eq("client_id", clientToDelete.id);

      if (quotesError) throw quotesError;

      // Delete appointments
      const { error: appointmentsError } = await supabase
        .from("appointments")
        .delete()
        .eq("client_id", clientToDelete.id);

      if (appointmentsError) throw appointmentsError;

      // Delete projects
      const { error: projectsError } = await supabase
        .from("projects")
        .delete()
        .eq("client_id", clientToDelete.id);

      if (projectsError) throw projectsError;

      // Finally, delete the client
      const { error: deleteError } = await supabase
        .from("clients")
        .delete()
        .eq("id", clientToDelete.id);

      if (deleteError) throw deleteError;

      setMessage(
        `Client "${clientToDelete.first_name} ${clientToDelete.last_name}" and all related data deleted successfully.`
      );
      setClientToDelete(null);
      setDeleteType(null);
      loadClients();
    } catch (err) {
      console.error("Error deleting client and related data:", err);
      setMessage(
        `Error: ${
          err.message ||
          "Failed to delete client and related data. Check console for details."
        }`
      );
    } finally {
      setDeleteLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="p-6 bg-background min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-border mx-auto"></div>
          <p className="mt-4 text-text-muted">Loading clients...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-background min-h-screen">
      {/* Header */}
      <div className="mb-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-text">Clients</h1>
            <p className="text-text-muted">Manage your client database</p>
          </div>
          <button
            onClick={() => {
              resetForm();
              setShowForm(true);
            }}
            className="bg-primary text-white px-6 py-3 rounded-lg hover:bg-background font-medium flex items-center transition-colors"
          >
            <Plus className="w-5 h-5 mr-2" />
            Add Client
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div className="bg-background-light p-6 rounded-lg shadow-sm border border-border">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <User className="w-6 h-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-2xl font-bold text-text">{clients.length}</p>
              <p className="text-sm text-text-muted">Total Clients</p>
            </div>
          </div>
        </div>

        <div className="bg-background-light p-6 rounded-lg shadow-sm border border-border">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <Calendar className="w-6 h-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-2xl font-bold text-text">
                {
                  clients.filter((c) => {
                    const created = new Date(c.created_at);
                    const thirtyDaysAgo = new Date();
                    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
                    return created >= thirtyDaysAgo;
                  }).length
                }
              </p>
              <p className="text-sm text-text-muted">New This Month</p>
            </div>
          </div>
        </div>
      </div>

      {/* Message - For non-modal errors and notifications */}
      {message && !showForm && (
        <div
          className={`mb-6 p-4 rounded-lg ${
            message.includes("Error")
              ? "bg-red-50 text-red-800 border border-red-200"
              : "bg-green-50 text-green-800 border border-green-200"
          }`}
        >
          <p>{message}</p>
        </div>
      )}

      {/* Search */}
      <div className="bg-background-light p-4 rounded-lg shadow-sm border border-border mb-6">
        <div className="flex items-center gap-2">
          <Search className="w-4 h-4 text-text" />
          <input
            type="text"
            placeholder="Search by name, email, phone, or address..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="text-text border border-border rounded-md px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-border"
          />
        </div>
      </div>

      {/* Clients Table */}
      <div className="bg-background-light rounded-lg shadow-sm border border-border">
        {filteredClients.length === 0 ? (
          <div className="p-8 text-center">
            <User className="w-12 h-12 text-text-muted mx-auto mb-4" />
            <p className="text-text-muted">No clients found</p>
            <p className="text-sm text-text-muted">
              Client information will appear here when added to the database
            </p>
          </div>
        ) : (
          <div className="rounded-lg overflow-x-auto">
            <table className="min-w-full divide-y divide-border">
              <thead className="bg-background-light">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-text-muted uppercase tracking-wider">
                    Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-text-muted uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-text-muted uppercase tracking-wider">
                    Phone
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-text-muted uppercase tracking-wider">
                    Address
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-text-muted uppercase tracking-wider">
                    Added
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-text-muted uppercase tracking-wider">
                    Appointments
                  </th>
                </tr>
              </thead>
              <tbody className="bg-background-light divide-y divide-border">
                {filteredClients.map((client) => {
                  const appointmentCount = appointmentCounts[client.id] || 0;

                  return (
                    <tr key={client.id} className="hover:bg-background-hover">
                      <td
                        className="px-6 py-4 whitespace-nowrap cursor-pointer"
                        onClick={() => openEditForm(client)}
                      >
                        <div className="text-sm font-medium text-text">
                          {client.first_name} {client.last_name}
                        </div>
                      </td>
                      <td
                        className="px-6 py-4 whitespace-nowrap cursor-pointer"
                        onClick={() => openEditForm(client)}
                      >
                        <div className="flex items-center text-sm text-text">
                          <Mail className="w-4 h-4 text-text-muted mr-2" />
                          {client.email || "Not provided"}
                        </div>
                      </td>
                      <td
                        className="px-6 py-4 whitespace-nowrap cursor-pointer"
                        onClick={() => openEditForm(client)}
                      >
                        <div className="flex items-center text-sm text-text">
                          <Phone className="w-4 h-4 text-text-muted mr-2" />
                          {client.phone
                            ? formatPhoneNumber(client.phone)
                            : "Not provided"}
                        </div>
                      </td>
                      <td
                        className="px-6 py-4 cursor-pointer"
                        onClick={() => openEditForm(client)}
                      >
                        <div className="flex items-center text-sm text-text">
                          <MapPin className="w-4 h-4 text-text-muted mr-2 flex-shrink-0" />
                          <span className="truncate max-w-xs">
                            {client.address || "Not provided"}
                          </span>
                        </div>
                      </td>
                      <td
                        className="px-6 py-4 whitespace-nowrap text-sm text-text cursor-pointer"
                        onClick={() => openEditForm(client)}
                      >
                        {new Date(client.created_at).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        {appointmentCount > 0 ? (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              viewClientAppointments(client);
                            }}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors font-medium"
                            title="View appointments"
                          >
                            <FileText className="w-4 h-4" />
                            {appointmentCount}
                            <ExternalLink className="w-3 h-3" />
                          </button>
                        ) : (
                          <span className="text-gray-400 text-xs">
                            No appointments
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add or Edit Client Form Modal */}
      {showForm && (
        <div className="fixed inset-0 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full max-h-[95vh] overflow-y-auto shadow-2xl border border-gray-200">
            <div className="p-6 border-b flex justify-between items-center">
              <h2 className="text-xl font-semibold text-gray-900">
                {editingClient ? "Edit Client" : "Add New Client"}
              </h2>
              <button
                onClick={() => {
                  setShowForm(false);
                  resetForm();
                  setMessage("");
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              {/* Error Message Inside Modal */}
              {message && (
                <div
                  className={`p-4 rounded-lg ${
                    message.includes("Error")
                      ? "bg-red-50 text-red-800 border border-red-200"
                      : "bg-green-50 text-green-800 border border-green-200"
                  }`}
                >
                  <p className="text-sm">{message}</p>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    First Name
                  </label>
                  <input
                    type="text"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleChange}
                    placeholder="First Name"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#74A744] focus:border-transparent text-gray-900"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Last Name
                  </label>
                  <input
                    type="text"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleChange}
                    placeholder="Last Name"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#74A744] focus:border-transparent text-gray-900"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="email@example.com"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#74A744] focus:border-transparent text-gray-900"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Phone
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="(123) 456-7890"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#74A744] focus:border-transparent text-gray-900"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Address
                </label>
                <input
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  placeholder="123 Main St, Calgary, AB"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#74A744] focus:border-transparent text-gray-900"
                />
              </div>

              <div className="flex flex-col gap-3 pt-4">
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setShowForm(false);
                      resetForm();
                      setMessage("");
                    }}
                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 hover:border-gray-500 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={saveClient}
                    className="flex-1 px-4 py-2 bg-[#74A744] text-white rounded-lg hover:bg-[#5d8636] transition-colors flex items-center justify-center"
                  >
                    <Save className="w-4 h-4 mr-2" />
                    {editingClient ? "Update Client" : "Add Client"}
                  </button>
                </div>

                {/* Delete Button - Only show when editing */}
                {editingClient && (
                  <button
                    type="button"
                    onClick={() => {
                      setShowForm(false);
                      openDeleteModal(editingClient);
                    }}
                    className="w-full px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center justify-center"
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete Client
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && clientToDelete && (
        <div className="fixed inset-0 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-lg w-full max-h-[95vh] overflow-y-auto shadow-2xl border border-gray-200">
            <div className="p-6 border-b flex items-start gap-4">
              <div className="p-3 bg-red-100 rounded-full flex-shrink-0">
                <AlertTriangle className="w-6 h-6 text-red-600" />
              </div>
              <div className="flex-1">
                <h2 className="text-xl font-semibold text-gray-900">
                  Delete Client
                </h2>
                <p className="text-gray-600 mt-1">
                  Choose how to delete "{clientToDelete.first_name}{" "}
                  {clientToDelete.last_name}"
                </p>
              </div>
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setClientToDelete(null);
                }}
                className="text-gray-400 hover:text-gray-600"
                disabled={deleteLoading}
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              {/* Show appointment count warning */}
              {appointmentCounts[clientToDelete.id] > 0 && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <div className="flex items-start gap-2">
                    <AlertTriangle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                    <div className="text-sm text-yellow-800">
                      <p className="font-medium">
                        This client has {appointmentCounts[clientToDelete.id]}{" "}
                        appointment(s)
                      </p>
                      <p className="mt-1">
                        Choose whether to keep or delete related data.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              <div className="space-y-3">
                {/* Option 1: Delete Client Only */}
                <button
                  onClick={() => confirmDeleteType("client-only")}
                  disabled={deleteLoading}
                  className="w-full p-4 border-2 border-gray-300 rounded-lg hover:border-orange-500 hover:bg-orange-50 transition-all text-left disabled:opacity-50 disabled:cursor-not-allowed group"
                >
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-orange-100 rounded-lg group-hover:bg-orange-200 transition-colors flex-shrink-0">
                      <User className="w-5 h-5 text-orange-600" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 mb-1">
                        Delete Client Info Only
                      </h3>
                      <p className="text-sm text-gray-600">
                        Removes client information but keeps all appointments,
                        quotes, and projects. Related records will be preserved
                        without client details.
                      </p>
                    </div>
                  </div>
                </button>

                {/* Option 2: Delete Everything */}
                <button
                  onClick={() => confirmDeleteType("all-related")}
                  disabled={deleteLoading}
                  className="w-full p-4 border-2 border-gray-300 rounded-lg hover:border-red-500 hover:bg-red-50 transition-all text-left disabled:opacity-50 disabled:cursor-not-allowed group"
                >
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-red-100 rounded-lg group-hover:bg-red-200 transition-colors flex-shrink-0">
                      <Trash2 className="w-5 h-5 text-red-600" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 mb-1">
                        Delete All Related Information
                      </h3>
                      <p className="text-sm text-gray-600">
                        Permanently deletes client and all related appointments,
                        quotes, projects, and data. This action cannot be
                        undone.
                      </p>
                    </div>
                  </div>
                </button>
              </div>

              <div className="pt-2">
                <button
                  onClick={() => {
                    setShowDeleteModal(false);
                    setClientToDelete(null);
                  }}
                  disabled={deleteLoading}
                  className="w-full px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Final Confirmation Modal */}
      {showConfirmModal && clientToDelete && (
        <div className="fixed inset-0 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full shadow-2xl border border-gray-200">
            <div className="p-6 border-b flex items-start gap-4">
              <div className="p-3 bg-red-100 rounded-full flex-shrink-0">
                <AlertTriangle className="w-6 h-6 text-red-600" />
              </div>
              <div className="flex-1">
                <h2 className="text-xl font-semibold text-gray-900">
                  Confirm Deletion
                </h2>
                <p className="text-gray-600 mt-1">
                  This action cannot be undone
                </p>
              </div>
            </div>

            <div className="p-6 space-y-4">
              {deleteType === "client-only" ? (
                <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <User className="w-5 h-5 text-orange-600 flex-shrink-0 mt-0.5" />
                    <div className="text-sm text-orange-900">
                      <p className="font-semibold mb-2">
                        You are about to delete:
                      </p>
                      <p className="mb-1">
                        • Client:{" "}
                        <strong>
                          {clientToDelete.first_name} {clientToDelete.last_name}
                        </strong>
                      </p>
                      <p className="text-orange-700 mt-3">
                        Related appointments, quotes, and projects will be
                        preserved but will no longer show client details.
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <Trash2 className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                    <div className="text-sm text-red-900">
                      <p className="font-semibold mb-2">
                        You are about to permanently delete:
                      </p>
                      <p className="mb-1">
                        • Client:{" "}
                        <strong>
                          {clientToDelete.first_name} {clientToDelete.last_name}
                        </strong>
                      </p>
                      {appointmentCounts[clientToDelete.id] > 0 && (
                        <p className="mb-1">
                          • {appointmentCounts[clientToDelete.id]}{" "}
                          appointment(s)
                        </p>
                      )}
                      <p className="mb-1">• All related quotes and projects</p>
                      <p className="text-red-700 font-semibold mt-3">
                        ⚠️ All data will be permanently removed and cannot be
                        recovered.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {deleteLoading && (
                <div className="flex items-center justify-center gap-2 text-gray-600 py-2">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-gray-600"></div>
                  <span>Deleting...</span>
                </div>
              )}

              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowConfirmModal(false);
                    setDeleteType(null);
                    setShowDeleteModal(true);
                  }}
                  disabled={deleteLoading}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 hover:border-gray-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Go Back
                </button>
                <button
                  onClick={executeDelete}
                  disabled={deleteLoading}
                  className={`flex-1 px-4 py-2 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-semibold text-white ${
                    deleteType === "client-only"
                      ? "bg-orange-600 hover:bg-orange-700"
                      : "bg-red-600 hover:bg-red-700"
                  }`}
                >
                  {deleteLoading ? "Deleting..." : "Yes, Delete"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
