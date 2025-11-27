"use client";

import { useState, useEffect } from "react";
import { supabase } from "../lib/db/supabase-client";
import { Star, CheckCircle, Trash2, Clock, Eye, EyeOff, RefreshCw, TrendingUp, Award } from "lucide-react";

export default function AdminDashboard() {
  // State management: stores all reviews, loading status, messages, and current filter
  const [allReviews, setAllReviews] = useState([]); // Store ALL reviews
  const [reviews, setReviews] = useState([]); // Store filtered reviews
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [filter, setFilter] = useState("pending");

  // Automatically reload reviews whenever the filter changes
  useEffect(() => {
    loadReviews();
  }, []);

  // Filter reviews when filter changes
  useEffect(() => {
    if (filter === "all") {
      setReviews(allReviews);
    } else {
      setReviews(allReviews.filter((r) => r.status === filter));
    }
  }, [filter, allReviews]);

  // Fetch reviews from database
  const loadReviews = async () => {
    setLoading(true);
    try {
      // Get ALL reviews, sorted by newest first
      const { data, error } = await supabase
        .from("testimonials")
        .select("*")
        .order("submitted_at", { ascending: false });

      if (error) throw error;

      setAllReviews(data || []);
    } catch (err) {
      setMessage(`Error loading reviews: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };
      
  // Approve a review: change status to "approved" and mark it live on website
  const approveReview = async (id) => {
    try {
      const { error } = await supabase
        .from("testimonials")
        .update({ status: "approved", approved_at: new Date().toISOString() })
        .eq("id", id);
      if (error) throw error;
      
      // Show success message and refresh the list
      setMessage("Review approved and posted!");
      loadReviews();
      setTimeout(() => setMessage(""), 3000);
    } catch (err) {
      setMessage(`Error: ${err.message}`);
    }
  };

  // Remove a review: hide from website but keep in database
  const removeReview = async (id) => {
    if (!confirm("Remove this review from website?")) return;
    try {
      const { error } = await supabase
        .from("testimonials")
        .update({ status: "removed" })
        .eq("id", id);
      if (error) throw error;
      
      setMessage("Review removed from website.");
      loadReviews();
      setTimeout(() => setMessage(""), 3000);
    } catch (err) {
      setMessage(`Error: ${err.message}`);
    }
  };

  // Permanently delete a review from database (cannot be undone)
  const deleteReview = async (id) => {
    if (!confirm("Permanently delete? Cannot be undone!")) return;
    try {
      const { error } = await supabase.from("testimonials").delete().eq("id", id);
      if (error) throw error;
      
      setMessage("Review deleted permanently.");
      loadReviews();
      setTimeout(() => setMessage(""), 3000);
    } catch (err) {
      setMessage(`Error: ${err.message}`);
    }
  };

  // Returns a colored badge component based on review status
  const getStatusBadge = (status) => {
    switch (status) {
      case "pending":
        return (
          <span className="px-3 py-1 bg-yellow-100 text-yellow-800 text-xs font-medium rounded-full flex items-center gap-1">
            <Clock className="w-3 h-3" />
            Pending
          </span>
        );
      case "approved":
        return (
          <span className="px-3 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full flex items-center gap-1">
            <Eye className="w-3 h-3" />
            Live
          </span>
        );
      case "removed":
        return (
          <span className="px-3 py-1 bg-gray-100 text-gray-800 text-xs font-medium rounded-full flex items-center gap-1">
            <EyeOff className="w-3 h-3" />
            Removed
          </span>
        );
      default:
        return null;
    }
  };

  // Calculate average rating from ALL reviews
  const averageRating = allReviews.length > 0
    ? (allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length).toFixed(1)
    : 0;

  // Show loading spinner while fetching data
  if (loading)
    return (
      <div className="p-6 bg-gradient-to-br from-gray-50 to-gray-100 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-gray-300 border-t-blue-600 mb-4"></div>
          <p className="text-gray-600 font-medium">Loading reviews...</p>
        </div>
      </div>
    );

  return (
    <div className="p-6 bg-gradient-to-br from-gray-50 to-gray-100 min-h-screen">
      {/* Page header with refresh button */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Customer Reviews Dashboard</h1>
            <p className="text-gray-600">Manage and moderate customer testimonials</p>
          </div>
          <button
            onClick={loadReviews}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-md hover:shadow-lg"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh
          </button>
        </div>
      </div>

      {/* Statistics cards: shows counts for pending, approved, and removed reviews */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        {/* Pending reviews card */}
        <div className="bg-gradient-to-br from-yellow-50 to-white p-6 rounded-xl shadow-md border border-yellow-200 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-yellow-800 mb-1">Pending Review</p>
              <p className="text-3xl font-bold text-yellow-900">
                {allReviews.filter((r) => r.status === "pending").length}
              </p>
            </div>
            <div className="p-3 bg-yellow-200 rounded-full">
              <Clock className="w-7 h-7 text-yellow-700" />
            </div>
          </div>
        </div>

        {/* Approved reviews card */}
        <div className="bg-gradient-to-br from-green-50 to-white p-6 rounded-xl shadow-md border border-green-200 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-green-800 mb-1">Live on Site</p>
              <p className="text-3xl font-bold text-green-900">
                {allReviews.filter((r) => r.status === "approved").length}
              </p>
            </div>
            <div className="p-3 bg-green-200 rounded-full">
              <Eye className="w-7 h-7 text-green-700" />
            </div>
          </div>
        </div>

        {/* Removed reviews card */}
        <div className="bg-gradient-to-br from-gray-50 to-white p-6 rounded-xl shadow-md border border-gray-200 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-800 mb-1">Removed</p>
              <p className="text-3xl font-bold text-gray-900">
                {allReviews.filter((r) => r.status === "removed").length}
              </p>
            </div>
            <div className="p-3 bg-gray-200 rounded-full">
              <EyeOff className="w-7 h-7 text-gray-700" />
            </div>
          </div>
        </div>

        {/* Average rating card */}
        <div className="bg-gradient-to-br from-purple-50 to-white p-6 rounded-xl shadow-md border border-purple-200 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-purple-800 mb-1">Avg Rating</p>
              <div className="flex items-center gap-2">
                <p className="text-3xl font-bold text-purple-900">{averageRating}</p>
                <Star className="w-6 h-6 text-yellow-400 fill-current" />
              </div>
            </div>
            <div className="p-3 bg-purple-200 rounded-full">
              <Award className="w-7 h-7 text-purple-700" />
            </div>
          </div>
        </div>
      </div>

      {/* Filter buttons: allows switching between pending, approved, removed, and all reviews */}
      <div className="bg-white p-5 rounded-xl shadow-md border mb-6">
        <div className="flex items-center gap-3 mb-3">
          <TrendingUp className="w-5 h-5 text-gray-600" />
          <h2 className="text-lg font-semibold text-gray-900">Filter Reviews</h2>
        </div>
        <div className="flex flex-wrap gap-3">
          <button
            onClick={() => setFilter("pending")}
            className={`px-5 py-2.5 rounded-lg font-medium transition-all duration-200 ${
              filter === "pending"
                ? "bg-yellow-500 text-white shadow-lg scale-105"
                : "bg-yellow-50 text-yellow-700 hover:bg-yellow-100 border border-yellow-200"
            }`}
          >
            <span className="flex items-center gap-2">
              <Clock className="w-4 h-4" />
              Pending ({allReviews.filter((r) => r.status === "pending").length})
            </span>
          </button>
          <button
            onClick={() => setFilter("approved")}
            className={`px-5 py-2.5 rounded-lg font-medium transition-all duration-200 ${
              filter === "approved"
                ? "bg-green-500 text-white shadow-lg scale-105"
                : "bg-green-50 text-green-700 hover:bg-green-100 border border-green-200"
            }`}
          >
            <span className="flex items-center gap-2">
              <Eye className="w-4 h-4" />
              Approved ({allReviews.filter((r) => r.status === "approved").length})
            </span>
          </button>
          <button
            onClick={() => setFilter("removed")}
            className={`px-5 py-2.5 rounded-lg font-medium transition-all duration-200 ${
              filter === "removed"
                ? "bg-gray-500 text-white shadow-lg scale-105"
                : "bg-gray-50 text-gray-700 hover:bg-gray-100 border border-gray-200"
            }`}
          >
            <span className="flex items-center gap-2">
              <EyeOff className="w-4 h-4" />
              Removed ({allReviews.filter((r) => r.status === "removed").length})
            </span>
          </button>
          <button
            onClick={() => setFilter("all")}
            className={`px-5 py-2.5 rounded-lg font-medium transition-all duration-200 ${
              filter === "all"
                ? "bg-blue-500 text-white shadow-lg scale-105"
                : "bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200"
            }`}
          >
            <span className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4" />
              All ({allReviews.length})
            </span>
          </button>
        </div>
      </div>

      {/* Success/error message alert (shows for 3 seconds) */}
      {message && (
        <div
          className={`mb-6 p-4 rounded-xl shadow-lg border animate-pulse ${
            message.includes("Error")
              ? "bg-red-50 text-red-800 border-red-200"
              : "bg-green-50 text-green-800 border-green-200"
          }`}
        >
          <div className="flex items-center gap-2">
            {message.includes("Error") ? (
              <Trash2 className="w-5 h-5" />
            ) : (
              <CheckCircle className="w-5 h-5" />
            )}
            <p className="font-medium">{message}</p>
          </div>
        </div>
      )}

      {/* Reviews list: displays all reviews or "no reviews found" message */}
      <div className="bg-white rounded-xl shadow-md border overflow-hidden">
        {reviews.length === 0 ? (
          <div className="p-12 text-center">
            <div className="inline-block p-4 bg-gray-100 rounded-full mb-4">
              <Star className="w-12 h-12 text-gray-400" />
            </div>
            <p className="text-gray-500 text-lg font-medium">No reviews found</p>
            <p className="text-gray-400 text-sm mt-2">Reviews will appear here once submitted</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {/* Loop through each review and display as a card */}
            {reviews.map((review, index) => (
              <div
                key={review.id}
                className="p-6 hover:bg-gradient-to-r hover:from-gray-50 hover:to-transparent transition-all duration-200"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <div className="flex justify-between items-start gap-6">
                  {/* Review content: name, service type, rating, quote, and date */}
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3 flex-wrap">
                      <div className="flex items-center gap-2">
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold">
                          {review.author_name.charAt(0).toUpperCase()}
                        </div>
                        <h3 className="font-bold text-gray-900 text-lg">
                          {review.author_name}
                        </h3>
                      </div>
                      <span className="px-3 py-1 text-xs font-medium bg-blue-100 text-blue-700 rounded-full">
                        {review.service_type}
                      </span>
                      {getStatusBadge(review.status)}
                    </div>

                    {/* Star rating display */}
                    <div className="flex items-center mb-3">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`w-5 h-5 transition-all ${
                            i < review.rating
                              ? "text-yellow-400 fill-current"
                              : "text-gray-300"
                          }`}
                        />
                      ))}
                      <span className="ml-2 text-sm font-semibold text-gray-700 bg-gray-100 px-2 py-1 rounded">
                        {review.rating}/5
                      </span>
                    </div>

                    <div className="bg-gray-50 border-l-4 border-blue-500 p-4 rounded-r-lg mb-3">
                      <p className="text-gray-800 italic leading-relaxed">"{review.quote}"</p>
                    </div>

                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <Clock className="w-3 h-3" />
                      Submitted: {new Date(review.submitted_at).toLocaleString()}
                    </div>
                  </div>

                  {/* Action buttons: change based on review status */}
                  <div className="flex flex-col gap-2 min-w-[140px]">
                    {/* Pending: show Approve and Delete buttons */}
                    {review.status === "pending" && (
                      <>
                        <button
                          onClick={() => approveReview(review.id)}
                          className="px-4 py-2.5 bg-gradient-to-r from-green-600 to-green-500 text-white rounded-lg hover:from-green-700 hover:to-green-600 flex items-center justify-center gap-2 whitespace-nowrap font-medium shadow-md hover:shadow-lg transition-all transform hover:scale-105"
                        >
                          <CheckCircle className="w-4 h-4" />
                          Approve
                        </button>
                        <button
                          onClick={() => deleteReview(review.id)}
                          className="px-4 py-2.5 bg-gradient-to-r from-red-600 to-red-500 text-white rounded-lg hover:from-red-700 hover:to-red-600 flex items-center justify-center gap-2 font-medium shadow-md hover:shadow-lg transition-all transform hover:scale-105"
                        >
                          <Trash2 className="w-4 h-4" />
                          Delete
                        </button>
                      </>
                    )}

                    {/* Approved: show Remove and Delete buttons */}
                    {review.status === "approved" && (
                      <>
                        <button
                          onClick={() => removeReview(review.id)}
                          className="px-4 py-2.5 bg-gradient-to-r from-gray-600 to-gray-500 text-white rounded-lg hover:from-gray-700 hover:to-gray-600 flex items-center justify-center gap-2 whitespace-nowrap font-medium shadow-md hover:shadow-lg transition-all transform hover:scale-105"
                        >
                          <EyeOff className="w-4 h-4" />
                          Remove
                        </button>
                        <button
                          onClick={() => deleteReview(review.id)}
                          className="px-4 py-2.5 bg-gradient-to-r from-red-600 to-red-500 text-white rounded-lg hover:from-red-700 hover:to-red-600 flex items-center justify-center gap-2 font-medium shadow-md hover:shadow-lg transition-all transform hover:scale-105"
                        >
                          <Trash2 className="w-4 h-4" />
                          Delete
                        </button>
                      </>
                    )}

                    {/* Removed: show Re-approve and Delete buttons */}
                    {review.status === "removed" && (
                      <>
                        <button
                          onClick={() => approveReview(review.id)}
                          className="px-4 py-2.5 bg-gradient-to-r from-green-600 to-green-500 text-white rounded-lg hover:from-green-700 hover:to-green-600 flex items-center justify-center gap-2 whitespace-nowrap font-medium shadow-md hover:shadow-lg transition-all transform hover:scale-105"
                        >
                          <CheckCircle className="w-4 h-4" />
                          Re-approve
                        </button>
                        <button
                          onClick={() => deleteReview(review.id)}
                          className="px-4 py-2.5 bg-gradient-to-r from-red-600 to-red-500 text-white rounded-lg hover:from-red-700 hover:to-red-600 flex items-center justify-center gap-2 font-medium shadow-md hover:shadow-lg transition-all transform hover:scale-105"
                        >
                          <Trash2 className="w-4 h-4" />
                          Delete
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}