import Link from "next/link";
import Image from "next/image";
import { Check } from "lucide-react";
import Header from "@/src/components/layout/Header";
import Footer from "@/src/components/layout/Footer";

export default function ServicesPage() {
  return (
    <div className="w-full min-h-screen bg-background">
      <Header currentPage="services" />

      {/* Hero */}
      <section className="bg-background-dark py-16">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h1 className="text-4xl font-bold text-text mb-4">
            Our Painting Services
          </h1>
          <p className="text-xl text-text-muted max-w-3xl mx-auto">
            Professional painting solutions for every space and budget. From
            interior makeovers to exterior protection, residential homes to
            commercial buildings — we bring quality and color to Calgary.
          </p>
        </div>
      </section>

      {/* Interior Painting */}
      <section id="interior" className="scroll-mt-24 py-16 bg-background">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <h2 className="text-3xl font-bold text-text">
                Interior Painting
              </h2>
              <p className="text-lg text-text-muted">
                Transform your indoor spaces with our professional interior
                painting services. We use premium paints and expert techniques
                to create beautiful, long-lasting finishes that reflect your
                style.
              </p>
              <ul className="space-y-3">
                <li className="flex items-center space-x-3">
                  <Check className="w-5 h-5 text-text flex-shrink-0" />
                  <span className="text-text-muted">
                    Living rooms, bedrooms, kitchens, and bathrooms
                  </span>
                </li>
                <li className="flex items-center space-x-3">
                  <Check className="w-5 h-5 text-text flex-shrink-0" />
                  <span className="text-text-muted">
                    Premium paint brands and eco-friendly options
                  </span>
                </li>
                <li className="flex items-center space-x-3">
                  <Check className="w-5 h-5 text-text flex-shrink-0" />
                  <span className="text-text-muted">
                    Color consultation and design advice
                  </span>
                </li>
                <li className="flex items-center space-x-3">
                  <Check className="w-5 h-5 text-text flex-shrink-0" />
                  <span className="text-text-muted">
                    Wall preparation, priming, and detailed finishing
                  </span>
                </li>
              </ul>
              <Link
                href="/quote"
                className="inline-block bg-background-light text-white px-8 py-3 rounded-lg hover:bg-background-dark transition-colors font-medium"
              >
                Get Interior Quote
              </Link>
            </div>

            {/* Images */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-4">
                <div className="h-64 bg-background-light rounded-lg overflow-hidden shadow-md">
                  <Image
                    src="/projectImages/blueLiving.jpg"
                    alt="Painted living room with modern colors"
                    width={300}
                    height={300}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="h-64 bg-gray-200 rounded-lg overflow-hidden shadow-md">
                  <Image
                    src="/projectImages/greenBed.jpg"
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
                    src="/projectImages/whiteKitchen.jpg"
                    alt="Professional kitchen painting"
                    width={300}
                    height={300}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="h-64 bg-gray-200 rounded-lg overflow-hidden shadow-md">
                  <Image
                    src="/projectImages/whiteBath.jpg"
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
      <section id="exterior" className="scroll-mt-24 py-16 bg-background-dark">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-4">
                <div className="h-64 bg-background-light rounded-lg overflow-hidden shadow-md">
                  <Image
                    src="/projectImages/blueExt.jpg"
                    alt="House front exterior painting"
                    width={300}
                    height={300}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="h-64 bg-gray-200 rounded-lg overflow-hidden shadow-md">
                  <Image
                    src="/projectImages/redExt.jpg"
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
                    src="/projectImages/whiteRedExt.jpg"
                    alt="Detailed trim and window painting"
                    width={300}
                    height={300}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="h-64 bg-gray-200 rounded-lg overflow-hidden shadow-md">
                  <Image
                    src="/projectImages/deckStain.jpg"
                    alt="Deck staining and exterior work"
                    width={300}
                    height={300}
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <h2 className="text-3xl font-bold text-text">
                Exterior Painting
              </h2>
              <p className="text-lg text-text-muted">
                Protect and beautify your home’s exterior with weather-resistant
                paints and proven techniques designed for Calgary’s climate.
              </p>
              <ul className="space-y-3">
                <li className="flex items-center space-x-3">
                  <Check className="w-5 h-5 text-text" />
                  <span className="text-text-muted">
                    House siding, trim, doors, and windows
                  </span>
                </li>
                <li className="flex items-center space-x-3">
                  <Check className="w-5 h-5 text-text" />
                  <span className="text-text-muted">
                    Climate-specific coatings
                  </span>
                </li>
                <li className="flex items-center space-x-3">
                  <Check className="w-5 h-5 text-text" />
                  <span className="text-text-muted">
                    Pressure washing & surface prep
                  </span>
                </li>
                <li className="flex items-center space-x-3">
                  <Check className="w-5 h-5 text-text" />
                  <span className="text-text-muted">
                    Deck staining & fence painting
                  </span>
                </li>
              </ul>
              <Link
                href="/quote"
                className="inline-block bg-primary text-white px-8 py-3 rounded-lg hover:bg-primary-dark transition-colors font-medium"
              >
                Get Exterior Quote
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Residential */}
      <section id="residential" className="scroll-mt-24 py-16 bg-background">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <h2 className="text-3xl font-bold text-text">
                Residential Painting Services
              </h2>
              <p className="text-lg text-text-muted">
                Complete home painting solutions tailored to your lifestyle and
                preferences—from single rooms to whole-home makeovers.
              </p>
              <ul className="space-y-3">
                <li className="flex items-center space-x-3">
                  <Check className="w-5 h-5 text-text" />
                  <span className="text-text-muted">
                    Single room refresh to full home transformation
                  </span>
                </li>
                <li className="flex items-center space-x-3">
                  <Check className="w-5 h-5 text-text" />
                  <span className="text-text-muted">
                    Family-friendly scheduling & clean work sites
                  </span>
                </li>
                <li className="flex items-center space-x-3">
                  <Check className="w-5 h-5 text-text" />
                  <span className="text-text-muted">
                    Accent walls, feature painting, custom finishes
                  </span>
                </li>
                <li className="flex items-center space-x-3">
                  <Check className="w-5 h-5 text-text" />
                  <span className="text-text-muted">
                    Move-in/move-out services
                  </span>
                </li>
              </ul>
              <Link
                href="/quote"
                className="inline-block bg-primary text-white px-8 py-3 rounded-lg hover:bg-primary-dark transition-colors font-medium"
              >
                Get Residential Quote
              </Link>
            </div>

            {/* Images */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-4">
                <div className="h-64 bg-gray-200 rounded-lg overflow-hidden shadow-md">
                  <Image
                    src="/projectImages/greyLiving.jpg"
                    alt="Family room painting project"
                    width={300}
                    height={300}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="h-64 bg-gray-200 rounded-lg overflow-hidden shadow-md">
                  <Image
                    src="/projectImages/whiteLiving.jpg"
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
                    src="/projectImages/greyBath.jpg"
                    alt="Beautifully painted hallway"
                    width={300}
                    height={300}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="h-64 bg-gray-200 rounded-lg overflow-hidden shadow-md">
                  <Image
                    src="/projectImages/blueExt.jpg"
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
      <section
        id="commercial"
        className="scroll-mt-24 py-16 bg-background-dark"
      >
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-4">
                <div className="h-64 bg-background rounded-lg overflow-hidden shadow-md">
                  <Image
                    src="/projectImages/whiteOffice.jpg"
                    alt="Professional office painting"
                    width={300}
                    height={300}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="h-64 bg-gray-200 rounded-lg overflow-hidden shadow-md">
                  <Image
                    src="/projectImages/greyCom.jpg"
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
                    src="/projectImages/greyShop.jpg"
                    alt="Grey shop interior painting"
                    width={300}
                    height={300}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="h-64 bg-gray-200 rounded-lg overflow-hidden shadow-md">
                  <Image
                    src="/projectImages/blueOffice.jpg"
                    alt="Blue office wall painting"
                    width={300}
                    height={300}
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <h2 className="text-3xl font-bold text-text">
                Commercial Painting Services
              </h2>
              <p className="text-lg text-text-muted">
                Professional painting solutions for businesses of all sizes. We
                maintain your professional image while minimizing downtime.
              </p>
              <ul className="space-y-3">
                <li className="flex items-center space-x-3">
                  <Check className="w-5 h-5 text-text" />
                  <span className="text-text-muted">
                    Offices, retail, restaurants, warehouses
                  </span>
                </li>
                <li className="flex items-center space-x-3">
                  <Check className="w-5 h-5 text-text" />
                  <span className="text-text-muted">
                    Flexible scheduling to reduce disruption
                  </span>
                </li>
                <li className="flex items-center space-x-3">
                  <Check className="w-5 h-5 text-text" />
                  <span className="text-text-muted">
                    Commercial-grade paints & industrial finishes
                  </span>
                </li>
                <li className="flex items-center space-x-3">
                  <Check className="w-5 h-5 text-text" />
                  <span className="text-text-muted">
                    Maintenance programs & touch-ups
                  </span>
                </li>
              </ul>
              <Link
                href="/quote"
                className="inline-block bg-primary text-white px-8 py-3 rounded-lg hover:bg-primary-dark transition-colors font-medium"
              >
                Get Commercial Quote
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Consultation */}
      <section className="py-16 bg-background">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Images */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-4">
                <div className="h-64 bg-gray-200 rounded-lg overflow-hidden shadow-md">
                  <Image
                    src="/projectImages/redExt.jpg"
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
                    src="/projectImages/whiteBath.jpg"
                    alt="Professional project planning"
                    width={300}
                    height={300}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="h-64 bg-gray-200 rounded-lg overflow-hidden shadow-md">
                  <Image
                    src="/projectImages/greyBath.jpg"
                    alt="High-quality paint finish"
                    width={300}
                    height={300}
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <h2 className="text-3xl font-bold text-text">
                Need Help Planning Your Project?
              </h2>
              <p className="text-lg text-text-muted">
                Not sure about colors or which service you need? Our team offers
                consultations to help you make the best choices for your space,
                budget, and timeline.
              </p>
              <ul className="space-y-3">
                <li className="flex items-center space-x-3">
                  <Check className="w-5 h-5 text-text" />
                  <span className="text-text-muted">
                    Professional color consultation & design advice
                  </span>
                </li>
                <li className="flex items-center space-x-3">
                  <Check className="w-5 h-5 text-text" />
                  <span className="text-text-muted">
                    Budget planning & material recommendations
                  </span>
                </li>
                <li className="flex items-center space-x-3">
                  <Check className="w-5 h-5 text-text" />
                  <span className="text-text-muted">
                    Timeline planning & project coordination
                  </span>
                </li>
              </ul>
              <Link
                href="/appointments"
                className="inline-block bg-primary text-white px-8 py-3 rounded-lg hover:bg-primary-dark transition-colors font-medium"
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
