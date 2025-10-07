// app/page.js
import Link from "next/link";
import Image from "next/image";
import Header from "../components/Header";
import Footer from "../components/Footer";

export default function Home() {
  // Reusable button styles
  const btnPrimary =
    "inline-flex items-center justify-center rounded-md px-8 py-3 font-semibold text-white bg-[#74A744] " +
    "transition-all duration-200 motion-reduce:transition-none " +
    "hover:bg-[#5F9136] hover:shadow-md hover:-translate-y-0.5 " +
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#74A744]/60 focus-visible:ring-offset-2";
  const btnOutline =
    "inline-flex items-center justify-center rounded-md px-8 py-3 font-semibold text-[#74A744] border border-[#74A744] " +
    "transition-all duration-200 motion-reduce:transition-none " +
    "hover:bg-[#74A744] hover:text-white hover:shadow-md hover:-translate-y-0.5 " +
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#74A744]/60 focus-visible:ring-offset-2";

  const textLink =
    "inline-flex items-center gap-1 font-medium text-[#171717] " +
    "underline decoration-transparent underline-offset-4 transition-[text-decoration-color,transform] duration-200 " +
    "hover:decoration-[#171717] hover:translate-x-0.5 " +
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#74A744]/60 focus-visible:ring-offset-2 rounded";

  return (
    <div className="w-full min-h-screen bg-white">
      <Header currentPage="home" />

      {/* HERO */}
      <div className="w-full h-[600px] relative overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat pointer-events-none"
          style={{
            backgroundImage: `url('/projectImages/greyLiving.jpg')`,
            filter: "brightness(1.1) contrast(0.95)",
          }}
        >
          <div className="absolute inset-0 bg-black/10 pointer-events-none" />
        </div>

        <div className="relative z-10 h-full flex items-center justify-center">
          <div
            className="flex items-center justify-center w-full h-full"
            style={{ marginTop: "-40px" }}
          >
            <Image
              src="/martinPainting.png"
              alt="Martin Painting Logo"
              width={6200}
              height={6200}
              className="drop-shadow-xl"
              style={{
                mixBlendMode: "multiply",
                filter: "contrast(1.1) brightness(0.95)",
                width: "650px",
                height: "650px",
                objectFit: "contain",
              }}
              priority
              unoptimized
            />
          </div>
        </div>
      </div>

      {/* VALUE PROP */}
      <div className="w-full h-[600px] bg-[#F1F4E8] relative overflow-hidden">
        <div className="absolute inset-0 bg-[rgba(238,245,212,0.2)] pointer-events-none" />

        <div className="relative z-10 max-w-7xl mx-auto px-20 h-full flex items-center gap-10">
          <div className="flex-1 max-w-2xl">
            <h1 className="text-5xl font-normal text-[#171717] leading-tight mb-6">
              Transform Your Space with Professional Painting
            </h1>
            <p className="text-xl text-[#525252] leading-relaxed mb-8">
              Expert interior and exterior painting services for residential and
              commercial properties. Bringing color and life to Calgary homes
              and businesses for over 15 years.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link
                href="/appointments"
                className={btnPrimary}
                aria-label="Book an appointment"
              >
                Book Appointment
              </Link>
              <Link
                href="/quote"
                className={btnOutline}
                aria-label="Get a free quote"
              >
                Get Free Quote
              </Link>
              <Link
                href="/gallery"
                className={btnOutline}
                aria-label="View our project gallery"
              >
                View Projects
              </Link>
            </div>
          </div>

          <div className="flex-1">
            <div className="rounded-lg shadow-lg overflow-hidden group">
              <Image
                src="/blueLiving.jpg"
                alt="Professional interior painting"
                width={584}
                height={400}
                className="w-full h-96 object-cover transition-transform duration-300 motion-reduce:transition-none group-hover:scale-[1.03]"
              />
            </div>
          </div>
        </div>
      </div>

      {/* SERVICES */}
      <div className="w-full bg-white py-20">
        <div className="max-w-7xl mx-auto px-20">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-normal text-[#171717] mb-4">
              Our Services
            </h2>
            <p className="text-xl text-[#525252]">
              Professional painting solutions for every need
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[
              {
                key: "interior",
                title: "Interior Painting",
                href: "/services#interior",
                img: "/whiteLiving.jpg",
                desc: "Transform your indoor spaces with our professional interior painting services.",
              },
              {
                key: "exterior",
                title: "Exterior Painting",
                href: "/services#exterior",
                img: "/blueExt.jpg",
                desc: "Protect and beautify your homes exterior with weather-resistant paint solutions.",
              },
              {
                key: "residential",
                title: "Residential",
                href: "/services#residential",
                img: "/greenBed.jpg",
                desc: "Complete home painting services tailored to your personal style and needs.",
              },
              {
                key: "commercial",
                title: "Commercial",
                href: "/services#commercial",
                img: "/greyCom.jpg",
                desc: "Professional painting solutions for offices, retail spaces, and commercial buildings.",
              },
            ].map((s) => (
              <div
                key={s.key}
                className="group bg-[#EAF3E0] rounded-lg p-8 transition-all duration-200 motion-reduce:transition-none hover:shadow-lg hover:-translate-y-1"
              >
                <div className="overflow-hidden rounded-lg mb-6">
                  <Image
                    src={s.img}
                    alt={`${s.title} service`}
                    width={320}
                    height={192}
                    className="w-full h-48 object-cover transition-transform duration-300 motion-reduce:transition-none group-hover:scale-[1.04]"
                  />
                </div>
                <h3 className="text-xl text-[#171717] text-center mb-4">
                  {s.title}
                </h3>
                <p className="text-[#525252] text-center mb-6">{s.desc}</p>
                <div className="text-center">
                  <Link
                    href={s.href}
                    className={textLink}
                    aria-label={`Learn more about ${s.title}`}
                  >
                    <span>Learn More</span>
                    <span
                      className="transition-transform duration-200 group-hover:translate-x-1"
                      aria-hidden
                    >
                      →
                    </span>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* RECENT PROJECTS */}
      <div className="w-full bg-[#F1F4E8] py-20">
        <div className="max-w-7xl mx-auto px-20">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-normal text-[#171717] mb-4">
              Recent Projects
            </h2>
            <p className="text-xl text-[#525252]">
              See our latest painting transformations
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
            {[
              {
                src: "/whiteLiving.jpg",
                alt: "Recent interior painting project",
              },
              { src: "/redExt.jpg", alt: "Recent exterior painting project" },
              {
                src: "/greyCom.jpg",
                alt: "Recent commercial painting project",
              },
            ].map((p) => (
              <div
                key={p.alt}
                className="h-80 rounded-lg overflow-hidden shadow-sm group transition-all duration-200 hover:shadow-lg"
              >
                <Image
                  src={p.src}
                  alt={p.alt}
                  width={384}
                  height={360}
                  className="w-full h-full object-cover transition-transform duration-300 motion-reduce:transition-none group-hover:scale-[1.03]"
                />
              </div>
            ))}
          </div>

          <div className="text-center">
            <Link
              href="/gallery"
              className={btnPrimary}
              aria-label="Open full project gallery"
            >
              View Project Gallery
            </Link>
          </div>
        </div>
      </div>

      {/* CTA */}
      <div className="w-full bg-white py-20">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-normal text-[#171717] mb-4">
            Ready to Transform Your Space?
          </h2>
          <p className="text-xl text-[#525252] mb-8">
            Get a free consultation and quote for your painting project
          </p>
          <Link
            href="/appointments"
            className={btnPrimary}
            aria-label="Book an appointment"
          >
            Book Appointment
          </Link>
        </div>
      </div>

      <Footer />
    </div>
  );
}
