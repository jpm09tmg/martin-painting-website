// src/components/ui/buttons.js
// Reusable button and link styles
export const btnPrimary =
  "inline-flex items-center justify-center rounded-md px-8 py-4 font-semibold text-white bg-primary " +
  "transition-all duration-200 motion-reduce:transition-none " +
  "hover:bg-primary/70 hover:d-shadow hover:-translate-y-0.5 " +
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#74A744]/60 focus-visible:ring-offset-2";
export const btnOutline =
  "inline-flex items-center justify-center rounded-md px-8 py-3 font-semibold text-text border border-border " +
  "transition-all duration-200 motion-reduce:transition-none " +
  "hover:bg-border hover:text-white hover:d-shadow hover:-translate-y-0.5 " +
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#74A744]/60 focus-visible:ring-offset-2";

export const textLink =
  "inline-flex items-center gap-1 font-medium text-[#171717] " +
  "underline decoration-transparent underline-offset-4 transition-[text-decoration-color,transform] duration-200 " +
  "hover:decoration-[#171717] hover:translate-x-0.5 " +
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#74A744]/60 focus-visible:ring-offset-2 rounded";
