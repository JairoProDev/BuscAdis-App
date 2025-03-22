// src/components/icons/FlagIcon.tsx
import React from 'react';

const FlagIcon: React.FC = () => {
return (
    <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    width="24" // Ajusta el ancho según necesites
    height="24" // Ajusta la altura según necesites
    >
    <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M5 13l4 4L19 7"
    />
    <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M3 18h18"
    />
    <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M10 3v18m0-15a3 3 0 100-6v6a3 3 0 100 6v-6z"
    />
    </svg>
);
};

export default FlagIcon;