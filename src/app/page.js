import Header from "@/src/components/layout/Header";
import Footer from "@/src/components/layout/Footer";

import Hero from "@/src/components/sections/Hero";
import ValueProp from "@/src/components/sections/ValueProp";
import ServicesGrid from "@/src/components/sections/ServicesGrid";
import ProjectsStrip from "@/src/components/sections/ProjectsStrip";
import Testimonials from "@/src/components/sections/Testimonials";
import CtaStrip from "@/src/components/sections/CtaStrip";
import ReviewForm from "@/src/components/sections/ReviewForm";

export default function Home() {
  return (
    <div className="w-full min-h-screen bg-white">
      <Header currentPage="home" />
      <Hero />
      <ValueProp />
      <ServicesGrid />
      <ProjectsStrip />
      <Testimonials />
      <CtaStrip />
      <ReviewForm />
      <Footer />
    </div>
  );
}
