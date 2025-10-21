"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

export default function Testimonials() {
  const [currentIndex, setCurrentIndex] = useState(0);

  const testimonials = [
    {
      id: 1,
      quote:
        "Our experience with Martin Painting was excellent, from the initial quote to the crew who navigated tight deadlines in our house. Every aspect with them was above our expectations. They work quick, the entire team is friendly, and they produce high-quality work. I would absolutely use them again and will be referring to friends and family looking to paint their homes!",
      author: "Travis C.",
      service: "Painting Walls - Interior",
    },
    {
      id: 2,
      quote:
        "Amazing service! The team was professional, punctual, and did an outstanding job painting our entire home. The attention to detail was impressive and they cleaned up everything perfectly. Highly recommend for anyone looking for quality painting services!",
      author: "Sarah M.",
      service: "Exterior Painting",
    },
    {
      id: 3,
      quote:
        "We hired Martin Painting for our office renovation and couldn't be happier. They worked around our schedule, were very respectful of our workspace, and delivered beautiful results. The color consultation was particularly helpful!",
      author: "Michael R.",
      service: "Commercial Painting",
    },
  ];

  const previousTestimonial = () => {
    setCurrentIndex((prevIndex) =>
      prevIndex === 0 ? testimonials.length - 1 : prevIndex - 1
    );
  };

  const nextTestimonial = () => {
    setCurrentIndex((prevIndex) =>
      prevIndex === testimonials.length - 1 ? 0 : prevIndex + 1
    );
  };

  const goToTestimonial = (index) => {
    setCurrentIndex(index);
  };

  return (
    <section className="w-full bg-[#F5E6D3] py-20">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-900 mb-2 tracking-wide">
            TESTIMONIALS
          </h2>
        </div>

        <div className="relative bg-white rounded-2xl shadow-xl p-8 md:p-12 max-w-5xl mx-auto">
          <div className="flex flex-col md:flex-row items-center gap-8">
            <div className="flex-shrink-0">
              <div className="w-40 h-40 rounded-full border-4 border-[#2c5f7f] bg-[#e8f4f8] flex items-center justify-center">
                <svg
                  className="w-20 h-20 text-[#2c5f7f]"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M18 2H6C4.9 2 4 2.9 4 4v4c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zM6 8V4h12v4H6zm5 4H9v10h2V12z" />
                </svg>
              </div>
            </div>

            <div className="flex-1 text-center md:text-left">
              <p className="text-lg md:text-xl text-gray-700 italic leading-relaxed mb-6">
                "{testimonials[currentIndex].quote}"
              </p>

              <p className="text-[#2c5f7f] font-bold text-lg">
                {testimonials[currentIndex].author}{" "}
                <span className="font-normal">
                  ({testimonials[currentIndex].service})
                </span>
              </p>
            </div>
          </div>

          <button
            onClick={previousTestimonial}
            className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white border-2 border-[#2c5f7f] text-[#2c5f7f] hover:bg-[#2c5f7f] hover:text-white transition-colors flex items-center justify-center"
            aria-label="Previous testimonial"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>

          <button
            onClick={nextTestimonial}
            className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white border-2 border-[#2c5f7f] text-[#2c5f7f] hover:bg-[#2c5f7f] hover:text-white transition-colors flex items-center justify-center"
            aria-label="Next testimonial"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        </div>

        <div className="flex justify-center gap-3 mt-8">
          {testimonials.map((_, index) => (
            <button
              key={index}
              onClick={() => goToTestimonial(index)}
              className={`w-3 h-3 rounded-full border-2 border-[#2c5f7f] transition-all ${
                index === currentIndex
                  ? "bg-[#2c5f7f] scale-110"
                  : "bg-transparent hover:bg-[#2c5f7f]/30"
              }`}
              aria-label={`Go to testimonial ${index + 1}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}