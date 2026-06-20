import React from "react";

interface GreenPulseLogoProps {
  className?: string;
  size?: "sm" | "md" | "lg";
}

export default function GreenPulseLogo({ className = "", size = "md" }: GreenPulseLogoProps) {
  // Compute overall proportions based on requested size
  const dims = {
    sm: { width: 140, height: 60, scale: 0.5 },
    md: { width: 260, height: 110, scale: 0.95 },
    lg: { width: 440, height: 190, scale: 1.6 }
  }[size];

  return (
    <div className={`flex flex-col items-center justify-center select-none ${className}`} style={{ width: dims.width }}>
      <svg 
        viewBox="0 0 280 120" 
        fill="none" 
        xmlns="http://www.w3.org/2000/svg" 
        className="w-full h-auto drop-shadow-[0_2px_8px_rgba(16,185,129,0.12)]"
      >
        <defs>
          {/* Radial Gradient for Earth Sphere backglow */}
          <radialGradient id="earth-glow" cx="140" cy="40" r="28" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#059669" stopOpacity="1" />
            <stop offset="60%" stopColor="#047857" stopOpacity="1" />
            <stop offset="100%" stopColor="#064e3b" stopOpacity="1" />
          </radialGradient>

          {/* Radial Gradient for 3D Atmosphere highlight */}
          <radialGradient id="ocean-specular" cx="130" cy="30" r="26" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#6ee7b7" stopOpacity="0.45" />
            <stop offset="50%" stopColor="#34d399" stopOpacity="0.15" />
            <stop offset="100%" stopColor="#047857" stopOpacity="0" />
          </radialGradient>

          {/* Linear Gradient for Earth Leaf frame */}
          <linearGradient id="leaf-gradient" x1="140" y1="42" x2="195" y2="12" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#10b981" />
            <stop offset="50%" stopColor="#34d399" />
            <stop offset="100%" stopColor="#059669" />
          </linearGradient>

          {/* Bright Linear Accent for orbiting track */}
          <linearGradient id="orbit-gradient" x1="85" y1="20" x2="165" y2="45" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#a7f3d0" />
            <stop offset="100%" stopColor="#10b981" />
          </linearGradient>

          {/* Linear Gradient for the name "Green" */}
          <linearGradient id="text-green-grad" x1="30" y1="80" x2="160" y2="80" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#10b981" />
            <stop offset="100%" stopColor="#34d399" />
          </linearGradient>

          {/* Glowing Pulse Wave neon filter */}
          <filter id="neon-glow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="1.5" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* =================== THE GLOBE ICON AND ENVELOPE =================== */}
        
        {/* Glow behind the earth sphere */}
        <circle cx="140" cy="40" r="28" fill="url(#earth-glow)" />

        {/* Grid-style continents (modern digital layout) */}
        <g opacity="0.85">
          {/* North America */}
          <path d="M118 24C119.5 25.5 122 25 123 23C124 21 123 18.5 125 17.5C127 16.5 130 18.2 131 16C131.5 14.8 128.5 14.1 127.5 15C126.5 15.9 124 16 123 14C122.5 13 124 12 121 12.5C118 13 116 16.5 116 19.5C116 22.5 116.5 22.5 118 24Z" fill="#6ee7b7" opacity="0.8" />
          {/* South America */}
          <path d="M121 34C119.5 31.5 122 28.5 124.5 26.5C127 24.5 128 26.5 129.5 28C131 29.5 129 33 127 34.5C125 36 124.5 39 123 42.5C121.5 46 120 48.5 121 51C122 53.5 124 53 125.5 54C125.5 55 124 56.5 122.5 56.5C121 56.5 120 54 119.5 51C119 48 118 45.5 118 43C118 40.5 122.5 36.5 121 34Z" fill="#6ee7b7" opacity="0.8" />
          {/* Europe / Northern Africa */}
          <path d="M140 14C141 15 143 14 144 12C145 10 141.5 9 140 10.5C138.5 12 139 13 140 14Z" fill="#34d399" />
          <path d="M136 21C137 23.5 139 21.5 141.5 20C144 18.5 146 19 147.5 20.5C149 22 153.5 19 152 17.5C150.5 16 148 18 146 16.5C144 15 145 12 142.5 14.5C140 17 137.5 17 136 18.5C134.5 20 135 18.5 136 21Z" fill="#6ee7b7" opacity="0.8" />
          {/* Africa */}
          <path d="M136 25C137.5 24 142 21.5 145 22.5C148 23.5 150.5 21 153.5 24C156.5 27 155.5 30 157 32C158.5 34 157.5 36 154 35.5C150.5 35 148 38 147.5 41C147 44 144.5 46.5 143 45C141.5 43.5 141.5 40 140.5 37.5C139.5 35 137 34 136 31C135 28 134.5 26 136 25Z" fill="#34d399" />
          {/* Asia / Australia */}
          <path d="M152 12C154.5 12.5 158 11.5 159 13.5C160 15.5 158 17.5 161 18.5C164 19.5 164.5 17 166.5 19C168.5 21 164 24 162 21.5C160 19 157 21.5 155 19.5C153 17.5 151.5 16.5 150 14C148.5 11.5 149.5 11.5 152 12ZM163 32C161 33.5 159 31.5 159.5 29C160 26.5 161.5 24 163 25C164.5 26 165 29 165 30.5C165 32 165 30.5 163 32ZM166 43C165 42 163.5 44 164.5 45.5C165.5 47 167.5 46 166.5 44.5C165.5 43 167 44 166 43Z" fill="#6ee7b7" opacity="0.8" />
        </g>

        {/* Specular ocean 3D glass shine shading */}
        <circle cx="140" cy="40" r="28" fill="url(#ocean-specular)" />

        {/* The Orbiting Track surrounding the Earth */}
        <path 
          d="M106 48C94 38 94 22 108 15C118 10 135 9 148 11C161 13 175 18 181 26" 
          stroke="url(#orbit-gradient)" 
          strokeWidth="1.8" 
          strokeLinecap="round" 
        />

        {/* 3 Glowing Dots on the orbiting track left */}
        <circle cx="100" cy="30" r="2.8" fill="#a7f3d0" filter="url(#neon-glow)" />
        <circle cx="102" cy="38" r="2.8" fill="#34d399" filter="url(#neon-glow)" />
        <circle cx="107" cy="45" r="2.8" fill="#10b981" filter="url(#neon-glow)" />

        {/* Double Leaf Cradling the bottom right of the Globe */}
        <g opacity="0.95">
          {/* Main Leaf */}
          <path 
            d="M140 68C148 70 160 67 170 59C180 51 187 38 189 27C182 34 175 36 168 37C154 39 147 48 140 68Z" 
            fill="url(#leaf-gradient)" 
          />
          {/* Inside leaf vein lines */}
          <path 
            d="M141 66C151 55 163 46 179 36M156 52C160 48 165 46 172 44M147 60C152 56 156 55 161 54" 
            stroke="#064e3b" 
            strokeWidth="0.8" 
            strokeLinecap="round" 
            opacity="0.5" 
          />

          {/* Secondary smaller leaf */}
          <path 
            d="M174 53C174 46 179 40 187 36C191 33 195 30 197 26C197 32 194 38 190 42C185 47 180 50 174 53Z" 
            fill="#059669" 
          />
          <path 
            d="M176 50C181 44 186 40 193 34" 
            stroke="#022c22" 
            strokeWidth="0.6" 
            strokeLinecap="round" 
            opacity="0.4" 
          />
        </g>

        {/* =================== THE TEXT IDENTITY =================== */}
        
        {/* LOGO TITLE: "GreenPulse" */}
        <g id="logo-text-group">
          {/* Green - styled with an elegant custom font look */}
          <text 
            x="48" 
            y="88" 
            fill="url(#text-green-grad)" 
            fontSize="31" 
            fontFamily="system-ui, -apple-system, sans-serif" 
            fontWeight="800" 
            letterSpacing="-0.5"
          >
            Green
          </text>

          {/* Pulse - styled crisp */}
          <text 
            x="138" 
            y="88" 
            fill="currentColor" 
            fontSize="31" 
            fontFamily="system-ui, -apple-system, sans-serif" 
            fontWeight="500" 
            letterSpacing="-0.5"
            className="text-slate-900 dark:text-white"
          >
            Pulse
          </text>

          {/* High-design mini sprout leaf growing out of the letter 'e' */}
          <path 
            d="M211 68C213 65 217 64 220 65C222 66 222 68 221 69C219 71 216 71 213 70C211 69 211 68 211 68Z" 
            fill="#34d399" 
          />
          <path 
            d="M212 69C215 67 218 67 220 68" 
            stroke="#064e3b" 
            strokeWidth="0.4" 
          />
        </g>

        {/* =================== THE HARMONIC WAVEFORM CORE =================== */}
        
        {/* Horizontal Pulse Line (Heartbeat EKG Waveform) */}
        <polyline 
          points="25,99 110,99 113,99 117,89 121,111 125,75 130,105 133,95 136,101 139,99 255,99" 
          stroke="#10b981" 
          strokeWidth="2.2" 
          strokeLinecap="round" 
          strokeLinejoin="round"
          filter="url(#neon-glow)" 
        />

        {/* SUBTITLE: TRACK. REDUCE. TRANSFORM. */}
        <text 
          x="140" 
          y="113" 
          fill="#10b981" 
          fontSize="7.8" 
          fontFamily="monospace, Courier" 
          fontWeight="700" 
          letterSpacing="4.0" 
          textAnchor="middle"
          opacity="0.95"
          className="text-emerald-500 animate-pulse"
        >
          TRACK. REDUCE. TRANSFORM.
        </text>
      </svg>
    </div>
  );
}
