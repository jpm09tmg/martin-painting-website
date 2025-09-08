import Link from 'next/link'
import Image from 'next/image'
import { Check } from 'lucide-react'
import Header from '../components/Header'
import Footer from '../components/Footer'

export default function ServicesPage() {
  return (
    <div className="w-full min-h-screen bg-white">
      <Header currentPage="services" />
      
      {/* Hero Section */}
      <div className="bg-[#F1F4E8] py-16">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Our Painting Services</h1>
          <p className="text-xl text-gray-700 max-w-3xl mx-auto">
            Professional painting solutions for every space and budget. From interior makeovers to exterior protection, residential homes to commercial buildings - we bring quality and color to Calgary.
          </p>
        </div>
      </div>

      {/* Interior Painting Section */}
      <div className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            
            <div className="space-y-6">
              <h2 className="text-3xl font-bold text-gray-900">Interior Painting</h2>
              <p className="text-lg text-gray-700">
                Transform your indoor spaces with our professional interior painting services. We use premium paints and expert techniques to create beautiful, long-lasting finishes that reflect your personal style.
              </p>
              <ul className="space-y-3">
                <li className="flex items-center space-x-3">
                  <Check className="w-5 h-5 text-[#5F9136] flex-shrink-0" />
                  <span className="text-gray-700">Living rooms, bedrooms, kitchens, and bathrooms</span>
                </li>
                <li className="flex items-center space-x-3">
                  <Check className="w-5 h-5 text-[#5F9136] flex-shrink-0" />
                  <span className="text-gray-700">Premium paint brands and eco-friendly options</span>
                </li>
                <li className="flex items-center space-x-3">
                  <Check className="w-5 h-5 text-[#5F9136] flex-shrink-0" />
                  <span className="text-gray-700">Color consultation and design advice</span>
                </li>
                <li className="flex items-center space-x-3">
                  <Check className="w-5 h-5 text-[#5F9136] flex-shrink-0" />
                  <span className="text-gray-700">Wall preparation, priming, and detailed finishing</span>
                </li>
              </ul>
              <Link href="/quote" className="inline-block bg-[#5F9136] text-white px-8 py-3 rounded-lg hover:bg-[#3F652B] transition-colors font-medium">
                Get Interior Quote
              </Link>
            </div>

            {/* Image Grid */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-4">
                <div className="h-64 bg-gray-200 rounded-lg overflow-hidden shadow-md">
                  <Image 
                    src="/interior-living-room.jpg" 
                    alt="Painted living room with modern colors"
                    width={300}
                    height={300}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="h-64 bg-gray-200 rounded-lg overflow-hidden shadow-md">
                  <Image 
                    src="/interior-bedroom.jpg" 
                    alt="Beautifully painted bedroom"
                    width={300}
                    height={300}
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
              <div className="space-y-4">
                <div className="h-64 bg-gray-200 rounded-lg overflow-hidden shadow-md">
                  <Image 
                    src="/interior-kitchen.jpg" 
                    alt="Professional kitchen painting"
                    width={300}
                    height={300}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="h-64 bg-gray-200 rounded-lg overflow-hidden shadow-md">
                  <Image 
                    src="/interior-bathroom.jpg" 
                    alt="Freshly painted bathroom"
                    width={300}
                    height={300}
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Exterior Painting Section */}
      <div className="py-16 bg-[#F1F4E8]">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-4">
                <div className="h-64 bg-gray-200 rounded-lg overflow-hidden shadow-md">
                  <Image 
                    src="/exterior-house-front.jpg" 
                    alt="House front exterior painting"
                    width={300}
                    height={300}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="h-64 bg-gray-200 rounded-lg overflow-hidden shadow-md">
                  <Image 
                    src="/exterior-siding.jpg" 
                    alt="Professional siding painting"
                    width={300}
                    height={300}
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
              <div className="space-y-4">
                <div className="h-64 bg-gray-200 rounded-lg overflow-hidden shadow-md">
                  <Image 
                    src="/exterior-trim.jpg" 
                    alt="Detailed trim and window painting"
                    width={300}
                    height={300}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="h-64 bg-gray-200 rounded-lg overflow-hidden shadow-md">
                  <Image 
                    src="/exterior-deck-staining.jpg" 
                    alt="Deck staining and exterior work"
                    width={300}
                    height={300}
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <h2 className="text-3xl font-bold text-gray-900">Exterior Painting</h2>
              <p className="text-lg text-gray-700">
                Protect and beautify your homes exterior with our professional painting services. We use weather-resistant paints and proven techniques to ensure your investment lasts through Calgarys challenging climate.
              </p>
              <ul className="space-y-3">
                <li className="flex items-center space-x-3">
                  <Check className="w-5 h-5 text-[#5F9136] flex-shrink-0" />
                  <span className="text-gray-700">House siding, trim, doors, and windows</span>
                </li>
                <li className="flex items-center space-x-3">
                  <Check className="w-5 h-5 text-[#5F9136] flex-shrink-0" />
                  <span className="text-gray-700">Weather-resistant and climate-specific paints</span>
                </li>
                <li className="flex items-center space-x-3">
                  <Check className="w-5 h-5 text-[#5F9136] flex-shrink-0" />
                  <span className="text-gray-700">Pressure washing and surface preparation</span>
                </li>
                <li className="flex items-center space-x-3">
                  <Check className="w-5 h-5 text-[#5F9136] flex-shrink-0" />
                  <span className="text-gray-700">Deck staining and fence painting services</span>
                </li>
              </ul>
              <Link href="/quote" className="inline-block bg-[#5F9136] text-white px-8 py-3 rounded-lg hover:bg-[#3F652B] transition-colors font-medium">
                Get Exterior Quote
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Residential Services Section */}
      <div className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            
            <div className="space-y-6">
              <h2 className="text-3xl font-bold text-gray-900">Residential Painting Services</h2>
              <p className="text-lg text-gray-700">
                Complete home painting solutions tailored to your lifestyle and preferences. From single rooms to whole-house makeovers, we provide personalized service that makes your house feel like home.
              </p>
              <ul className="space-y-3">
                <li className="flex items-center space-x-3">
                  <Check className="w-5 h-5 text-[#5F9136] flex-shrink-0" />
                  <span className="text-gray-700">Single room refresh to full home transformation</span>
                </li>
                <li className="flex items-center space-x-3">
                  <Check className="w-5 h-5 text-[#5F9136] flex-shrink-0" />
                  <span className="text-gray-700">Family-friendly scheduling and clean work practices</span>
                </li>
                <li className="flex items-center space-x-3">
                  <Check className="w-5 h-5 text-[#5F9136] flex-shrink-0" />
                  <span className="text-gray-700">Accent walls, feature painting, and custom finishes</span>
                </li>
                <li className="flex items-center space-x-3">
                  <Check className="w-5 h-5 text-[#5F9136] flex-shrink-0" />
                  <span className="text-gray-700">Move-in/move-out painting services</span>
                </li>
              </ul>
              <Link href="/quote" className="inline-block bg-[#5F9136] text-white px-8 py-3 rounded-lg hover:bg-[#3F652B] transition-colors font-medium">
                Get Residential Quote
              </Link>
            </div>

            {/* Image Grid */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-4">
                <div className="h-64 bg-gray-200 rounded-lg overflow-hidden shadow-md">
                  <Image 
                    src="/residential-family-room.jpg" 
                    alt="Family room painting project"
                    width={300}
                    height={300}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="h-64 bg-gray-200 rounded-lg overflow-hidden shadow-md">
                  <Image 
                    src="/residential-dining-room.jpg" 
                    alt="Elegant dining room paint job"
                    width={300}
                    height={300}
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
              <div className="space-y-4">
                <div className="h-64 bg-gray-200 rounded-lg overflow-hidden shadow-md">
                  <Image 
                    src="/residential-hallway.jpg" 
                    alt="Beautifully painted hallway"
                    width={300}
                    height={300}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="h-64 bg-gray-200 rounded-lg overflow-hidden shadow-md">
                  <Image 
                    src="/residential-exterior-home.jpg" 
                    alt="Complete home exterior painting"
                    width={300}
                    height={300}
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Commercial Services Section */}
      <div className="py-16 bg-[#F1F4E8]">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-4">
                <div className="h-64 bg-gray-200 rounded-lg overflow-hidden shadow-md">
                  <Image 
                    src="/commercial-office.jpg" 
                    alt="Professional office painting"
                    width={300}
                    height={300}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="h-64 bg-gray-200 rounded-lg overflow-hidden shadow-md">
                  <Image 
                    src="/commercial-retail.jpg" 
                    alt="Retail space painting project"
                    width={300}
                    height={300}
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
              <div className="space-y-4">
                <div className="h-64 bg-gray-200 rounded-lg overflow-hidden shadow-md">
                  <Image 
                    src="/commercial-warehouse.jpg" 
                    alt="Industrial warehouse painting"
                    width={300}
                    height={300}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="h-64 bg-gray-200 rounded-lg overflow-hidden shadow-md">
                  <Image 
                    src="/commercial-building-exterior.jpg" 
                    alt="Commercial building exterior painting"
                    width={300}
                    height={300}
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <h2 className="text-3xl font-bold text-gray-900">Commercial Painting Services</h2>
              <p className="text-lg text-gray-700">
                Professional painting solutions for businesses of all sizes. We understand the importance of maintaining your professional image while minimizing disruption to your operations.
              </p>
              <ul className="space-y-3">
                <li className="flex items-center space-x-3">
                  <Check className="w-5 h-5 text-[#5F9136] flex-shrink-0" />
                  <span className="text-gray-700">Offices, retail stores, restaurants, and warehouses</span>
                </li>
                <li className="flex items-center space-x-3">
                  <Check className="w-5 h-5 text-[#5F9136] flex-shrink-0" />
                  <span className="text-gray-700">Flexible scheduling to minimize business disruption</span>
                </li>
                <li className="flex items-center space-x-3">
                  <Check className="w-5 h-5 text-[#5F9136] flex-shrink-0" />
                  <span className="text-gray-700">Commercial-grade paints and industrial finishes</span>
                </li>
                <li className="flex items-center space-x-3">
                  <Check className="w-5 h-5 text-[#5F9136] flex-shrink-0" />
                  <span className="text-gray-700">Maintenance programs and touch-up services</span>
                </li>
              </ul>
              <Link href="/quote" className="inline-block bg-[#5F9136] text-white px-8 py-3 rounded-lg hover:bg-[#3F652B] transition-colors font-medium">
                Get Commercial Quote
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Consultation Section */}
      <div className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Image Grid */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-4">
                <div className="h-64 bg-gray-200 rounded-lg overflow-hidden shadow-md">
                  <Image 
                    src="/color-consultation.jpg" 
                    alt="Color consultation service"
                    width={300}
                    height={300}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="h-64 bg-gray-200 rounded-lg overflow-hidden shadow-md">
                  <Image 
                    src="/paint-samples.jpg" 
                    alt="Paint samples and color selection"
                    width={300}
                    height={300}
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
              <div className="space-y-4">
                <div className="h-64 bg-gray-200 rounded-lg overflow-hidden shadow-md">
                  <Image 
                    src="/project-planning.jpg" 
                    alt="Professional project planning"
                    width={300}
                    height={300}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="h-64 bg-gray-200 rounded-lg overflow-hidden shadow-md">
                  <Image 
                    src="/quality-finish.jpg" 
                    alt="High-quality paint finish"
                    width={300}
                    height={300}
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <h2 className="text-3xl font-bold text-gray-900">Need Help Planning Your Project?</h2>
              <p className="text-lg text-gray-700">
                Not sure about colors or which service you need? Our experienced team offers comprehensive consultations to help you make the best choices for your space, budget, and timeline.
              </p>
              <ul className="space-y-3">
                <li className="flex items-center space-x-3">
                  <Check className="w-5 h-5 text-[#5F9136] flex-shrink-0" />
                  <span className="text-gray-700">Professional color consultation and design advice</span>
                </li>
                <li className="flex items-center space-x-3">
                  <Check className="w-5 h-5 text-[#5F9136] flex-shrink-0" />
                  <span className="text-gray-700">Budget planning and material recommendations</span>
                </li>
                <li className="flex items-center space-x-3">
                  <Check className="w-5 h-5 text-[#5F9136] flex-shrink-0" />
                  <span className="text-gray-700">Timeline planning and project coordination</span>
                </li>
              </ul>
              <Link href="/appointment" className="inline-block bg-[#5F9136] text-white px-8 py-3 rounded-lg hover:bg-[#3F652B] transition-colors font-medium">
                Book A Consultation
              </Link>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  )
}