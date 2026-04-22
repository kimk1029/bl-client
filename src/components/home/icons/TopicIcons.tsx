import React from "react";
import type { TopicId } from "../data/topics";

interface IconProps {
  size?: number;
}

function Tile({
  bg,
  size = 40,
  children,
}: IconProps & { bg: string; children: React.ReactNode }) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" fill="none" aria-hidden>
      <rect width="40" height="40" rx="11" fill={bg} />
      {children}
    </svg>
  );
}

const Free = ({ size }: IconProps) => (
  <Tile bg="#FFF1E6" size={size}>
    <path d="M8 14a4 4 0 0 1 4-4h11a4 4 0 0 1 4 4v6a4 4 0 0 1-4 4h-7l-5 4v-4h1a4 4 0 0 1-4-4v-6Z" fill="#FF9F68" />
    <path d="M17 19a4 4 0 0 1 4-4h9a4 4 0 0 1 4 4v5a4 4 0 0 1-4 4h-1v4l-5-4h-3a4 4 0 0 1-4-4v-5Z" fill="#E25B17" opacity="0.9" />
  </Tile>
);

const Prayer = ({ size }: IconProps) => (
  <Tile bg="#EDE7FF" size={size}>
    <path d="M14 11 c0-1.5 2-1.5 2 0 v10 c0 1 -1 1.5 -2 1.5 c-3 0 -5 -2 -5 -5 v-3 l5 -3.5 Z" fill="#7A5CF0" />
    <path d="M26 11 c0-1.5 -2-1.5 -2 0 v10 c0 1 1 1.5 2 1.5 c3 0 5 -2 5 -5 v-3 l-5 -3.5 Z" fill="#7A5CF0" />
    <path d="M17 14 v12 c0 2 1 4 3 4 s3 -2 3 -4 v-12 c0 -1.3 -1 -2 -3 -2 s-3 0.7 -3 2 Z" fill="#4E31C7" />
  </Tile>
);

const Testimony = ({ size }: IconProps) => (
  <Tile bg="#FFF4CC" size={size}>
    <circle cx="20" cy="20" r="9" fill="#F5C518" opacity="0.35" />
    <path d="M20 9 L22.5 17.5 L31 20 L22.5 22.5 L20 31 L17.5 22.5 L9 20 L17.5 17.5 Z" fill="#E29C00" />
    <circle cx="20" cy="20" r="2" fill="#FFF4CC" />
  </Tile>
);

const Sermon = ({ size }: IconProps) => (
  <Tile bg="#DDEEE4" size={size}>
    <path d="M8 12 h10 c1.5 0 2 1 2 2 v15 c0 -1 -0.5 -2 -2 -2 h-10 Z" fill="#4A7A5C" />
    <path d="M32 12 h-10 c-1.5 0 -2 1 -2 2 v15 c0 -1 0.5 -2 2 -2 h10 Z" fill="#6BA07E" />
    <rect x="10" y="15" width="7" height="1.2" rx="0.6" fill="#DDEEE4" opacity="0.7" />
    <rect x="10" y="18" width="6" height="1.2" rx="0.6" fill="#DDEEE4" opacity="0.7" />
    <rect x="10" y="21" width="7" height="1.2" rx="0.6" fill="#DDEEE4" opacity="0.7" />
    <rect x="23" y="15" width="7" height="1.2" rx="0.6" fill="#DDEEE4" opacity="0.7" />
    <rect x="23" y="18" width="6" height="1.2" rx="0.6" fill="#DDEEE4" opacity="0.7" />
    <rect x="23" y="21" width="7" height="1.2" rx="0.6" fill="#DDEEE4" opacity="0.7" />
  </Tile>
);

