"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import {
  Upload,
  Trash2,
  Search,
  Filter,
  X,
  AlertCircle,
  Image as ImageIcon,
} from "lucide-react";
import { supabase } from "../../../lib/db/supabase-client";

// Folder structure mapping for categories
const CATEGORY_FOLDERS = {
  "Residential Interior": "residential/interior",
  "Residential Exterior": "residential/exterior",
  "Commercial Interior": "commercial/interior",
  "Commercial Exterior": "commercial/exterior",
};

const FOLDERS = {
  all: [
    "residential/interior",
    "residential/exterior",
    "commercial/interior",
    "commercial/exterior",
  ],
  residential: ["residential/interior", "residential/exterior"],
  commercial: ["commercial/interior", "commercial/exterior"],
  interior: ["residential/interior", "commercial/interior"],
  exterior: ["residential/exterior", "commercial/exterior"],
};

// List all files in a folder and return metadata
async function listFolder(folder) {
  const { data, error } = await supabase.storage.from("gallery").list(folder, {
    limit: 1000,
    sortBy: { column: "created_at", order: "desc" },
  });
  if (error) throw error;

  const parts = folder.split("/");
  const tags = parts;

  return (data || [])
    .filter((item) => item.id) // Filter out folders, keep files only
    .map((item) => {
      const fullPath = `${folder}/${item.name}`;
      const { data: pub } = supabase.storage
        .from("gallery")
        .getPublicUrl(fullPath);
      return {
        id: item.id,
        name: item.name,
        path: fullPath,
        url: pub.publicUrl,
        created_at: item.created_at,
        tags,
        folder,
      };
    });
}

