// app/services/[category]/page.tsx
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

const CATEGORIES = {
  interior: {
    title: "Interior Painting",
    blurb:
      "Transform your indoor spaces with smooth finishes, durable paints, and clean edges—done on schedule with minimal disruption.",
    hero: "/whiteLiving.jpg",
    bullets: [
      "Walls, ceilings, trim, doors",
      "Colour consultation & samples",
      "Low-VOC options for sensitive spaces",
      "Minor patching & surface prep",
    ],
  },
  exterior: {
    title: "Exterior Painting",
    blurb:
      "Weather-resistant coatings that protect your home and boost curb appeal with proper prep and pro application.",
    hero: "/blueExt.jpg",
    bullets: [
      "Stucco, siding, brick, fences",
      "Power washing & scraping",
      "Primer selection for material",
      "Seasonal timing & durability",
    ],
  },
  residential: {
    title: "Residential Painting",
    blurb:
      "From single rooms to full-home refreshes, we tailor scope, schedule, and finishes to your lifestyle and budget.",
    hero: "/greenBed.jpg",
    bullets: [
      "Condo & single-family specialists",
      "Move-in / move-out refresh",
      "Colour matching & touch-ups",
      "Protective coverings & cleanup",
    ],
  },
  commercial: {
    title: "Commercial Painting",
    blurb:
      "Professional finishes for offices and retail with safety, scheduling, and longevity in mind.",
    hero: "/greyCom.jpg",
    bullets: [
      "After-hours work available",
      "Brand-accurate colour matching",
      "Durable, easy-clean coatings",
      "Site safety & compliance",
    ],
  },
} as const;

type CategoryKey = keyof typeof CATEGORIES;

export function generateStaticParams() {
  // lets Next prebuild /services/interior, etc. (optional but nice)
  return Object.keys(CATEGORIES).map((category) => ({ category }));
}

export function generateMetadata({ params }: { params: { category: string } }) {
  const item = CATEGORIES[params.category as CategoryKey];
  if (!item) return { title: "Service not found" };
  return {
    title: `${item.title} | Martin Painting`,
    description: item.blurb,
  };
}

export default function Page({ params }: { params: { category: string } }) {
  const item = CATEGORIES[params.category as CategoryKey];
  if (!item) return notFound();

  return (
    <main className="bg-white">
      {/* Hero */}
      <section className="w-full bg-[#F1F4E8]">
        <div className="max-w-7xl mx-auto px-6 md:px-20 py-16 grid md:grid-cols-2 gap-10 items-center">
          <div>
            <p className="text-sm tracking-wide text-[#5F9136] mb-3">Services</p>
            <h1 className="text-4xl md:text-5xl text-[#171717] mb-6">{item.title}</h1>
            <p className="text-lg text-[#525252] mb-8">{item.blurb}</p>
            <div className="flex flex-wrap gap-6">
              <Link
                href="/quote"
                className="inline-flex items-center justify-center rounded-md px-6 py-3 font-semibold text-white bg-[#74A744] transition-all duration-200 hover:bg-[#5F9136] hover:shadow-md hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#74A744]/60 focus-visible:ring-offset-2"
              >
                Get Free Quote
              </Link>
              <Link
                href="/services"
                className="inline-flex items-center gap-2 rounded-md px-6 py-3 font-medium text-[#171717] border border-[#D7E6C7] hover:bg-[#EEF5D4] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#74A744]/60 focus-visible:ring-offset-2"
              >
                ← All Services
              </Link>
            </div>
          </div>

          <div className="rounded-lg shadow-lg overflow-hidden">
            <Image
              src={item.hero}
              alt={`${item.title} example`}
              width={960}
              height={640}
              className="w-full h-[320px] md:h-[380px] object-cover"
              priority
            />
          </div>
        </div>
      </section>

      {/* Details */}
      <section className="max-w-7xl mx-auto px-6 md:px-20 py-16">
        <h2 className="text-2xl text-[#171717] mb-6">What’s included</h2>
        <ul className="grid md:grid-cols-2 gap-4 text-[#525252]">
          {item.bullets.map((b) => (
            <li key={b} className="flex items-start gap-3">
              <span className="mt-1 h-2 w-2 rounded-full bg-[#74A744]" />
              <span>{b}</span>
            </li>
          ))}
        </ul>

        <div className="mt-12 rounded-lg border border-[#E6E6E6] p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <p className="text-[#171717]">
            Have questions about <strong>{item.title.toLowerCase()}</strong>? We’ll guide you on prep,
            colours, and timelines.
          </p>
          <Link
            href="/appointments"
            className="inline-flex items-center justify-center rounded-md px-5 py-3 font-semibold text-white bg-[#74A744] transition-all duration-200 hover:bg-[#5F9136] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#74A744]/60 focus-visible:ring-offset-2"
          >
            Book a Consultation
          </Link>
        </div>
      </section>
    </main>
  );
}
