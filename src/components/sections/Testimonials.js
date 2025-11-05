"use client";

import { useState, useEffect } from "react";
import { supabase } from "../../lib/supabase-client";
import { ChevronLeft, ChevronRight } from "lucide-react";

export default function Testimonials() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [allTestimonials, setAllTestimonials] = useState([]);

  // Your default/hardcoded testimonials
  const defaultTestimonials = [
    {
      id: "default-1",
      quote:
        "Our experience with Martin Painting was excellent, from the initial quote to the crew who navigated tight deadlines in our house. Every aspect with them was above our expectations. They work quick, the entire team is friendly, and they produce high-quality work. I would absolutely use them again and will be referring to friends and family looking to paint their homes!",
      author_name: "Travis C.",
      service_type: "Painting Walls - Interior",
      rating: 5,
    },
    {
      id: "default-2",
      quote:
        "Martin Painting transformed our home beautifully! Professional service from start to finish. Highly recommend for anyone looking for quality painting work.",
      author_name: "Sarah M.",
      service_type: "Exterior Painting",
      rating: 5,
    },
    {
      id: "default-3",
      quote:
        "Exceptional attention to detail and very reasonable pricing. The team was punctual and cleaned up thoroughly after completing the job.",
      author_name: "John D.",
      service_type: "Interior Painting",
      rating: 5,
    },
  ];

  // Load approved testimonials from database
  useEffect(() => {
    loadTestimonials();
  }, []);

  const loadTestimonials = async () => {
    try {
      const { data, error } = await supabase
        .from("testimonials")
        .select("*")
        .eq("status", "approved")
        .order("approved_at", { ascending: false });

      if (error) throw error;

      // Combine database testimonials with default ones
      const combinedTestimonials = [...(data || []), ...defaultTestimonials];
      setAllTestimonials(combinedTestimonials);
    } catch (err) {
      console.error("Error loading testimonials:", err);
      // If there's an error, just show default testimonials
      setAllTestimonials(defaultTestimonials);
    }
  };

  const nextSlide = () => {
    setCurrentIndex((prevIndex) =>
      prevIndex === allTestimonials.length - 1 ? 0 : prevIndex + 1
    );
  };

  const prevSlide = () => {
    setCurrentIndex((prevIndex) =>
      prevIndex === 0 ? allTestimonials.length - 1 : prevIndex - 1
    );
  };

  const goToSlide = (index) => {
    setCurrentIndex(index);
  };

  // Auto-rotate every 5 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      nextSlide();
    }, 5000);
    return () => clearInterval(interval);
  }, [currentIndex, allTestimonials.length]);

  if (allTestimonials.length === 0) {
    return null; // Don't show anything if no testimonials but will show the default ones
  }

  return (
    <section className="py-16 bg-gray-50">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold text-center mb-12 text-gray-800">
          TESTIMONIALS
        </h2>

        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-lg shadow-lg p-8 md:p-12 relative">
            {/* Navigation Arrows */}
            <button
              onClick={prevSlide}
              className="absolute left-4 top-1/2 -translate-y-1/2 bg-white rounded-full p-2 shadow-md hover:bg-gray-100 transition-colors"
              aria-label="Previous testimonial"
            >
              <ChevronLeft className="w-6 h-6 text-gray-600" />
            </button>

            <button
              onClick={nextSlide}
              className="absolute right-4 top-1/2 -translate-y-1/2 bg-white rounded-full p-2 shadow-md hover:bg-gray-100 transition-colors"
              aria-label="Next testimonial"
            >
              <ChevronRight className="w-6 h-6 text-gray-600" />
            </button>

            {/* Testimonial Content */}
            <div className="flex flex-col md:flex-row items-center gap-8">
              {/* Icon */}
              <div className="flex-shrink-0">
                <div className="w-24 h-24 md:w-32 md:h-32 rounded-full border-4 border-[#2c5f7f] flex items-center justify-center bg-white">
                  <svg
                    className="w-12 h-12 md:w-16 md:h-16 text-[#2c5f7f]"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M7 2h10v2H7V2zm0 18h10v2H7v-2zM5 6h14v12H5V6zm2 2v8h10V8H7z" />
                  </svg>
                </div>
              </div>

              {/* Quote and Author */}
              <div className="flex-1 text-center md:text-left">
                {/* Star Rating */}
                <div className="flex justify-center md:justify-start mb-4">
                  {[...Array(5)].map((_, i) => (
                    <svg
                      key={i}
                      className={`w-5 h-5 ${
                        i < allTestimonials[currentIndex].rating
                          ? "text-yellow-400 fill-current"
                          : "text-gray-300 fill-current"
                      }`}
                      viewBox="0 0 20 20"
                    >
                      <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
                    </svg>
                  ))}
                </div>

                <p className="text-gray-700 text-lg italic mb-6 leading-relaxed">
                  "{allTestimonials[currentIndex].quote}"
                </p>
                <p className="text-[#2c5f7f] font-semibold text-lg">
                  {allTestimonials[currentIndex].author_name} (
                  {allTestimonials[currentIndex].service_type})
                </p>
              </div>
            </div>

            {/* Dots Navigation */}
            <div className="flex justify-center gap-2 mt-8">
              {allTestimonials.map((_, index) => (
                <button
                  key={index}
                  onClick={() => goToSlide(index)}
                  className={`w-3 h-3 rounded-full transition-all ${
                    index === currentIndex
                      ? "bg-[#2c5f7f] w-8"
                      : "bg-gray-300 hover:bg-gray-400"
                  }`}
                  aria-label={`Go to testimonial ${index + 1}`}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}