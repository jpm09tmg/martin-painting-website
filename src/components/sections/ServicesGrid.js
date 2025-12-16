import Link from "next/link";
import Image from "next/image";
import { textLink } from "@/src/components/ui/buttons";
import { supabase } from "@/src/lib/db/supabase-client";

// Revalidate every minute so you see new uploads without a rebuild
export const revalidate = 60;

// Map each service to a folder in your Supabase Storage bucket
const BUCKET = "gallery"; // <-- change if your bucket name differs
const FOLDERS = {
  interior: "residential/interior",
  exterior: "residential/exterior",
  residential: "residential/interior", // or reuse "residential/interior"
  commercial: "commercial/interior", // set to an existing path
};

// Optional local fallbacks if a folder is empty
const FALLBACKS = {
  interior: "/projectImages/whiteLiving.jpg",
  exterior: "/projectImages/blueExt.jpg",
  residential: "/projectImages/greenBed.jpg",
  commercial: "/projectImages/greyCom.jpg",
};

// helper: get the newest file in a folder and return a public URL
async function getPreviewUrl(folder) {
  // list files in folder
  const { data, error } = await supabase.storage.from(BUCKET).list(folder, {
    limit: 1,
    offset: 0,
    sortBy: { column: "created_at", order: "desc" },
  });

  if (error || !data || data.length === 0) return null;

  const file = data[0];
  const path = `${folder}/${file.name}`;
  const { data: pub } = supabase.storage.from(BUCKET).getPublicUrl(path);
  return pub?.publicUrl ?? null;
}

export default async function ServicesGrid() {
  // fetch all preview URLs in parallel
  const [interiorUrl, exteriorUrl, residentialUrl, commercialUrl] =
    await Promise.all([
      getPreviewUrl(FOLDERS.interior),
      getPreviewUrl(FOLDERS.exterior),
      getPreviewUrl(FOLDERS.residential),
      getPreviewUrl(FOLDERS.commercial),
    ]);

  const items = [
    {
      key: "interior",
      title: "Interior Painting",
      href: "/services#interior",
      img: interiorUrl || FALLBACKS.interior,
      desc: "Transform your indoor spaces with our professional interior painting services.",
    },
    {
      key: "exterior",
      title: "Exterior Painting",
      href: "/services#exterior",
      img: exteriorUrl || FALLBACKS.exterior,
      desc: "Protect and beautify your home’s exterior with weather-resistant paint solutions.",
    },
    {
      key: "residential",
      title: "Residential",
      href: "/services#residential",
      img: residentialUrl || FALLBACKS.residential,
      desc: "Complete home painting services tailored to your personal style and needs.",
    },
    {
      key: "commercial",
      title: "Commercial",
      href: "/services#commercial",
      img: commercialUrl || FALLBACKS.commercial,
      desc: "Professional painting solutions for offices, retail spaces, and commercial buildings.",
    },
  ];

  return (
    <section className="w-full bg-background-dark py-24">
      <div className="max-w-7xl mx-auto px-20">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-normal text-text mb-4">Our Services</h2>
          <p className="text-xl text-text-muted">
            Professional painting solutions for every need
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {items.map((s) => (
            <div
              key={s.key}
              className="group grid grid-rows-[auto_auto_1fr_auto] bg-background-light rounded-lg p-8 transition-all duration-200 motion-reduce:transition-none hover:shadow-lg hover:-translate-y-1"
            >
              <div className="overflow-hidden rounded-lg mb-6">
                <Image
                  src={s.img}
                  alt={`${s.title} service`}
                  width={640}
                  height={384}
                  // sizes="(min-width: 1024px) 20vw, 90vw"
                  className="w-full h-48 object-cover transition-transform duration-300 motion-reduce:transition-none group-hover:scale-[1.04]"
                />
              </div>
              <h3 className="text-xl text-text text-center mb-4">{s.title}</h3>
              <p className="text-text-muted text-center mb-6">{s.desc}</p>
              <div className="text-center">
                <Link
                  href={s.href}
                  className={
                    textLink + " text-text hover:underline mx-auto group"
                  }
                  aria-label={`Learn more about ${s.title}`}
                >
                  <span className="hover:underline">Learn More</span>
                  <span
                    className="text-text `transition-transform duration-200 group-hover:translate-x-1"
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
    </section>
  );
}
