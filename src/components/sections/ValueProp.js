import Link from "next/link";
import Image from "next/image";
import { btnPrimary, btnOutline } from "@/src/components/ui/buttons";

export default function ValueProp() {
  return (
    <section className="w-full h-[600px] bg-background-dark relative overflow-hidden">
      <div className="absolute inset-0  pointer-events-none" />

      <div className="relative z-10 max-w-7xl mx-auto px-20 h-full flex items-center gap-10">
        <div className="flex-1 max-w-2xl">
          <h1 className="text-5xl font-normal text-[#171717] leading-tight mb-6">
            Transform Your Space with Professional Painting
          </h1>
          <p className="text-xl text-text-muted leading-relaxed mb-8">
            Expert interior and exterior painting services for residential and
            commercial properties. Bringing color and life to Calgary homes and
            businesses for over 15 years.
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

          {/* tiny trust bar */}
          <div className="mt-6 flex flex-wrap items-center gap-6 text-sm text-text-muted">
            <span>
              ⭐ <strong>4.9/5</strong> Average Rating
            </span>
            <span className="opacity-40">•</span>
            <span>
              <strong>15+ Years</strong> in Calgary
            </span>
            <span className="opacity-40">•</span>
            <span>
              <strong>Licensed & Insured</strong>
            </span>
          </div>
        </div>

        <div className="flex-1">
          <div className="rounded-lg shadow-lg overflow-hidden group">
            <Image
              src="/projectImages/blueLiving.jpg"
              alt="Professional interior painting"
              width={584}
              height={400}
              sizes="(min-width: 1024px) 40vw, 90vw"
              className="w-full h-96 object-cover transition-transform duration-300 motion-reduce:transition-none group-hover:scale-[1.03]"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
