import Link from 'next/link'
import Image from 'next/image'

export default function Header({ currentPage = 'home' }) {
  const isActive = (page) => currentPage === page

  return (
    <div className="w-full h-16 bg-[#74A744]">
      <div className="max-w-7xl mx-auto px-4 h-full flex items-center justify-between">
        <div className="flex items-center">
          <div className="w-28 h-12 bg-[#E4EDCB] rounded-lg overflow-hidden shadow-md">
            <Image 
              src="/martinPainting.png" 
              alt="Martin Painting Logo"
              width={144}
              height={69}
              className="w-full h-full object-cover"
            />
          </div>
        </div>

        <nav className="flex space-x-0">
          <Link 
            href="/" 
            className={`px-6 py-4 text-sm transition-colors ${
              isActive('home') 
                ? 'text-black bg-white/10 border-b-2 border-black' 
                : 'text-white hover:bg-white/10'
            }`}
          >
            Home
          </Link>
          <Link 
            href="/services" 
            className={`px-6 py-4 text-sm transition-colors ${
              isActive('services') 
                ? 'text-black bg-white/10 border-b-2 border-black' 
                : 'text-white hover:bg-white/10'
            }`}
          >
            Services
          </Link>
          <Link 
            href="/gallery" 
            className={`px-6 py-4 text-sm transition-colors ${
              isActive('gallery') 
                ? 'text-black bg-white/10 border-b-2 border-black' 
                : 'text-white hover:bg-white/10'
            }`}
          >
            Gallery
          </Link>
          <Link 
            href="/quote" 
            className={`px-6 py-4 text-sm transition-colors ${
              isActive('quote') 
                ? 'text-black bg-white/10 border-b-2 border-black' 
                : 'text-white hover:bg-white/10'
            }`}
          >
            Quote
          </Link>
          <Link 
            href="/contact" 
            className={`px-6 py-4 text-sm transition-colors ${
              isActive('contact') 
                ? 'text-black bg-white/10 border-b-2 border-black' 
                : 'text-white hover:bg-white/10'
            }`}
          >
            Contact
          </Link>
          <Link 
            href="/login" 
            className={`px-6 py-4 text-sm transition-colors ${
              isActive('admin') 
                ? 'text-black bg-white/10 border-b-2 border-black' 
                : 'text-white hover:bg-white/10'
            }`}
          >
            Admin
          </Link>
        </nav>
      </div>
    </div>
  )
}