export function LogoIcon({ className = "w-6 h-6" }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"
        className="fill-primary-600"
      />
      <circle
        cx="12"
        cy="9"
        r="4.5"
        className="stroke-white"
        strokeWidth="1.5"
        fill="none"
      />
      <path
        d="M15.5 12.5L18 15"
        className="stroke-white"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
} 