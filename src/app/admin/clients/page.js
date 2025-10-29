"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../../lib/supabase-client";
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
      const { data: appointmentsData, error: appointmentsError } = await supabase
        .from("appointments")
        .select("client_id");

      if (appointmentsError) throw appointmentsError;

      // Count appointments per client
      const counts = {};
      appointmentsData?.forEach((apt) => {
        counts[apt.client_id] = (counts[apt.client_id] || 0) + 1;
      });
      setAppointmentCounts(counts);
    } catch (err) {
      console.error("Error loading clients:", err.message);
      setMessage(`Error loading clients: ${err.message}. Please refresh the page.`);
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

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
    
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
      phone: client.phone || "",
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
            phone: formData.phone,
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
          phone: formData.phone,
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

  if (loading) {
    return (
      <div className="p-6 bg-gray-50 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#74A744] mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading clients...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="mb-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Clients</h1>
            <p className="text-gray-600">Manage your client database</p>
          </div>
          <button
            onClick={() => {
              resetForm();
              setShowForm(true);
            }}
            className="bg-[#74A744] text-white px-6 py-3 rounded-lg hover:bg-[#5F9136] font-medium flex items-center transition-colors"
          >
            <Plus className="w-5 h-5 mr-2" />
            Add Client
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center">
            <User className="w-8 h-8 text-blue-500 mr-3" />
            <div>
              <p className="text-2xl font-bold text-gray-900">
                {clients.length}
              </p>
              <p className="text-sm text-gray-600">Total Clients</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center">
            <Calendar className="w-8 h-8 text-[#74A744] mr-3" />
            <div>
              <p className="text-2xl font-bold text-gray-900">
                {
                  clients.filter((c) => {
                    const created = new Date(c.created_at);
                    const thirtyDaysAgo = new Date();
                    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
                    return created >= thirtyDaysAgo;
                  }).length
                }
              </p>
              <p className="text-sm text-gray-600">New This Month</p>
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
      <div className="bg-white p-4 rounded-lg shadow-sm border mb-6">
        <div className="flex items-center gap-2">
          <Search className="w-4 h-4 text-gray-500" />
          <input
            type="text"
            placeholder="Search by name, email, phone, or address..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="border border-gray-300 rounded-md px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-[#74A744]"
          />
        </div>
      </div>

      {/* Clients Table */}
      <div className="bg-white rounded-lg shadow-sm border">
        {filteredClients.length === 0 ? (
          <div className="p-8 text-center">
            <User className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">No clients found</p>
            <p className="text-sm text-gray-400">
              Client information will appear here when added to the database
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Phone
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Address
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Added
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Appointments
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredClients.map((client) => {
                  const appointmentCount = appointmentCounts[client.id] || 0;
                  
                  return (
                    <tr key={client.id} className="hover:bg-gray-50">
                      <td
                        className="px-6 py-4 whitespace-nowrap cursor-pointer"
                        onClick={() => openEditForm(client)}
                      >
                        <div className="text-sm font-medium text-gray-900">
                          {client.first_name} {client.last_name}
                        </div>
                      </td>
                      <td
                        className="px-6 py-4 whitespace-nowrap cursor-pointer"
                        onClick={() => openEditForm(client)}
                      >
                        <div className="flex items-center text-sm text-gray-900">
                          <Mail className="w-4 h-4 text-gray-400 mr-2" />
                          {client.email || "Not provided"}
                        </div>
                      </td>
                      <td
                        className="px-6 py-4 whitespace-nowrap cursor-pointer"
                        onClick={() => openEditForm(client)}
                      >
                        <div className="flex items-center text-sm text-gray-900">
                          <Phone className="w-4 h-4 text-gray-400 mr-2" />
                          {client.phone || "Not provided"}
                        </div>
                      </td>
                      <td
                        className="px-6 py-4 cursor-pointer"
                        onClick={() => openEditForm(client)}
                      >
                        <div className="flex items-center text-sm text-gray-900">
                          <MapPin className="w-4 h-4 text-gray-400 mr-2 flex-shrink-0" />
                          <span className="truncate max-w-xs">
                            {client.address || "Not provided"}
                          </span>
                        </div>
                      </td>
                      <td
                        className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 cursor-pointer"
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

              <div className="flex gap-3 pt-4">
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
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
