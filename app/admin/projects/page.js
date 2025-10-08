'use client'
import { useState, useEffect } from 'react'
import { Plus, Search, Filter, Calendar, DollarSign, User, MapPin, Clock, Trash2, X } from 'lucide-react'
import { supabase } from '@/lib/supabase-client'

export default function ProjectsPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [showAddModal, setShowAddModal] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [projectToDelete, setProjectToDelete] = useState(null)
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState('')
  
  // Projects data - loaded from database
  const [projects, setProjects] = useState([])

  const [newProject, setNewProject] = useState({
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

  // Load projects from database on component mount
  useEffect(() => {
    loadProjects()
  }, [])

  const loadProjects = async () => {
    try {
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      
      setProjects(data || [])
    } catch (err) {
      console.error('Error loading projects:', err)
      setMessage(`Error loading projects: ${err.message}`)
    } finally {
      setLoading(false)
    }
  }

  // Filter projects based on search and status
  const filteredProjects = projects.filter(project => {
    const matchesSearch = project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         project.client.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         project.address.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === 'all' || project.status === statusFilter
    return matchesSearch && matchesStatus
  })

  // Update progress function - now saves to database
  const updateProgress = async (projectId, change) => {
    const project = projects.find(p => p.id === projectId)
    if (!project) return

    const newProgress = Math.max(0, Math.min(100, project.progress + change))
    
    // Auto-update status based on progress
    let newStatus = project.status
    if (newProgress === 0) {
      newStatus = 'Planning'
    } else if (newProgress > 0 && newProgress < 100) {
      newStatus = 'In Progress'
    } else if (newProgress === 100) {
      newStatus = 'Completed'
    }

    try {
      const { error } = await supabase
        .from('projects')
        .update({ 
          progress: newProgress,
          status: newStatus
        })
        .eq('id', projectId)

      if (error) throw error

      // Update local state
      setProjects(projects.map(p => {
        if (p.id === projectId) {
          return {
            ...p,
            progress: newProgress,
            status: newStatus
          }
        }
        return p
      }))
    } catch (err) {
      console.error('Error updating progress:', err)
      setMessage(`Error updating progress: ${err.message}`)
    }
  }

  const handleAddProject = async (e) => {
    e.preventDefault()
    setMessage('')

    try {
      const projectData = {
        name: newProject.name,
        client: newProject.client,
        address: newProject.address,
        status: newProject.status,
        start_date: newProject.startDate,
        end_date: newProject.endDate,
        budget: parseInt(newProject.budget),
        type: newProject.type,
        description: newProject.description,
        progress: 0
      }

      const { data, error } = await supabase
        .from('projects')
        .insert([projectData])
        .select()

      if (error) throw error

      setMessage('Project added successfully!')
      setProjects([data[0], ...projects])
      
      // Reset form
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
      setShowAddModal(false)
      
      // Clear success message after 3 seconds
      setTimeout(() => setMessage(''), 3000)
    } catch (err) {
      console.error('Error adding project:', err)
      setMessage(`Error adding project: ${err.message}`)
    }
  }

  // Delete project function
  const handleDeleteProject = async () => {
    if (!projectToDelete) return

    try {
      const { error } = await supabase
        .from('projects')
        .delete()
        .eq('id', projectToDelete.id)

      if (error) throw error

      setMessage('Project deleted successfully!')
      setProjects(projects.filter(p => p.id !== projectToDelete.id))
      setShowDeleteConfirm(false)
      setProjectToDelete(null)
      
      // Clear success message after 3 seconds
      setTimeout(() => setMessage(''), 3000)
    } catch (err) {
      console.error('Error deleting project:', err)
      setMessage(`Error deleting project: ${err.message}`)
    }
  }

  const confirmDelete = (project) => {
    setProjectToDelete(project)
    setShowDeleteConfirm(true)
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'Planning': return 'bg-yellow-100 text-yellow-800'
      case 'In Progress': return 'bg-blue-100 text-blue-800'
      case 'Completed': return 'bg-green-100 text-green-800'
      case 'On Hold': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getTypeColor = (type) => {
    switch (type) {
      case 'Interior': return 'bg-purple-100 text-purple-800'
      case 'Exterior': return 'bg-orange-100 text-orange-800'
      case 'Commercial': return 'bg-indigo-100 text-indigo-800'
      case 'Specialty': return 'bg-pink-100 text-pink-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="flex flex-col min-h-screen bg-white">
      <div className="flex-1 p-8 bg-gray-50">
        
        {/* Success/Error Message */}
        {message && (
          <div className={`mb-4 p-4 rounded-lg ${message.includes('Error') ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}`}>
            {message}
          </div>
        )}

        {/* Header */}
        <div className="mb-8">
          <div className="mb-6 flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Projects Management</h1>
              <p className="text-gray-600">Track and manage all painting projects</p>
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
                  <p className="text-2xl font-bold text-gray-900">{projects.filter(p => p.status === 'In Progress').length}</p>
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
                  <p className="text-2xl font-bold text-gray-900">{projects.filter(p => p.status === 'Planning').length}</p>
                  <p className="text-gray-600">Planning</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="p-2 bg-green-100 rounded-lg">
                  <div className="w-6 h-6 text-green-600 flex items-center justify-center font-bold">✓</div>
                </div>
                <div className="ml-4">
                  <p className="text-2xl font-bold text-gray-900">{projects.filter(p => p.status === 'Completed').length}</p>
                  <p className="text-gray-600">Completed</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="p-2 bg-[#74A744] bg-opacity-20 rounded-lg">
                  <DollarSign className="w-6 h-6 text-[#74A744]" />
                </div>
                <div className="ml-4">
                  <p className="text-2xl font-bold text-gray-900">${projects.reduce((sum, p) => sum + (p.budget || 0), 0).toLocaleString()}</p>
                  <p className="text-gray-600">Total Value</p>
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
                <div key={project.id} className="bg-white rounded-lg shadow-lg border hover:shadow-xl transition-shadow">
                  <div className="p-6">
                    <div className="flex justify-between items-start mb-4">
                      <h3 className="text-lg font-semibold text-gray-900 line-clamp-2 flex-1">{project.name}</h3>
                      <div className="flex gap-2 ml-2">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(project.status)}`}>
                          {project.status}
                        </span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTypeColor(project.type)}`}>
                          {project.type}
                        </span>
                      </div>
                    </div>

                    <div className="space-y-3 mb-4">
                      <div className="flex items-center text-sm text-gray-600">
                        <User className="w-4 h-4 mr-2" />
                        <span>{project.client}</span>
                      </div>
                      <div className="flex items-center text-sm text-gray-600">
                        <MapPin className="w-4 h-4 mr-2" />
                        <span className="line-clamp-1">{project.address}</span>
                      </div>
                      <div className="flex items-center text-sm text-gray-600">
                        <Calendar className="w-4 h-4 mr-2" />
                        <span>{project.start_date} → {project.end_date}</span>
                      </div>
                      <div className="flex items-center text-sm text-gray-600">
                        <DollarSign className="w-4 h-4 mr-2" />
                        <span className="font-medium">${project.budget?.toLocaleString()}</span>
                      </div>
                    </div>

                    <div className="mb-4">
                      <p className="text-sm text-gray-600 line-clamp-2">{project.description}</p>
                    </div>

                    {/* Progress Bar with Status */}
                    <div className="mb-4">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-medium text-gray-700">Progress</span>
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-gray-600">{project.progress || 0}%</span>
                          {project.progress === 100 && (
                            <span className="text-green-600 text-xs font-medium">✓ Complete</span>
                          )}
                        </div>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-3">
                        <div 
                          className={`h-3 rounded-full transition-all duration-500 ${
                            project.progress === 100 ? 'bg-green-500' : 
                            project.progress >= 75 ? 'bg-[#74A744]' : 
                            project.progress >= 50 ? 'bg-blue-500' : 
                            project.progress >= 25 ? 'bg-yellow-500' : 'bg-red-500'
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
                      <button className="flex-1 px-3 py-2 bg-gray-100 text-gray-700 text-sm rounded-lg hover:bg-gray-200 transition-colors">
                        View Details
                      </button>
                      <button className="flex-1 px-3 py-2 bg-[#74A744] text-white text-sm rounded-lg hover:bg-[#5F9136] transition-colors">
                        Edit Project
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
            {projects.length === 0 && searchTerm === '' && statusFilter === 'all' && (
              <div className="bg-white rounded-lg shadow p-12 text-center">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Calendar className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No projects yet</h3>
                <p className="text-gray-500 mb-6">Get started by adding your first painting project</p>
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

      {/* Add Project Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b flex justify-between items-center">
              <h2 className="text-xl font-semibold text-gray-900">Add New Project</h2>
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
                  <label className="block text-sm font-medium text-gray-700 mb-1">Project Name</label>
                  <input
                    type="text"
                    required
                    value={newProject.name}
                    onChange={(e) => setNewProject({...newProject, name: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#74A744] focus:border-transparent"
                    placeholder="e.g., Modern Office Renovation"
                  />
                </div>
                
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

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Budget ($)</label>
                  <input
                    type="number"
                    required
                    min="0"
                    value={newProject.budget}
                    onChange={(e) => setNewProject({...newProject, budget: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#74A744] focus:border-transparent"
                    placeholder="0"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <textarea
                    rows={3}
                    value={newProject.description}
                    onChange={(e) => setNewProject({...newProject, description: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#74A744] focus:border-transparent"
                    placeholder="Project description..."
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
              <h3 className="text-lg font-semibold text-gray-900 text-center mb-2">Delete Project</h3>
              <p className="text-gray-600 text-center mb-6">
                Are you sure you want to delete <strong>{projectToDelete.name}</strong>? This action cannot be undone.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowDeleteConfirm(false)
                    setProjectToDelete(null)
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
    </div>
  )
}