const Qt = ({ size }: IconProps) => (
  <Tile bg="#E5F4E0" size={size}>
    <circle cx="20" cy="14" r="3.5" fill="#F5C518" />
    <path d="M13.5 14 h-2 M26.5 14 h2 M15 9.5 l-1.4 -1.4 M25 9.5 l1.4 -1.4 M20 7 v-1.5" stroke="#E29C00" strokeWidth="1.5" strokeLinecap="round" />
    <path d="M20 32 c0 -6 -4 -9 -9 -9 c0 6 4 9 9 9 Z" fill="#6BA07E" />
    <path d="M20 32 c0 -7 4 -11 9 -11 c0 7 -4 11 -9 11 Z" fill="#4A7A5C" />
    <path d="M20 32 v-12" stroke="#2F5238" strokeWidth="1.5" strokeLinecap="round" />
  </Tile>
);

const Youth = ({ size }: IconProps) => (
  <Tile bg="#FDE2E8" size={size}>
    <path d="M13 26 L26 13 L28 15 L15 28 Z" fill="#D13B5E" />
    <circle cx="12" cy="27" r="3.5" fill="#8B1E3B" />
    <circle cx="29" cy="14" r="1.3" fill="#8B1E3B" />
  </Tile>
);

const Market = ({ size }: IconProps) => (
  <Tile bg="#E0ECFF" size={size}>
    <path d="M11 16 h18 l-1.5 14 c-0.2 1.5 -1.2 2 -2 2 h-11 c-0.8 0 -1.8 -0.5 -2 -2 Z" fill="#4A7BE8" />
    <path d="M15 16 v-3 c0 -2.5 2 -5 5 -5 s5 2.5 5 5 v3" stroke="#1F4DB0" strokeWidth="2" strokeLinecap="round" fill="none" />
    <circle cx="15" cy="20" r="1.2" fill="#1F4DB0" />
    <circle cx="25" cy="20" r="1.2" fill="#1F4DB0" />
  </Tile>
);

const Notice = ({ size }: IconProps) => (
  <Tile bg="#FFE4D0" size={size}>
    <path d="M9 16 l14 -5 c1 -0.4 2 0.2 2 1.3 v16.4 c0 1.1 -1 1.7 -2 1.3 l-14 -5 c-0.8 -0.3 -1 -0.8 -1 -1.5 v-6 c0 -0.7 0.2 -1.2 1 -1.5 Z" fill="#E2752A" />
    <rect x="25" y="15" width="5" height="10" rx="2.5" fill="#9E4310" />
    <path d="M13 24 l2 6 c0.3 1 1 1.3 2 1 l1 -0.4 c1 -0.3 1.3 -1 1 -2 l-2 -6" fill="#9E4310" />
  </Tile>
);

const Mission = ({ size }: IconProps) => (
  <Tile bg="#D4ECEA" size={size}>
    <circle cx="20" cy="20" r="10" fill="#2F8C83" />
    <path d="M10 20 h20 M20 10 c3 2.5 5 6 5 10 s-2 7.5 -5 10 c-3 -2.5 -5 -6 -5 -10 s2 -7.5 5 -10 Z" stroke="#0B5E57" strokeWidth="1.4" fill="none" />
    <path d="M12 15 c3 0.5 6 1 8 1 s5 -0.5 8 -1 M12 25 c3 -0.5 6 -1 8 -1 s5 0.5 8 1" stroke="#0B5E57" strokeWidth="1.2" fill="none" />
  </Tile>
);

const Cell = ({ size }: IconProps) => (
  <Tile bg="#FFE9D6" size={size}>
    <circle cx="14" cy="15" r="4" fill="#E2A14A" />
    <circle cx="26" cy="15" r="4" fill="#C77B2A" />
    <circle cx="20" cy="26" r="4" fill="#8B4B10" />
    <path d="M14 15 L26 15 L20 26 Z" stroke="#8B4B10" strokeWidth="1.2" fill="none" opacity="0.4" />
  </Tile>
);

const Worship = ({ size }: IconProps) => (
  <Tile bg="#E8E0F5" size={size}>
    <circle cx="14" cy="26" r="3.5" fill="#5B3A9E" />
    <circle cx="27" cy="23" r="3.5" fill="#5B3A9E" />
    <path d="M17 26 v-14 l13 -2 v14" stroke="#3C1F7A" strokeWidth="2" strokeLinecap="round" fill="none" />
    <path d="M17 15 l13 -2" stroke="#3C1F7A" strokeWidth="2" strokeLinecap="round" />
  </Tile>
);

