"use client";

import { useState, useEffect } from "react";
import { X, MessageSquare } from "lucide-react";

/**
 * NotificationPopup Component
 *
 * Displays a popup notification when there are new reviews in the system.
 * Shows on admin dashboard login/load to alert about pending reviews.
 */
export default function NotificationPopup({ newReviews = [], onClose, onViewReviews }) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Show popup if there are new reviews
    if (newReviews.length > 0) {
      setIsVisible(true);
    }
  }, [newReviews]);

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(() => {
      if (onClose) onClose();
    }, 300); // Wait for animation to complete
  };

  const handleViewReviews = () => {
    if (onViewReviews) onViewReviews();
    handleClose();
  };

  if (!isVisible || newReviews.length === 0) return null;

  return (
    <>
      {/* Notification popup - slides in from right */}
      <div className="fixed top-20 right-4 z-[1000] w-full max-w-sm animate-slide-in">
        <div className="bg-background-dark rounded-xl shadow-2xl overflow-hidden border-2 border-primary/50">
          {/* Header */}
          <div className="bg-background-dark border-b border-primary/30 p-4 relative">
            <button
              onClick={handleClose}
              className="absolute top-3 right-3 text-text-muted hover:text-text transition-colors"
              aria-label="Close notification"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center space-x-3 pr-8">
              <div className="bg-primary/20 p-2 rounded-full">
                <MessageSquare className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-text">
                  New Reviews Pending
                </h2>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="p-4 bg-background-dark">
            {/* Action buttons */}
            <div className="flex flex-col space-y-2">
              <button
                onClick={handleViewReviews}
                className="w-full bg-primary hover:bg-primary/80 text-background-dark font-semibold py-2.5 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center space-x-2"
              >
                <MessageSquare className="w-4 h-4" />
                <span>See Reviews</span>
              </button>
              <button
                onClick={handleClose}
                className="w-full py-2.5 px-4 bg-background-light hover:bg-background text-text-muted font-semibold rounded-lg transition-colors duration-200 border border-border"
              >
                Later
              </button>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes slide-in {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }

        .animate-slide-in {
          animation: slide-in 0.4s ease-out;
        }
      `}</style>
    </>
  );
}
