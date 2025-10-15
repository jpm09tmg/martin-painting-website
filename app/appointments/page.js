'use client' 
// Marks this file as a Client Component in Next.js (so it can use hooks like useState)

import { useState } from 'react'
import Header from '../components/Header'
import { supabase } from '../../lib/supabase-client'

/**
 * BookAppointment Component
 * ----------------------------------------------------
 * This component renders a two-panel booking form where users can:
 * - Select property and location types
 * - Enter personal and contact details
 * - Choose a preferred date and time
 * On submission, it saves client and appointment data to Supabase.
 */
export default function BookAppointment() {
  // -------------------------------
  // State Management
  // -------------------------------
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    propertyType: '',
    locationType: '',
    appointmentDate: '',
    appointmentTime: '',
    details: ''
  })

  const [loading, setLoading] = useState(false)   // Indicates when submission is processing
  const [message, setMessage] = useState('')      // Success or error message for user feedback

  // -------------------------------
  // Handle input changes dynamically
  // -------------------------------
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  // -------------------------------
  // Handle form submission
  // -------------------------------
  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setMessage('')

    try {
      // STEP 1: Check if client already exists in database (by email)
      let clientId = null
      
      if (formData.email) {
        const { data: existingClient } = await supabase
          .from('clients')
          .select('id')
          .eq('email', formData.email)
          .single()
        
        // If existing client found, update their info
        if (existingClient) {
          clientId = existingClient.id
          await supabase
            .from('clients')
            .update({
              first_name: formData.firstName,
              last_name: formData.lastName,
              phone: formData.phone,
              address: formData.address
            })
            .eq('id', clientId)
        }
      }
      
      // STEP 2: If no existing client, insert new one
      if (!clientId) {
        const { data: newClient, error: clientError } = await supabase
          .from('clients')
          .insert([{
            first_name: formData.firstName,
            last_name: formData.lastName,
            email: formData.email,
            phone: formData.phone,
            address: formData.address
          }])
          .select()
          .single()

        // Handle error gracefully (won’t block appointment creation)
        if (clientError) {
          console.error('Error creating client:', clientError.message)
        } else {
          clientId = newClient?.id
        }
      }

      // STEP 3: Insert appointment referencing the client
      const { error: appointmentError } = await supabase
        .from('appointments_test')
        .insert([{
          property_type: formData.propertyType,
          location_type: formData.locationType,
          preferred_date: formData.appointmentDate,
          preferred_time: formData.appointmentTime,
          appointment_date: formData.appointmentDate,
          appointment_time: formData.appointmentTime,
          details: formData.details,
          client_id: clientId,
          status: 'pending'
        }])

      // If something fails, log and stop
      if (appointmentError) {
        console.error('Error creating appointment:', appointmentError.message)
        throw appointmentError
      }

      // STEP 4: Reset form and show success message
      setMessage("Appointment request submitted successfully! We'll contact you soon to confirm.")
      setFormData({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        address: '',
        propertyType: '',
        locationType: '',
        appointmentDate: '',
        appointmentTime: '',
        details: ''
      })
    } catch (error) {
      // Handle general errors
      console.error('Error submitting appointment:', error?.message)
      setMessage(`Error: ${error?.message || 'Please try again or call us directly.'}`)
    }

    setLoading(false)
  }

  // -------------------------------
  // Data lists for dropdowns / radios
  // -------------------------------

  // Predefined time slot options
  const timeSlots = [
    '9:00 AM', '10:00 AM', '11:00 AM', '12:00 PM',
    '1:00 PM', '2:00 PM', '3:00 PM', '4:00 PM'
  ]

  // Property type options
  const propertyTypes = [
    {
      name: 'Residential',
      description: 'Homes, condos, townhouses, and residential properties'
    },
    {
      name: 'Commercial',
      description: 'Offices, retail spaces, restaurants, and commercial buildings'
    }
  ]

  // Location type options
  const locationTypes = [
    {
      name: 'Interior',
      description: 'Indoor spaces - living rooms, bedrooms, kitchens, bathrooms'
    },
    {
      name: 'Exterior',
      description: 'Outdoor surfaces - siding, trim, doors, windows, fences'
    }
  ]

  // -------------------------------
  // Component JSX Rendering
  // -------------------------------
  return (
    <div className="min-h-screen bg-white">
      {/* Header component (shared across pages) */}
      <Header currentPage="appointment" />

      {/* Page content container */}
      <div className="w-full max-w-4xl mx-auto py-8 px-4">

        {/* Section Title */}
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Book Your Painting Consultation
          </h1>
          <p className="text-lg text-gray-600">
            Schedule a free consultation to discuss your painting project
          </p>
        </div>

        {/* Main form card */}
        <div className="bg-white rounded-lg shadow-lg overflow-hidden border border-gray-200">
          <div className="grid md:grid-cols-2 gap-0">

            {/* LEFT PANEL — Service Selection */}
            <div className="bg-[#F1F4E8] p-6">
              <h2 className="text-lg font-normal text-[#171717] mb-6">Service Details</h2>
              
              {/* Property Type Selection */}
              <div className="mb-6">
                <h3 className="text-sm font-normal text-[#404040] mb-4">Property Type</h3>
                <div className="space-y-3">
                  {propertyTypes.map((property) => (
                    <label 
                      key={property.name}
                      className={`flex items-start space-x-3 p-4 bg-white rounded-lg cursor-pointer transition-colors border ${
                        formData.propertyType === property.name 
                          ? 'border-[#DCE9D4] shadow-sm' 
                          : 'border-gray-200 hover:border-[#DCE9D4]'
                      }`}
                    >
                      <input
                        type="radio"
                        name="propertyType"
                        value={property.name}
                        checked={formData.propertyType === property.name}
                        onChange={handleChange}
                        className="mt-1 w-4 h-4 text-[#74A744] border-gray-300 focus:ring-[#74A744] rounded-full"
                        required
                      />
                      <div className="flex-1">
                        <div className="font-normal text-[#171717] text-sm mb-1">{property.name}</div>
                        <div className="text-xs text-[#737373]">{property.description}</div>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              {/* Location Type Selection */}
              <div className="mb-6">
                <h3 className="text-sm font-normal text-[#404040] mb-4">Location Type</h3>
                <div className="space-y-3">
                  {locationTypes.map((location) => (
                    <label 
                      key={location.name}
                      className={`flex items-start space-x-3 p-4 bg-white rounded-lg cursor-pointer transition-colors border ${
                        formData.locationType === location.name 
                          ? 'border-[#DCE9D4] shadow-sm' 
                          : 'border-gray-200 hover:border-[#DCE9D4]'
                      }`}
                    >
                      <input
                        type="radio"
                        name="locationType"
                        value={location.name}
                        checked={formData.locationType === location.name}
                        onChange={handleChange}
                        className="mt-1 w-4 h-4 text-[#74A744] border-gray-300 focus:ring-[#74A744] rounded-full"
                        required
                      />
                      <div className="flex-1">
                        <div className="font-normal text-[#171717] text-sm mb-1">{location.name}</div>
                        <div className="text-xs text-[#737373]">{location.description}</div>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              {/* Project Details textarea */}
              <div className="mb-6">
                <label className="block text-sm font-normal text-[#404040] mb-2">
                  Project Details
                </label>
                <textarea
                  name="details"
                  value={formData.details}
                  onChange={handleChange}
                  rows="6"
                  className="w-full px-3 py-2 bg-white border border-[#D4D4D4] rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[#74A744] focus:border-transparent"
                  placeholder="Tell us about your painting project..."
                ></textarea>
              </div>
            </div>

            {/* RIGHT PANEL — Contact Information */}
            <div className="bg-white p-6">
              <h2 className="text-lg font-normal text-[#171717] mb-6">Contact Information</h2>
              
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* First and Last Name fields */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-normal text-[#404040] mb-2">First Name</label>
                    <input
                      type="text"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleChange}
                      placeholder="John"
                      required
                      className="w-full px-3 py-2 bg-white border border-[#D4D4D4] rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[#74A744]"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-normal text-[#404040] mb-2">Last Name</label>
                    <input
                      type="text"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleChange}
                      placeholder="Doe"
                      required
                      className="w-full px-3 py-2 bg-white border border-[#D4D4D4] rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[#74A744]"
                    />
                  </div>
                </div>

                {/* Email, phone, address inputs */}
                <div>
                  <label className="block text-sm font-normal text-[#404040] mb-2">Email Address</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="john@example.com"
                    required
                    className="w-full px-3 py-2 bg-white border border-[#D4D4D4] rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[#74A744]"
                  />
                </div>

                <div>
                  <label className="block text-sm font-normal text-[#404040] mb-2">Phone Number</label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="(403) 555-PAINT"
                    required
                    className="w-full px-3 py-2 bg-white border border-[#D4D4D4] rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[#74A744]"
                  />
                </div>

                <div>
                  <label className="block text-sm font-normal text-[#404040] mb-2">Address</label>
                  <input
                    type="text"
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    placeholder="123 Main Street, Calgary, AB T2P 1J9"
                    required
                    className="w-full px-3 py-2 bg-white border border-[#D4D4D4] rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[#74A744]"
                  />
                </div>

                {/* Date and time selectors */}
                <div>
                  <label className="block text-sm font-normal text-[#404040] mb-2">Preferred Consultation Date</label>
                  <input
                    type="date"
                    name="appointmentDate"
                    value={formData.appointmentDate}
                    onChange={handleChange}
                    min={new Date().toISOString().split('T')[0]} // cannot pick past dates
                    required
                    className="w-full px-3 py-2 bg-white border border-[#DFDFDF] rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[#74A744]"
                  />
                </div>

                <div>
                  <label className="block text-sm font-normal text-[#404040] mb-2">Preferred Time</label>
                  <select
                    name="appointmentTime"
                    value={formData.appointmentTime}
                    onChange={handleChange}
                    required
                    className="w-full px-3 py-2 bg-white border border-[#DFDFDF] rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[#74A744]"
                  >
                    <option value="">Select time</option>
                    {timeSlots.map((time) => (
                      <option key={time} value={time}>{time}</option>
                    ))}
                  </select>
                </div>

                {/* Success/Error message */}
                {message && (
                  <div
                    className={`p-4 rounded-md text-sm ${
                      message.includes('success')
                        ? 'bg-green-50 text-green-800 border border-green-200'
                        : 'bg-red-50 text-red-800 border border-red-200'
                    }`}
                  >
                    {message}
                  </div>
                )}

                {/* Submit button */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 px-4 bg-[#74A744] text-white font-semibold rounded-md hover:bg-[#5F9136] focus:outline-none focus:ring-2 focus:ring-[#74A744] disabled:opacity-50 transition duration-300"
                >
                  {loading ? 'Submitting...' : 'Request Consultation'}
                </button>

                {/* Contact Info */}
                <div className="text-center pt-4">
                  <p className="text-sm text-gray-600">
                    Or call us directly at{' '}
                    <a href="tel:4035552746" className="text-[#74A744] hover:underline font-medium">
                      (403) 555-PAINT
                    </a>
                  </p>
                </div>
              </form>
            </div>
          </div>
        </div>

        {/* Info Section — What to Expect */}
        <div className="mt-8 bg-[#F1F4E8] rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">What to Expect</h3>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="w-12 h-12 bg-[#74A744] rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-white font-bold">1</span>
              </div>
              <h4 className="font-medium text-gray-900 mb-2">Free Consultation</h4>
              <p className="text-sm text-gray-600">We'll visit your property to assess your painting needs.</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-[#74A744] rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-white font-bold">2</span>
              </div>
              <h4 className="font-medium text-gray-900 mb-2">Detailed Quote</h4>
              <p className="text-sm text-gray-600">Receive a clear written estimate with material and labor details.</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-[#74A744] rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-white font-bold">3</span>
              </div>
              <h4 className="font-medium text-gray-900 mb-2">Professional Service</h4>
              <p className="text-sm text-gray-600">Our insured team completes your project with care and quality.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
