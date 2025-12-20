"use client";

import { CSSProperties } from "react";

interface SantaHatProps {
  size?: number;
  className?: string;
  style?: CSSProperties;
}

export default function SantaHat({ size = 40, className = "", style = {} }: SantaHatProps) {
  return (
    <div
      className={`santa-hat ${className}`}
      style={{
        position: "absolute",
        top: -size * 0.6,
        right: -size * 0.3,
        width: size,
        height: size,
        zIndex: 10,
        animation: "santa-hat-wiggle 2s ease-in-out infinite",
        ...style,
      }}
    >
      <svg
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{ width: "100%", height: "100%", filter: "drop-shadow(2px 2px 4px rgba(0,0,0,0.2))" }}
      >
        {/* Main red hat body */}
        <path
          d="M20 60 Q30 20, 50 15 Q70 20, 80 60 L70 65 Q50 30, 30 65 Z"
          fill="#DC2626"
          stroke="#B91C1C"
          strokeWidth="1"
        />

        {/* Hat trim (white fur) */}
        <ellipse cx="50" cy="65" rx="32" ry="6" fill="#FFFFFF" />
        <ellipse cx="50" cy="64" rx="32" ry="5" fill="#F3F4F6" />

        {/* Pom-pom at top */}
        <circle cx="50" cy="12" r="8" fill="#FFFFFF" />
        <circle cx="50" cy="12" r="7" fill="#F9FAFB" />
        <circle cx="48" cy="10" r="2" fill="#E5E7EB" opacity="0.6" />
        <circle cx="53" cy="13" r="1.5" fill="#E5E7EB" opacity="0.6" />

        {/* Highlight on hat */}
        <path
          d="M35 35 Q40 25, 45 30 Q42 35, 37 40 Z"
          fill="#EF4444"
          opacity="0.6"
        />
      </svg>

      <style>{`
        @keyframes santa-hat-wiggle {
          0%, 100% {
            transform: rotate(-5deg);
          }
          50% {
            transform: rotate(5deg);
          }
        }
      `}</style>
    </div>
  );
}
