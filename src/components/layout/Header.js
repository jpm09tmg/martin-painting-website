import Link from "next/link";
import Image from "next/image";

export default function Header({ currentPage = "home" }) {
  const isActive = (page) => currentPage === page;

  return (
    <div className="w-full h-16 bg-background">
      <div className="max-w-7xl mx-auto px-4 h-full flex items-center justify-between">
        <div className="flex items-center">
          <div className="w-24  rounded-lg overflow-hidden shadow-md">
            <Link href="/" className="hover:opacity-80 transition-opacity">
              <div className="w-24  rounded-lg overflow-hidden shadow-md">
                <Image
                  src="/martinPainting_v2.png"
                  alt="Martin Painting Logo"
                  width={144}
                  height={69}
                  className="w-full h-full object-cover"
                />
              </div>
            </Link>
          </div>
        </div>

        <nav className="flex space-x-0">
          <Link
            href="/"
            className={`px-6 py-4 text-sm transition-colors ${
              isActive("home")
                ? "text-text bg-white/10 border-b-2 border-text"
                : "text-white hover:bg-white/10"
            }`}
          >
            Home
          </Link>
          <Link
            href="/services"
            className={`px-6 py-4 text-sm transition-colors ${
              isActive("services")
                ? "text-black bg-white/10 border-b-2 border-text"
                : "text-white hover:bg-white/10"
            }`}
          >
            Services
          </Link>
          <Link
            href="/gallery"
            className={`px-6 py-4 text-sm transition-colors ${
              isActive("gallery")
                ? "text-black bg-white/10 border-b-2 border-text"
                : "text-white hover:bg-white/10"
            }`}
          >
            Gallery
          </Link>
          <Link
            href="/quote"
            className={`px-6 py-4 text-sm transition-colors ${
              isActive("quote")
                ? "text-black bg-white/10 border-b-2 border-text"
                : "text-white hover:bg-white/10"
            }`}
          >
            Quote
          </Link>
          <Link
            href="/contact"
            className={`px-6 py-4 text-sm transition-colors ${
              isActive("contact")
                ? "text-black bg-white/10 border-b-2 border-text"
                : "text-white hover:bg-white/10"
            }`}
          >
            Contact
          </Link>
          <Link
            href="/login"
            className={`px-6 py-4 text-sm transition-colors ${
              isActive("admin")
                ? "text-black bg-white/10 border-b-2 border-text"
                : "text-white hover:bg-white/10"
            }`}
          >
            Admin
          </Link>
        </nav>
      </div>
    </div>
  );
}
