"use client";

import { useState } from "react";
import { MapPin, Phone, Mail, Facebook, Instagram, CheckCircle, XCircle } from "lucide-react";
import Header from "@/src/components/layout/Header";
import Footer from "@/src/components/layout/Footer";

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: ""
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState(null); // 'success' or 'error'
  const [statusMessage, setStatusMessage] = useState("");

  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [id]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus(null);
    setStatusMessage("");

    try {
      const response = await fetch('/api/send-contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (result.success) {
        setSubmitStatus('success');
        setStatusMessage('Thank you for your message! We\'ll get back to you soon.');
        
        // this clears the form
        setFormData({
          name: "",
          email: "",
          subject: "",
          message: ""
        });

        // this clears success message after 5 seconds
        setTimeout(() => {
          setSubmitStatus(null);
          setStatusMessage("");
        }, 5000);
      } else {
        throw new Error(result.error || 'Failed to send message');
      }
    } catch (error) {
      console.error('Error submitting form:', error);
      setSubmitStatus('error');
      setStatusMessage(error.message || 'Failed to send message. Please try again.');
      
      // this clears error message after 5 seconds
      setTimeout(() => {
        setSubmitStatus(null);
        setStatusMessage("");
      }, 5000);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full min-h-screen bg-white">
      <Header currentPage="contact" />

      {/* Hero Section */}
      <div className="bg-background-dark py-16">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h1 className="text-4xl font-bold text-text mb-4">Contact Us</h1>
          <p className="text-xl text-text-muted max-w-3xl mx-auto">
            Get in touch with our team. We're here to help you with any
            questions or inquiries you may have.
          </p>
        </div>
      </div>

      {/* Contact Content */}
      <div className="py-16 bg-background-dark">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Left Column - Contact Information */}
            <div className="space-y-8">
              {/* Business Info */}
              <div className="bg-background rounded-lg shadow-lg p-8">
                <h2 className="text-2xl font-bold text-text mb-6">
                  YYC Landscapers
                </h2>

                <div className="space-y-4">
                  <div className="flex items-start space-x-3">
                    <MapPin className="w-5 h-5 text-primary mt-1 flex-shrink-0" />
                    <div>
                      <p className="text-text font-medium">Calgary, Alberta</p>
                      <p className="text-text-muted">Canada</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    <Phone className="w-5 h-5 text-primary flex-shrink-0" />
                    <p className="text-text">+1 (403) 555-PAINT</p>
                  </div>

                  <div className="flex items-center space-x-3">
                    <Mail className="w-5 h-5 text-primary flex-shrink-0" />
                    <p className="text-text">info@martinpainting.ca</p>
                  </div>
                </div>
              </div>


              {/* Follow Us */}
              <div className="bg-background rounded-lg shadow-lg p-8">
                <h2 className="text-2xl font-bold text-text mb-6">Follow Us</h2>

                <div className="flex space-x-4">
                  <a
                    href="#"
                    className="w-12 h-12 bg-primary rounded-full flex items-center justify-center text-white hover:bg-secondary transition-colors"
                  >
                    <span className="text-white text-sm">
                      <svg
                        width="24"
                        height="24"
                        viewBox="0 0 18 18"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M17.4375 8.71875C17.4375 3.90234 13.5352 0 8.71875 0C3.90234 0 0 3.90234 0 8.71875C0 13.0704 3.18832 16.6774 7.35645 17.332V11.2391H5.1416V8.71875H7.35645V6.79781C7.35645 4.61285 8.65723 3.40594 10.6495 3.40594C11.6037 3.40594 12.6014 3.57609 12.6014 3.57609V5.72062H11.5017C10.4189 5.72062 10.0811 6.39281 10.0811 7.08223V8.71875H12.4991L12.1124 11.2391H10.0811V17.332C14.2492 16.6774 17.4375 13.0704 17.4375 8.71875Z"
                          fill="white"
                        />
                      </svg>
                    </span>
                  </a>
                  <a
                    href="#"
                    className="w-12 h-12 bg-primary rounded-full flex items-center justify-center text-white hover:bg-secondary transition-colors"
                  >
                    <span className="text-white text-sm">
                      <svg
                        width="24"
                        height="24"
                        viewBox="0 0 16 16"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M7.87847 3.83818C5.64253 3.83818 3.83901 5.6417 3.83901 7.87764C3.83901 10.1136 5.64253 11.9171 7.87847 11.9171C10.1144 11.9171 11.9179 10.1136 11.9179 7.87764C11.9179 5.6417 10.1144 3.83818 7.87847 3.83818ZM7.87847 10.5038C6.43355 10.5038 5.25229 9.32607 5.25229 7.87764C5.25229 6.4292 6.43003 5.25146 7.87847 5.25146C9.3269 5.25146 10.5046 6.4292 10.5046 7.87764C10.5046 9.32607 9.32339 10.5038 7.87847 10.5038ZM13.0253 3.67295C13.0253 4.19678 12.6035 4.61514 12.0832 4.61514C11.5593 4.61514 11.141 4.19326 11.141 3.67295C11.141 3.15264 11.5628 2.73076 12.0832 2.73076C12.6035 2.73076 13.0253 3.15264 13.0253 3.67295ZM15.7007 4.6292C15.641 3.36709 15.3527 2.24912 14.4281 1.32803C13.507 0.406933 12.389 0.118652 11.1269 0.0553711C9.82612 -0.018457 5.9273 -0.018457 4.62651 0.0553711C3.36792 0.115137 2.24995 0.403418 1.32534 1.32451C0.400733 2.24561 0.115967 3.36357 0.0526855 4.62568C-0.0211426 5.92646 -0.0211426 9.82529 0.0526855 11.1261C0.112451 12.3882 0.400733 13.5062 1.32534 14.4272C2.24995 15.3483 3.3644 15.6366 4.62651 15.6999C5.9273 15.7737 9.82612 15.7737 11.1269 15.6999C12.389 15.6401 13.507 15.3519 14.4281 14.4272C15.3492 13.5062 15.6375 12.3882 15.7007 11.1261C15.7746 9.82529 15.7746 5.92998 15.7007 4.6292ZM14.0203 12.5218C13.746 13.2108 13.2152 13.7417 12.5226 14.0194C11.4855 14.4308 9.02456 14.3358 7.87847 14.3358C6.73237 14.3358 4.26792 14.4272 3.23433 14.0194C2.54526 13.7452 2.0144 13.2144 1.73667 12.5218C1.32534 11.4847 1.42026 9.02373 1.42026 7.87764C1.42026 6.73154 1.32886 4.26709 1.73667 3.2335C2.01089 2.54443 2.54175 2.01357 3.23433 1.73584C4.27144 1.32451 6.73237 1.41943 7.87847 1.41943C9.02456 1.41943 11.489 1.32803 12.5226 1.73584C13.2117 2.01006 13.7425 2.54092 14.0203 3.2335C14.4316 4.27061 14.3367 6.73154 14.3367 7.87764C14.3367 9.02373 14.4316 11.4882 14.0203 12.5218Z"
                          fill="white"
                        />
                      </svg>
                    </span>
                  </a>
                </div>
              </div>
            </div>

            {/* Right Column - Contact Form */}
            <div className="bg-background rounded-lg shadow-lg p-8">
              <h2 className="text-2xl font-bold text-text mb-6">
                Send us a message
              </h2>

              {/* Status Messages */}
              {submitStatus && (
                <div className={`mb-6 p-4 rounded-lg flex items-start gap-3 ${
                  submitStatus === 'success' 
                    ? 'bg-green-50 text-green-800 border border-green-200' 
                    : 'bg-red-50 text-red-800 border border-red-200'
                }`}>
                  {submitStatus === 'success' ? (
                    <CheckCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                  ) : (
                    <XCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                  )}
                  <p className="text-sm">{statusMessage}</p>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label
                    htmlFor="name"
                    className="block text-sm font-medium text-text mb-2"
                  >
                    Name *
                  </label>
                  <input
                    type="text"
                    id="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Your name"
                    required
                    className="w-full bg-background-light px-4 py-3 border border-border text-text rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                </div>

                <div>
                  <label
                    htmlFor="email"
                    className="block text-sm font-medium text-text mb-2"
                  >
                    Email *
                  </label>
                  <input
                    type="email"
                    id="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="your@email.com"
                    required
                    className="w-full bg-background-light px-4 py-3 border border-border text-text rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                </div>

                <div>
                  <label
                    htmlFor="subject"
                    className="block text-sm font-medium text-text mb-2"
                  >
                    Subject *
                  </label>
                  <input
                    type="text"
                    id="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    placeholder="Message subject"
                    required
                    className="w-full bg-background-light px-4 py-3 border border-border text-text rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                </div>

                <div>
                  <label
                    htmlFor="message"
                    className="block text-sm font-medium text-text mb-2"
                  >
                    Message *
                  </label>
                  <textarea
                    id="message"
                    value={formData.message}
                    onChange={handleChange}
                    placeholder="Your message..."
                    required
                    rows={6}
                    className="w-full bg-background-light px-4 py-3 border border-border text-text rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full bg-primary text-white py-3 px-6 rounded-lg font-medium hover:bg-secondary transition-colors"
                >
                  {isSubmitting ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                      Sending...
                    </>
                  ) : (
                    'Send Message'
                  )}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}