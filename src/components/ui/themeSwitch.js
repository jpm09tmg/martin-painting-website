// src/components/ui/ThemeSwitch.js
"use client";

import { useTheme } from "@/src/app/providers/ThemeProvider"; // adjust alias if needed

export default function ThemeSwitch({ className = "" }) {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === "dark";

  return (
    <button
      type="button"
      role="switch"
      aria-checked={isDark}
      aria-label={`Switch to ${isDark ? "light" : "dark"} mode`}
      onClick={toggleTheme}
      className={`relative inline-flex h-8 w-14 items-center rounded-full border border-border-muted transition-colors
        ${isDark ? "bg-background-dark" : "bg-background-dark"}
        ${className}`}
    >
      {/* Thumb with icon */}
      <span
        className={`relative inline-flex h-6 w-6 items-center justify-center rounded-full bg-primary text-text shadow transform transition-transform
          ${isDark ? "translate-x-6" : "translate-x-1"}`}
      >
        {/* Sun icon */}
        <div
          className={`absolute h-5 w-5  transition-opacity
            ${isDark ? "opacity-0" : "opacity-100"}`}
        >
          <span className="text-white text-sm font-bold">
            <svg
              viewBox="-2.4 -2.4 28.80 28.80"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              stroke="#ffffff"
            >
              <g id="SVGRepo_bgCarrier" stroke-width="0"></g>
              <g
                id="SVGRepo_tracerCarrier"
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke="#ffffff"
                stroke-width="2.352"
              >
                {" "}
                <circle cx="12" cy="12" r="4" fill="#ffffff"></circle>{" "}
                <path
                  d="M12 5V3"
                  stroke="#ffffff"
                  stroke-width="1.7759999999999998"
                  stroke-linecap="round"
                ></path>{" "}
                <path
                  d="M12 21V19"
                  stroke="#ffffff"
                  stroke-width="1.7759999999999998"
                  stroke-linecap="round"
                ></path>{" "}
                <path
                  d="M16.9498 7.04996L18.364 5.63574"
                  stroke="#ffffff"
                  stroke-width="1.7759999999999998"
                  stroke-linecap="round"
                ></path>{" "}
                <path
                  d="M5.63608 18.3644L7.05029 16.9502"
                  stroke="#ffffff"
                  stroke-width="1.7759999999999998"
                  stroke-linecap="round"
                ></path>{" "}
                <path
                  d="M19 12L21 12"
                  stroke="#ffffff"
                  stroke-width="1.7759999999999998"
                  stroke-linecap="round"
                ></path>{" "}
                <path
                  d="M3 12L5 12"
                  stroke="#ffffff"
                  stroke-width="1.7759999999999998"
                  stroke-linecap="round"
                ></path>{" "}
                <path
                  d="M16.9498 16.95L18.364 18.3643"
                  stroke="#ffffff"
                  stroke-width="1.7759999999999998"
                  stroke-linecap="round"
                ></path>{" "}
                <path
                  d="M5.63608 5.63559L7.05029 7.0498"
                  stroke="#ffffff"
                  stroke-width="1.7759999999999998"
                  stroke-linecap="round"
                ></path>{" "}
              </g>
              <g id="SVGRepo_iconCarrier">
                {" "}
                <circle cx="12" cy="12" r="4" fill="#ffffff"></circle>{" "}
                <path
                  d="M12 5V3"
                  stroke="#ffffff"
                  stroke-width="1.9200000000000004"
                  stroke-linecap="round"
                ></path>{" "}
                <path
                  d="M12 21V19"
                  stroke="#ffffff"
                  stroke-width="1.9200000000000004"
                  stroke-linecap="round"
                ></path>{" "}
                <path
                  d="M16.9498 7.04996L18.364 5.63574"
                  stroke="#ffffff"
                  stroke-width="1.9200000000000004"
                  stroke-linecap="round"
                ></path>{" "}
                <path
                  d="M5.63608 18.3644L7.05029 16.9502"
                  stroke="#ffffff"
                  stroke-width="1.9200000000000004"
                  stroke-linecap="round"
                ></path>{" "}
                <path
                  d="M19 12L21 12"
                  stroke="#ffffff"
                  stroke-width="1.9200000000000004"
                  stroke-linecap="round"
                ></path>{" "}
                <path
                  d="M3 12L5 12"
                  stroke="#ffffff"
                  stroke-width="1.9200000000000004"
                  stroke-linecap="round"
                ></path>{" "}
                <path
                  d="M16.9498 16.95L18.364 18.3643"
                  stroke="#ffffff"
                  stroke-width="1.9200000000000004"
                  stroke-linecap="round"
                ></path>{" "}
                <path
                  d="M5.63608 5.63559L7.05029 7.0498"
                  stroke="#ffffff"
                  stroke-width="1.9200000000000004"
                  stroke-linecap="round"
                ></path>{" "}
              </g>
            </svg>
          </span>
        </div>

        {/* Moon icon */}
        <div
          className={`absolute h-4 w-4  transition-opacity
            ${isDark ? "opacity-100" : "opacity-0"}`}
        >
          <span className="text-white text-sm font-bold">
            <svg
              fill="#ffffff"
              viewBox="-2.4 -2.4 28.80 28.80"
              xmlns="http://www.w3.org/2000/svg"
              id="moon-alt"
              class="icon glyph"
              stroke="#ffffff"
              transform="rotate(0)matrix(-1, 0, 0, 1, 0, 0)"
              stroke-width="0.00024000000000000003"
            >
              <g id="SVGRepo_bgCarrier" stroke-width="0"></g>
              <g
                id="SVGRepo_tracerCarrier"
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke="#28c4e9"
                stroke-width="0.192"
              ></g>
              <g id="SVGRepo_iconCarrier">
                <path d="M12,2h-.46a1,1,0,0,0-.9.77,1,1,0,0,0,.46,1.09A5.92,5.92,0,0,1,14,9,6,6,0,0,1,3.93,13.4a1,1,0,0,0-1.65,1A10,10,0,1,0,12,2Z"></path>
              </g>
            </svg>
          </span>
        </div>
      </span>
    </button>
  );
}
