"use client"; // Tells Next.js this component runs on the client side (browser)

// ============================================
// IMPORTS - React hooks, UI icons, and database client
// ============================================
import { useState, useEffect } from "react";
import {
  Plus,          // Add/create icon
  Search,        // Search icon
  Filter,        // Filter icon
  Calendar,      // Calendar/date icon
  DollarSign,    // Money/currency icon
  User,          // User/person icon
  MapPin,        // Location/address icon
  Clock,         // Time/clock icon
  Trash2,        // Delete/trash icon
  X,             // Close/exit icon
  Mail,          // Email icon
  Phone,         // Phone icon
  Palette,       // Paint/color icon
  Home,          // House/home icon
} from "lucide-react";
import { supabase } from "@/src/lib/supabase-client";

export default function ProjectsPage() {
  // ============================================
  // STATE MANAGEMENT - All component state variables
  // ============================================
  
  // Search functionality - stores what user types in search box
  const [searchTerm, setSearchTerm] = useState("");
  
  // Filter functionality - stores selected status filter (all, Planning, In Progress, etc.)
  const [statusFilter, setStatusFilter] = useState("all");
  
  // Controls visibility of "Add Project" modal (true = visible, false = hidden)
  const [showAddModal, setShowAddModal] = useState(false);
  
  // Controls visibility of delete confirmation modal
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  
  // Controls visibility of project details modal
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  
  // Stores the project that user wants to delete
  const [projectToDelete, setProjectToDelete] = useState(null);
  
  // Stores the project selected for viewing details
  const [selectedProject, setSelectedProject] = useState(null);
  
  // Loading state - shows loading message while fetching data from database
  const [loading, setLoading] = useState(true);
  
  // Message state - displays success or error messages to user
  const [message, setMessage] = useState("");

  // Projects data - array that holds all projects loaded from database
  const [projects, setProjects] = useState([]);
  
  // Clients data - for dropdown selection when creating new project
  const [clients, setClients] = useState([]);
  
  // Quotes data - for linking existing quotes to projects
  const [quotes, setQuotes] = useState([]);
  
  // Appointments data - for linking existing appointments to projects
  const [appointments, setAppointments] = useState([]);

  // Form data for new project - stores all input field values when adding a project
  const [newProject, setNewProject] = useState({
    client_id: "",           // Which client this project belongs to
    project_address: "",     // Location of the project
    status: "Planning",      // Default status for new projects
    start_date: "",          // When project starts
    end_date: "",            // When project ends
    description: "",         // Project notes and details
    quote_id: "",            // Optional link to existing quote
    appointment_id: "",      // Optional link to existing appointment
  });

  // ============================================
  // LOAD DATA ON COMPONENT MOUNT
  // ============================================
  
  // useEffect runs once when component loads (empty dependency array [])
  useEffect(() => {
    loadProjects();      // Load all projects
    loadClients();       // Load all clients for dropdown
    loadQuotes();        // Load all quotes for dropdown
    loadAppointments();  // Load all appointments for dropdown
  }, []);

  // ============================================
  // LOAD PROJECTS FROM DATABASE
  // ============================================
  
  // Async function to fetch all projects with related data
  const loadProjects = async () => {
    try {
      // Query Supabase with joins to get related data
      const { data, error } = await supabase
        .from("projects")
        .select(`
          *,
          clients (*),
          quotes (*, quote_items (*)),
          appointments (*)
        `)
        .order("updated_at", { ascending: false });

      if (error) throw error; // If database returns error, throw it to catch block

      // Update projects state with fetched data (or empty array if no data)
      setProjects(data || []);
    } catch (err) {
      console.error("Error loading projects:", err);
      setMessage(`Error loading projects: ${err.message}`);
    } finally {
      // Always set loading to false, whether successful or not
      setLoading(false);
    }
  };

  // ============================================
  // LOAD CLIENTS FROM DATABASE
  // ============================================
  
  // Fetch all clients for the client dropdown in add project form
  const loadClients = async () => {
    try {
      const { data, error } = await supabase
        .from("clients")                         // Select from clients table
        .select("*")                             // Get all client columns
        .order("last_name", { ascending: true }); // Sort alphabetically by last name

      if (error) throw error;

      setClients(data || []); // Update clients state
    } catch (err) {
      console.error("Error loading clients:", err);
    }
  };

  // ============================================
  // LOAD QUOTES FROM DATABASE
  // ============================================
  
  // Fetch all quotes to link to projects
  const loadQuotes = async () => {
    try {
      const { data, error } = await supabase
        .from("quotes")                          // Select from quotes table
        .select("id, total_amount, client_id, clients(first_name, last_name)") // Get specific columns and client info
        .order("created_at", { ascending: false }); // Sort by creation date (newest first)

      if (error) throw error;

      setQuotes(data || []); // Update quotes state
    } catch (err) {
      console.error("Error loading quotes:", err);
    }
  };

  // ============================================
  // LOAD APPOINTMENTS FROM DATABASE
  // ============================================
  
  // Fetch all appointments to link to projects
  const loadAppointments = async () => {
    try {
      const { data, error } = await supabase
        .from("appointments")                    // Select from appointments table
        .select("id, appointment_date, client_id, clients(first_name, last_name)") // Get specific columns and client info
        .order("appointment_date", { ascending: false }); // Sort by date (newest first)

      if (error) throw error;

      setAppointments(data || []); // Update appointments state
    } catch (err) {
      console.error("Error loading appointments:", err);
    }
  };

  // ============================================
  // FILTERING LOGIC - Filter projects based on search and status
  // ============================================
  
  // Filter projects array based on searchTerm and statusFilter
  const filteredProjects = projects.filter((project) => {
    // Build client name from joined client data
    const clientName = project.clients 
      ? `${project.clients.first_name} ${project.clients.last_name}`.toLowerCase()
      : "";
    
    // Get project address (or empty string if null)
    const projectAddress = (project.project_address || "").toLowerCase();
    
    // Check if search term matches client name OR project address (case-insensitive)
    const matchesSearch =
      clientName.includes(searchTerm.toLowerCase()) ||
      projectAddress.includes(searchTerm.toLowerCase());
    
    // Check if status filter matches (or if 'all' is selected, show everything)
    const matchesStatus =
      statusFilter === "all" || project.status === statusFilter;
    
    // Return true only if both conditions are met
    return matchesSearch && matchesStatus;
  });

  // ============================================
  // PROGRESS UPDATE - Update project progress and auto-update status
  // ============================================
  
  // Function to update a project's progress percentage in the database
  const updateProgress = async (projectId, change) => {
    // Find the specific project by ID
    const project = projects.find((p) => p.id === projectId);
    if (!project) return; // Exit if project not found

    // Calculate new progress: add change, but keep between 0-100
    // Math.max ensures it doesn't go below 0, Math.min ensures it doesn't exceed 100
    const newProgress = Math.max(0, Math.min(100, (project.progress || 0) + change));

    // Auto-update status based on progress percentage
    let newStatus = project.status;
    if (newProgress === 0) {
      newStatus = "Planning";        // 0% = Planning
    } else if (newProgress > 0 && newProgress < 100) {
      newStatus = "In Progress";     // 1-99% = In Progress
    } else if (newProgress === 100) {
      newStatus = "Completed";       // 100% = Completed
    }

    try {
      // Update the database with new progress, status, and timestamp
      const { error } = await supabase
        .from("projects")              // Target the projects table
        .update({                      // Update these fields
          progress: newProgress,       // New progress value
          status: newStatus,           // Auto-calculated status
          updated_at: new Date().toISOString(), // Current timestamp
        })
        .eq("id", projectId);          // Only update where id matches projectId

      // If database update fails, throw error
      if (error) throw error;

      // Update local state to reflect changes immediately (without reloading from database)
      setProjects(
        projects.map((p) => {
          if (p.id === projectId) {
            // For matching project, return updated version
            return {
              ...p,                    // Keep all existing properties
              progress: newProgress,   // Update progress
              status: newStatus,       // Update status
              updated_at: new Date().toISOString(), // Update timestamp
            };
          }
          return p; // For all other projects, return unchanged
        })
      );
      
      // Show success message
      setMessage("Progress updated successfully!");
      
      // Clear message after 3 seconds
      setTimeout(() => setMessage(""), 3000);
    } catch (err) {
      // If update fails, log error and show message to user
      console.error("Error updating progress:", err);
      setMessage(`Error updating progress: ${err.message}`);
    }
  };

  // ============================================
  // ADD PROJECT - Handle form submission to create new project
  // ============================================
  
  // Function called when user submits the "Add Project" form
  const handleAddProject = async (e) => {
    e.preventDefault(); // Prevent page refresh on form submit
    setMessage("");     // Clear any existing messages

    try {
      // Prepare project data for database
      const projectData = {
        client_id: newProject.client_id,
        project_address: newProject.project_address,
        status: newProject.status,
        start_date: newProject.start_date,
        end_date: newProject.end_date,
        description: newProject.description,
        progress: 0,                            // New projects always start at 0%
      };

      // Only add quote_id if user selected a quote (not empty)
      if (newProject.quote_id && newProject.quote_id !== "") {
        projectData.quote_id = newProject.quote_id;
      }

      // Only add appointment_id if user selected an appointment (not empty)
      if (newProject.appointment_id && newProject.appointment_id !== "") {
        projectData.appointment_id = newProject.appointment_id;
      }

      // Insert new project into database and return the created project with all joined data
      const { data, error } = await supabase
        .from("projects")
        .insert([projectData])
        .select(`
          *,
          clients (*),
          quotes (*, quote_items (*)),
          appointments (*)
        `);

      // If insertion fails, throw error
      if (error) throw error;

      // Show success message
      setMessage("Project added successfully!");
      
      // Reload all projects to ensure data consistency
      await loadProjects();

      // Reset form to empty values
      setNewProject({
        client_id: "",
        project_address: "",
        status: "Planning",
        start_date: "",
        end_date: "",
        description: "",
        quote_id: "",
        appointment_id: "",
      });
      
      // Close the modal
      setShowAddModal(false);

      // Clear success message after 3 seconds
      setTimeout(() => setMessage(""), 3000);
    } catch (err) {
      // If anything fails, log error and show message to user
      console.error("Error adding project:", err);
      setMessage(`Error adding project: ${err.message}`);
    }
  };

  // ============================================
  // DELETE PROJECT - Remove project from database
  // ============================================
  
  // Function to delete a project after confirmation
  const handleDeleteProject = async () => {
    if (!projectToDelete) return; // Safety check - exit if no project selected

    try {
      // Delete project from database
      const { error } = await supabase
        .from("projects")              // Target projects table
        .delete()                      // Delete operation
        .eq("id", projectToDelete.id); // Only delete where id matches

      // If deletion fails, throw error
      if (error) throw error;

      // Show success message
      setMessage("Project deleted successfully!");
      
      // Remove deleted project from local state (filter it out)
      setProjects(projects.filter((p) => p.id !== projectToDelete.id));
      
      // Close confirmation modal
      setShowDeleteConfirm(false);
      
      // Clear selected project
      setProjectToDelete(null);

      // Clear success message after 3 seconds
      setTimeout(() => setMessage(""), 3000);
    } catch (err) {
      // If deletion fails, log error and show message to user
      console.error("Error deleting project:", err);
      setMessage(`Error deleting project: ${err.message}`);
    }
  };

  // ============================================
  // MODAL CONTROL FUNCTIONS
  // ============================================
  
  // Opens delete confirmation modal with selected project
  const confirmDelete = (project) => {
    setProjectToDelete(project);      // Store project to delete
    setShowDeleteConfirm(true);       // Show confirmation modal
  };

  // Opens project details modal with selected project
  const viewProjectDetails = (project) => {
    setSelectedProject(project);      // Store project to view
    setShowDetailsModal(true);        // Show details modal
  };

  // ============================================
  // UTILITY FUNCTIONS - Get colors for different statuses and types
  // ============================================
  
  // Returns CSS classes for status badge colors
  const getStatusColor = (status) => {
    switch (status) {
      case "Planning":
        return "bg-yellow-100 text-yellow-800";       // Yellow for planning
      case "In Progress":
        return "bg-blue-100 text-blue-800";          // Blue for in progress
      case "Completed":
        return "bg-green-100 text-green-800";        // Green for completed
      case "On Hold":
        return "bg-red-100 text-red-800";            // Red for on hold
      default:
        return "bg-gray-100 text-gray-800";           // Gray as fallback
    }
  };

  // Returns CSS classes for project type badge colors
  const getTypeColor = (type) => {
    switch (type) {
      case "Interior":
        return "bg-purple-100 text-purple-800";      // Purple for interior
      case "Exterior":
        return "bg-orange-100 text-orange-800";      // Orange for exterior
      case "Commercial":
        return "bg-indigo-100 text-indigo-800";      // Indigo for commercial
      case "Specialty":
        return "bg-pink-100 text-pink-800";          // Pink for specialty
      default:
        return "bg-gray-100 text-gray-800";           // Gray as fallback
    }
  };

  // ============================================
  // JSX RETURN - The actual UI/HTML structure
  // ============================================
  return (
    <div className="flex flex-col min-h-screen bg-white">
      <div className="flex-1 p-8 bg-gray-50">
        
        {/* ============================================ */}
        {/* SUCCESS/ERROR MESSAGE BANNER */}
        {/* ============================================ */}
        {/* Only shows when message exists */}
        {message && (
          <div
            className={`mb-4 p-4 rounded-lg ${
              message.includes("Error")
                ? "bg-red-100 text-red-800"    // Red for errors
                : "bg-green-100 text-green-800" // Green for success
            }`}
          >
            {message}
          </div>
        )}

        {/* ============================================ */}
        {/* PAGE HEADER - Title and New Project Button */}
        {/* ============================================ */}
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
            
            {/* New Project Button */}
            <button
              onClick={() => setShowAddModal(true)} // Open add project modal
              className="bg-[#74A744] text-white px-6 py-3 rounded-lg hover:bg-[#5F9136] font-medium inline-flex items-center shadow-lg transition-colors"
            >
              <Plus className="w-5 h-5 mr-2" />
              New Project
            </button>
          </div>

          {/* ============================================ */}
          {/* STATISTICS CARDS - Dashboard overview */}
          {/* ============================================ */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
            
            {/* Active Projects Card */}
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Calendar className="w-6 h-6 text-blue-600" />
                </div>
                <div className="ml-4">
                  {/* Filter and count projects with "In Progress" status */}
                  <p className="text-2xl font-bold text-gray-900">
                    {projects.filter((p) => p.status === "In Progress").length}
                  </p>
                  <p className="text-gray-600">Active Projects</p>
                </div>
              </div>
            </div>

            {/* Planning Projects Card */}
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="p-2 bg-yellow-100 rounded-lg">
                  <Clock className="w-6 h-6 text-yellow-600" />
                </div>
                <div className="ml-4">
                  {/* Filter and count projects with "Planning" status */}
                  <p className="text-2xl font-bold text-gray-900">
                    {projects.filter((p) => p.status === "Planning").length}
                  </p>
                  <p className="text-gray-600">Planning</p>
                </div>
              </div>
            </div>

            {/* Completed Projects Card */}
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="p-2 bg-green-100 rounded-lg">
                  <div className="w-6 h-6 text-green-600 flex items-center justify-center font-bold">
                    ✓
                  </div>
                </div>
                <div className="ml-4">
                  {/* Filter and count projects with "Completed" status */}
                  <p className="text-2xl font-bold text-gray-900">
                    {projects.filter((p) => p.status === "Completed").length}
                  </p>
                  <p className="text-gray-600">Completed</p>
                </div>
              </div>
            </div>

            {/* On Hold Projects Card */}
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="p-2 bg-red-100 rounded-lg">
                  <Clock className="w-6 h-6 text-red-600" />
                </div>
                <div className="ml-4">
                  {/* Filter and count projects with "On Hold" status */}
                  <p className="text-2xl font-bold text-gray-900">
                    {projects.filter((p) => p.status === "On Hold").length}
                  </p>
                  <p className="text-gray-600">On Hold</p>
                </div>
              </div>
            </div>
          </div>

          {/* ============================================ */}
          {/* SEARCH AND FILTER BAR */}
          {/* ============================================ */}
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <div className="flex flex-col md:flex-row gap-4">
              
              {/* Search Input */}
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search projects, clients, or addresses..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)} // Update searchTerm when user types
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#74A744] focus:border-transparent"
                />
              </div>
              
              {/* Status Filter Dropdown */}
              <div className="flex items-center gap-2">
                <Filter className="w-5 h-5 text-gray-400" />
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)} // Update statusFilter when user selects
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

        {/* ============================================ */}
        {/* LOADING STATE - Shows while fetching data */}
        {/* ============================================ */}
        {loading ? (
          <div className="text-center py-12">
            <p className="text-gray-500">Loading projects...</p>
          </div>
        ) : (
          <>
            {/* ============================================ */}
            {/* PROJECTS GRID - Display all filtered projects */}
            {/* ============================================ */}
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
              {/* Loop through filtered projects and create a card for each */}
              {filteredProjects.map((project) => (
                <div
                  key={project.id}
                  className="bg-white rounded-lg shadow-lg border hover:shadow-xl transition-shadow"
                >
                  <div className="p-6">
                    
                    {/* Project Header - Name and Status/Type badges */}
                    <div className="flex justify-between items-start mb-4">
                      <h3 className="text-lg font-semibold text-gray-900 line-clamp-2 flex-1">
                        {/* Display client name with possessive or generic "Project" */}
                        {project.clients 
                          ? `${project.clients.first_name} ${project.clients.last_name}'s Project`
                          : "Project"}
                      </h3>
                      <div className="flex gap-2 ml-2">
                        {/* Status badge with dynamic color */}
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                            project.status
                          )}`}
                        >
                          {project.status}
                        </span>
                        {/* Type badge with dynamic color (only if type exists) */}
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

                    {/* ============================================ */}
                    {/* PROJECT DETAILS */}
                    {/* ============================================ */}
                    <div className="space-y-3 mb-4">
                      {/* Client name with icon */}
                      <div className="flex items-center text-sm text-gray-600">
                        <User className="w-4 h-4 mr-2" />
                        <span>
                          {project.clients 
                            ? `${project.clients.first_name} ${project.clients.last_name}`
                            : "No client"}
                        </span>
                      </div>
                      
                      {/* Phone (only show if client has phone) */}
                      {project.clients?.phone && (
                        <div className="flex items-center text-sm text-gray-600">
                          <Phone className="w-4 h-4 mr-2" />
                          <span>{project.clients.phone}</span>
                        </div>
                      )}
                      
                      {/* Project address with icon */}
                      <div className="flex items-center text-sm text-gray-600">
                        <MapPin className="w-4 h-4 mr-2" />
                        <span className="line-clamp-1">{project.project_address || "No address"}</span>
                      </div>
                      
                      {/* Date range with icon */}
                      <div className="flex items-center text-sm text-gray-600">
                        <Calendar className="w-4 h-4 mr-2" />
                        <span>
                          {project.start_date || "TBD"} → {project.end_date || "TBD"}
                        </span>
                      </div>
                      
                      {/* Quote amount (only show if quote exists and has amount) */}
                      {project.quotes?.total_amount && (
                        <div className="flex items-center text-sm text-gray-600">
                          <DollarSign className="w-4 h-4 mr-2" />
                          <span className="font-medium">
                            ${project.quotes.total_amount.toLocaleString()}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Project Description (only show if exists) */}
                    {project.description && (
                      <div className="mb-4">
                        <p className="text-sm text-gray-600 line-clamp-2">
                          {project.description}
                        </p>
                      </div>
                    )}

                    {/* ============================================ */}
                    {/* PROGRESS BAR - Visual representation of completion */}
                    {/* ============================================ */}
                    <div className="mb-4">
                      {/* Progress header with percentage */}
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-medium text-gray-700">
                          Progress
                        </span>
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-gray-600">
                            {project.progress || 0}%
                          </span>
                          {/* Show checkmark if 100% complete */}
                          {project.progress === 100 && (
                            <span className="text-green-600 text-xs font-medium">
                              ✓ Complete
                            </span>
                          )}
                        </div>
                      </div>
                      
                      {/* Animated progress bar with color based on completion */}
                      <div className="w-full bg-gray-200 rounded-full h-3">
                        <div
                          className={`h-3 rounded-full transition-all duration-500 ${
                            project.progress === 100
                              ? "bg-green-500"      // 100% = Green
                              : project.progress >= 75
                              ? "bg-[#74A744]"      // 75-99% = Brand green
                              : project.progress >= 50
                              ? "bg-blue-500"       // 50-74% = Blue
                              : project.progress >= 25
                              ? "bg-yellow-500"     // 25-49% = Yellow
                              : "bg-red-500"        // 0-24% = Red
                          }`}
                          style={{ width: `${project.progress || 0}%` }} // Dynamic width based on progress
                        ></div>
                      </div>
                      
                      {/* Progress milestone markers (0%, 25%, 50%, 75%, 100%) */}
                      <div className="flex justify-between text-xs text-gray-400 mt-1">
                        <span>Start</span>
                        <span>25%</span>
                        <span>50%</span>
                        <span>75%</span>
                        <span>Done</span>
                      </div>
                    </div>

                    {/* ============================================ */}
                    {/* PROGRESS UPDATE BUTTONS */}
                    {/* ============================================ */}
                    <div className="flex gap-2 mb-3">
                      {/* Decrease progress by 10% - disabled if at 0% */}
                      <button
                        onClick={() => updateProgress(project.id, -10)}
                        disabled={project.progress <= 0}
                        className="px-3 py-1 bg-red-100 text-red-700 text-sm rounded-lg hover:bg-red-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        -10%
                      </button>
                      
                      {/* Increase progress by 10% - disabled if at 100% */}
                      <button
                        onClick={() => updateProgress(project.id, 10)}
                        disabled={project.progress >= 100}
                        className="px-3 py-1 bg-green-100 text-green-700 text-sm rounded-lg hover:bg-green-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        +10%
                      </button>
                      
                      {/* Increase progress by 25% - disabled if at 100% */}
                      <button
                        onClick={() => updateProgress(project.id, 25)}
                        disabled={project.progress >= 100}
                        className="px-3 py-1 bg-[#74A744] text-white text-sm rounded-lg hover:bg-[#5F9136] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        +25%
                      </button>
                    </div>

                    {/* ============================================ */}
                    {/* ACTION BUTTONS - View Details and Delete */}
                    {/* ============================================ */}
                    <div className="flex gap-2">
                      {/* View Details Button - Opens detail modal */}
                      <button 
                        onClick={() => viewProjectDetails(project)}
                        className="flex-1 px-3 py-2 bg-gray-100 text-gray-700 text-sm rounded-lg hover:bg-gray-200 transition-colors"
                      >
                        View Details
                      </button>
                      
                      {/* Delete Button - Opens confirmation modal */}
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

            {/* ============================================ */}
            {/* EMPTY STATE - No projects exist yet */}
            {/* ============================================ */}
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
                    onClick={() => setShowAddModal(true)} // Open add project modal
                    className="bg-[#74A744] text-white px-6 py-3 rounded-lg hover:bg-[#5F9136] font-medium inline-flex items-center"
                  >
                    <Plus className="w-5 h-5 mr-2" />
                    Add First Project
                  </button>
                </div>
              )}

            {/* ============================================ */}
            {/* EMPTY STATE - No search results */}
            {/* ============================================ */}
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

      {/* ============================================ */}
      {/* ADD PROJECT MODAL - Form to create new project */}
      {/* ============================================ */}
      {showAddModal && (
        // Modal overlay - dark background covering entire screen
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          {/* Modal content container - scrollable */}
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            
            {/* Modal Header with Close Button */}
            <div className="p-6 border-b flex justify-between items-center">
              <h2 className="text-xl font-semibold text-gray-900">
                Add New Project
              </h2>
              {/* Close button (X icon) */}
              <button
                onClick={() => setShowAddModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* ============================================ */}
            {/* ADD PROJECT FORM - All input fields */}
            {/* ============================================ */}
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                
                {/* Client Dropdown - Required field */}
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
                    {/* Loop through all clients and create option for each */}
                    {clients.map((client) => (
                      <option key={client.id} value={client.id}>
                        {client.first_name} {client.last_name} - {client.email}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Project Address Input - Spans 2 columns on medium+ screens */}
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

                {/* Description Textarea - Spans 2 columns */}
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

                {/* Start Date Input */}
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

                {/* End Date Input */}
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

                {/* Related Quote Dropdown - Optional */}
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
                    {/* Loop through quotes and show amount + client name */}
                    {quotes.map((quote) => (
                      <option key={quote.id} value={quote.id}>
                        ${quote.total_amount?.toLocaleString()} - {quote.clients?.first_name} {quote.clients?.last_name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Related Appointment Dropdown - Optional */}
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
                    {/* Loop through appointments and show date + client name */}
                    {appointments.map((appointment) => (
                      <option key={appointment.id} value={appointment.id}>
                        {appointment.appointment_date} - {appointment.clients?.first_name} {appointment.clients?.last_name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Modal Action Buttons */}
              <div className="flex gap-3 pt-4">
                {/* Cancel button - closes modal without saving */}
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                
                {/* Add Project button - triggers handleAddProject function */}
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

      {/* ============================================ */}
      {/* DELETE CONFIRMATION MODAL */}
      {/* ============================================ */}
      {showDeleteConfirm && projectToDelete && (
        // Modal overlay
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          {/* Modal content */}
          <div className="bg-white rounded-lg max-w-md w-full">
            <div className="p-6">
              {/* Warning icon */}
              <div className="flex items-center justify-center w-12 h-12 bg-red-100 rounded-full mx-auto mb-4">
                <Trash2 className="w-6 h-6 text-red-600" />
              </div>
              
              {/* Confirmation message */}
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
              
              {/* Action buttons */}
              <div className="flex gap-3">
                {/* Cancel button - closes modal without deleting */}
                <button
                  onClick={() => {
                    setShowDeleteConfirm(false);
                    setProjectToDelete(null);
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                
                {/* Delete button - confirms deletion */}
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

      {/* ============================================ */}
      {/* PROJECT DETAILS MODAL - Comprehensive view of project */}
      {/* ============================================ */}
      {showDetailsModal && selectedProject && (
        // Modal overlay
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          {/* Modal content - scrollable */}
          <div className="bg-white rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            
            {/* Modal Header - Sticky at top */}
            <div className="p-6 border-b flex justify-between items-center sticky top-0 bg-white z-10">
              <h2 className="text-xl font-semibold text-gray-900">
                Project Details
              </h2>
              {/* Close button */}
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
              
              {/* ============================================ */}
              {/* STATUS AND TYPE BADGES */}
              {/* ============================================ */}
              <div className="flex gap-2 mb-6">
                {/* Status badge */}
                <span
                  className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(
                    selectedProject.status
                  )}`}
                >
                  {selectedProject.status}
                </span>
                
                {/* Type badge (only if type exists) */}
                {selectedProject.type && (
                  <span
                    className={`px-3 py-1 rounded-full text-sm font-medium ${getTypeColor(
                      selectedProject.type
                    )}`}
                  >
                    {selectedProject.type}
                  </span>
                )}
                
                {/* Progress badge */}
                <span className="px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-800">
                  {selectedProject.progress || 0}% Complete
                </span>
              </div>

              {/* ============================================ */}
              {/* CLIENT INFORMATION SECTION */}
              {/* ============================================ */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">
                  Client Information
                </h3>
                <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                  {/* Client name */}
                  <div className="flex items-center text-sm">
                    <User className="w-4 h-4 mr-2 text-gray-500" />
                    <span className="font-medium text-gray-700 w-24">Name:</span>
                    <span className="text-gray-900">
                      {selectedProject.clients
                        ? `${selectedProject.clients.first_name} ${selectedProject.clients.last_name}`
                        : "N/A"}
                    </span>
                  </div>
                  
                  {/* Client email (only if exists) */}
                  {selectedProject.clients?.email && (
                    <div className="flex items-center text-sm">
                      <Mail className="w-4 h-4 mr-2 text-gray-500" />
                      <span className="font-medium text-gray-700 w-24">Email:</span>
                      <span className="text-gray-900">{selectedProject.clients.email}</span>
                    </div>
                  )}
                  
                  {/* Client phone (only if exists) */}
                  {selectedProject.clients?.phone && (
                    <div className="flex items-center text-sm">
                      <Phone className="w-4 h-4 mr-2 text-gray-500" />
                      <span className="font-medium text-gray-700 w-24">Phone:</span>
                      <span className="text-gray-900">{selectedProject.clients.phone}</span>
                    </div>
                  )}
                  
                  {/* Client address (only if exists) */}
                  {selectedProject.clients?.address && (
                    <div className="flex items-start text-sm">
                      <MapPin className="w-4 h-4 mr-2 text-gray-500 mt-0.5" />
                      <span className="font-medium text-gray-700 w-24">Address:</span>
                      <span className="text-gray-900 flex-1">{selectedProject.clients.address}</span>
                    </div>
                  )}
                  
                  {/* Client since date (only if exists) */}
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

              {/* ============================================ */}
              {/* PROJECT INFORMATION SECTION */}
              {/* ============================================ */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">
                  Project Information
                </h3>
                <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                  {/* Project address */}
                  <div className="flex items-start text-sm">
                    <MapPin className="w-4 h-4 mr-2 text-gray-500 mt-0.5" />
                    <span className="font-medium text-gray-700 w-24">Address:</span>
                    <span className="text-gray-900 flex-1">
                      {selectedProject.project_address || "N/A"}
                    </span>
                  </div>
                  
                  {/* Project type (only if exists) */}
                  {selectedProject.type && (
                    <div className="flex items-center text-sm">
                      <Palette className="w-4 h-4 mr-2 text-gray-500" />
                      <span className="font-medium text-gray-700 w-24">Type:</span>
                      <span className="text-gray-900">{selectedProject.type}</span>
                    </div>
                  )}
                  
                  {/* Start date */}
                  <div className="flex items-center text-sm">
                    <Calendar className="w-4 h-4 mr-2 text-gray-500" />
                    <span className="font-medium text-gray-700 w-24">Start Date:</span>
                    <span className="text-gray-900">
                      {selectedProject.start_date || "TBD"}
                    </span>
                  </div>
                  
                  {/* End date */}
                  <div className="flex items-center text-sm">
                    <Calendar className="w-4 h-4 mr-2 text-gray-500" />
                    <span className="font-medium text-gray-700 w-24">End Date:</span>
                    <span className="text-gray-900">
                      {selectedProject.end_date || "TBD"}
                    </span>
                  </div>
                </div>
              </div>

              {/* ============================================ */}
              {/* DESCRIPTION SECTION (only if exists) */}
              {/* ============================================ */}
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

              {/* ============================================ */}
              {/* QUOTE DETAILS SECTION (only if quote exists) */}
              {/* ============================================ */}
              {selectedProject.quotes && (
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">
                    Quote Details
                  </h3>
                  <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                    {/* Total amount */}
                    {selectedProject.quotes.total_amount && (
                      <div className="flex items-center text-sm">
                        <DollarSign className="w-4 h-4 mr-2 text-gray-500" />
                        <span className="font-medium text-gray-700 w-40">Total Amount:</span>
                        <span className="text-gray-900 font-semibold">
                          ${selectedProject.quotes.total_amount.toLocaleString()}
                        </span>
                      </div>
                    )}
                    
                    {/* Project type from quote */}
                    {selectedProject.quotes.project_type && (
                      <div className="flex items-center text-sm">
                        <Palette className="w-4 h-4 mr-2 text-gray-500" />
                        <span className="font-medium text-gray-700 w-40">Project Type:</span>
                        <span className="text-gray-900">{selectedProject.quotes.project_type}</span>
                      </div>
                    )}
                    
                    {/* Property type from quote */}
                    {selectedProject.quotes.property_type && (
                      <div className="flex items-center text-sm">
                        <Home className="w-4 h-4 mr-2 text-gray-500" />
                        <span className="font-medium text-gray-700 w-40">Property Type:</span>
                        <span className="text-gray-900">{selectedProject.quotes.property_type}</span>
                      </div>
                    )}
                    
                    {/* Quote address */}
                    {selectedProject.quotes.project_address && (
                      <div className="flex items-start text-sm">
                        <MapPin className="w-4 h-4 mr-2 text-gray-500 mt-0.5" />
                        <span className="font-medium text-gray-700 w-40">Quote Address:</span>
                        <span className="text-gray-900 flex-1">{selectedProject.quotes.project_address}</span>
                      </div>
                    )}
                    
                    {/* Quote valid until date */}
                    {selectedProject.quotes.quote_valid_until && (
                      <div className="flex items-center text-sm">
                        <Calendar className="w-4 h-4 mr-2 text-gray-500" />
                        <span className="font-medium text-gray-700 w-40">Valid Until:</span>
                        <span className="text-gray-900">{selectedProject.quotes.quote_valid_until}</span>
                      </div>
                    )}
                    
                    {/* Project description from quote */}
                    {selectedProject.quotes.project_description && (
                      <div className="flex items-start text-sm mt-3 pt-3 border-t border-gray-200">
                        <span className="font-medium text-gray-700 w-40">Project Description:</span>
                        <span className="text-gray-900 flex-1">{selectedProject.quotes.project_description}</span>
                      </div>
                    )}
                    
                    {/* Quote notes */}
                    {selectedProject.quotes.notes && (
                      <div className="flex items-start text-sm mt-3 pt-3 border-t border-gray-200">
                        <span className="font-medium text-gray-700 w-40">Quote Notes:</span>
                        <span className="text-gray-900 flex-1">{selectedProject.quotes.notes}</span>
                      </div>
                    )}
                  </div>

                  {/* ============================================ */}
                  {/* QUOTE ITEMS TABLE (only if items exist) */}
                  {/* ============================================ */}
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
                            {/* Loop through quote items */}
                            {selectedProject.quotes.quote_items.map((item) => (
                              <tr key={item.id} className="hover:bg-gray-50">
                                <td className="px-4 py-3 text-sm font-medium text-gray-900">{item.item_name}</td>
                                <td className="px-4 py-3 text-sm text-gray-600">{item.description}</td>
                                <td className="px-4 py-3 text-sm text-gray-900 text-center">{item.quantity}</td>
                                <td className="px-4 py-3 text-sm text-gray-900 text-right">${parseFloat(item.price).toFixed(2)}</td>
                                <td className="px-4 py-3 text-sm font-medium text-gray-900 text-right">${parseFloat(item.total).toFixed(2)}</td>
                              </tr>
                            ))}
                            {/* Total row */}
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

              {/* ============================================ */}
              {/* APPOINTMENT DETAILS SECTION (only if appointment exists) */}
              {/* ============================================ */}
              {selectedProject.appointments && (
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">
                    Appointment Details
                  </h3>
                  <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                    {/* Appointment date */}
                    {selectedProject.appointments.appointment_date && (
                      <div className="flex items-center text-sm">
                        <Calendar className="w-4 h-4 mr-2 text-gray-500" />
                        <span className="font-medium text-gray-700 w-32">Date:</span>
                        <span className="text-gray-900">{selectedProject.appointments.appointment_date}</span>
                      </div>
                    )}
                    
                    {/* Appointment time */}
                    {selectedProject.appointments.appointment_time && (
                      <div className="flex items-center text-sm">
                        <Clock className="w-4 h-4 mr-2 text-gray-500" />
                        <span className="font-medium text-gray-700 w-32">Time:</span>
                        <span className="text-gray-900">{selectedProject.appointments.appointment_time}</span>
                      </div>
                    )}
                    
                    {/* Property type from appointment */}
                    {selectedProject.appointments.property_type && (
                      <div className="flex items-center text-sm">
                        <Home className="w-4 h-4 mr-2 text-gray-500" />
                        <span className="font-medium text-gray-700 w-32">Property Type:</span>
                        <span className="text-gray-900">{selectedProject.appointments.property_type}</span>
                      </div>
                    )}
                    
                    {/* Location type from appointment */}
                    {selectedProject.appointments.location_type && (
                      <div className="flex items-center text-sm">
                        <MapPin className="w-4 h-4 mr-2 text-gray-500" />
                        <span className="font-medium text-gray-700 w-32">Location Type:</span>
                        <span className="text-gray-900">{selectedProject.appointments.location_type}</span>
                      </div>
                    )}
                    
                    {/* Appointment details/notes */}
                    {selectedProject.appointments.details && (
                      <div className="flex items-start text-sm mt-3 pt-3 border-t border-gray-200">
                        <span className="font-medium text-gray-700 w-32">Appointment Details:</span>
                        <span className="text-gray-900 flex-1">{selectedProject.appointments.details}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* ============================================ */}
              {/* PROGRESS BAR SECTION */}
              {/* ============================================ */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Progress</h3>
                <div className="bg-gray-50 rounded-lg p-4">
                  {/* Progress percentage display */}
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium text-gray-700">
                      Completion Status
                    </span>
                    <span className="text-sm text-gray-600">
                      {selectedProject.progress || 0}%
                    </span>
                  </div>
                  
                  {/* Animated progress bar */}
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div
                      className={`h-3 rounded-full transition-all duration-500 ${
                        selectedProject.progress === 100
                          ? "bg-green-500"      // 100% = Green
                          : selectedProject.progress >= 75
                          ? "bg-[#74A744]"      // 75-99% = Brand green
                          : selectedProject.progress >= 50
                          ? "bg-blue-500"       // 50-74% = Blue
                          : selectedProject.progress >= 25
                          ? "bg-yellow-500"     // 25-49% = Yellow
                          : "bg-red-500"        // 0-24% = Red
                      }`}
                      style={{ width: `${selectedProject.progress || 0}%` }} // Dynamic width
                    ></div>
                  </div>
                </div>
              </div>

              {/* ============================================ */}
              {/* CLOSE BUTTON */}
              {/* ============================================ */}
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