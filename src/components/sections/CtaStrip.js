import Link from "next/link";
import { btnPrimary } from "@/src/components/ui/buttons";

export default function CtaStrip() {
  return (
    <section className="w-full bg-background py-20">
      <div className="max-w-4xl mx-auto text-center">
        <h2 className="text-3xl font-normal text-text mb-4">
          Ready to Transform Your Space?
        </h2>
        <p className="text-xl text-text-muted mb-8">
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
    </section>
  );
}
