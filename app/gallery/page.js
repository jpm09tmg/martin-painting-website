/**
 * Dev Notes – Gallery Page
 * -----------------------
 * - Make pagination functional instead of just static buttons.
 * - Add lightbox / image carousel when clicking a project card.
 * - Replace hardcoded project data with DB/API call.
 * - Store images in cloud storage (S3, etc.) instead of /public for scaling.
 * - Consider multiple-tag filtering (e.g. Interior + Residential).
 * - Add loading states or skeletons for better UX when fetching.
 * - Improve accessibility (keyboard nav, aria labels).
 */

"use client";

import { useState, useEffect, useMemo } from "react";
import Image from "next/image";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { supabase } from "@/lib/supabase-client"; // Supabase integration

// folder mapping for filtering through supabase gallery bucket
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

const PAGE_SIZE = 12;

//  list all files in a folder and return {name, path, url, created_at, tags}
async function listFolder(folder) {
  const { data, error } = await supabase.storage.from("gallery").list(folder, {
    limit: 1000, //fetch up to 1000 images per folder
    sortBy: { column: "created_at", order: "desc" },
  });
  if (error) throw error;

  // get tags from folder path
  // e.g. 'residential/interior' -> ['residential','interior']
  // or 'commercial/exterior' -> ['commercial','exterior']
  const parts = folder.split("/"); // ['interior','residential']
  const tags = parts; // ['interior','residential']

  return (
    (data || [])
      // Storage returns folders and files; files have "id"
      .filter((item) => item.id)
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
          tags, // ['interior','residential'] etc.
          alt: item.name.replace(/[-_]/g, " "), // fallback alt
        };
      })
  );
}

