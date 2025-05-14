import React from 'react';

/**
 * BuscadisAvatarIcon - Un avatar SVG único: silueta de usuario con lupa y gradiente de marca.
 * Amigable, profesional, elegante y memorable.
 */
export const BuscadisAvatarIcon: React.FC<{ className?: string; size?: number }> = ({ className = '', size = 128 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 128 128"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    aria-label="Avatar Buscadis"
    role="img"
  >
    <defs>
      <linearGradient id="buscadis-avatar-gradient" x1="0" y1="0" x2="128" y2="128" gradientUnits="userSpaceOnUse">
        <stop stopColor="#14b8a6" />
        <stop offset="1" stopColor="#06b6d4" />
      </linearGradient>
      <filter id="shadow" x="-10%" y="-10%" width="120%" height="120%" filterUnits="userSpaceOnUse">
        <feDropShadow dx="0" dy="2" stdDeviation="4" floodColor="#000" floodOpacity="0.10" />
      </filter>
    </defs>
    {/* Círculo de fondo */}
    <circle cx="64" cy="64" r="60" fill="url(#buscadis-avatar-gradient)" filter="url(#shadow)" />
    {/* Silueta de usuario */}
    <ellipse cx="64" cy="60" rx="26" ry="24" fill="#fff" fillOpacity="0.95" />
    <ellipse cx="64" cy="52" rx="12" ry="12" fill="#e0f7fa" />
    {/* Lupa */}
    <g filter="url(#shadow)">
      <circle cx="92" cy="92" r="12" fill="#fff" stroke="url(#buscadis-avatar-gradient)" strokeWidth="3" />
      <rect x="102" y="102" width="12" height="4" rx="2" transform="rotate(45 102 102)" fill="#14b8a6" />
    </g>
    {/* Detalles de la silueta */}
    <ellipse cx="64" cy="80" rx="18" ry="10" fill="#e0f2f1" />
    {/* Sutil sonrisa */}
    <path d="M58 58 Q64 64 70 58" stroke="#14b8a6" strokeWidth="2" fill="none" strokeLinecap="round" />
  </svg>
);

export default BuscadisAvatarIcon; 