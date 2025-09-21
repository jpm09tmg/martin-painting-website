'use client'
import { useState, useEffect } from 'react'
import { supabase } from '../../../lib/supabase-client'
import { Plus, Search, Filter, Download, Eye, Edit, Trash2, Calculator, FileText, Calendar, DollarSign, User, MapPin, Phone, Mail, Save, X } from 'lucide-react'

export default function AdminQuoteForm() {
  const [message, setMessage] = useState('')
  const [quotes, setQuotes] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [showForm, setShowForm] = useState(false)
  const [showViewModal, setShowViewModal] = useState(false)
  const [selectedQuote, setSelectedQuote] = useState(null)
  const [isEditing, setIsEditing] = useState(false)
  
  const [formData, setFormData] = useState({
    // Client Information
    clientName: '',
    clientEmail: '',
    clientPhone: '',
    projectAddress: '',
    
    // Project Details
    projectType: '',
    propertyType: '',
    projectDescription: '',
    
    // Quote Details
    quoteValidUntil: '',
    notes: '',
    status: 'Pending',
    
    // Line Items
    items: [
      {
        id: 1,
        itemName: '',
        description: '',
        quantity: '',
        price: '',
        total: ''
      }
    ]
  })

  // Load quotes on component mount
  useEffect(() => {
    loadQuotes()
  }, [])

  const loadQuotes = async () => {
    try {
      const { data, error } = await supabase
        .from('quotes')
        .select(`
          *,
          quote_items (*)
        `)
        .order('created_at', { ascending: false })

      if (error) throw error
      setQuotes(data || [])
    } catch (err) {
      setMessage(`Error loading quotes: ${err.message}`)
    }
  }

  const filteredQuotes = quotes.filter(quote => {
    const matchesSearch = quote.client_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         quote.client_email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         quote.project_address?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === 'all' || quote.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const calculateQuoteTotal = (items) => {
    return items?.reduce((sum, item) => sum + (parseFloat(item.total) || 0), 0) || 0
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData({
      ...formData,
      [name]: value
    })
  }

  const handleItemChange = (index, field, value) => {
    const updatedItems = [...formData.items]
    updatedItems[index] = {
      ...updatedItems[index],
      [field]: value
    }
    
    // Auto-calculate total if quantity and price are provided
    if (field === 'quantity' || field === 'price') {
      const quantity = parseFloat(updatedItems[index].quantity) || 0
      const price = parseFloat(updatedItems[index].price) || 0
      updatedItems[index].total = (quantity * price).toFixed(2)
    }
    
    setFormData({
      ...formData,
      items: updatedItems
    })
  }

  const addItem = () => {
    const newItem = {
      id: Date.now(),
      itemName: '',
      description: '',
      quantity: '',
      price: '',
      total: ''
    }
    setFormData({
      ...formData,
      items: [...formData.items, newItem]
    })
  }

  const removeItem = (index) => {
    const updatedItems = formData.items.filter((_, i) => i !== index)
    setFormData({
      ...formData,
      items: updatedItems
    })
  }

  const resetForm = () => {
    setFormData({
      clientName: '',
      clientEmail: '',
      clientPhone: '',
      projectAddress: '',
      projectType: '',
      propertyType: '',
      projectDescription: '',
      quoteValidUntil: '',
      notes: '',
      status: 'Pending',
      items: [{
        id: 1,
        itemName: '',
        description: '',
        quantity: '',
        price: '',
        total: ''
      }]
    })
    setIsEditing(false)
  }

  const saveQuote = async () => {
    setMessage('')

    try {
      let quote
      
      if (isEditing && selectedQuote) {
        // Update existing quote
        const { data: updatedQuote, error: quoteError } = await supabase
          .from('quotes')
          .update({
            client_name: formData.clientName,
            client_email: formData.clientEmail,
            client_phone: formData.clientPhone,
            project_address: formData.projectAddress,
            project_type: formData.projectType,
            property_type: formData.propertyType,
            project_description: formData.projectDescription,
            quote_valid_until: formData.quoteValidUntil || null,
            notes: formData.notes,
            status: formData.status
          })
          .eq('id', selectedQuote.id)
          .select()
          .single()

        if (quoteError) throw quoteError
        quote = updatedQuote

        // Delete existing items
        await supabase
          .from('quote_items')
          .delete()
          .eq('quote_id', selectedQuote.id)

      } else {
        // Insert new quote
        const { data: newQuote, error: quoteError } = await supabase
          .from('quotes')
          .insert({
            client_name: formData.clientName,
            client_email: formData.clientEmail,
            client_phone: formData.clientPhone,
            project_address: formData.projectAddress,
            project_type: formData.projectType,
            property_type: formData.propertyType,
            project_description: formData.projectDescription,
            quote_valid_until: formData.quoteValidUntil || null,
            notes: formData.notes,
            status: formData.status
          })
          .select()
          .single()

        if (quoteError) throw quoteError
        quote = newQuote
      }

      // Insert the quote items
      const itemsData = formData.items
        .filter(item => item.itemName.trim() !== '')
        .map(item => ({
          quote_id: quote.id,
          item_name: item.itemName,
          description: item.description,
          quantity: item.quantity,
          price: item.price,
          total: item.total
        }))

      if (itemsData.length > 0) {
        const { error: itemsError } = await supabase
          .from('quote_items')
          .insert(itemsData)

        if (itemsError) throw itemsError
      }

      setMessage(isEditing ? 'Quote updated successfully!' : 'Quote saved successfully!')
      resetForm()
      setShowForm(false)
      setShowViewModal(false)
      loadQuotes() // Reload quotes

    } catch (err) {
      setMessage(`Error: ${err.message}`)
    }
  }

  const updateQuoteStatus = async (quoteId, newStatus) => {
    try {
      const { error } = await supabase
        .from('quotes')
        .update({ status: newStatus })
        .eq('id', quoteId)

      if (error) throw error
      
      loadQuotes() // Reload quotes
      setMessage(`Quote status updated to ${newStatus}`)
    } catch (err) {
      setMessage(`Error updating status: ${err.message}`)
    }
  }

  const deleteQuote = async (quoteId) => {
    if (!confirm('Are you sure you want to delete this quote?')) return

    try {
      // Delete quote items first
      await supabase
        .from('quote_items')
        .delete()
        .eq('quote_id', quoteId)

      // Delete quote
      const { error } = await supabase
        .from('quotes')
        .delete()
        .eq('id', quoteId)

      if (error) throw error
      
      loadQuotes() // Reload quotes
      setMessage('Quote deleted successfully')
    } catch (err) {
      setMessage(`Error deleting quote: ${err.message}`)
    }
  }

  const editQuote = (quote) => {
    setFormData({
      clientName: quote.client_name || '',
      clientEmail: quote.client_email || '',
      clientPhone: quote.client_phone || '',
      projectAddress: quote.project_address || '',
      projectType: quote.project_type || '',
      propertyType: quote.property_type || '',
      projectDescription: quote.project_description || '',
      quoteValidUntil: quote.quote_valid_until || '',
      notes: quote.notes || '',
      status: quote.status || 'Pending',
      items: quote.quote_items?.length > 0 ? quote.quote_items.map(item => ({
        id: item.id,
        itemName: item.item_name || '',
        description: item.description || '',
        quantity: item.quantity || '',
        price: item.price || '',
        total: item.total || ''
      })) : [{
        id: 1,
        itemName: '',
        description: '',
        quantity: '',
        price: '',
        total: ''
      }]
    })
    setSelectedQuote(quote)
    setIsEditing(true)
    setShowForm(true)
  }

  const exportQuote = (quote) => {
    const total = calculateQuoteTotal(quote.quote_items)
    const quoteData = `
MARTIN PAINTING - QUOTE #${quote.id}

Client: ${quote.client_name}
Email: ${quote.client_email}
Phone: ${quote.client_phone}
Address: ${quote.project_address}

Project Details:
Type: ${quote.project_type} - ${quote.property_type}
Description: ${quote.project_description}

Items:
${quote.quote_items?.map(item => 
  `${item.item_name} - ${item.description}
  Qty: ${item.quantity} × $${item.price} = $${item.total}`
).join('\n\n') || 'No items'}

TOTAL: $${total.toLocaleString()}

Valid until: ${quote.quote_valid_until || 'Not specified'}
Status: ${quote.status}
Notes: ${quote.notes || 'None'}
    `.trim()

    const blob = new Blob([quoteData], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `Quote_${quote.id}_${quote.client_name?.replace(/\s+/g, '_')}.txt`
    a.click()
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'Pending': return 'bg-yellow-100 text-yellow-800'
      case 'Sent': return 'bg-blue-100 text-blue-800'
      case 'Approved': return 'bg-green-100 text-green-800'
      case 'Rejected': return 'bg-red-100 text-red-800'
      case 'Expired': return 'bg-gray-100 text-gray-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="flex flex-col min-h-screen bg-white">
      <div className="flex-1 p-8 bg-gray-50">
        
        {/* Header */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Quotes Management</h1>
              <p className="text-gray-600">Create and manage client quotes</p>
            </div>
            <button 
              onClick={() => {resetForm(); setShowForm(true)}}
              className="bg-[#74A744] text-white px-6 py-3 rounded-lg hover:bg-[#5F9136] font-medium flex items-center transition-colors"
            >
              <Plus className="w-5 h-5 mr-2" />
              Create New Quote
            </button>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-6">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="p-2 bg-yellow-100 rounded-lg">
                  <FileText className="w-6 h-6 text-yellow-600" />
                </div>
                <div className="ml-4">
                  <p className="text-2xl font-bold text-gray-900">{quotes.filter(q => q.status === 'Pending').length}</p>
                  <p className="text-gray-600">Pending</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <FileText className="w-6 h-6 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-2xl font-bold text-gray-900">{quotes.filter(q => q.status === 'Sent').length}</p>
                  <p className="text-gray-600">Sent</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="p-2 bg-green-100 rounded-lg">
                  <div className="w-6 h-6 text-green-600 flex items-center justify-center font-bold">✓</div>
                </div>
                <div className="ml-4">
                  <p className="text-2xl font-bold text-gray-900">{quotes.filter(q => q.status === 'Approved').length}</p>
                  <p className="text-gray-600">Approved</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="p-2 bg-red-100 rounded-lg">
                  <div className="w-6 h-6 text-red-600 flex items-center justify-center font-bold">✗</div>
                </div>
                <div className="ml-4">
                  <p className="text-2xl font-bold text-gray-900">{quotes.filter(q => q.status === 'Rejected').length}</p>
                  <p className="text-gray-600">Rejected</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="p-2 bg-[#74A744] bg-opacity-20 rounded-lg">
                  <DollarSign className="w-6 h-6 text-[#74A744]" />
                </div>
                <div className="ml-4">
                  <p className="text-2xl font-bold text-gray-900">
                    ${quotes.reduce((sum, q) => sum + calculateQuoteTotal(q.quote_items), 0).toLocaleString()}
                  </p>
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
                  placeholder="Search quotes, clients, or addresses..."
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
                  <option value="Pending">Pending</option>
                  <option value="Sent">Sent</option>
                  <option value="Approved">Approved</option>
                  <option value="Rejected">Rejected</option>
                  <option value="Expired">Expired</option>
                </select>
              </div>
            </div>
          </div>

          {/* Message */}
          {message && (
            <div className={`mb-6 p-4 rounded-lg ${
              message.includes('Error') ? 'bg-red-50 text-red-800 border border-red-200' : 'bg-green-50 text-green-800 border border-green-200'
            }`}>
              <p>{message}</p>
            </div>
          )}
        </div>

        {/* Quotes Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredQuotes.map((quote) => {
            const total = calculateQuoteTotal(quote.quote_items)
            return (
              <div key={quote.id} className="bg-white rounded-lg shadow-lg border hover:shadow-xl transition-shadow">
                <div className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">Quote #{quote.id}</h3>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(quote.status)}`}>
                      {quote.status || 'Pending'}
                    </span>
                  </div>

                  <div className="space-y-3 mb-4">
                    <div className="flex items-center text-sm text-gray-600">
                      <User className="w-4 h-4 mr-2" />
                      <span className="font-medium">{quote.client_name}</span>
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <Mail className="w-4 h-4 mr-2" />
                      <span>{quote.client_email}</span>
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <Phone className="w-4 h-4 mr-2" />
                      <span>{quote.client_phone}</span>
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <MapPin className="w-4 h-4 mr-2" />
                      <span className="line-clamp-1">{quote.project_address}</span>
                    </div>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-3 mb-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-gray-700">{quote.project_type} - {quote.property_type}</span>
                      <span className="text-lg font-bold text-[#74A744]">${total.toLocaleString()}</span>
                    </div>
                    <div className="text-sm text-gray-600 mt-1">
                      {quote.quote_items?.length || 0} items • Valid until: {quote.quote_valid_until || 'N/A'}
                    </div>
                  </div>

                  {/* Quick Status Update */}
                  <div className="flex gap-2 mb-3">
                    <button 
                      onClick={() => updateQuoteStatus(quote.id, 'Sent')}
                      className="px-3 py-1 bg-blue-100 text-blue-700 text-xs rounded-lg hover:bg-blue-200 transition-colors"
                    >
                      Send
                    </button>
                    <button 
                      onClick={() => updateQuoteStatus(quote.id, 'Approved')}
                      className="px-3 py-1 bg-green-100 text-green-700 text-xs rounded-lg hover:bg-green-200 transition-colors"
                    >
                      Approve
                    </button>
                    <button 
                      onClick={() => updateQuoteStatus(quote.id, 'Rejected')}
                      className="px-3 py-1 bg-red-100 text-red-700 text-xs rounded-lg hover:bg-red-200 transition-colors"
                    >
                      Reject
                    </button>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-2">
                    <button 
                      onClick={() => {setSelectedQuote(quote); setShowViewModal(true)}}
                      className="flex-1 px-3 py-2 bg-gray-100 text-gray-700 text-sm rounded-lg hover:bg-gray-200 transition-colors flex items-center justify-center"
                    >
                      <Eye className="w-4 h-4 mr-1" />
                      View
                    </button>
                    <button 
                      onClick={() => editQuote(quote)}
                      className="flex-1 px-3 py-2 bg-blue-100 text-blue-700 text-sm rounded-lg hover:bg-blue-200 transition-colors flex items-center justify-center"
                    >
                      <Edit className="w-4 h-4 mr-1" />
                      Edit
                    </button>
                    <button 
                      onClick={() => exportQuote(quote)}
                      className="flex-1 px-3 py-2 bg-[#74A744] text-white text-sm rounded-lg hover:bg-[#5F9136] transition-colors flex items-center justify-center"
                    >
                      <Download className="w-4 h-4 mr-1" />
                      Export
                    </button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {/* Empty State */}
        {quotes.length === 0 && (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <FileText className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No quotes yet</h3>
            <p className="text-gray-500 mb-6">Create your first client quote to get started</p>
            <button 
              onClick={() => {resetForm(); setShowForm(true)}}
              className="bg-[#74A744] text-white px-6 py-3 rounded-lg hover:bg-[#5F9136] font-medium inline-flex items-center"
            >
              <Plus className="w-5 h-5 mr-2" />
              Create First Quote
            </button>
          </div>
        )}
      </div>

      {/* Quote Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-6xl w-full max-h-[95vh] overflow-y-auto">
            <div className="p-6 border-b flex justify-between items-center">
              <h2 className="text-xl font-semibold text-gray-900">
                {isEditing ? `Edit Quote #${selectedQuote?.id}` : 'Create New Quote'}
              </h2>
              <button
                onClick={() => {setShowForm(false); resetForm()}}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="p-6 space-y-8">
              {/* Client Information */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Client Information</h3>
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Client Name</label>
                    <input
                      type="text"
                      name="clientName"
                      value={formData.clientName}
                      onChange={handleChange}
                      placeholder="John Doe"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#74A744] focus:border-transparent"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Client Email</label>
                    <input
                      type="email"
                      name="clientEmail"
                      value={formData.clientEmail}
                      onChange={handleChange}
                      placeholder="john@example.com"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#74A744] focus:border-transparent"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Client Phone</label>
                    <input
                      type="tel"
                      name="clientPhone"
                      value={formData.clientPhone}
                      onChange={handleChange}
                      placeholder="(403) 555-0123"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#74A744] focus:border-transparent"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Project Address</label>
                    <input
                      type="text"
                      name="projectAddress"
                      value={formData.projectAddress}
                      onChange={handleChange}
                      placeholder="123 Main St, Calgary, AB"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#74A744] focus:border-transparent"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Project Details */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Project Details</h3>
                <div className="grid md:grid-cols-3 gap-6 mb-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Property Type</label>
                    <select
                      name="propertyType"
                      value={formData.propertyType}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#74A744] focus:border-transparent"
                      required
                    >
                      <option value="">Select type</option>
                      <option value="Residential">Residential</option>
                      <option value="Commercial">Commercial</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Project Type</label>
                    <select
                      name="projectType"
                      value={formData.projectType}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#74A744] focus:border-transparent"
                      required
                    >
                      <option value="">Select type</option>
                      <option value="Interior">Interior</option>
                      <option value="Exterior">Exterior</option>
                      <option value="Both">Interior & Exterior</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                    <select
                      name="status"
                      value={formData.status}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#74A744] focus:border-transparent"
                    >
                      <option value="Pending">Pending</option>
                      <option value="Sent">Sent</option>
                      <option value="Approved">Approved</option>
                      <option value="Rejected">Rejected</option>
                      <option value="Expired">Expired</option>
                    </select>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Quote Valid Until</label>
                    <input
                      type="date"
                      name="quoteValidUntil"
                      value={formData.quoteValidUntil}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#74A744] focus:border-transparent"
                    />
                  </div>
                </div>

                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Project Description</label>
                  <textarea
                    name="projectDescription"
                    value={formData.projectDescription}
                    onChange={handleChange}
                    rows="3"
                    placeholder="Detailed description of the work to be performed..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#74A744] focus:border-transparent"
                  />
                </div>
              </div>

              {/* Line Items */}
              <div>
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-lg font-medium text-gray-900">Quote Items</h3>
                  <button
                    type="button"
                    onClick={addItem}
                    className="px-4 py-2 bg-[#74A744] text-white rounded-lg hover:bg-[#5d8636] focus:outline-none focus:ring-2 focus:ring-[#74A744] focus:ring-offset-2 flex items-center"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Item
                  </button>
                </div>

                <div className="space-y-4">
                  {formData.items.map((item, index) => (
                    <div key={item.id} className="p-4 border border-gray-200 rounded-lg bg-gray-50">
                      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Item Name</label>
                          <input
                            type="text"
                            value={item.itemName}
                            onChange={(e) => handleItemChange(index, 'itemName', e.target.value)}
                            placeholder="e.g., Master Bedroom"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#74A744] focus:border-transparent"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                          <input
                            type="text"
                            value={item.description}
                            onChange={(e) => handleItemChange(index, 'description', e.target.value)}
                            placeholder="Paint walls and ceiling"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#74A744] focus:border-transparent"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Quantity</label>
                          <input
                            type="number"
                            value={item.quantity}
                            onChange={(e) => handleItemChange(index, 'quantity', e.target.value)}
                            placeholder="1"
                            min="0"
                            step="0.01"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#74A744] focus:border-transparent"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Price ($)</label>
                          <input
                            type="number"
                            value={item.price}
                            onChange={(e) => handleItemChange(index, 'price', e.target.value)}
                            placeholder="0.00"
                            min="0"
                            step="0.01"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#74A744] focus:border-transparent"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Total ($)</label>
                          <input
                            type="number"
                            value={item.total}
                            onChange={(e) => handleItemChange(index, 'total', e.target.value)}
                            placeholder="0.00"
                            min="0"
                            step="0.01"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#74A744] focus:border-transparent bg-gray-100"
                            readOnly
                          />
                        </div>
                      </div>

                      {formData.items.length > 1 && (
                        <div className="mt-4 flex justify-end">
                          <button
                            type="button"
                            onClick={() => removeItem(index)}
                            className="px-3 py-1 text-sm text-red-600 border border-red-300 rounded-lg hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 flex items-center"
                          >
                            <Trash2 className="w-4 h-4 mr-1" />
                            Remove Item
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                {/* Quote Total */}
                <div className="mt-4 p-4 bg-[#74A744] bg-opacity-10 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <Calculator className="w-5 h-5 text-[#74A744] mr-2" />
                      <span className="font-medium text-gray-700">Quote Total:</span>
                    </div>
                    <span className="text-2xl font-bold text-[#74A744]">
                      ${formData.items.reduce((sum, item) => sum + (parseFloat(item.total) || 0), 0).toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>

              {/* Notes */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Additional Notes</h3>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Notes</label>
                  <textarea
                    name="notes"
                    value={formData.notes}
                    onChange={handleChange}
                    rows="4"
                    placeholder="Any additional information, terms, or special instructions..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#74A744] focus:border-transparent"
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => {setShowForm(false); resetForm()}}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={saveQuote}
                  className="flex-1 px-4 py-2 bg-[#74A744] text-white rounded-lg hover:bg-[#5d8636] transition-colors flex items-center justify-center"
                >
                  <Save className="w-4 h-4 mr-2" />
                  {isEditing ? 'Update Quote' : 'Save Quote'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* View Quote Modal */}
      {showViewModal && selectedQuote && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b flex justify-between items-center">
              <h2 className="text-xl font-semibold text-gray-900">Quote #{selectedQuote.id}</h2>
              <div className="flex gap-2 items-center">
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(selectedQuote.status)}`}>
                  {selectedQuote.status || 'Pending'}
                </span>
                <button
                  onClick={() => setShowViewModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>
            
            <div className="p-6 space-y-6">
              {/* Client Info */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-3">Client Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">Name:</span>
                    <span className="ml-2 font-medium">{selectedQuote.client_name}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Email:</span>
                    <span className="ml-2 font-medium">{selectedQuote.client_email}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Phone:</span>
                    <span className="ml-2 font-medium">{selectedQuote.client_phone}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Address:</span>
                    <span className="ml-2 font-medium">{selectedQuote.project_address}</span>
                  </div>
                </div>
              </div>

              {/* Project Details */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-3">Project Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">Property Type:</span>
                    <span className="ml-2 font-medium">{selectedQuote.property_type}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Project Type:</span>
                    <span className="ml-2 font-medium">{selectedQuote.project_type}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Valid Until:</span>
                    <span className="ml-2 font-medium">{selectedQuote.quote_valid_until || 'Not specified'}</span>
                  </div>
                </div>
                
                {selectedQuote.project_description && (
                  <div className="mt-4">
                    <span className="text-gray-600">Description:</span>
                    <p className="mt-1 text-gray-800">{selectedQuote.project_description}</p>
                  </div>
                )}
              </div>

              {/* Quote Items */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-3">Quote Items</h3>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Item</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Qty</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {selectedQuote.quote_items?.map((item, index) => (
                        <tr key={index}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {item.item_name}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {item.description}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {item.quantity}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            ${item.price}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            ${item.total}
                          </td>
                        </tr>
                      )) || (
                        <tr>
                          <td colSpan="5" className="px-6 py-4 text-center text-gray-500">
                            No items added
                          </td>
                        </tr>
                      )}
                    </tbody>
                    <tfoot className="bg-gray-50">
                      <tr>
                        <td colSpan="4" className="px-6 py-4 text-right text-sm font-medium text-gray-900">
                          Total:
                        </td>
                        <td className="px-6 py-4 text-sm font-bold text-[#74A744]">
                          ${calculateQuoteTotal(selectedQuote.quote_items).toLocaleString()}
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>

              {/* Notes */}
              {selectedQuote.notes && (
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-3">Notes</h3>
                  <p className="text-gray-800 bg-gray-50 p-4 rounded-lg">{selectedQuote.notes}</p>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => editQuote(selectedQuote)}
                  className="flex-1 px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors flex items-center justify-center"
                >
                  <Edit className="w-4 h-4 mr-2" />
                  Edit Quote
                </button>
                <button
                  onClick={() => exportQuote(selectedQuote)}
                  className="flex-1 px-4 py-2 bg-[#74A744] text-white rounded-lg hover:bg-[#5d8636] transition-colors flex items-center justify-center"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Export Quote
                </button>
                <button
                  onClick={() => deleteQuote(selectedQuote.id)}
                  className="flex-1 px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors flex items-center justify-center"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
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