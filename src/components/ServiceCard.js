import Link from "next/link";
import Image from "next/image";

export default function ServiceCard({ title, href, img, desc }) {
  return (
    <div className="group rounded-xl bg-[#EAF3E0] p-6 transition-all duration-200 hover:-translate-y-1 hover:shadow-lg hover:outline hover:outline-1 hover:outline-[#74A744]/25">
      <div className="mb-5 overflow-hidden rounded-lg">
        <Image
          src={img}
          alt={`${title} service`}
          width={640}
          height={400}
          sizes="(min-width: 768px) 25vw, 90vw"
          className="h-48 w-full object-cover transition-transform duration-300 group-hover:scale-[1.04]"
        />
      </div>
      <h3 className="mb-2 text-center text-xl text-[#171717]">{title}</h3>
      <p className="mb-4 text-center text-[#525252]">{desc}</p>
      <div className="text-center">
        <Link
          href={href}
          className="inline-flex items-center gap-1 font-medium text-[#171717] underline decoration-transparent underline-offset-4 transition-[text-decoration-color,transform] duration-200 hover:decoration-[#171717] hover:translate-x-0.5"
          aria-label={`Learn more about ${title}`}
        >
          Learn More →
        </Link>
      </div>
    </div>
  );
}
