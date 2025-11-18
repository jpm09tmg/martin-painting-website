"use client";

import { useState, useEffect } from "react";
import { supabase } from "../lib/db/supabase-client";
import { Star, CheckCircle, Trash2, Clock, Eye, EyeOff } from "lucide-react";

export default function AdminDashboard() {
  // State management: stores all reviews, loading status, messages, and current filter
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [filter, setFilter] = useState("pending");

  // Automatically reload reviews whenever the filter changes
  useEffect(() => {
    loadReviews();
  }, [filter]);

  // Fetch reviews from database based on current filter
  const loadReviews = async () => {
    setLoading(true);
    try {
      // Build query: get all reviews, sorted by newest first
      let query = supabase
        .from("testimonials")
        .select("*")
        .order("submitted_at", { ascending: false });
      
      // Apply filter if not showing "all" reviews
      if (filter !== "all") {
        query = query.eq("status", filter);
      }
      
      const { data, error } = await query;
      if (error) throw error;
      
      setReviews(data || []);
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
      const { error } = await supabase
        .from("testimonials")
        .delete()
        .eq("id", id);
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

  // Show loading spinner while fetching data
  if (loading)
    return (
      <div className="p-6 bg-gray-50 min-h-screen flex items-center justify-center">
        <p className="text-gray-600">Loading...</p>
      </div>
    );

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Page header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Customer Reviews</h1>
        <p className="text-gray-600">Manage customer reviews</p>
      </div>

      {/* Statistics cards: shows counts for pending, approved, and removed reviews */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        {/* Pending reviews card */}
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <Clock className="w-6 h-6 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-2xl font-bold text-gray-900">
                {reviews.filter((r) => r.status === "pending").length}
              </p>
              <p className="text-gray-600">Pending</p>
            </div>
          </div>
        </div>

        {/* Approved reviews card */}
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-2xl font-bold text-gray-900">
                {reviews.filter((r) => r.status === "approved").length}
              </p>
              <p className="text-gray-600">Approved</p>
            </div>
          </div>
        </div>

        {/* Removed reviews card */}
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center">
            <div className="p-2 bg-gray-100 rounded-lg">
              <EyeOff className="w-6 h-6 text-gray-600" />
            </div>
            <div className="ml-4">
              <p className="text-2xl font-bold text-gray-900">
                {reviews.filter((r) => r.status === "removed").length}
              </p>
              <p className="text-gray-600">Removed</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filter buttons: allows switching between pending, approved, removed, and all reviews */}
      <div className="bg-white p-4 rounded-lg shadow-sm border mb-6">
        <div className="flex gap-2">
          <button
            onClick={() => setFilter("pending")}
            className={`px-4 py-2 rounded-lg font-medium ${
              filter === "pending"
                ? "bg-yellow-100 text-yellow-800"
                : "bg-gray-100 text-gray-700"
            }`}
          >
            Pending ({reviews.filter((r) => r.status === "pending").length})
          </button>
          <button
            onClick={() => setFilter("approved")}
            className={`px-4 py-2 rounded-lg font-medium ${
              filter === "approved"
                ? "bg-green-100 text-green-800"
                : "bg-gray-100 text-gray-700"
            }`}
          >
            Approved ({reviews.filter((r) => r.status === "approved").length})
          </button>
          <button
            onClick={() => setFilter("removed")}
            className={`px-4 py-2 rounded-lg font-medium ${
              filter === "removed"
                ? "bg-gray-200 text-gray-800"
                : "bg-gray-100 text-gray-700"
            }`}
          >
            Removed ({reviews.filter((r) => r.status === "removed").length})
          </button>
          <button
            onClick={() => setFilter("all")}
            className={`px-4 py-2 rounded-lg font-medium ${
              filter === "all"
                ? "bg-blue-100 text-blue-800"
                : "bg-gray-100 text-gray-700"
            }`}
          >
            All ({reviews.length})
          </button>
        </div>
      </div>

      {/* Success/error message alert (shows for 3 seconds) */}
      {message && (
        <div
          className={`mb-6 p-4 rounded-lg ${
            message.includes("Error")
              ? "bg-red-50 text-red-800"
              : "bg-green-50 text-green-800"
          }`}
        >
          <p>{message}</p>
        </div>
      )}

      {/* Reviews list: displays all reviews or "no reviews found" message */}
      <div className="bg-white rounded-lg shadow-sm border">
        {reviews.length === 0 ? (
          <div className="p-8 text-center">
            <p className="text-gray-500">No reviews found</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {/* Loop through each review and display as a card */}
            {reviews.map((review) => (
              <div key={review.id} className="p-6 hover:bg-gray-50">
                <div className="flex justify-between items-start">
                  {/* Review content: name, service type, rating, quote, and date */}
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <h3 className="font-semibold text-gray-900 text-lg">
                        {review.author_name}
                      </h3>
                      <span className="text-sm text-gray-500">
                        ({review.service_type})
                      </span>
                      {getStatusBadge(review.status)}
                    </div>

                    {/* Star rating display */}
                    <div className="flex items-center mb-3">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`w-5 h-5 ${
                            i < review.rating
                              ? "text-yellow-400 fill-current"
                              : "text-gray-300"
                          }`}
                        />
                      ))}
                      <span className="ml-2 text-sm text-gray-600">
                        ({review.rating}/5)
                      </span>
                    </div>

                    <p className="text-gray-700 mb-3">"{review.quote}"</p>
                    <div className="text-xs text-gray-500">
                      Submitted:{" "}
                      {new Date(review.submitted_at).toLocaleString()}
                    </div>
                  </div>

                  {/* Action buttons: change based on review status */}
                  <div className="flex flex-col gap-2 ml-6">
                    {/* Pending: show Approve and Delete buttons */}
                    {review.status === "pending" && (
                      <>
                        <button
                          onClick={() => approveReview(review.id)}
                          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2 whitespace-nowrap"
                        >
                          <CheckCircle className="w-4 h-4" />
                          Approve
                        </button>
                        <button
                          onClick={() => deleteReview(review.id)}
                          className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 flex items-center gap-2"
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
                          className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 flex items-center gap-2 whitespace-nowrap"
                        >
                          <EyeOff className="w-4 h-4" />
                          Remove
                        </button>
                        <button
                          onClick={() => deleteReview(review.id)}
                          className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 flex items-center gap-2"
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
                          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2 whitespace-nowrap"
                        >
                          <CheckCircle className="w-4 h-4" />
                          Re-approve
                        </button>
                        <button
                          onClick={() => deleteReview(review.id)}
                          className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 flex items-center gap-2"
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
