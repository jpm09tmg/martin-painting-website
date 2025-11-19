"use client";

import { useState, useEffect } from "react";
import { supabase } from "../../lib/db/supabase-client";
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
    return null;
  }

  return (
    <section className="py-16 bg-gray-50">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-normal text-center mb-12 text-gray-800">
          Hear from Our Clients
        </h2>

        <div className="max-w-4xl mx-auto">
          <div className="bg-[#f0f4f0] rounded-lg shadow-lg p-8 md:p-12 relative">
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
              {/* Premium Paint Brush Icon */}
              <div className="flex-shrink-0">
                <div className="w-24 h-24 md:w-32 md:h-32 rounded-full border-4 border-[#6b9e3e] flex items-center justify-center bg-gradient-to-br from-white to-gray-50 shadow-lg">
                  <svg
                    className="w-12 h-12 md:w-16 md:h-16"
                    viewBox="0 0 64 64"
                    fill="none"
                  >
                    {/* Brush Handle - wooden texture */}
                    <defs>
                      <linearGradient id="woodGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" style={{stopColor: "#8B4513", stopOpacity: 1}} />
                        <stop offset="50%" style={{stopColor: "#A0522D", stopOpacity: 1}} />
                        <stop offset="100%" style={{stopColor: "#8B4513", stopOpacity: 1}} />
                      </linearGradient>
                      <linearGradient id="metalGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" style={{stopColor: "#E8E8E8", stopOpacity: 1}} />
                        <stop offset="50%" style={{stopColor: "#B8B8B8", stopOpacity: 1}} />
                        <stop offset="100%" style={{stopColor: "#989898", stopOpacity: 1}} />
                      </linearGradient>
                      <linearGradient id="bristleGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" style={{stopColor: "#7db84d", stopOpacity: 1}} />
                        <stop offset="100%" style={{stopColor: "#5a8a33", stopOpacity: 1}} />
                      </linearGradient>
                    </defs>
                    
                    {/* Wooden Handle with rounded top */}
                    <rect x="26" y="7" width="12" height="33" fill="url(#woodGradient)" rx="6"/>
                    {/* Wood grain detail */}
                    <ellipse cx="29" cy="15" rx="1" ry="3" fill="#6B3410" opacity="0.3"/>
                    <ellipse cx="35" cy="22" rx="1" ry="4" fill="#6B3410" opacity="0.3"/>
                    {/* Handle highlight */}
                    <rect x="28" y="9" width="2.5" height="28" fill="#D2691E" opacity="0.4" rx="1.25"/>
                    
                    {/* Metal Ferrule - realistic metallic look */}
                    <rect x="23.5" y="38" width="17" height="8" fill="url(#metalGradient)" rx="1.5"/>
                    {/* Ferrule bands */}
                    <rect x="23.5" y="38" width="17" height="1.5" fill="#F0F0F0" opacity="0.8"/>
                    <rect x="23.5" y="44.5" width="17" height="1.5" fill="#808080" opacity="0.6"/>
                    {/* Ferrule shine */}
                    <rect x="24" y="39" width="2" height="5" fill="white" opacity="0.3" rx="1"/>
                    
                    {/* Paint Brush Bristles - fuller, more realistic */}
                    <path d="M23.5 46 L21.5 56.5 C21.5 57.5 22.5 58.5 23.5 58.5 L25.5 58.5 L25.5 46 Z" fill="url(#bristleGradient)"/>
                    <path d="M26.5 46 L26.5 58.5 L28.5 58.5 L28.5 46 Z" fill="#6b9e3e"/>
                    <path d="M29.5 46 L29.5 58.5 L31 58.5 L31 46 Z" fill="url(#bristleGradient)"/>
                    <path d="M32 46 L32 58.5 L33.5 58.5 L33.5 46 Z" fill="#6b9e3e"/>
                    <path d="M34.5 46 L34.5 58.5 L36.5 58.5 L36.5 46 Z" fill="url(#bristleGradient)"/>
                    <path d="M37.5 46 L37.5 58.5 L38.5 58.5 C39.5 58.5 40.5 57.5 40.5 56.5 L38.5 46 Z" fill="#6b9e3e"/>
                    
                    {/* Bristle separation lines for texture */}
                    <line x1="26" y1="46" x2="26" y2="58" stroke="#5a8a33" strokeWidth="0.3" opacity="0.5"/>
                    <line x1="29" y1="46" x2="29" y2="58" stroke="#5a8a33" strokeWidth="0.3" opacity="0.5"/>
                    <line x1="32" y1="46" x2="32" y2="58" stroke="#5a8a33" strokeWidth="0.3" opacity="0.5"/>
                    <line x1="35" y1="46" x2="35" y2="58" stroke="#5a8a33" strokeWidth="0.3" opacity="0.5"/>
                    <line x1="38" y1="46" x2="38" y2="58" stroke="#5a8a33" strokeWidth="0.3" opacity="0.5"/>
                    
                    {/* Bristle tips - worn/used look */}
                    <ellipse cx="31" cy="57.5" rx="9" ry="1.5" fill="#4a7028" opacity="0.6"/>
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
