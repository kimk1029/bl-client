export default function LogoMark({ size = 26 }: { size?: number }) {
  return (
    <span
      className="blessing-logo-mark"
      style={{ width: size, height: size, display: "inline-flex" }}
    >
      <svg width={size} height={size} viewBox="0 0 40 40" fill="none" aria-hidden>
        <circle
          cx="20"
          cy="20"
          r="18.5"
          stroke="currentColor"
          strokeWidth="1.6"
          opacity="0.9"
        />
        <circle cx="20" cy="20" r="11" fill="currentColor" opacity="0.08" />
        <circle cx="20" cy="8.5" r="1.7" fill="currentColor" />
        <circle cx="31.5" cy="20" r="1.7" fill="currentColor" />
        <circle cx="20" cy="31.5" r="1.7" fill="currentColor" />
        <circle cx="8.5" cy="20" r="1.7" fill="currentColor" />
        <path
          d="M16 13 L16 27 M16 13 Q22 13 22 17 Q22 20 16 20 Q24 20 24 23.5 Q24 27 16 27"
          stroke="currentColor"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
      </svg>
    </span>
  );
}
