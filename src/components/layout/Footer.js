import Image from 'next/image'

export default function Footer() {
  return (
    <div className="w-full bg-[#74A744] py-16">
      <div className="max-w-7xl mx-auto px-20">
        <div className="grid grid-cols-4 gap-12 mb-8">
          <div className="flex flex-col items-center text-center">
            <div className="w-28 h-12 bg-[#E4EDCB] rounded-lg overflow-hidden shadow-md mb-4">
              <Image 
                src="/martinPainting.png" 
                alt="Martin Painting"
                width={144}
                height={69}
                className="w-full h-full object-cover"
              />
            </div>
            <h3 className="text-white text-lg font-semibold mb-2">Martin Painting</h3>
            <p className="text-white/90 text-sm leading-relaxed">
              Professional painting services for residential and commercial properties in Calgary.
            </p>
          </div>

          <div className="flex flex-col items-center text-center">
            <h3 className="text-white text-lg font-semibold mb-4">Our Services</h3>
            <ul className="space-y-3">
              <li><span className="text-white/90 text-sm hover:text-white transition-colors cursor-pointer">Interior Painting</span></li>
              <li><span className="text-white/90 text-sm hover:text-white transition-colors cursor-pointer">Exterior Painting</span></li>
              <li><span className="text-white/90 text-sm hover:text-white transition-colors cursor-pointer">Residential Services</span></li>
              <li><span className="text-white/90 text-sm hover:text-white transition-colors cursor-pointer">Commercial Services</span></li>
            </ul>
          </div>

          <div className="flex flex-col items-center text-center">
            <h3 className="text-white text-lg font-semibold mb-4">Contact Info</h3>
            <ul className="space-y-3">
              <li className="flex flex-col items-center">
                <span className="text-white/70 text-xs uppercase tracking-wide mb-1">Phone</span>
                <span className="text-white/90 text-sm">(403) 555-PAINT</span>
              </li>
              <li className="flex flex-col items-center">
                <span className="text-white/70 text-xs uppercase tracking-wide mb-1">Email</span>
                <span className="text-white/90 text-sm">info@martinpainting.ca</span>
              </li>
              <li className="flex flex-col items-center">
                <span className="text-white/70 text-xs uppercase tracking-wide mb-1">Location</span>
                <span className="text-white/90 text-sm">Calgary, Alberta</span>
              </li>
            </ul>
          </div>

          <div className="flex flex-col items-center text-center">
            <h3 className="text-white text-lg font-semibold mb-4">Follow Us</h3>
            <div className="flex space-x-4 mb-4">
              <div className="w-8 h-8 bg-white/20 hover:bg-white/30 rounded-lg flex items-center justify-center cursor-pointer transition-colors">
                <span className="text-white text-sm">f</span>
              </div>
              <div className="w-8 h-8 bg-white/20 hover:bg-white/30 rounded-lg flex items-center justify-center cursor-pointer transition-colors">
                <span className="text-white text-sm">ig</span>
              </div>
              <div className="w-8 h-8 bg-white/20 hover:bg-white/30 rounded-lg flex items-center justify-center cursor-pointer transition-colors">
                <span className="text-white text-sm">li</span>
              </div>
            </div>
            <p className="text-white/90 text-sm">
              Stay updated with our latest painting projects
            </p>
          </div>
        </div>

        <div className="border-t border-white/30 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <p className="text-white/90 text-sm">
              © 2025 Martin Painting. All rights reserved.
            </p>
            <div className="flex space-x-6">
              <span className="text-white/70 text-sm hover:text-white cursor-pointer transition-colors">Privacy Policy</span>
              <span className="text-white/70 text-sm hover:text-white cursor-pointer transition-colors">Terms of Service</span>
              <span className="text-white/70 text-sm hover:text-white cursor-pointer transition-colors">Site Map</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}