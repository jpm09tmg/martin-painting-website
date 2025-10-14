import Image from "next/image";

export default function Hero() {
  return (
    <section className="w-full h-[600px] relative overflow-hidden">
      {/* bg image */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat pointer-events-none"
        style={{
          backgroundImage: `url('/projectImages/greyLiving.jpg')`,
          filter: "brightness(1.1) contrast(0.95)",
        }}
      >
        <div className="absolute inset-0 bg-black/10 pointer-events-none" />
      </div>

      {/* centered logo (same as your current hero) */}
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
            priority
            unoptimized
            className="drop-shadow-xl"
            style={{
              mixBlendMode: "multiply",
              filter: "contrast(1.1) brightness(0.95)",
              width: "650px",
              height: "650px",
              objectFit: "contain",
            }}
          />
        </div>
      </div>
    </section>
  );
}
