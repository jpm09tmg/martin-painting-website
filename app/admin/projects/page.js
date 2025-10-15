'use client' // This tells Next.js this is a client-side component (runs in the browser, not on the server)

// Import React hooks for state management and side effects
import { useState, useEffect } from 'react'

// Import icons from lucide-react library for UI elements
import { Plus, Search, Filter, Calendar, DollarSign, User, MapPin, Clock } from 'lucide-react'

// Import Supabase client to interact with the database
import { supabase } from '@/lib/supabase-client'

export default function ProjectsPage() {
  // ============================================
  // STATE MANAGEMENT - All component state variables
  // ============================================
  
  // Search functionality - stores what user types in search box
  const [searchTerm, setSearchTerm] = useState('')
  
  // Filter functionality - stores selected status filter (all, Planning, In Progress, etc.)
  const [statusFilter, setStatusFilter] = useState('all')
  
  // Controls visibility of "Add Project" modal (true = visible, false = hidden)
  const [showAddModal, setShowAddModal] = useState(false)
  
  // Loading state - shows loading message while fetching data from database
  const [loading, setLoading] = useState(true)
  
  // Message state - displays success or error messages to user
  const [message, setMessage] = useState('')
  
  // Projects data - array that holds all projects loaded from database
  const [projects, setProjects] = useState([])

  // Form data for new project - stores all input field values when adding a project
  const [newProject, setNewProject] = useState({
    name: '',           // Project name
    client: '',         // Client name
    address: '',        // Project location
    status: 'Planning', // Default status
    startDate: '',      // Project start date
    endDate: '',        // Project end date
    budget: '',         // Project budget amount
    type: 'Interior',   // Default project type
    description: ''     // Project description
  })

  // ============================================
  // DATA LOADING - Fetch projects from database
  // ============================================
  
  // useEffect runs when component first loads (empty dependency array [] means run once)
  useEffect(() => {
    loadProjects() // Call function to load projects from database
  }, [])

  // Function to fetch all projects from Supabase database
  const loadProjects = async () => {
    try {
      // Query Supabase: select all columns from 'projects' table, ordered by creation date (newest first)
      const { data, error } = await supabase
        .from('projects')                          // Select the 'projects' table
        .select('*')                               // Get all columns
        .order('created_at', { ascending: false }) // Sort by created_at, newest first

      // If there's an error from the database, throw it to be caught below
      if (error) throw error
      
      // Update projects state with fetched data (or empty array if no data)
      setProjects(data || [])
    } catch (err) {
      // If something goes wrong, log error and show message to user
      console.error('Error loading projects:', err)
      setMessage(`Error loading projects: ${err.message}`)
    } finally {
      // Always run this - set loading to false whether successful or not
      setLoading(false)
    }
  }

  // ============================================
  // FILTERING LOGIC - Filter projects based on search and status
  // ============================================
  
  // Filter projects array based on searchTerm and statusFilter
  const filteredProjects = projects.filter(project => {
    // Check if search term matches project name, client name, or address (case-insensitive)
    const matchesSearch = project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         project.client.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         project.address.toLowerCase().includes(searchTerm.toLowerCase())
    
    // Check if status filter matches (or if 'all' is selected, show everything)
    const matchesStatus = statusFilter === 'all' || project.status === statusFilter
    
    // Return true only if both conditions are met
    return matchesSearch && matchesStatus
  })

  // ============================================
  // PROGRESS UPDATE - Update project progress and auto-update status
  // ============================================
  
  // Function to update a project's progress percentage in the database
  const updateProgress = async (projectId, change) => {
    // Find the specific project by ID
    const project = projects.find(p => p.id === projectId)
    if (!project) return // Exit if project not found

    // Calculate new progress: add change, but keep between 0-100
    // Math.max ensures it doesn't go below 0, Math.min ensures it doesn't exceed 100
    const newProgress = Math.max(0, Math.min(100, project.progress + change))
    
    // Auto-update status based on progress percentage
    let newStatus = project.status
    if (newProgress === 0) {
      newStatus = 'Planning'        // 0% = Planning
    } else if (newProgress > 0 && newProgress < 100) {
      newStatus = 'In Progress'     // 1-99% = In Progress
    } else if (newProgress === 100) {
      newStatus = 'Completed'       // 100% = Completed
    }

    try {
      // Update the database with new progress and status
      const { error } = await supabase
        .from('projects')              // Target the projects table
        .update({                      // Update these fields
          progress: newProgress,       // New progress value
          status: newStatus            // Auto-calculated status
        })
        .eq('id', projectId)           // Only update where id matches projectId

      // If database update fails, throw error
      if (error) throw error

      // Update local state to reflect changes immediately (without reloading from database)
      setProjects(projects.map(p => {
        if (p.id === projectId) {
          // For matching project, return updated version
          return {
            ...p,                    // Keep all existing properties
            progress: newProgress,   // Update progress
            status: newStatus        // Update status
          }
        }
        return p // For all other projects, return unchanged
      }))
    } catch (err) {
      // If update fails, log error and show message to user
      console.error('Error updating progress:', err)
      setMessage(`Error updating progress: ${err.message}`)
    }
  }

  // ============================================
  // ADD PROJECT - Handle form submission to create new project
  // ============================================
  
  // Function called when user submits the "Add Project" form
  const handleAddProject = async (e) => {
    e.preventDefault() // Prevent page refresh on form submit
    setMessage('')     // Clear any existing messages

    try {
      // Prepare project data for database (convert form data to match database schema)
      const projectData = {
        name: newProject.name,
        client: newProject.client,
        address: newProject.address,
        status: newProject.status,
        start_date: newProject.startDate,      // Convert startDate to start_date (database column name)
        end_date: newProject.endDate,          // Convert endDate to end_date
        budget: parseInt(newProject.budget),   // Convert string to number
        type: newProject.type,
        description: newProject.description,
        progress: 0                            // New projects always start at 0%
      }

      // Insert new project into database and return the created project
      const { data, error } = await supabase
        .from('projects')      // Target projects table
        .insert([projectData]) // Insert new project (array because .insert() accepts multiple rows)
        .select()              // Return the inserted data

      // If insertion fails, throw error
      if (error) throw error

      // Show success message
      setMessage('Project added successfully!')
      
      // Add new project to the beginning of projects array (so it appears first)
      setProjects([data[0], ...projects])
      
      // Reset form to empty values
      setNewProject({
        name: '',
        client: '',
        address: '',
        status: 'Planning',
        startDate: '',
        endDate: '',
        budget: '',
        type: 'Interior',
        description: ''
      })
      
      // Close the modal
      setShowAddModal(false)
      
      // Clear success message after 3 seconds (3000 milliseconds)
      setTimeout(() => setMessage(''), 3000)
    } catch (err) {
      // If anything fails, log error and show message to user
      console.error('Error adding project:', err)
      setMessage(`Error adding project: ${err.message}`)
    }
  }

  // ============================================
  // UTILITY FUNCTIONS - Get colors for different statuses and types
  // ============================================
  
  // Function to return appropriate background and text color classes for project status
  const getStatusColor = (status) => {
    switch (status) {
      case 'Planning': return 'bg-yellow-100 text-yellow-800'     // Yellow for planning
      case 'In Progress': return 'bg-blue-100 text-blue-800'      // Blue for in progress
      case 'Completed': return 'bg-green-100 text-green-800'      // Green for completed
      case 'On Hold': return 'bg-red-100 text-red-800'            // Red for on hold
      default: return 'bg-gray-100 text-gray-800'                 // Gray as fallback
    }
  }

  // Function to return appropriate background and text color classes for project type
  const getTypeColor = (type) => {
    switch (type) {
      case 'Interior': return 'bg-purple-100 text-purple-800'     // Purple for interior
      case 'Exterior': return 'bg-orange-100 text-orange-800'     // Orange for exterior
      case 'Commercial': return 'bg-indigo-100 text-indigo-800'   // Indigo for commercial
      case 'Specialty': return 'bg-pink-100 text-pink-800'        // Pink for specialty
      default: return 'bg-gray-100 text-gray-800'                 // Gray as fallback
    }
  }

  // ============================================
  // JSX RETURN - The actual UI/HTML structure
  // ============================================
  
  return (
    <div className="flex flex-col min-h-screen bg-white">
      <div className="flex-1 p-8 bg-gray-50">
        
        {/* Success/Error Message Banner - Only shows when message exists */}
        {message && (
          <div className={`mb-4 p-4 rounded-lg ${message.includes('Error') ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}`}>
            {message}
          </div>
        )}

        {/* ============================================ */}
        {/* PAGE HEADER - Title and description */}
        {/* ============================================ */}
        <div className="mb-8">
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-gray-900">Projects Management</h1>
            <p className="text-gray-600">Track and manage all painting projects</p>
          </div>

          {/* ============================================ */}
          {/* STATS CARDS - Dashboard overview statistics */}
          {/* ============================================ */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
            
            {/* Active Projects Card - Count of "In Progress" projects */}
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Calendar className="w-6 h-6 text-blue-600" />
                </div>
                <div className="ml-4">
                  {/* Filter and count projects with "In Progress" status */}
                  <p className="text-2xl font-bold text-gray-900">{projects.filter(p => p.status === 'In Progress').length}</p>
                  <p className="text-gray-600">Active Projects</p>
                </div>
              </div>
            </div>

            {/* Planning Projects Card - Count of "Planning" projects */}
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="p-2 bg-yellow-100 rounded-lg">
                  <Clock className="w-6 h-6 text-yellow-600" />
                </div>
                <div className="ml-4">
                  {/* Filter and count projects with "Planning" status */}
                  <p className="text-2xl font-bold text-gray-900">{projects.filter(p => p.status === 'Planning').length}</p>
                  <p className="text-gray-600">Planning</p>
                </div>
              </div>
            </div>

            {/* Completed Projects Card - Count of "Completed" projects */}
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="p-2 bg-green-100 rounded-lg">
                  <div className="w-6 h-6 text-green-600 flex items-center justify-center font-bold">✓</div>
                </div>
                <div className="ml-4">
                  {/* Filter and count projects with "Completed" status */}
                  <p className="text-2xl font-bold text-gray-900">{projects.filter(p => p.status === 'Completed').length}</p>
                  <p className="text-gray-600">Completed</p>
                </div>
              </div>
            </div>

            {/* Total Value Card - Sum of all project budgets */}
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="p-2 bg-[#74A744] bg-opacity-20 rounded-lg">
                  <DollarSign className="w-6 h-6 text-[#74A744]" />
                </div>
                <div className="ml-4">
                  {/* Use reduce to sum all budgets, then format with commas */}
                  <p className="text-2xl font-bold text-gray-900">${projects.reduce((sum, p) => sum + (p.budget || 0), 0).toLocaleString()}</p>
                  <p className="text-gray-600">Total Value</p>
                </div>
              </div>
            </div>
          </div>

          {/* ============================================ */}
          {/* SEARCH AND FILTER BAR */}
          {/* ============================================ */}
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <div className="flex flex-col md:flex-row gap-4">
              
              {/* Search Input - Filters by name, client, or address */}
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
                <div key={project.id} className="bg-white rounded-lg shadow-lg border hover:shadow-xl transition-shadow">
                  <div className="p-6">
                    
                    {/* Project Header - Name and Status/Type badges */}
                    <div className="flex justify-between items-start mb-4">
                      <h3 className="text-lg font-semibold text-gray-900 line-clamp-2">{project.name}</h3>
                      <div className="flex gap-2">
                        {/* Status badge with dynamic color */}
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(project.status)}`}>
                          {project.status}
                        </span>
                        {/* Type badge with dynamic color */}
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTypeColor(project.type)}`}>
                          {project.type}
                        </span>
                      </div>
                    </div>

                    {/* Project Details - Client, address, dates, budget */}
                    <div className="space-y-3 mb-4">
                      {/* Client name with icon */}
                      <div className="flex items-center text-sm text-gray-600">
                        <User className="w-4 h-4 mr-2" />
                        <span>{project.client}</span>
                      </div>
                      {/* Address with icon */}
                      <div className="flex items-center text-sm text-gray-600">
                        <MapPin className="w-4 h-4 mr-2" />
                        <span className="line-clamp-1">{project.address}</span>
                      </div>
                      {/* Date range with icon */}
                      <div className="flex items-center text-sm text-gray-600">
                        <Calendar className="w-4 h-4 mr-2" />
                        <span>{project.start_date} → {project.end_date}</span>
                      </div>
                      {/* Budget with icon and formatting */}
                      <div className="flex items-center text-sm text-gray-600">
                        <DollarSign className="w-4 h-4 mr-2" />
                        <span className="font-medium">${project.budget?.toLocaleString()}</span>
                      </div>
                    </div>

                    {/* Project Description */}
                    <div className="mb-4">
                      <p className="text-sm text-gray-600 line-clamp-2">{project.description}</p>
                    </div>

                    {/* ============================================ */}
                    {/* PROGRESS BAR - Visual representation of completion */}
                    {/* ============================================ */}
                    <div className="mb-4">
                      {/* Progress header with percentage */}
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-medium text-gray-700">Progress</span>
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-gray-600">{project.progress || 0}%</span>
                          {/* Show checkmark if 100% complete */}
                          {project.progress === 100 && (
                            <span className="text-green-600 text-xs font-medium">✓ Complete</span>
                          )}
                        </div>
                      </div>
                      
                      {/* Animated progress bar with color based on completion */}
                      <div className="w-full bg-gray-200 rounded-full h-3">
                        <div 
                          className={`h-3 rounded-full transition-all duration-500 ${
                            project.progress === 100 ? 'bg-green-500' :      // 100% = Green
                            project.progress >= 75 ? 'bg-[#74A744]' :        // 75-99% = Brand green
                            project.progress >= 50 ? 'bg-blue-500' :         // 50-74% = Blue
                            project.progress >= 25 ? 'bg-yellow-500' :       // 25-49% = Yellow
                            'bg-red-500'                                      // 0-24% = Red
                          }`}
                          style={{ width: `${project.progress || 0}%` }}   // Dynamic width based on progress
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
                    {/* ACTION BUTTONS - View and Edit */}
                    {/* ============================================ */}
                    <div className="flex gap-2">
                      <button className="flex-1 px-3 py-2 bg-gray-100 text-gray-700 text-sm rounded-lg hover:bg-gray-200 transition-colors">
                        View Details
                      </button>
                      <button className="flex-1 px-3 py-2 bg-[#74A744] text-white text-sm rounded-lg hover:bg-[#5F9136] transition-colors">
                        Edit Project
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* ============================================ */}
            {/* EMPTY STATE - No projects exist yet */}
            {/* ============================================ */}
            {projects.length === 0 && searchTerm === '' && statusFilter === 'all' && (
              <div className="bg-white rounded-lg shadow p-12 text-center">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Calendar className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No projects yet</h3>
                <p className="text-gray-500 mb-6">Get started by adding your first painting project</p>
                <button 
                  onClick={() => setShowAddModal(true)} // Open the add project modal
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
            {filteredProjects.length === 0 && (searchTerm !== '' || statusFilter !== 'all') && (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Search className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No projects found</h3>
                <p className="text-gray-500">Try adjusting your search or filter criteria</p>
              </div>
            )}
          </>
        )}
      </div>

      {/* ============================================ */}
      {/* ADD PROJECT MODAL - Form to create new project */}
      {/* ============================================ */}
      {showAddModal && (
        // Modal overlay - dark background that covers entire screen
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          {/* Modal content container */}
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            
            {/* Modal header */}
            <div className="p-6 border-b">
              <h2 className="text-xl font-semibold text-gray-900">Add New Project</h2>
            </div>
            
            {/* Add project form */}
            <form onSubmit={handleAddProject} className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                
                {/* Project Name Input */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Project Name</label>
                  <input
                    type="text"
                    required // HTML5 validation - field cannot be empty
                    value={newProject.name}
                    onChange={(e) => setNewProject({...newProject, name: e.target.value})} // Update name in state
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#74A744] focus:border-transparent"
                    placeholder="e.g., Modern Office Renovation"
                  />
                </div>
                
                {/* Client Name Input */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Client Name</label>
                  <input
                    type="text"
                    required
                    value={newProject.client}
                    onChange={(e) => setNewProject({...newProject, client: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#74A744] focus:border-transparent"
                    placeholder="Client name"
                  />
                </div>

                {/* Address Input - spans 2 columns on medium+ screens */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                  <input
                    type="text"
                    required
                    value={newProject.address}
                    onChange={(e) => setNewProject({...newProject, address: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#74A744] focus:border-transparent"
                    placeholder="Project address"
                  />
                </div>

                {/* Project Type Dropdown */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Project Type</label>
                  <select
                    value={newProject.type}
                    onChange={(e) => setNewProject({...newProject, type: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#74A744] focus:border-transparent"
                  >
                    <option value="Interior">Interior</option>
                    <option value="Exterior">Exterior</option>
                    <option value="Commercial">Commercial</option>
                    <option value="Specialty">Specialty</option>
                  </select>
                </div>

                {/* Status Dropdown */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                  <select
                    value={newProject.status}
                    onChange={(e) => setNewProject({...newProject, status: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#74A744] focus:border-transparent"
                  >
                    <option value="Planning">Planning</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Completed">Completed</option>
                    <option value="On Hold">On Hold</option>
                  </select>
                </div>

                {/* Start Date Input */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                  <input
                    type="date"
                    required
                    value={newProject.startDate}
                    onChange={(e) => setNewProject({...newProject, startDate: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#74A744] focus:border-transparent"
                  />
                </div>

                {/* End Date Input */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                  <input
                    type="date"
                    required
                    value={newProject.endDate}
                    onChange={(e) => setNewProject({...newProject, endDate: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#74A744] focus:border-transparent"
                  />
                </div>

                {/* Budget Input - Number only */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Budget ($)</label>
                  <input
                    type="number"
                    required
                    min="0" // Prevents negative numbers
                    value={newProject.budget}
                    onChange={(e) => setNewProject({...newProject, budget: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#74A744] focus:border-transparent"
                    placeholder="0"
                  />
                </div>

                {/* Description Textarea - spans 2 columns */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <textarea
                    rows="3" // Sets initial height to 3 lines
                    value={newProject.description}
                    onChange={(e) => setNewProject({...newProject, description: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#74A744] focus:border-transparent"
                    placeholder="Project description..."
                  />
                </div>
              </div>

              {/* ============================================ */}
              {/* MODAL ACTION BUTTONS - Cancel and Submit */}
              {/* ============================================ */}
              <div className="flex gap-3 pt-4">
                {/* Cancel button - closes modal without saving */}
                <button
                  type="button" // type="button" prevents form submission
                  onClick={() => setShowAddModal(false)} // Close modal
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                {/* Submit button - triggers handleAddProject function */}
                <button
                  type="submit" // type="submit" triggers form onSubmit event
                  className="flex-1 px-4 py-2 bg-[#74A744] text-white rounded-lg hover:bg-[#5F9136] transition-colors"
                >
                  Add Project
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}