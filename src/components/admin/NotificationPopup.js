"use client";

import { useState, useEffect } from "react";
import { X, Star, MessageSquare } from "lucide-react";

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
      {/* Backdrop overlay */}
      <div
        className="fixed inset-0 bg-black/50 z-[999] transition-opacity duration-300"
        onClick={handleClose}
      />

      {/* Notification popup */}
      <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-[1000] w-full max-w-md px-4">
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden animate-scale-in">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-6 relative">
            <button
              onClick={handleClose}
              className="absolute top-4 right-4 text-white/80 hover:text-white transition-colors"
              aria-label="Close notification"
            >
              <X className="w-6 h-6" />
            </button>

            <div className="flex items-center space-x-3">
              <div className="bg-white/20 p-3 rounded-full">
                <MessageSquare className="w-8 h-8 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">
                  New Review{newReviews.length > 1 ? "s" : ""}!
                </h2>
                <p className="text-blue-100 text-sm">
                  {newReviews.length} {newReviews.length === 1 ? "review" : "reviews"} awaiting your attention
                </p>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="p-6">
            <div className="space-y-4 max-h-64 overflow-y-auto">
              {newReviews.slice(0, 3).map((review, index) => (
                <div
                  key={review.id || index}
                  className="bg-gray-50 rounded-lg p-4 border border-gray-200"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <p className="font-semibold text-gray-900">
                        {review.client_name || "Anonymous"}
                      </p>
                      <p className="text-xs text-gray-500">
                        {review.created_at
                          ? new Date(review.created_at).toLocaleDateString()
                          : "Recently"}
                      </p>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                      <span className="text-sm font-semibold text-gray-700">
                        {review.rating || 5}
                      </span>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 line-clamp-2">
                    {review.review_text || review.comment || "No comment provided"}
                  </p>
                </div>
              ))}

              {newReviews.length > 3 && (
                <p className="text-center text-sm text-gray-500 pt-2">
                  + {newReviews.length - 3} more review{newReviews.length - 3 > 1 ? "s" : ""}
                </p>
              )}
            </div>

            {/* Action buttons */}
            <div className="flex space-x-3 mt-6">
              <button
                onClick={handleViewReviews}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center space-x-2"
              >
                <MessageSquare className="w-5 h-5" />
                <span>View All Reviews</span>
              </button>
              <button
                onClick={handleClose}
                className="px-6 py-3 bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold rounded-lg transition-colors duration-200"
              >
                Later
              </button>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes scale-in {
          from {
            transform: scale(0.9);
            opacity: 0;
          }
          to {
            transform: scale(1);
            opacity: 1;
          }
        }

        .animate-scale-in {
          animation: scale-in 0.3s ease-out;
        }
      `}</style>
    </>
  );
}