export default function GalleryManagementPage() {
  // State Management
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadFiles, setUploadFiles] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [uploading, setUploading] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [imageToDelete, setImageToDelete] = useState(null);

  // Load images on component mount
  useEffect(() => {
    loadImages();
  }, []);

  // Load all images from Supabase Storage
  const loadImages = async () => {
    try {
      setLoading(true);
      const folders = FOLDERS.all;
      const results = await Promise.all(folders.map((f) => listFolder(f)));
      const merged = results.flat();

      // Sort by creation date (newest first)
      merged.sort((a, b) => {
        const ad = a.created_at ? new Date(a.created_at).getTime() : 0;
        const bd = b.created_at ? new Date(b.created_at).getTime() : 0;
        return bd - ad;
      });

      setImages(merged);
    } catch (err) {
      console.error("Error loading images:", err);
      setMessage(`Error loading images: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Filter images based on search and category
  const filteredImages = images.filter((image) => {
    const matchesSearch = image.name
      .toLowerCase()
      .includes(searchTerm.toLowerCase());

    let matchesCategory = true;
    if (categoryFilter !== "all") {
      const folders = FOLDERS[categoryFilter];
      matchesCategory = folders.includes(image.folder);
    }

    return matchesSearch && matchesCategory;
  });

  // Statistics
  const totalImages = images.length;
  const residentialImages = images.filter((img) =>
    img.folder.startsWith("residential")
  ).length;
  const commercialImages = images.filter((img) =>
    img.folder.startsWith("commercial")
  ).length;
  const recentImages = images.filter((img) => {
    const date = new Date(img.created_at);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays <= 7;
  }).length;

  // Handle file selection
  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files || []);
    setUploadFiles(files);
  };

  // Handle image upload
  const handleUpload = async () => {
    if (!selectedCategory) {
      setMessage("Error: Please select a category");
      return;
    }

    if (uploadFiles.length === 0) {
      setMessage("Error: Please select at least one image");
      return;
    }

    setUploading(true);
    setMessage("");

    try {
      const folder = CATEGORY_FOLDERS[selectedCategory];
      let successCount = 0;
      let errorCount = 0;

      for (const file of uploadFiles) {
        if (!file.type.startsWith("image/")) {
          errorCount++;
          continue;
        }

        if (file.size > 5 * 1024 * 1024) {
          errorCount++;
          continue;
        }

        const sanitizedName = file.name
          .replace(/[^a-zA-Z0-9.-]/g, "_")
          .toLowerCase();

        try {
          const { error } = await supabase.storage
            .from("gallery")
            .upload(`${folder}/${sanitizedName}`, file, {
              cacheControl: "3600",
              upsert: false,
            });

          if (error) {
            if (error.message.includes("already exists")) {
              const timestamp = Date.now();
              const nameParts = sanitizedName.split(".");
              const ext = nameParts.pop();
              const baseName = nameParts.join(".");
              const newName = `${baseName}_${timestamp}.${ext}`;

              const { error: retryError } = await supabase.storage
                .from("gallery")
                .upload(`${folder}/${newName}`, file, {
                  cacheControl: "3600",
                  upsert: false,
                });

              if (retryError) throw retryError;
            } else {
              throw error;
            }
          }

          successCount++;
        } catch (uploadError) {
          console.error(`Error uploading ${file.name}:`, uploadError);
          errorCount++;
        }
      }

      if (successCount > 0) {
        setMessage(
          `Successfully uploaded ${successCount} image${
            successCount > 1 ? "s" : ""
          }${errorCount > 0 ? `. ${errorCount} failed.` : ""}`
        );
        await loadImages();
        setShowUploadModal(false);
        setUploadFiles([]);
        setSelectedCategory("");
      } else {
        setMessage(`Error: All ${errorCount} uploads failed`);
      }

      setTimeout(() => setMessage(""), 5000);
    } catch (err) {
      console.error("Upload error:", err);
      setMessage(`Error uploading images: ${err.message}`);
    } finally {
      setUploading(false);
    }
  };

  // Handle image deletion
  const handleDelete = async () => {
    if (!imageToDelete) return;

    try {
      const { error } = await supabase.storage
        .from("gallery")
        .remove([imageToDelete.path]);

      if (error) throw error;

      setMessage("Image deleted successfully!");
      setImages(images.filter((img) => img.path !== imageToDelete.path));
      setShowDeleteConfirm(false);
      setImageToDelete(null);

      setTimeout(() => setMessage(""), 3000);
    } catch (err) {
      console.error("Error deleting image:", err);
      setMessage(`Error deleting image: ${err.message}`);
    }
  };

  // Confirm delete
  const confirmDelete = (image) => {
    setImageToDelete(image);
    setShowDeleteConfirm(true);
  };

  // Get category badge colors
  const getCategoryColor = (folder) => {
    if (folder.includes("residential")) {
      return "bg-blue-100 text-blue-800";
    } else if (folder.includes("commercial")) {
      return "bg-purple-100 text-purple-800";
    }
    return "bg-gray-100 text-gray-800";
  };

  const getLocationColor = (folder) => {
    if (folder.includes("interior")) {
      return "bg-green-100 text-green-800";
    } else if (folder.includes("exterior")) {
      return "bg-orange-100 text-orange-800";
    }
    return "bg-gray-100 text-gray-800";
  };

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <div className="flex-1 p-8 bg-background">
        {/* Success/Error Message Banner */}
        {message && (
          <div
            className={`mb-4 p-4 rounded-lg ${
              message.includes("Error")
                ? "bg-red-100 text-red-800"
                : "bg-green-100 text-green-800"
            }`}
          >
            {message}
          </div>
        )}

        {/* Page Header */}
        <div className="mb-8">
          <div className="mb-6 flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold text-text">
                Gallery Management
              </h1>
              <p className="text-text-muted">
                Manage gallery images for the public website
              </p>
            </div>

            {/* Upload Button */}
            <button
              onClick={() => setShowUploadModal(true)}
              className="bg-primary text-white px-6 py-3 rounded-lg hover:bg-primary/70 font-medium inline-flex items-center shadow-lg transition-colors"
            >
              <Upload className="w-5 h-5 mr-2" />
              Upload Images
            </button>
          </div>

          {/* Statistics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
            {/* Total Images */}
            <div className="bg-background-light rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <ImageIcon className="w-6 h-6 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-2xl font-bold text-text">{totalImages}</p>
                  <p className="text-text-muted">Total Images</p>
                </div>
              </div>
            </div>

            {/* Residential Images */}
            <div className="bg-background-light rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <ImageIcon className="w-6 h-6 text-purple-600" />
                </div>
                <div className="ml-4">
                  <p className="text-2xl font-bold text-text">
                    {residentialImages}
                  </p>
                  <p className="text-text-muted">Residential</p>
                </div>
              </div>
            </div>

            {/* Commercial Images */}
            <div className="bg-background-light rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="p-2 bg-indigo-100 rounded-lg">
                  <ImageIcon className="w-6 h-6 text-indigo-600" />
                </div>
                <div className="ml-4">
                  <p className="text-2xl font-bold text-text">
                    {commercialImages}
                  </p>
                  <p className="text-text-muted">Commercial</p>
                </div>
              </div>
            </div>

            {/* Recent Uploads */}
            <div className="bg-background-light rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="p-2 bg-green-100 rounded-lg">
                  <Upload className="w-6 h-6 text-green-600" />
                </div>
                <div className="ml-4">
                  <p className="text-2xl font-bold text-text">{recentImages}</p>
                  <p className="text-text-muted">Last 7 Days</p>
                </div>
              </div>
            </div>
          </div>

          {/* Search and Filter Bar */}
          <div className="bg-background-light rounded-lg shadow p-6 mb-6">
            <div className="flex flex-col md:flex-row gap-4">
              {/* Search Input */}
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-text-muted w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search images by filename..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 text-text border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>

              {/* Category Filter */}
              <div className="flex items-center gap-2">
                <Filter className="w-5 h-5 text-text-muted" />
                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className="text-text bg-background-light border border-border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary focus:border-border"
                >
                  <option value="all">All Categories</option>
                  <option value="residential">Residential</option>
                  <option value="commercial">Commercial</option>
                  <option value="interior">Interior</option>
                  <option value="exterior">Exterior</option>
                </select>
              </div>
            </div>
            <p className="text-sm text-text-muted mt-2">
              Showing {filteredImages.length} of {totalImages} images
            </p>
          </div>
        </div>

        {/* Loading State */}
        {loading ? (
          <div className="text-center py-12">
            <p className="text-text-muted">Loading gallery images...</p>
          </div>
        ) : (
          <>
            {/* Images Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredImages.map((image) => (
                <div
                  key={image.path}
                  className="bg-background-light rounded-lg shadow-lg border hover:shadow-xl transition-shadow"
                >
                  {/* Image Preview */}
                  <div className="relative h-48 overflow-hidden rounded-t-lg">
                    <Image
                      src={`${image.url}?width=400&quality=80`}
                      alt={image.name}
                      fill
                      className="object-cover"
                    />
                  </div>

                  {/* Image Details */}
                  <div className="p-4">
                    {/* Category Badges */}
                    <div className="flex gap-2 mb-3">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(
                          image.folder
                        )}`}
                      >
                        {image.folder.split("/")[0]}
                      </span>
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${getLocationColor(
                          image.folder
                        )}`}
                      >
                        {image.folder.split("/")[1]}
                      </span>
                    </div>

                    {/* File Name */}
                    <h3 className="text-sm font-semibold text-text mb-2 truncate">
                      {image.name}
                    </h3>

                    {/* Upload Date */}
                    <p className="text-xs text-text-muted mb-3">
                      {new Date(image.created_at).toLocaleDateString()}
                    </p>

                    {/* Delete Button */}
                    <button
                      onClick={() => confirmDelete(image)}
                      className="w-full px-3 py-2 bg-danger text-red-700 text-sm rounded-lg hover:bg-red-200 transition-colors inline-flex items-center justify-center"
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Empty State */}
            {images.length === 0 && (
              <div className="bg-white rounded-lg shadow p-12 text-center">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <ImageIcon className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No images yet
                </h3>
                <p className="text-gray-500 mb-6">
                  Get started by uploading your first gallery image
                </p>
              </div>
            )}

            {/* No Search Results */}
            {filteredImages.length === 0 && images.length > 0 && (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Search className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No images found
                </h3>
                <p className="text-gray-500">
                  Try adjusting your search or filter criteria
                </p>
              </div>
            )}
          </>
        )}
      </div>

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-gray-200">
            <div className="p-6 border-b flex justify-between items-center">
              <h2 className="text-xl font-semibold text-gray-900">
                Upload Images
              </h2>
              <button
                onClick={() => {
                  setShowUploadModal(false);
                  setUploadFiles([]);
                  setSelectedCategory("");
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Category *
                </label>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#74A744] focus:border-transparent"
                >
                  <option value="">Select a category...</option>
                  {Object.keys(CATEGORY_FOLDERS).map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Select Images *
                </label>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleFileSelect}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#74A744] focus:border-transparent"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Max 5MB per file. Supported formats: JPG, PNG, WebP, GIF
                </p>
              </div>

              {uploadFiles.length > 0 && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Selected Files ({uploadFiles.length})
                  </label>
                  <div className="max-h-40 overflow-y-auto border border-gray-200 rounded-lg p-3 space-y-1">
                    {uploadFiles.map((file, index) => (
                      <div
                        key={index}
                        className="text-sm text-gray-600 flex justify-between"
                      >
                        <span className="truncate">{file.name}</span>
                        <span className="text-gray-400 ml-2">
                          {(file.size / 1024 / 1024).toFixed(2)} MB
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowUploadModal(false);
                    setUploadFiles([]);
                    setSelectedCategory("");
                  }}
                  disabled={uploading}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleUpload}
                  disabled={
                    uploading || !selectedCategory || uploadFiles.length === 0
                  }
                  className="flex-1 px-4 py-2 bg-[#74A744] text-white rounded-lg hover:bg-[#5F9136] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {uploading ? "Uploading..." : "Upload"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && imageToDelete && (
        <div className="fixed inset-0 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full shadow-2xl border border-gray-200">
            <div className="p-6">
              <div className="flex items-center justify-center w-12 h-12 bg-red-100 rounded-full mx-auto mb-4">
                <AlertCircle className="w-6 h-6 text-red-600" />
              </div>

              <h3 className="text-lg font-semibold text-gray-900 text-center mb-2">
                Delete Image
              </h3>
              <p className="text-gray-600 text-center mb-6">
                Are you sure you want to delete{" "}
                <strong>{imageToDelete.name}</strong>? This action cannot be
                undone.
              </p>

              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowDeleteConfirm(false);
                    setImageToDelete(null);
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDelete}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
