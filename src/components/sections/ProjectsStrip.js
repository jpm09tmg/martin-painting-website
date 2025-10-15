import Link from "next/link";
import Image from "next/image";
import { btnPrimary } from "@/src/components/ui/buttons";

export default function ProjectsStrip() {
  const projects = [
    {
      src: "/projectImages/whiteLiving.jpg",
      alt: "Recent interior painting project",
    },
    {
      src: "/projectImages/redExt.jpg",
      alt: "Recent exterior painting project",
    },
    {
      src: "/projectImages/greyCom.jpg",
      alt: "Recent commercial painting project",
    },
  ];

  return (
    <section className="w-full bg-[#F1F4E8] py-20">
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
          {projects.map((p) => (
            <div
              key={p.alt}
              className="h-80 rounded-lg overflow-hidden shadow-sm group transition-all duration-200 hover:shadow-lg"
            >
              <Image
                src={p.src}
                alt={p.alt}
                width={384}
                height={360}
                sizes="(min-width: 1024px) 33vw, 90vw"
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
    </section>
  );
}
