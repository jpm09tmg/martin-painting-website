import Link from "next/link";
import Image from "next/image";
import { Check } from "lucide-react";
import Header from "../components/Header";
import Footer from "../components/Footer";

export default function ServicesPage() {
  return (
    <div className="w-full min-h-screen bg-white">
      <Header currentPage="services" />

      {/* Hero */}
      <section className="bg-[#F1F4E8] py-16">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Our Painting Services
          </h1>
          <p className="text-xl text-gray-700 max-w-3xl mx-auto">
            Professional painting solutions for every space and budget. From
            interior makeovers to exterior protection, residential homes to
            commercial buildings — we bring quality and color to Calgary.
          </p>
        </div>
      </section>

      {/* Interior Painting */}
      <section id="interior" className="scroll-mt-24 py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <h2 className="text-3xl font-bold text-gray-900">
                Interior Painting
              </h2>
              <p className="text-lg text-gray-700">
                Transform your indoor spaces with our professional interior
                painting services. We use premium paints and expert techniques
                to create beautiful, long-lasting finishes that reflect your
                style.
              </p>
              <ul className="space-y-3">
                <li className="flex items-center space-x-3">
                  <Check className="w-5 h-5 text-[#5F9136] flex-shrink-0" />
                  <span className="text-gray-700">
                    Living rooms, bedrooms, kitchens, and bathrooms
                  </span>
                </li>
                <li className="flex items-center space-x-3">
                  <Check className="w-5 h-5 text-[#5F9136] flex-shrink-0" />
                  <span className="text-gray-700">
                    Premium paint brands and eco-friendly options
                  </span>
                </li>
                <li className="flex items-center space-x-3">
                  <Check className="w-5 h-5 text-[#5F9136] flex-shrink-0" />
                  <span className="text-gray-700">
                    Color consultation and design advice
                  </span>
                </li>
                <li className="flex items-center space-x-3">
                  <Check className="w-5 h-5 text-[#5F9136] flex-shrink-0" />
                  <span className="text-gray-700">
                    Wall preparation, priming, and detailed finishing
                  </span>
                </li>
              </ul>
              <Link
                href="/quote"
                className="inline-block bg-[#5F9136] text-white px-8 py-3 rounded-lg hover:bg-[#3F652B] transition-colors font-medium"
              >
                Get Interior Quote
              </Link>
            </div>

            {/* Images */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-4">
                <div className="h-64 bg-gray-200 rounded-lg overflow-hidden shadow-md">
                  <Image
                    src="/blueLiving.jpg"
                    alt="Painted living room with modern colors"
                    width={300}
                    height={300}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="h-64 bg-gray-200 rounded-lg overflow-hidden shadow-md">
                  <Image
                    src="/greenBed.jpg"
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
                    src="/whiteKitchen.jpg"
                    alt="Professional kitchen painting"
                    width={300}
                    height={300}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="h-64 bg-gray-200 rounded-lg overflow-hidden shadow-md">
                  <Image
                    src="/whiteBath.jpg"
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
      </section>

      {/* Exterior Painting */}
      <section id="exterior" className="scroll-mt-24 py-16 bg-[#F1F4E8]">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-4">
                <div className="h-64 bg-gray-200 rounded-lg overflow-hidden shadow-md">
                  <Image
                    src="/blueExt.jpg"
                    alt="House front exterior painting"
                    width={300}
                    height={300}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="h-64 bg-gray-200 rounded-lg overflow-hidden shadow-md">
                  <Image
                    src="/redExt.jpg"
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
                    src="/whiteRedExt.jpg"
                    alt="Detailed trim and window painting"
                    width={300}
                    height={300}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="h-64 bg-gray-200 rounded-lg overflow-hidden shadow-md">
                  <Image
                    src="/deckstain.jpg"
                    alt="Deck staining and exterior work"
                    width={300}
                    height={300}
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <h2 className="text-3xl font-bold text-gray-900">
                Exterior Painting
              </h2>
              <p className="text-lg text-gray-700">
                Protect and beautify your home’s exterior with weather-resistant
                paints and proven techniques designed for Calgary’s climate.
              </p>
              <ul className="space-y-3">
                <li className="flex items-center space-x-3">
                  <Check className="w-5 h-5 text-[#5F9136]" />
                  <span className="text-gray-700">
                    House siding, trim, doors, and windows
                  </span>
                </li>
                <li className="flex items-center space-x-3">
                  <Check className="w-5 h-5 text-[#5F9136]" />
                  <span className="text-gray-700">
                    Climate-specific coatings
                  </span>
                </li>
                <li className="flex items-center space-x-3">
                  <Check className="w-5 h-5 text-[#5F9136]" />
                  <span className="text-gray-700">
                    Pressure washing & surface prep
                  </span>
                </li>
                <li className="flex items-center space-x-3">
                  <Check className="w-5 h-5 text-[#5F9136]" />
                  <span className="text-gray-700">
                    Deck staining & fence painting
                  </span>
                </li>
              </ul>
              <Link
                href="/quote"
                className="inline-block bg-[#5F9136] text-white px-8 py-3 rounded-lg hover:bg-[#3F652B] transition-colors font-medium"
              >
                Get Exterior Quote
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Residential */}
      <section id="residential" className="scroll-mt-24 py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <h2 className="text-3xl font-bold text-gray-900">
                Residential Painting Services
              </h2>
              <p className="text-lg text-gray-700">
                Complete home painting solutions tailored to your lifestyle and
                preferences—from single rooms to whole-home makeovers.
              </p>
              <ul className="space-y-3">
                <li className="flex items-center space-x-3">
                  <Check className="w-5 h-5 text-[#5F9136]" />
                  <span className="text-gray-700">
                    Single room refresh to full home transformation
                  </span>
                </li>
                <li className="flex items-center space-x-3">
                  <Check className="w-5 h-5 text-[#5F9136]" />
                  <span className="text-gray-700">
                    Family-friendly scheduling & clean work sites
                  </span>
                </li>
                <li className="flex items-center space-x-3">
                  <Check className="w-5 h-5 text-[#5F9136]" />
                  <span className="text-gray-700">
                    Accent walls, feature painting, custom finishes
                  </span>
                </li>
                <li className="flex items-center space-x-3">
                  <Check className="w-5 h-5 text-[#5F9136]" />
                  <span className="text-gray-700">
                    Move-in/move-out services
                  </span>
                </li>
              </ul>
              <Link
                href="/quote"
                className="inline-block bg-[#5F9136] text-white px-8 py-3 rounded-lg hover:bg-[#3F652B] transition-colors font-medium"
              >
                Get Residential Quote
              </Link>
            </div>

            {/* Images */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-4">
                <div className="h-64 bg-gray-200 rounded-lg overflow-hidden shadow-md">
                  <Image
                    src="/greyLiving.jpg"
                    alt="Family room painting project"
                    width={300}
                    height={300}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="h-64 bg-gray-200 rounded-lg overflow-hidden shadow-md">
                  <Image
                    src="/whiteLiving.jpg"
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
                    src="/greyBath.jpg"
                    alt="Beautifully painted hallway"
                    width={300}
                    height={300}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="h-64 bg-gray-200 rounded-lg overflow-hidden shadow-md">
                  <Image
                    src="/blueExt.jpg"
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
      </section>

      {/* Commercial */}
      <section id="commercial" className="scroll-mt-24 py-16 bg-[#F1F4E8]">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-4">
                <div className="h-64 bg-gray-200 rounded-lg overflow-hidden shadow-md">
                  <Image
                    src="/whiteOffice.jpg"
                    alt="Professional office painting"
                    width={300}
                    height={300}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="h-64 bg-gray-200 rounded-lg overflow-hidden shadow-md">
                  <Image
                    src="/greyCom.jpg"
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
                    src="/greyShop.jpg"
                    alt="Grey shop interior painting"
                    width={300}
                    height={300}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="h-64 bg-gray-200 rounded-lg overflow-hidden shadow-md">
                  <Image
                    src="/blueOffice.jpg"
                    alt="Blue office wall painting"
                    width={300}
                    height={300}
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <h2 className="text-3xl font-bold text-gray-900">
                Commercial Painting Services
              </h2>
              <p className="text-lg text-gray-700">
                Professional painting solutions for businesses of all sizes. We
                maintain your professional image while minimizing downtime.
              </p>
              <ul className="space-y-3">
                <li className="flex items-center space-x-3">
                  <Check className="w-5 h-5 text-[#5F9136]" />
                  <span className="text-gray-700">
                    Offices, retail, restaurants, warehouses
                  </span>
                </li>
                <li className="flex items-center space-x-3">
                  <Check className="w-5 h-5 text-[#5F9136]" />
                  <span className="text-gray-700">
                    Flexible scheduling to reduce disruption
                  </span>
                </li>
                <li className="flex items-center space-x-3">
                  <Check className="w-5 h-5 text-[#5F9136]" />
                  <span className="text-gray-700">
                    Commercial-grade paints & industrial finishes
                  </span>
                </li>
                <li className="flex items-center space-x-3">
                  <Check className="w-5 h-5 text-[#5F9136]" />
                  <span className="text-gray-700">
                    Maintenance programs & touch-ups
                  </span>
                </li>
              </ul>
              <Link
                href="/quote"
                className="inline-block bg-[#5F9136] text-white px-8 py-3 rounded-lg hover:bg-[#3F652B] transition-colors font-medium"
              >
                Get Commercial Quote
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Consultation */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Images */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-4">
                <div className="h-64 bg-gray-200 rounded-lg overflow-hidden shadow-md">
                  <Image
                    src="/redExt.jpg"
                    alt="Color consultation service"
                    width={300}
                    height={300}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="h-64 bg-gray-200 rounded-lg overflow-hidden shadow-md">
                  <Image
                    src="/paintSample.jpg"
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
                    src="/whiteBath.jpg"
                    alt="Professional project planning"
                    width={300}
                    height={300}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="h-64 bg-gray-200 rounded-lg overflow-hidden shadow-md">
                  <Image
                    src="/greyBath.jpg"
                    alt="High-quality paint finish"
                    width={300}
                    height={300}
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <h2 className="text-3xl font-bold text-gray-900">
                Need Help Planning Your Project?
              </h2>
              <p className="text-lg text-gray-700">
                Not sure about colors or which service you need? Our team offers
                consultations to help you make the best choices for your space,
                budget, and timeline.
              </p>
              <ul className="space-y-3">
                <li className="flex items-center space-x-3">
                  <Check className="w-5 h-5 text-[#5F9136]" />
                  <span className="text-gray-700">
                    Professional color consultation & design advice
                  </span>
                </li>
                <li className="flex items-center space-x-3">
                  <Check className="w-5 h-5 text-[#5F9136]" />
                  <span className="text-gray-700">
                    Budget planning & material recommendations
                  </span>
                </li>
                <li className="flex items-center space-x-3">
                  <Check className="w-5 h-5 text-[#5F9136]" />
                  <span className="text-gray-700">
                    Timeline planning & project coordination
                  </span>
                </li>
              </ul>
              <Link
                href="/appointments"
                className="inline-block bg-[#5F9136] text-white px-8 py-3 rounded-lg hover:bg-[#3F652B] transition-colors font-medium"
              >
                Book a Consultation
              </Link>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
