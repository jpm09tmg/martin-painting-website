"use client";
import { btnPrimary } from "@/src/components/ui/buttons";

import { useState } from "react";
import { Star, X, MessageSquare } from "lucide-react";
import { supabase } from "@/src/lib/db/supabase-client";

export default function ReviewForm() {
  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const [hoveredRating, setHoveredRating] = useState(0);

  const [formData, setFormData] = useState({
    author_name: "",
    service_type: "",
    quote: "",
    rating: 5,
  });

  const serviceOptions = [
    "Interior Painting",
    "Exterior Painting",
    "Residential Painting",
    "Commercial Painting",
    "Cabinet Painting",
    "Deck Staining",
    "Other",
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const setRating = (rating) => {
    setFormData({ ...formData, rating: rating });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setMessage("");

    try {
      const { error } = await supabase.from("testimonials").insert({
        author_name: formData.author_name.trim(),
        service_type: formData.service_type,
        quote: formData.quote.trim(),
        rating: formData.rating,
        status: "pending",
      });

      if (error) throw error;

      setMessage(
        "Thank you for your review! We'll review it and post it shortly."
      );
      setFormData({ author_name: "", service_type: "", quote: "", rating: 5 });

      setTimeout(() => {
        setShowModal(false);
        setMessage("");
      }, 3000);
    } catch (err) {
      setMessage(`Error: ${err.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  const closeModal = () => {
    setShowModal(false);
    setMessage("");
    setFormData({ author_name: "", service_type: "", quote: "", rating: 5 });
  };

  return (
    <>
      <section className="w-full bg-background-dark py-24">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-text mb-4">
            Share Your Experience
          </h2>
          <p className="text-text-muted text-lg mb-6">
            We&apos;d love to hear about your experience with Martin Painting!
          </p>
          <button
            onClick={() => setShowModal(true)}
            className="bg-background-light text-text px-8 py-4 rounded-lg font-semibold text-lg hover:bg-text transition-colors inline-flex items-center gap-2 shadow-lg"
          >
            <MessageSquare className="w-6 h-6" />
            Leave a Review
          </button>
        </div>
      </section>

      {showModal && (
        <div className="fixed inset-0 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-gray-200">
            <div className="p-6 border-b flex justify-between items-center bg-[#74A744]">
              <h2 className="text-2xl font-bold text-white">
                Share Your Experience
              </h2>
              <button
                onClick={closeModal}
                className="text-white hover:text-gray-200"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Your Name *
                </label>
                <input
                  type="text"
                  name="author_name"
                  value={formData.author_name}
                  onChange={handleChange}
                  placeholder="John Smith"
                  required
                  maxLength={100}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#74A744] text-gray-900"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  What service did you use? *
                </label>
                <select
                  name="service_type"
                  value={formData.service_type}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#74A744] text-gray-900"
                >
                  <option value="">Select a service...</option>
                  {serviceOptions.map((service) => (
                    <option key={service} value={service}>
                      {service}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  How would you rate our work? *
                </label>
                <div className="flex items-center gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      onMouseEnter={() => setHoveredRating(star)}
                      onMouseLeave={() => setHoveredRating(0)}
                      className="focus:outline-none transition-transform hover:scale-110"
                    >
                      <Star
                        className={`w-10 h-10 ${
                          star <= (hoveredRating || formData.rating)
                            ? "text-yellow-400 fill-current"
                            : "text-gray-300"
                        }`}
                      />
                    </button>
                  ))}
                  <span className="ml-3 text-lg font-semibold text-gray-700">
                    {formData.rating} / 5 Stars
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tell us about your experience *
                </label>
                <textarea
                  name="quote"
                  value={formData.quote}
                  onChange={handleChange}
                  rows="6"
                  required
                  maxLength={1000}
                  placeholder="Share details about your experience..."
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#74A744] text-gray-900 resize-none"
                />
                <p className="text-xs text-gray-500 mt-1">
                  {formData.quote.length} / 1000 characters
                </p>
              </div>

              {message && (
                <div
                  className={`p-4 rounded-lg ${
                    message.includes("Error")
                      ? "bg-red-50 text-red-800"
                      : "bg-green-50 text-green-800"
                  }`}
                >
                  <p>{message}</p>
                </div>
              )}

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={closeModal}
                  className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 px-6 py-3 bg-[#74A744] text-white rounded-lg hover:bg-[#5F9136] disabled:opacity-50"
                >
                  {submitting ? "Submitting..." : "Submit Review"}
                </button>
              </div>

              <p className="text-xs text-gray-500 text-center">
                Your review will be reviewed by our team before being posted.
              </p>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