export default function Gallery() {
  //const [images, setImages] = useState([]);

  //sets default filter to 'all'
  const [activeFilter, setActiveFilter] = useState("all");
  const [items, setItems] = useState([]); // all fetched items for current filter
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState(null);
  const [page, setPage] = useState(1); //default to page 1

  // fetch when filter changes
  useEffect(() => {
    let cancelled = false;
    async function run() {
      setLoading(true);
      setErr(null);
      setPage(1); // reset to first page on filter change
      try {
        const folders = FOLDERS[activeFilter] ?? FOLDERS.all;
        const results = await Promise.all(folders.map((f) => listFolder(f)));
        const merged = results.flat();

        // Sort newest first (fallback if created_at is missing)
        merged.sort((a, b) => {
          const ad = a.created_at ? new Date(a.created_at).getTime() : 0;
          const bd = b.created_at ? new Date(b.created_at).getTime() : 0;
          return bd - ad;
        });

        if (!cancelled) setItems(merged);
      } catch (e) {
        if (!cancelled) setErr(e.message || "Failed to load gallery");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    run();
    return () => {
      cancelled = true;
    };
  }, [activeFilter]);

  // client-side pagination
  const totalPages = useMemo(
    () => Math.max(1, Math.ceil(items.length / PAGE_SIZE)),
    [items.length]
  );
  const pageItems = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;
    return items.slice(start, start + PAGE_SIZE);
  }, [items, page]);

  // filtering button categories
  const filters = ["all", "interior", "exterior", "commercial", "residential"];

  //image data hardcoded version
  //   const projects = [
  //     {
  //       id: 1,
  //       category: ["exterior", "residential"],
  //       image: "/blueExt.jpg",
  //       alt: "Blue Exterior",
  //     },
  //     {
  //       id: 2,
  //       category: ["interior", "residential"],
  //       image: "/blueLiving.jpg",
  //       alt: "Blue Living Room",
  //     },
  //     {
  //       id: 3,
  //       category: ["interior", "commercial"],
  //       image: "/blueOffice.jpg",
  //       alt: "Blue Office",
  //     },
  //     {
  //       id: 4,
  //       category: ["exterior", "residential"],
  //       image: "/deckstain.jpg",
  //       alt: "Deck Stain",
  //     },
  //     {
  //       id: 5,
  //       category: ["interior", "residential"],
  //       image: "/greenBed.jpg",
  //       alt: "Green Bedroom",
  //     },
  //     {
  //       id: 6,
  //       category: ["interior", "residential"],
  //       image: "/greyBath.jpg",
  //       alt: "Grey Bathroom",
  //     },
  //     {
  //       id: 7,
  //       category: ["interior", "commercial"],
  //       image: "/greyCom.jpg",
  //       alt: "Grey Commercial Hallway",
  //     },
  //     {
  //       id: 8,
  //       category: ["interior", "commercial"],
  //       image: "/greyLiving.jpg",
  //       alt: "Grey Living Room",
  //     },
  //     {
  //       id: 9,
  //       category: ["interior", "commercial"],
  //       image: "/greyShop.jpg",
  //       alt: "Grey Shop",
  //     },
  //     {
  //       id: 10,
  //       category: ["exterior", "residential"],
  //       image: "/redExt.jpg",
  //       alt: "Red Exterior",
  //     },
  //     {
  //       id: 11,
  //       category: ["interior", "residential"],
  //       image: "/whiteBath.jpg",
  //       alt: "White Bathroom",
  //     },
  //     {
  //       id: 12,
  //       category: ["interior", "residential"],
  //       image: "/whiteKitchen.jpg",
  //       alt: "White Kitchen",
  //     },
  //     {
  //       id: 13,
  //       category: ["interior", "residential"],
  //       image: "/whiteLiving.jpg",
  //       alt: "White Living Room",
  //     },
  //     {
  //       id: 14,
  //       category: ["interior", "commercial"],
  //       image: "/whiteOffice.jpg",
  //       alt: "White Office",
  //     },
  //     {
  //       id: 15,
  //       category: ["exterior", "residential"],
  //       image: "/whiteRedExt.jpg",
  //       alt: "White and Red Exterior",
  //     },
  //   ];

  // Sets filtering based on category by navigating the category buttons at top of gallery
  //   const filteredProjects =
  //     activeFilter === "all"
  //       ? projects
  //       : projects.filter((project) => project.category.includes(activeFilter)); // changed to accommodate change from single tag to array of tags

  // Note: Consider adding a file that determines website color scheme and company theme to allow easy switching of color palette
  return (
    <div className="w-full min-h-screen flex flex-col bg-white">
      <Header currentPage="gallery" />

      {/* Hero Section */}
      <div className="bg-[#F1F4E8] py-16">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Painting Project Gallery
          </h1>
          <p className="text-xl text-gray-700 max-w-3xl mx-auto">
            Explore some of our completed painting projects. From interior walls
            to full home exteriors and commercial spaces, we bring color and
            quality craftsmanship to every job.
          </p>
        </div>
      </div>

      {/* Filter Buttons */}
      <div className="py-8 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex justify-center space-x-4">
            {["all", "interior", "exterior", "commercial", "residential"].map(
              (cat) => (
                <button
                  key={cat} // switched filter buttons to loop instead of hardcoding each button for better rendering
                  onClick={() => setActiveFilter(cat)}
                  className={`px-6 py-3 rounded-lg font-medium transition-colors ${
                    activeFilter === cat
                      ? "bg-[#5F9136] text-white"
                      : "bg-white text-gray-700 border border-[#5F9136] hover:bg-[#5F9136] hover:text-white"
                  }`}
                >
                  {cat.charAt(0).toUpperCase() + cat.slice(1)}{" "}
                  {/* Capitalizes first letter of each filter button */}
                </button>
              )
            )}
          </div>
        </div>
      </div>

      {/* Same grid from landscaping site; add image carousel on click */}
      {/* Project Grid */}
      <div className="py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[...Array(6)].map((_, i) => (
                <div
                  key={i}
                  className="rounded-lg border shadow-sm p-4 animate-pulse"
                >
                  <div className="w-full h-64 bg-gray-200 rounded-md" />
                  <div className="mt-3 h-4 bg-gray-200 rounded w-1/2" />
                </div>
              ))}
            </div>
          ) : err ? (
            <div className="text-center text-red-600">{err}</div>
          ) : items.length === 0 ? (
            <div className="text-center text-gray-600">
              No images yet. Add some in Supabase Storage.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {pageItems.map((project) => (
                <div key={project.path} className="group cursor-pointer">
                  <div className="relative overflow-hidden rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300">
                    <Image
                      src={`${project.url}?width=1200&quality=80`} // simple built-in transform
                      alt={project.alt}
                      width={400}
                      height={300}
                      className="w-full h-64 object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300" />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Pagination */}
      {!loading && items.length > 0 && (
        <div className="py-8 bg-white border-t border-gray-200">
          <div className="max-w-7xl mx-auto px-4">
            <div className="flex justify-center items-center space-x-4">
              <button
                className="text-gray-600 hover:text-[#5F9136] disabled:opacity-50"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
              >
                Prev
              </button>

              <div className="flex items-center space-x-2">
                <span className="w-10 h-10 bg-[#5F9136] text-white rounded-full flex items-center justify-center">
                  {page}
                </span>
                <span className="text-gray-700">/ {totalPages}</span>
              </div>

              <button
                className="text-gray-600 hover:text-[#5F9136] disabled:opacity-50"
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
              >
                Next
              </button>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}
