export default function HeroLandscape() {
  return (
    <svg
      className="blessing-hero-bg"
      viewBox="0 0 400 220"
      preserveAspectRatio="xMidYMid slice"
      aria-hidden
    >
      <defs>
        <linearGradient id="heroGrad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#F5E6C8" />
          <stop offset="50%" stopColor="#E8D4A8" />
          <stop offset="100%" stopColor="#C9B382" />
        </linearGradient>
        <linearGradient id="heroSun" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#FFF3D0" stopOpacity="0.9" />
          <stop offset="100%" stopColor="#FFF3D0" stopOpacity="0" />
        </linearGradient>
      </defs>
      <rect width="400" height="220" fill="url(#heroGrad)" />
      <circle cx="300" cy="70" r="46" fill="#FFEFC0" opacity="0.8" />
      <circle cx="300" cy="70" r="46" fill="url(#heroSun)" />
      <path
        d="M0 160 L60 120 L110 150 L170 100 L230 145 L290 110 L360 145 L400 125 L400 220 L0 220 Z"
        fill="#8B7A4E"
        opacity="0.55"
      />
      <path
        d="M0 175 L50 150 L110 175 L180 140 L240 175 L310 150 L380 175 L400 165 L400 220 L0 220 Z"
        fill="#6B5C38"
        opacity="0.7"
      />
      <path
        d="M0 195 L80 180 L160 195 L240 180 L320 195 L400 185 L400 220 L0 220 Z"
        fill="#4A3F22"
      />
      <path
        d="M130 50 q4 -4 8 0 q4 -4 8 0"
        stroke="#6B5C38"
        strokeWidth="1.3"
        fill="none"
        strokeLinecap="round"
      />
      <path
        d="M155 38 q3 -3 6 0 q3 -3 6 0"
        stroke="#6B5C38"
        strokeWidth="1.1"
        fill="none"
        strokeLinecap="round"
      />
      <path
        d="M85 65 q4 -4 8 0 q4 -4 8 0"
        stroke="#6B5C38"
        strokeWidth="1.2"
        fill="none"
        strokeLinecap="round"
      />
    </svg>
  );
}