const Kids = ({ size }: IconProps) => (
  <Tile bg="#FFE0EE" size={size}>
    <circle cx="20" cy="18" r="8" fill="#E85D9B" />
    <circle cx="17.5" cy="17" r="1.2" fill="#FFE0EE" />
    <circle cx="22.5" cy="17" r="1.2" fill="#FFE0EE" />
    <path d="M17 20.5 c1 1.5 2 2 3 2 s2 -0.5 3 -2" stroke="#FFE0EE" strokeWidth="1.5" strokeLinecap="round" fill="none" />
    <path d="M18.5 32 h3" stroke="#B83472" strokeWidth="1.5" strokeLinecap="round" />
  </Tile>
);

const Local = ({ size }: IconProps) => (
  <Tile bg="#FFEDD5" size={size}>
    <path d="M20 8 c-5 0 -9 4 -9 9 c0 6 9 15 9 15 s9 -9 9 -15 c0 -5 -4 -9 -9 -9 Z" fill="#D97A2E" />
    <circle cx="20" cy="17" r="3.5" fill="#FFEDD5" />
  </Tile>
);

const Family = ({ size }: IconProps) => (
  <Tile bg="#E3EDFF" size={size}>
    <circle cx="13" cy="14" r="3" fill="#3D6BD4" />
    <path d="M8 26 c0 -3 2.5 -5.5 5 -5.5 s5 2.5 5 5.5" fill="#3D6BD4" />
    <circle cx="27" cy="14" r="3" fill="#1B4AAD" />
    <path d="M22 26 c0 -3 2.5 -5.5 5 -5.5 s5 2.5 5 5.5" fill="#1B4AAD" />
    <circle cx="20" cy="22" r="2.3" fill="#7AA3EB" />
    <path d="M16 30 c0 -2.5 2 -4 4 -4 s4 1.5 4 4" fill="#7AA3EB" />
  </Tile>
);

const Career = ({ size }: IconProps) => (
  <Tile bg="#E0E5ED" size={size}>
    <rect x="9" y="14" width="22" height="16" rx="2.5" fill="#4A566B" />
    <path d="M16 14 v-2 c0 -1.2 0.8 -2 2 -2 h4 c1.2 0 2 0.8 2 2 v2" stroke="#1F2937" strokeWidth="1.8" fill="none" strokeLinecap="round" />
    <rect x="9" y="20" width="22" height="1.5" fill="#1F2937" opacity="0.5" />
    <rect x="18" y="22" width="4" height="2.5" rx="0.6" fill="#FFF" opacity="0.3" />
  </Tile>
);

const Confide = ({ size }: IconProps) => (
  <Tile bg="#E7E5EB" size={size}>
    <circle cx="20" cy="20" r="10" fill="#6B6577" />
    <circle cx="20" cy="20" r="10" fill="none" stroke="#3A3544" strokeWidth="1" strokeDasharray="2 2" opacity="0.6" />
    <rect x="14" y="18" width="4" height="2" rx="1" fill="#E7E5EB" />
    <rect x="22" y="18" width="4" height="2" rx="1" fill="#E7E5EB" />
    <path d="M17 25 h6" stroke="#E7E5EB" strokeWidth="1.3" strokeLinecap="round" />
  </Tile>
);

const REGISTRY: Record<TopicId, React.FC<IconProps>> = {
  free: Free, prayer: Prayer, testimony: Testimony, sermon: Sermon, qt: Qt,
  youth: Youth, market: Market, notice: Notice, mission: Mission, cell: Cell,
  worship: Worship, kids: Kids, local: Local, family: Family, career: Career, confide: Confide,
};

export default function TopicIcon({ id, size = 40 }: { id: TopicId; size?: number }) {
  const C = REGISTRY[id];
  return C ? <C size={size} /> : null;
}
