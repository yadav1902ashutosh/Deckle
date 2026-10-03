import React from "react";

export default function DeckleLogo({ className = "h-8 w-auto text-accent", ...props }) {
  return (
    <svg
      viewBox="0 0 40 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label="Deckle Logo"
      {...props}
    >
      {/* Outer Glow / Soft Tint */}
      <rect
        x="2"
        y="2"
        width="36"
        height="36"
        rx="8"
        fill="currentColor"
        fillOpacity="0.08"
      />

      {/* Left Deckled Page */}
      <path
        d="M19 11C14.5 9.5 8.5 10 5 12V28C8.5 26 14.5 25.5 19 27V11Z"
        fill="currentColor"
        fillOpacity="0.18"
      />
      <path
        d="M19 11C14.5 9.5 8.5 10 5 12V28C8.5 26 14.5 25.5 19 27V11Z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Right Deckled Page */}
      <path
        d="M21 11C25.5 9.5 31.5 10 35 12V28C31.5 26 25.5 25.5 21 27V11Z"
        fill="currentColor"
        fillOpacity="0.28"
      />
      <path
        d="M21 11C25.5 9.5 31.5 10 35 12V28C31.5 26 25.5 25.5 21 27V11Z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Deckle Edge Feathers (Left Page) */}
      <path
        d="M5 15.5L7 16M5 19.5L7.5 20M5 23.5L7 24"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinecap="round"
        strokeOpacity="0.7"
      />

      {/* Deckle Edge Feathers (Right Page) */}
      <path
        d="M35 15.5L33 16M35 19.5L32.5 20M35 23.5L33 24"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinecap="round"
        strokeOpacity="0.7"
      />

      {/* Center Spine Accent */}
      <line
        x1="20"
        y1="10"
        x2="20"
        y2="28"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <circle cx="20" cy="28.5" r="1.5" fill="currentColor" />
    </svg>
  );
}
