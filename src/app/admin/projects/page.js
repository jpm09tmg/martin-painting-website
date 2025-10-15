"use client";
import { useState, useEffect } from "react";
import {
  Plus,
  Search,
  Filter,
  Calendar,
  DollarSign,
  User,
  MapPin,
  Clock,
  Trash2,
  X,
} from "lucide-react";
import { supabase } from "@lib/supabase-client";

export default function ProjectsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [showAddModal, setShowAddModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [projectToDelete, setProjectToDelete] = useState(null);
  const [selectedProject, setSelectedProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  // Projects data - loaded from database
  const [projects, setProjects] = useState([]);
  
  // Clients data - for dropdown
  const [clients, setClients] = useState([]);
  const [quotes, setQuotes] = useState([]);
  const [appointments, setAppointments] = useState([]);

  const [newProject, setNewProject] = useState({
    client_id: "",
    project_address: "",
    status: "Planning",
    start_date: "",
    end_date: "",
    type: "Interior",
    description: "",
    quote_id: "",
    appointment_id: "",
  });

  // Load projects from database on component mount
  useEffect(() => {
    loadProjects();
    loadClients();
    loadQuotes();
    loadAppointments();
  }, []);

  const loadProjects = async () => {
    try {
      const { data, error } = await supabase
        .from("projects")
        .select(`
          *,
          clients (*),
          quotes (*, quote_items (*)),
          appointments (*)
        `)
        .order("updated_at", { ascending: false });

      if (error) throw error;

      setProjects(data || []);
    } catch (err) {
      console.error("Error loading projects:", err);
      setMessage(`Error loading projects: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const loadClients = async () => {
    try {
      const { data, error } = await supabase
        .from("clients")
        .select("*")
        .order("last_name", { ascending: true });

      if (error) throw error;

      setClients(data || []);
    } catch (err) {
      console.error("Error loading clients:", err);
    }
  };

  const loadQuotes = async () => {
    try {
      const { data, error } = await supabase
        .from("quotes")
        .select("id, total_amount, client_id, clients(first_name, last_name)")
        .order("created_at", { ascending: false });

      if (error) throw error;

      setQuotes(data || []);
    } catch (err) {
      console.error("Error loading quotes:", err);
    }
  };

  const loadAppointments = async () => {
    try {
      const { data, error } = await supabase
        .from("appointments")
        .select("id, appointment_date, client_id, clients(first_name, last_name)")
        .order("appointment_date", { ascending: false });

      if (error) throw error;

      setAppointments(data || []);
    } catch (err) {
      console.error("Error loading appointments:", err);
    }
  };

  // Filter projects based on search and status
  const filteredProjects = projects.filter((project) => {
    const clientName = project.clients 
      ? `${project.clients.first_name} ${project.clients.last_name}`.toLowerCase()
      : "";
    const projectAddress = (project.project_address || "").toLowerCase();
    
    const matchesSearch =
      clientName.includes(searchTerm.toLowerCase()) ||
      projectAddress.includes(searchTerm.toLowerCase());
    const matchesStatus =
      statusFilter === "all" || project.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Update progress function - saves to database
  const updateProgress = async (projectId, change) => {
    const project = projects.find((p) => p.id === projectId);
    if (!project) return;

    const newProgress = Math.max(0, Math.min(100, (project.progress || 0) + change));

    // Auto-update status based on progress
    let newStatus = project.status;
    if (newProgress === 0) {
      newStatus = "Planning";
    } else if (newProgress > 0 && newProgress < 100) {
      newStatus = "In Progress";
    } else if (newProgress === 100) {
      newStatus = "Completed";
    }

    try {
      const { error } = await supabase
        .from("projects")
        .update({
          progress: newProgress,
          status: newStatus,
          updated_at: new Date().toISOString(),
        })
        .eq("id", projectId);

      if (error) throw error;

      // Update local state
      setProjects(
        projects.map((p) => {
          if (p.id === projectId) {
            return {
              ...p,
              progress: newProgress,
              status: newStatus,
              updated_at: new Date().toISOString(),
            };
          }
          return p;
        })
      );
      setMessage("Progress updated successfully!");
      setTimeout(() => setMessage(""), 3000);
    } catch (err) {
      console.error("Error updating progress:", err);
      setMessage(`Error updating progress: ${err.message}`);
    }
  };

  const handleAddProject = async (e) => {
    e.preventDefault();
    setMessage("");

    try {
      const projectData = {
        client_id: newProject.client_id,
        project_address: newProject.project_address,
        status: newProject.status,
        start_date: newProject.start_date,
        end_date: newProject.end_date,
        type: newProject.type,
        description: newProject.description,
        progress: 0,
      };

      // Only add quote_id if it's provided
      if (newProject.quote_id && newProject.quote_id !== "") {
        projectData.quote_id = newProject.quote_id;
      }

      // Only add appointment_id if it's provided
      if (newProject.appointment_id && newProject.appointment_id !== "") {
        projectData.appointment_id = newProject.appointment_id;
      }

      const { data, error } = await supabase
        .from("projects")
        .insert([projectData])
        .select(`
          *,
          clients (*),
          quotes (*, quote_items (*)),
          appointments (*)
        `);

      if (error) throw error;

      setMessage("Project added successfully!");
      // Reload all projects to ensure data consistency
      await loadProjects();

      // Reset form
      setNewProject({
        client_id: "",
        project_address: "",
        status: "Planning",
        start_date: "",
        end_date: "",
        type: "Interior",
        description: "",
        quote_id: "",
        appointment_id: "",
      });
      setShowAddModal(false);

      // Clear success message after 3 seconds
      setTimeout(() => setMessage(""), 3000);
    } catch (err) {
      console.error("Error adding project:", err);
      setMessage(`Error adding project: ${err.message}`);
    }
  };

  // Delete project function
  const handleDeleteProject = async () => {
    if (!projectToDelete) return;

    try {
      const { error } = await supabase
        .from("projects")
        .delete()
        .eq("id", projectToDelete.id);

      if (error) throw error;

      setMessage("Project deleted successfully!");
      setProjects(projects.filter((p) => p.id !== projectToDelete.id));
      setShowDeleteConfirm(false);
      setProjectToDelete(null);

      // Clear success message after 3 seconds
      setTimeout(() => setMessage(""), 3000);
    } catch (err) {
      console.error("Error deleting project:", err);
      setMessage(`Error deleting project: ${err.message}`);
    }
  };

  const confirmDelete = (project) => {
    setProjectToDelete(project);
    setShowDeleteConfirm(true);
  };

  const viewProjectDetails = (project) => {
    setSelectedProject(project);
    setShowDetailsModal(true);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "Planning":
        return "bg-yellow-100 text-yellow-800";
      case "In Progress":
        return "bg-blue-100 text-blue-800";
      case "Completed":
        return "bg-green-100 text-green-800";
      case "On Hold":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getTypeColor = (type) => {
    switch (type) {
      case "Interior":
        return "bg-purple-100 text-purple-800";
      case "Exterior":
        return "bg-orange-100 text-orange-800";
      case "Commercial":
        return "bg-indigo-100 text-indigo-800";
      case "Specialty":
        return "bg-pink-100 text-pink-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-white">
      <div className="flex-1 p-8 bg-gray-50">
        {/* Success/Error Message */}
        {message && (
          <div
            className={`mb-4 p-4 rounded-lg ${
              message.includes("Error")
                ? "bg-red-100 text-red-800"
                : "bg-green-100 text-green-800"
            }`}
          >
            {message}
          </div>
        )}

        {/* Header */}
        <div className="mb-8">
          <div className="mb-6 flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Projects Management
              </h1>
              <p className="text-gray-600">
                Track and manage all painting projects
              </p>
            </div>
            <button
              onClick={() => setShowAddModal(true)}
              className="bg-[#74A744] text-white px-6 py-3 rounded-lg hover:bg-[#5F9136] font-medium inline-flex items-center shadow-lg transition-colors"
            >
              <Plus className="w-5 h-5 mr-2" />
              New Project
            </button>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Calendar className="w-6 h-6 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-2xl font-bold text-gray-900">
                    {projects.filter((p) => p.status === "In Progress").length}
                  </p>
                  <p className="text-gray-600">Active Projects</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="p-2 bg-yellow-100 rounded-lg">
                  <Clock className="w-6 h-6 text-yellow-600" />
                </div>
                <div className="ml-4">
                  <p className="text-2xl font-bold text-gray-900">
                    {projects.filter((p) => p.status === "Planning").length}
                  </p>
                  <p className="text-gray-600">Planning</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="p-2 bg-green-100 rounded-lg">
                  <div className="w-6 h-6 text-green-600 flex items-center justify-center font-bold">
                    ✓
                  </div>
                </div>
                <div className="ml-4">
                  <p className="text-2xl font-bold text-gray-900">
                    {projects.filter((p) => p.status === "Completed").length}
                  </p>
                  <p className="text-gray-600">Completed</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="p-2 bg-red-100 rounded-lg">
                  <Clock className="w-6 h-6 text-red-600" />
                </div>
                <div className="ml-4">
                  <p className="text-2xl font-bold text-gray-900">
                    {projects.filter((p) => p.status === "On Hold").length}
                  </p>
                  <p className="text-gray-600">On Hold</p>
                </div>
              </div>
            </div>
          </div>

          {/* Search and Filter */}
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search projects, clients, or addresses..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#74A744] focus:border-transparent"
                />
              </div>
              <div className="flex items-center gap-2">
                <Filter className="w-5 h-5 text-gray-400" />
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#74A744] focus:border-transparent"
                >
                  <option value="all">All Status</option>
                  <option value="Planning">Planning</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Completed">Completed</option>
                  <option value="On Hold">On Hold</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Loading State */}
        {loading ? (
          <div className="text-center py-12">
            <p className="text-gray-500">Loading projects...</p>
          </div>
        ) : (
          <>
            {/* Projects Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
              {filteredProjects.map((project) => (
                <div
                  key={project.id}
                  className="bg-white rounded-lg shadow-lg border hover:shadow-xl transition-shadow"
                >
                  <div className="p-6">
                    <div className="flex justify-between items-start mb-4">
                      <h3 className="text-lg font-semibold text-gray-900 line-clamp-2 flex-1">
                        {project.clients 
                          ? `${project.clients.first_name} ${project.clients.last_name}'s Project`
                          : "Project"}
                      </h3>
                      <div className="flex gap-2 ml-2">
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                            project.status
                          )}`}
                        >
                          {project.status}
                        </span>
                        {project.type && (
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-medium ${getTypeColor(
                              project.type
                            )}`}
                          >
                            {project.type}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="space-y-3 mb-4">
                      <div className="flex items-center text-sm text-gray-600">
                        <User className="w-4 h-4 mr-2" />
                        <span>
                          {project.clients 
                            ? `${project.clients.first_name} ${project.clients.last_name}`
                            : "No client"}
                        </span>
                      </div>
                      {project.clients?.phone && (
                        <div className="flex items-center text-sm text-gray-600">
                          <span className="mr-2">📞</span>
                          <span>{project.clients.phone}</span>
                        </div>
                      )}
                      <div className="flex items-center text-sm text-gray-600">
                        <MapPin className="w-4 h-4 mr-2" />
                        <span className="line-clamp-1">{project.project_address || "No address"}</span>
                      </div>
                      <div className="flex items-center text-sm text-gray-600">
                        <Calendar className="w-4 h-4 mr-2" />
                        <span>
                          {project.start_date || "TBD"} → {project.end_date || "TBD"}
                        </span>
                      </div>
                      {project.quotes?.total_amount && (
                        <div className="flex items-center text-sm text-gray-600">
                          <DollarSign className="w-4 h-4 mr-2" />
                          <span className="font-medium">
                            ${project.quotes.total_amount.toLocaleString()}
                          </span>
                        </div>
                      )}
                    </div>

                    {project.description && (
                      <div className="mb-4">
                        <p className="text-sm text-gray-600 line-clamp-2">
                          {project.description}
                        </p>
                      </div>
                    )}

                    {/* Progress Bar with Status */}
                    <div className="mb-4">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-medium text-gray-700">
                          Progress
                        </span>
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-gray-600">
                            {project.progress || 0}%
                          </span>
                          {project.progress === 100 && (
                            <span className="text-green-600 text-xs font-medium">
                              ✓ Complete
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-3">
                        <div
                          className={`h-3 rounded-full transition-all duration-500 ${
                            project.progress === 100
                              ? "bg-green-500"
                              : project.progress >= 75
                              ? "bg-[#74A744]"
                              : project.progress >= 50
                              ? "bg-blue-500"
                              : project.progress >= 25
                              ? "bg-yellow-500"
                              : "bg-red-500"
                          }`}
                          style={{ width: `${project.progress || 0}%` }}
                        ></div>
                      </div>
                      {/* Progress Milestones */}
                      <div className="flex justify-between text-xs text-gray-400 mt-1">
                        <span>Start</span>
                        <span>25%</span>
                        <span>50%</span>
                        <span>75%</span>
                        <span>Done</span>
                      </div>
                    </div>

                    {/* Progress Update Buttons */}
                    <div className="flex gap-2 mb-3">
                      <button
                        onClick={() => updateProgress(project.id, -10)}
                        disabled={project.progress <= 0}
                        className="px-3 py-1 bg-red-100 text-red-700 text-sm rounded-lg hover:bg-red-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        -10%
                      </button>
                      <button
                        onClick={() => updateProgress(project.id, 10)}
                        disabled={project.progress >= 100}
                        className="px-3 py-1 bg-green-100 text-green-700 text-sm rounded-lg hover:bg-green-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        +10%
                      </button>
                      <button
                        onClick={() => updateProgress(project.id, 25)}
                        disabled={project.progress >= 100}
                        className="px-3 py-1 bg-[#74A744] text-white text-sm rounded-lg hover:bg-[#5F9136] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        +25%
                      </button>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-2">
                      <button 
                        onClick={() => viewProjectDetails(project)}
                        className="flex-1 px-3 py-2 bg-gray-100 text-gray-700 text-sm rounded-lg hover:bg-gray-200 transition-colors"
                      >
                        View Details
                      </button>
                      <button
                        onClick={() => confirmDelete(project)}
                        className="px-3 py-2 bg-red-100 text-red-700 text-sm rounded-lg hover:bg-red-200 transition-colors"
                        title="Delete Project"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Empty State - No Projects */}
            {projects.length === 0 &&
              searchTerm === "" &&
              statusFilter === "all" && (
                <div className="bg-white rounded-lg shadow p-12 text-center">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Calendar className="w-8 h-8 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    No projects yet
                  </h3>
                  <p className="text-gray-500 mb-6">
                    Get started by adding your first painting project
                  </p>
                  <button
                    onClick={() => setShowAddModal(true)}
                    className="bg-[#74A744] text-white px-6 py-3 rounded-lg hover:bg-[#5F9136] font-medium inline-flex items-center"
                  >
                    <Plus className="w-5 h-5 mr-2" />
                    Add First Project
                  </button>
                </div>
              )}

            {/* Empty State - No Search Results */}
            {filteredProjects.length === 0 &&
              (searchTerm !== "" || statusFilter !== "all") && (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Search className="w-8 h-8 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    No projects found
                  </h3>
                  <p className="text-gray-500">
                    Try adjusting your search or filter criteria
                  </p>
                </div>
              )}
          </>
        )}
      </div>

      {/* Add Project Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b flex justify-between items-center">
              <h2 className="text-xl font-semibold text-gray-900">
                Add New Project
              </h2>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Client *
                  </label>
                  <select
                    required
                    value={newProject.client_id}
                    onChange={(e) =>
                      setNewProject({ ...newProject, client_id: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#74A744] focus:border-transparent"
                  >
                    <option value="">Select a client...</option>
                    {clients.map((client) => (
                      <option key={client.id} value={client.id}>
                        {client.first_name} {client.last_name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Project Address *
                  </label>
                  <input
                    type="text"
                    required
                    value={newProject.project_address}
                    onChange={(e) =>
                      setNewProject({ ...newProject, project_address: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#74A744] focus:border-transparent"
                    placeholder="Project address"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Project Type
                  </label>
                  <select
                    value={newProject.type}
                    onChange={(e) =>
                      setNewProject({ ...newProject, type: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#74A744] focus:border-transparent"
                  >
                    <option value="Interior">Interior</option>
                    <option value="Exterior">Exterior</option>
                    <option value="Commercial">Commercial</option>
                    <option value="Specialty">Specialty</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Start Date *
                  </label>
                  <input
                    type="date"
                    required
                    value={newProject.start_date}
                    onChange={(e) =>
                      setNewProject({
                        ...newProject,
                        start_date: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#74A744] focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    End Date *
                  </label>
                  <input
                    type="date"
                    required
                    value={newProject.end_date}
                    onChange={(e) =>
                      setNewProject({ ...newProject, end_date: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#74A744] focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Related Quote (Optional)
                  </label>
                  <select
                    value={newProject.quote_id}
                    onChange={(e) =>
                      setNewProject({ ...newProject, quote_id: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#74A744] focus:border-transparent"
                  >
                    <option value="">None</option>
                    {quotes.map((quote) => (
                      <option key={quote.id} value={quote.id}>
                        ${quote.total_amount?.toLocaleString()} - {quote.clients?.first_name} {quote.clients?.last_name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Related Appointment (Optional)
                  </label>
                  <select
                    value={newProject.appointment_id}
                    onChange={(e) =>
                      setNewProject({ ...newProject, appointment_id: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#74A744] focus:border-transparent"
                  >
                    <option value="">None</option>
                    {appointments.map((appointment) => (
                      <option key={appointment.id} value={appointment.id}>
                        {appointment.appointment_date} - {appointment.clients?.first_name} {appointment.clients?.last_name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <textarea
                    rows={3}
                    value={newProject.description}
                    onChange={(e) =>
                      setNewProject({
                        ...newProject,
                        description: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#74A744] focus:border-transparent"
                    placeholder="Project description and notes..."
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleAddProject}
                  className="flex-1 px-4 py-2 bg-[#74A744] text-white rounded-lg hover:bg-[#5F9136] transition-colors"
                >
                  Add Project
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && projectToDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full">
            <div className="p-6">
              <div className="flex items-center justify-center w-12 h-12 bg-red-100 rounded-full mx-auto mb-4">
                <Trash2 className="w-6 h-6 text-red-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 text-center mb-2">
                Delete Project
              </h3>
              <p className="text-gray-600 text-center mb-6">
                Are you sure you want to delete the project for{" "}
                <strong>
                  {projectToDelete.clients 
                    ? `${projectToDelete.clients.first_name} ${projectToDelete.clients.last_name}`
                    : "this client"}
                </strong>{" "}
                at <strong>{projectToDelete.project_address}</strong>? This action cannot be undone.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowDeleteConfirm(false);
                    setProjectToDelete(null);
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteProject}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Project Details Modal */}
      {showDetailsModal && selectedProject && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b flex justify-between items-center sticky top-0 bg-white z-10">
              <h2 className="text-xl font-semibold text-gray-900">
                Project Details
              </h2>
              <button
                onClick={() => {
                  setShowDetailsModal(false);
                  setSelectedProject(null);
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6">
              {/* Status and Type Badges */}
              <div className="flex gap-2 mb-6">
                <span
                  className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(
                    selectedProject.status
                  )}`}
                >
                  {selectedProject.status}
                </span>
                {selectedProject.type && (
                  <span
                    className={`px-3 py-1 rounded-full text-sm font-medium ${getTypeColor(
                      selectedProject.type
                    )}`}
                  >
                    {selectedProject.type}
                  </span>
                )}
                <span className="px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-800">
                  {selectedProject.progress || 0}% Complete
                </span>
              </div>

              {/* Client Information */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">
                  Client Information
                </h3>
                <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                  <div className="flex items-center text-sm">
                    <User className="w-4 h-4 mr-2 text-gray-500" />
                    <span className="font-medium text-gray-700 w-24">Name:</span>
                    <span className="text-gray-900">
                      {selectedProject.clients
                        ? `${selectedProject.clients.first_name} ${selectedProject.clients.last_name}`
                        : "N/A"}
                    </span>
                  </div>
                  {selectedProject.clients?.email && (
                    <div className="flex items-center text-sm">
                      <span className="mr-2 text-gray-500">📧</span>
                      <span className="font-medium text-gray-700 w-24">Email:</span>
                      <span className="text-gray-900">{selectedProject.clients.email}</span>
                    </div>
                  )}
                  {selectedProject.clients?.phone && (
                    <div className="flex items-center text-sm">
                      <span className="mr-2 text-gray-500">📞</span>
                      <span className="font-medium text-gray-700 w-24">Phone:</span>
                      <span className="text-gray-900">{selectedProject.clients.phone}</span>
                    </div>
                  )}
                  {selectedProject.clients?.address && (
                    <div className="flex items-start text-sm">
                      <MapPin className="w-4 h-4 mr-2 text-gray-500 mt-0.5" />
                      <span className="font-medium text-gray-700 w-24">Address:</span>
                      <span className="text-gray-900 flex-1">{selectedProject.clients.address}</span>
                    </div>
                  )}
                  {selectedProject.clients?.created_at && (
                    <div className="flex items-center text-sm">
                      <Calendar className="w-4 h-4 mr-2 text-gray-500" />
                      <span className="font-medium text-gray-700 w-24">Client Since:</span>
                      <span className="text-gray-900">
                        {new Date(selectedProject.clients.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Project Information */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">
                  Project Information
                </h3>
                <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                  <div className="flex items-start text-sm">
                    <MapPin className="w-4 h-4 mr-2 text-gray-500 mt-0.5" />
                    <span className="font-medium text-gray-700 w-24">Address:</span>
                    <span className="text-gray-900 flex-1">
                      {selectedProject.project_address || "N/A"}
                    </span>
                  </div>
                  {selectedProject.type && (
                    <div className="flex items-center text-sm">
                      <span className="mr-2 text-gray-500">🎨</span>
                      <span className="font-medium text-gray-700 w-24">Type:</span>
                      <span className="text-gray-900">{selectedProject.type}</span>
                    </div>
                  )}
                  <div className="flex items-center text-sm">
                    <Calendar className="w-4 h-4 mr-2 text-gray-500" />
                    <span className="font-medium text-gray-700 w-24">Start Date:</span>
                    <span className="text-gray-900">
                      {selectedProject.start_date || "TBD"}
                    </span>
                  </div>
                  <div className="flex items-center text-sm">
                    <Calendar className="w-4 h-4 mr-2 text-gray-500" />
                    <span className="font-medium text-gray-700 w-24">End Date:</span>
                    <span className="text-gray-900">
                      {selectedProject.end_date || "TBD"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Description */}
              {selectedProject.description && (
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">
                    Description
                  </h3>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-sm text-gray-700 whitespace-pre-wrap">
                      {selectedProject.description}
                    </p>
                  </div>
                </div>
              )}

              {/* Quote Details */}
              {selectedProject.quotes && (
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">
                    Quote Details
                  </h3>
                  <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                    {selectedProject.quotes.total_amount && (
                      <div className="flex items-center text-sm">
                        <DollarSign className="w-4 h-4 mr-2 text-gray-500" />
                        <span className="font-medium text-gray-700 w-40">Total Amount:</span>
                        <span className="text-gray-900 font-semibold">
                          ${selectedProject.quotes.total_amount.toLocaleString()}
                        </span>
                      </div>
                    )}
                    {selectedProject.quotes.project_type && (
                      <div className="flex items-center text-sm">
                        <span className="mr-2 text-gray-500">🎨</span>
                        <span className="font-medium text-gray-700 w-40">Project Type:</span>
                        <span className="text-gray-900">{selectedProject.quotes.project_type}</span>
                      </div>
                    )}
                    {selectedProject.quotes.property_type && (
                      <div className="flex items-center text-sm">
                        <span className="mr-2 text-gray-500">🏠</span>
                        <span className="font-medium text-gray-700 w-40">Property Type:</span>
                        <span className="text-gray-900">{selectedProject.quotes.property_type}</span>
                      </div>
                    )}
                    {selectedProject.quotes.project_address && (
                      <div className="flex items-start text-sm">
                        <MapPin className="w-4 h-4 mr-2 text-gray-500 mt-0.5" />
                        <span className="font-medium text-gray-700 w-40">Quote Address:</span>
                        <span className="text-gray-900 flex-1">{selectedProject.quotes.project_address}</span>
                      </div>
                    )}
                    {selectedProject.quotes.quote_valid_until && (
                      <div className="flex items-center text-sm">
                        <Calendar className="w-4 h-4 mr-2 text-gray-500" />
                        <span className="font-medium text-gray-700 w-40">Valid Until:</span>
                        <span className="text-gray-900">{selectedProject.quotes.quote_valid_until}</span>
                      </div>
                    )}
                    {selectedProject.quotes.project_description && (
                      <div className="flex items-start text-sm mt-3 pt-3 border-t border-gray-200">
                        <span className="font-medium text-gray-700 w-40">Project Description:</span>
                        <span className="text-gray-900 flex-1">{selectedProject.quotes.project_description}</span>
                      </div>
                    )}
                    {selectedProject.quotes.notes && (
                      <div className="flex items-start text-sm mt-3 pt-3 border-t border-gray-200">
                        <span className="font-medium text-gray-700 w-40">Quote Notes:</span>
                        <span className="text-gray-900 flex-1">{selectedProject.quotes.notes}</span>
                      </div>
                    )}
                  </div>

                  {/* Quote Items Table */}
                  {selectedProject.quotes.quote_items && selectedProject.quotes.quote_items.length > 0 && (
                    <div className="mt-4">
                      <h4 className="text-md font-semibold text-gray-900 mb-2">Quote Items</h4>
                      <div className="overflow-x-auto">
                        <table className="min-w-full bg-white border border-gray-200 rounded-lg">
                          <thead className="bg-gray-100">
                            <tr>
                              <th className="px-4 py-2 text-left text-xs font-medium text-gray-700 uppercase">Item</th>
                              <th className="px-4 py-2 text-left text-xs font-medium text-gray-700 uppercase">Description</th>
                              <th className="px-4 py-2 text-center text-xs font-medium text-gray-700 uppercase">Qty</th>
                              <th className="px-4 py-2 text-right text-xs font-medium text-gray-700 uppercase">Price</th>
                              <th className="px-4 py-2 text-right text-xs font-medium text-gray-700 uppercase">Total</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-200">
                            {selectedProject.quotes.quote_items.map((item) => (
                              <tr key={item.id} className="hover:bg-gray-50">
                                <td className="px-4 py-3 text-sm font-medium text-gray-900">{item.item_name}</td>
                                <td className="px-4 py-3 text-sm text-gray-600">{item.description}</td>
                                <td className="px-4 py-3 text-sm text-gray-900 text-center">{item.quantity}</td>
                                <td className="px-4 py-3 text-sm text-gray-900 text-right">${parseFloat(item.price).toFixed(2)}</td>
                                <td className="px-4 py-3 text-sm font-medium text-gray-900 text-right">${parseFloat(item.total).toFixed(2)}</td>
                              </tr>
                            ))}
                            <tr className="bg-gray-50 font-semibold">
                              <td colSpan="4" className="px-4 py-3 text-sm text-gray-900 text-right">Total:</td>
                              <td className="px-4 py-3 text-sm text-gray-900 text-right">
                                ${selectedProject.quotes.total_amount.toLocaleString()}
                              </td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Appointment Details */}
              {selectedProject.appointments && (
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">
                    Appointment Details
                  </h3>
                  <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                    {selectedProject.appointments.appointment_date && (
                      <div className="flex items-center text-sm">
                        <Calendar className="w-4 h-4 mr-2 text-gray-500" />
                        <span className="font-medium text-gray-700 w-32">Date:</span>
                        <span className="text-gray-900">{selectedProject.appointments.appointment_date}</span>
                      </div>
                    )}
                    {selectedProject.appointments.appointment_time && (
                      <div className="flex items-center text-sm">
                        <Clock className="w-4 h-4 mr-2 text-gray-500" />
                        <span className="font-medium text-gray-700 w-32">Time:</span>
                        <span className="text-gray-900">{selectedProject.appointments.appointment_time}</span>
                      </div>
                    )}
                    {selectedProject.appointments.property_type && (
                      <div className="flex items-center text-sm">
                        <span className="mr-2 text-gray-500">🏠</span>
                        <span className="font-medium text-gray-700 w-32">Property Type:</span>
                        <span className="text-gray-900">{selectedProject.appointments.property_type}</span>
                      </div>
                    )}
                    {selectedProject.appointments.location_type && (
                      <div className="flex items-center text-sm">
                        <MapPin className="w-4 h-4 mr-2 text-gray-500" />
                        <span className="font-medium text-gray-700 w-32">Location Type:</span>
                        <span className="text-gray-900">{selectedProject.appointments.location_type}</span>
                      </div>
                    )}
                    {selectedProject.appointments.details && (
                      <div className="flex items-start text-sm mt-3 pt-3 border-t border-gray-200">
                        <span className="font-medium text-gray-700 w-32">Appointment Details:</span>
                        <span className="text-gray-900 flex-1">{selectedProject.appointments.details}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Progress Bar */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Progress</h3>
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium text-gray-700">
                      Completion Status
                    </span>
                    <span className="text-sm text-gray-600">
                      {selectedProject.progress || 0}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div
                      className={`h-3 rounded-full transition-all duration-500 ${
                        selectedProject.progress === 100
                          ? "bg-green-500"
                          : selectedProject.progress >= 75
                          ? "bg-[#74A744]"
                          : selectedProject.progress >= 50
                          ? "bg-blue-500"
                          : selectedProject.progress >= 25
                          ? "bg-yellow-500"
                          : "bg-red-500"
                      }`}
                      style={{ width: `${selectedProject.progress || 0}%` }}
                    ></div>
                  </div>
                </div>
              </div>

              {/* Close Button */}
              <div className="flex justify-end">
                <button
                  onClick={() => {
                    setShowDetailsModal(false);
                    setSelectedProject(null);
                  }}
                  className="px-6 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
