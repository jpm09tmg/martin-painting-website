import Header from "@/src/components/layout/Header";
import Footer from "@/src/components/layout/Footer";

import Hero from "@/src/components/sections/Hero";
import ValueProp from "@/src/components/sections/ValueProp";
import ServicesGrid from "@/src/components/sections/ServicesGrid";
import ProjectsStrip from "@/src/components/sections/ProjectsStrip";
import CtaStrip from "@/src/components/sections/CtaStrip";

export default function Home() {
  return (
    <div className="w-full min-h-screen bg-white">
      <Header currentPage="home" />
      <Hero />
      <ValueProp />
      <ServicesGrid />
      <ProjectsStrip />
      <CtaStrip />
      <Footer />
    </div>
  );
}
