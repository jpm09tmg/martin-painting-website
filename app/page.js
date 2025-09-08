import Link from 'next/link'
import Image from 'next/image'
import Header from './components/Header'
import Footer from './components/Footer'

export default function Home() {
  return (
    <div className="w-full min-h-screen bg-white">
      <Header currentPage="home" />

      <div className="w-full h-[600px] relative overflow-hidden">
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: `url('/greyLiving.jpg')`,
            filter: 'brightness(1.1) contrast(0.95)'
          }}
        >

          <div className="absolute inset-0 bg-black/10"></div>
        </div>
        
        <div className="relative z-10 h-full flex items-center justify-center">
          <div className="flex items-center justify-center w-full h-full" style={{ marginTop: '-40px' }}>
            <Image 
              src="/martinPainting.pn"
              alt="Martin Painting Logo"
              width={6200}
              height={6200}
              className="drop-shadow-xl"
              style={{
                mixBlendMode: 'multiply',
                filter: 'contrast(1.1) brightness(0.95)',
                width: '650px',
                height: '650px',
                objectFit: 'contain'
              }}
              priority
              unoptimized
            />
          </div>
        </div>
      </div>

      <div className="w-full h-[600px] bg-[#F1F4E8] relative overflow-hidden">
        <div className="absolute inset-0 bg-[rgba(238,245,212,0.2)]"></div>
        
        <div className="max-w-7xl mx-auto px-20 h-full flex items-center">
          <div className="flex-1 max-w-2xl">
            <h1 className="text-5xl font-normal text-[#171717] leading-tight mb-6">
              Transform Your Space with Professional Painting
            </h1>
            <p className="text-xl text-[#525252] leading-relaxed mb-8">
              Expert interior and exterior painting services for residential and commercial properties. Bringing color and life to Calgary homes and businesses for over 15 years.
            </p>
            <div className="flex space-x-4">
              <Link 
                href="/quote" 
                className="px-8 py-3 bg-[#74A744] text-white font-semibold rounded-md hover:bg-[#5F9136] transition duration-300"
              >
                Get Free Quote
              </Link>
              <Link 
                href="/gallery" 
                className="px-8 py-3 border border-[#74A744] text-[#74A744] font-semibold rounded-md hover:bg-[#74A744] hover:text-white transition duration-300"
              >
                View Projects
              </Link>
            </div>
          </div>
          
          <div className="flex-1">
            <Image 
              src="/blueLiving.jpg" 
              alt="Professional interior painting"
              width={584}
              height={400}
              className="w-full h-96 object-cover rounded-lg shadow-lg"
            />
          </div>
        </div>
      </div>

      {/* Services Section */}
      <div className="w-full bg-white py-20">
        <div className="max-w-7xl mx-auto px-20">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-normal text-[#171717] mb-4">Our Services</h2>
            <p className="text-xl text-[#525252]">Professional painting solutions for every need</p>
          </div>

          <div className="grid grid-cols-4 gap-6">
            {/* Interior Painting */}
            <div className="bg-[#EAF3E0] rounded-lg p-8">
              <Image 
                src="/whiteLiving.jpg" 
                alt="Interior painting service"
                width={320}
                height={192}
                className="w-full h-48 object-cover rounded-lg mb-6"
              />
              <h3 className="text-xl text-[#171717] text-center mb-4">Interior Painting</h3>
              <p className="text-[#525252] text-center mb-6">
                Transform your indoor spaces with our professional interior painting services.
              </p>
              <div className="text-center">
                <Link href="/services/interior" className="text-[#171717] font-medium hover:underline">
                  Learn More →
                </Link>
              </div>
            </div>

            {/* Exterior Painting */}
            <div className="bg-[#EAF3E0] rounded-lg p-8">
              <Image 
                src="/blueExt.jpg" 
                alt="Exterior painting service"
                width={320}
                height={192}
                className="w-full h-48 object-cover rounded-lg mb-6"
              />
              <h3 className="text-xl text-[#171717] text-center mb-4">Exterior Painting</h3>
              <p className="text-[#525252] text-center mb-6">
                Protect and beautify your homes exterior with weather-resistant paint solutions.
              </p>
              <div className="text-center">
                <Link href="/services/exterior" className="text-[#171717] font-medium hover:underline">
                  Learn More →
                </Link>
              </div>
            </div>

            {/* Residential Services */}
            <div className="bg-[#EAF3E0] rounded-lg p-8">
              <Image 
                src="/greenBed.jpg" 
                alt="Residential painting service"
                width={320}
                height={192}
                className="w-full h-48 object-cover rounded-lg mb-6"
              />
              <h3 className="text-xl text-[#171717] text-center mb-4">Residential</h3>
              <p className="text-[#525252] text-center mb-6">
                Complete home painting services tailored to your personal style and needs.
              </p>
              <div className="text-center">
                <Link href="/services/residential" className="text-[#171717] font-medium hover:underline">
                  Learn More →
                </Link>
              </div>
            </div>

            {/* Commercial Services */}
            <div className="bg-[#EAF3E0] rounded-lg p-8">
              <Image 
                src="/greyCom.jpg" 
                alt="Commercial painting service"
                width={320}
                height={192}
                className="w-full h-48 object-cover rounded-lg mb-6"
              />
              <h3 className="text-xl text-[#171717] text-center mb-4">Commercial</h3>
              <p className="text-[#525252] text-center mb-6">
                Professional painting solutions for offices, retail spaces, and commercial buildings.
              </p>
              <div className="text-center">
                <Link href="/services/commercial" className="text-[#171717] font-medium hover:underline">
                  Learn More →
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Projects Section */}
      <div className="w-full bg-[#F1F4E8] py-20">
        <div className="max-w-7xl mx-auto px-20">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-normal text-[#171717] mb-4">Recent Projects</h2>
            <p className="text-xl text-[#525252]">See our latest painting transformations</p>
          </div>

          <div className="grid grid-cols-3 gap-8 mb-12">
            <div className="h-80 rounded-lg overflow-hidden">
              <Image 
                src="/whiteLiving.jpg" 
                alt="Recent interior painting project"
                width={384}
                height={360}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="h-80 rounded-lg overflow-hidden shadow-md">
              <Image 
                src="/redExt.jpg" 
                alt="Recent exterior painting project"
                width={384}
                height={360}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="h-80 rounded-lg overflow-hidden">
              <Image 
                src="/greyCom.jpg" 
                alt="Recent commercial painting project"
                width={384}
                height={360}
                className="w-full h-full object-cover"
              />
            </div>
          </div>

          <div className="text-center">
            <Link 
              href="/gallery" 
              className="px-8 py-3 bg-[#74A744] text-white font-semibold rounded-md hover:bg-[#5F9136] transition duration-300"
            >
              View Project Gallery
            </Link>
          </div>
        </div>
      </div>

      <div className="w-full bg-white py-20">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-normal text-[#171717] mb-4">
            Ready to Transform Your Space?
          </h2>
          <p className="text-xl text-[#525252] mb-8">
            Get a free consultation and quote for your painting project
          </p>
          <Link 
            href="/appointment" 
            className="px-8 py-3 bg-[#74A744] text-white font-semibold rounded-md hover:bg-[#5F9136] transition duration-300"
          >
            Book Appointment
          </Link>
        </div>
      </div>

      <Footer />
    </div>
    );
}