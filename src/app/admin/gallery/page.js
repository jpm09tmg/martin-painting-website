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

  return (
    (data || [])
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
      })
  );
}

export default function GalleryManagementPage() {
  // State Management
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");

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
    <div className="flex flex-col min-h-screen bg-white">
      <div className="flex-1 p-8 bg-gray-50">
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
              <h1 className="text-3xl font-bold text-gray-900">
                Gallery Management
              </h1>
              <p className="text-gray-600">
                Manage gallery images for the public website
              </p>
            </div>

            {/* Upload Button - will be functional in next commit */}
            <button
              disabled
              className="bg-gray-400 text-white px-6 py-3 rounded-lg font-medium inline-flex items-center shadow-lg cursor-not-allowed"
            >
              <Upload className="w-5 h-5 mr-2" />
              Upload Images
            </button>
          </div>

          {/* Statistics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
            {/* Total Images */}
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <ImageIcon className="w-6 h-6 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-2xl font-bold text-gray-900">
                    {totalImages}
                  </p>
                  <p className="text-gray-600">Total Images</p>
                </div>
              </div>
            </div>

            {/* Residential Images */}
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <ImageIcon className="w-6 h-6 text-purple-600" />
                </div>
                <div className="ml-4">
                  <p className="text-2xl font-bold text-gray-900">
                    {residentialImages}
                  </p>
                  <p className="text-gray-600">Residential</p>
                </div>
              </div>
            </div>

            {/* Commercial Images */}
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="p-2 bg-indigo-100 rounded-lg">
                  <ImageIcon className="w-6 h-6 text-indigo-600" />
                </div>
                <div className="ml-4">
                  <p className="text-2xl font-bold text-gray-900">
                    {commercialImages}
                  </p>
                  <p className="text-gray-600">Commercial</p>
                </div>
              </div>
            </div>

            {/* Recent Uploads */}
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="p-2 bg-green-100 rounded-lg">
                  <Upload className="w-6 h-6 text-green-600" />
                </div>
                <div className="ml-4">
                  <p className="text-2xl font-bold text-gray-900">
                    {recentImages}
                  </p>
                  <p className="text-gray-600">Last 7 Days</p>
                </div>
              </div>
            </div>
          </div>

          {/* Search and Filter Bar */}
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <div className="flex flex-col md:flex-row gap-4">
              {/* Search Input */}
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search images by filename..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#74A744] focus:border-transparent"
                />
              </div>

              {/* Category Filter */}
              <div className="flex items-center gap-2">
                <Filter className="w-5 h-5 text-gray-400" />
                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#74A744] focus:border-transparent"
                >
                  <option value="all">All Categories</option>
                  <option value="residential">Residential</option>
                  <option value="commercial">Commercial</option>
                  <option value="interior">Interior</option>
                  <option value="exterior">Exterior</option>
                </select>
              </div>
            </div>
            <p className="text-sm text-gray-600 mt-2">
              Showing {filteredImages.length} of {totalImages} images
            </p>
          </div>
        </div>

        {/* Loading State */}
        {loading ? (
          <div className="text-center py-12">
            <p className="text-gray-500">Loading gallery images...</p>
          </div>
        ) : (
          <>
            {/* Images Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredImages.map((image) => (
                <div
                  key={image.path}
                  className="bg-white rounded-lg shadow-lg border hover:shadow-xl transition-shadow"
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
                    <h3 className="text-sm font-semibold text-gray-900 mb-2 truncate">
                      {image.name}
                    </h3>

                    {/* Upload Date */}
                    <p className="text-xs text-gray-500 mb-3">
                      {new Date(image.created_at).toLocaleDateString()}
                    </p>

                    {/* Delete Button - will be functional in next commit */}
                    <button
                      disabled
                      className="w-full px-3 py-2 bg-gray-200 text-gray-400 text-sm rounded-lg cursor-not-allowed inline-flex items-center justify-center"
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
    </div>
  );
}
