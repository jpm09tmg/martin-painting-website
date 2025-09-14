'use client'
import Link from 'next/link'
import Header from '../components/Header'

export default function QuotePage() {
  const propertyTypes = [
    { name: 'Residential', description: 'Homes, condos, townhouses' },
    { name: 'Commercial', description: 'Offices, retail, restaurants' }
  ]

  const locationTypes = [
    { name: 'Interior', description: 'Indoor painting projects' },
    { name: 'Exterior', description: 'Outdoor painting projects' }
  ]

  const paintConditions = [
    'Excellent - Recently painted',
    'Good - Minor touch-ups needed',
    'Fair - Some prep work required',
    'Poor - Extensive prep work needed'
  ]

  const paintQualities = [
    'Standard - Good quality paint',
    'Premium - High-end paint',
    'Luxury - Top-of-the-line paint'
  ]

  const specialServiceOptions = [
    'Primer application',
    'Wallpaper removal',
    'Drywall repair',
    'Trim and baseboards',
    'Ceiling painting',
    'Textured walls',
    'Pressure washing (exterior)'
  ]

  return (
    <div className="min-h-screen bg-white">
      <Header currentPage="quote" />

      <div className="w-full max-w-6xl mx-auto py-8 px-4">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Get Your Painting Estimate</h1>
          <p className="text-lg text-gray-600">Fill out the details below to receive a personalized estimate</p>
        </div>

        <div className="bg-white rounded-lg shadow-lg border border-gray-200">
          
          {/* Project Type Section */}
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Project Type</h2>
            
            <div className="grid md:grid-cols-2 gap-8">
              {/* Property Type */}
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-4">Property Type</h3>
                <div className="space-y-3">
                  {propertyTypes.map((property) => (
                    <label 
                      key={property.name}
                      className="flex items-start space-x-3 p-4 border border-gray-200 rounded-lg cursor-pointer transition-colors hover:border-[#74A744]"
                    >
                      <input
                        type="radio"
                        name="propertyType"
                        value={property.name}
                        className="mt-1 w-4 h-4 text-[#74A744] border-gray-300 focus:ring-[#74A744]"
                      />
                      <div>
                        <div className="font-medium text-gray-900">{property.name}</div>
                        <div className="text-sm text-gray-600">{property.description}</div>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              {/* Location Type */}
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-4">Location Type</h3>
                <div className="space-y-3">
                  {locationTypes.map((location) => (
                    <label 
                      key={location.name}
                      className="flex items-start space-x-3 p-4 border border-gray-200 rounded-lg cursor-pointer transition-colors hover:border-[#74A744]"
                    >
                      <input
                        type="radio"
                        name="locationType"
                        value={location.name}
                        className="mt-1 w-4 h-4 text-[#74A744] border-gray-300 focus:ring-[#74A744]"
                      />
                      <div>
                        <div className="font-medium text-gray-900">{location.name}</div>
                        <div className="text-sm text-gray-600">{location.description}</div>
                      </div>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Project Details Section */}
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Project Details</h2>
            
            <div className="grid md:grid-cols-3 gap-6 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Square Footage (approximate)
                </label>
                <input
                  type="number"
                  name="squareFootage"
                  placeholder="e.g., 1200"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#74A744] focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Number of Rooms/Areas
                </label>
                <input
                  type="number"
                  name="numberOfRooms"
                  placeholder="e.g., 3"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#74A744] focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Ceiling Height
                </label>
                <select
                  name="ceilingHeight"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#74A744] focus:border-transparent"
                >
                  <option value="">Select height</option>
                  <option value="8ft">8 feet (standard)</option>
                  <option value="9ft">9 feet</option>
                  <option value="10ft">10 feet</option>
                  <option value="10ft+">10+ feet (high ceilings)</option>
                </select>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Current Paint Condition
                </label>
                <select
                  name="currentCondition"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#74A744] focus:border-transparent"
                >
                  <option value="">Select condition</option>
                  {paintConditions.map((condition) => (
                    <option key={condition} value={condition}>{condition}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Paint Quality Preference
                </label>
                <select
                  name="paintQuality"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#74A744] focus:border-transparent"
                >
                  <option value="">Select quality</option>
                  {paintQualities.map((quality) => (
                    <option key={quality} value={quality}>{quality}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Additional Services Section */}
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Additional Services</h2>
            
            <div className="mb-6">
              <h3 className="text-sm font-medium text-gray-700 mb-4">Special Services (select all that apply)</h3>
              <div className="grid md:grid-cols-2 gap-3">
                {specialServiceOptions.map((service) => (
                  <label key={service} className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      name="specialServices"
                      value={service}
                      className="w-4 h-4 text-[#74A744] border-gray-300 rounded focus:ring-[#74A744]"
                    />
                    <span className="text-sm text-gray-700">{service}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>

          {/* Submit Section */}
          <div className="p-6">
            {/* Disclaimer */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <svg className="w-5 h-5 text-blue-400 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-blue-800">Estimate Information</h3>
                  <p className="text-sm text-blue-700 mt-1">
                    This is a preliminary estimate only. For an accurate quote, please{' '}
                    <Link href="/appointments" className="underline font-medium hover:text-blue-600">
                      book a consultation
                    </Link>{' '}
                    where we can assess your project in person.
                  </p>
                </div>
              </div>
            </div>

            <button
              type="button"
              className="w-full py-3 px-4 bg-[#74A744] text-white font-semibold rounded-md hover:bg-[#5F9136] focus:outline-none focus:ring-2 focus:ring-[#74A744] focus:ring-offset-2 transition duration-300"
            >
              Get Estimate
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}