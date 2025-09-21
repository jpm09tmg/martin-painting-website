'use client'
import { useState } from 'react'
import Header from '../components/Header'
import { supabase } from '../../lib/supabase-client'

export default function BookAppointment() {
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
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setMessage('')

    try {
      const { data, error } = await supabase
        .from('appointments')
        .insert([{
          first_name: formData.firstName,
          last_name: formData.lastName,
          email: formData.email,
          phone: formData.phone,
          address: formData.address,
          property_type: formData.propertyType,
          location_type: formData.locationType,
          appointment_date: formData.appointmentDate,
          appointment_time: formData.appointmentTime,
          details: formData.details
        }])

      if (error) throw error

      setMessage('Appointment request submitted successfully!')
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
      console.error('Error submitting appointment:', error)
      setMessage('Error submitting appointment. Please try again or call us directly.')
    }

    setLoading(false)
  }

  const timeSlots = [
    '9:00 AM', '10:00 AM', '11:00 AM', '12:00 PM',
    '1:00 PM', '2:00 PM', '3:00 PM', '4:00 PM'
  ]

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

  return (
    <div className="min-h-screen bg-white">
      <Header currentPage="appointment" />

      {/* Main Content */}
      <div className="w-full max-w-4xl mx-auto py-8 px-4">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Book Your Painting Consultation</h1>
          <p className="text-lg text-gray-600">Schedule a free consultation to discuss your painting project</p>
        </div>

        <div className="bg-white rounded-lg shadow-lg overflow-hidden border border-gray-200">
          <div className="grid md:grid-cols-2 gap-0">
            
            {/* Left Panel - Service Selection */}
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
                  placeholder="Tell us about your painting project... (room sizes, color preferences, timeline, etc.)"
                ></textarea>
              </div>

              <div>
                <label className="block text-sm font-normal text-[#404040] mb-2">
                  Property Address
                </label>
                <input
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  placeholder="Enter full address for consultation"
                  required
                  className="w-full px-3 py-2 bg-white border border-[#D4D4D4] rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[#74A744] focus:border-transparent"
                />
              </div>
            </div>

            {/* Right Panel - Contact Information */}
            <div className="bg-white p-6">
              <h2 className="text-lg font-normal text-[#171717] mb-6">Contact Information</h2>
              
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-normal text-[#404040] mb-2">
                      First Name
                    </label>
                    <input
                      type="text"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleChange}
                      placeholder="John"
                      required
                      className="w-full px-3 py-2 bg-white border border-[#D4D4D4] rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[#74A744] focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-normal text-[#404040] mb-2">
                      Last Name
                    </label>
                    <input
                      type="text"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleChange}
                      placeholder="Doe"
                      required
                      className="w-full px-3 py-2 bg-white border border-[#D4D4D4] rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[#74A744] focus:border-transparent"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-normal text-[#404040] mb-2">
                    Email Address
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="john@example.com"
                    required
                    className="w-full px-3 py-2 bg-white border border-[#D4D4D4] rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[#74A744] focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-normal text-[#404040] mb-2">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="(403) 555-PAINT"
                    required
                    className="w-full px-3 py-2 bg-white border border-[#D4D4D4] rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[#74A744] focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-normal text-[#404040] mb-2">
                    Preferred Consultation Date
                  </label>
                  <input
                    type="date"
                    name="appointmentDate"
                    value={formData.appointmentDate}
                    onChange={handleChange}
                    min={new Date().toISOString().split('T')[0]}
                    required
                    className="w-full px-3 py-2 bg-white border border-[#DFDFDF] rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[#74A744] focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-normal text-[#404040] mb-2">
                    Preferred Time
                  </label>
                  <select
                    name="appointmentTime"
                    value={formData.appointmentTime}
                    onChange={handleChange}
                    required
                    className="w-full px-3 py-2 bg-white border border-[#DFDFDF] rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[#74A744] focus:border-transparent"
                  >
                    <option value="">Select time</option>
                    {timeSlots.map((time) => (
                      <option key={time} value={time}>{time}</option>
                    ))}
                  </select>
                </div>

                {message && (
                  <div className={`p-4 rounded-md text-sm ${
                    message.includes('success') 
                      ? 'bg-green-50 text-green-800 border border-green-200' 
                      : 'bg-red-50 text-red-800 border border-red-200'
                  }`}>
                    {message}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 px-4 bg-[#74A744] text-white font-semibold rounded-md hover:bg-[#5F9136] focus:outline-none focus:ring-2 focus:ring-[#74A744] focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition duration-300"
                >
                  {loading ? 'Submitting...' : 'Request Consultation'}
                </button>

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

        {/* Additional Information */}
        <div className="mt-8 bg-[#F1F4E8] rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">What to Expect</h3>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="w-12 h-12 bg-[#74A744] rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-white font-bold">1</span>
              </div>
              <h4 className="font-medium text-gray-900 mb-2">Free Consultation</h4>
              <p className="text-sm text-gray-600">Well visit your property to assess your painting needs and discuss your vision.</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-[#74A744] rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-white font-bold">2</span>
              </div>
              <h4 className="font-medium text-gray-900 mb-2">Detailed Quote</h4>
              <p className="text-sm text-gray-600">Receive a comprehensive written estimate with material and labor breakdown.</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-[#74A744] rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-white font-bold">3</span>
              </div>
              <h4 className="font-medium text-gray-900 mb-2">Professional Service</h4>
              <p className="text-sm text-gray-600">Schedule your painting project with our experienced and insured team.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}