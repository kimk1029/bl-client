interface AvatarProps {
  name?: string | null;
  seed?: number;
  size?: number;
  anon?: boolean;
}

function hashCode(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) {
    h = (h << 5) - h + s.charCodeAt(i);
    h |= 0;
  }
  return Math.abs(h);
}

export default function Avatar({
  name = "",
  seed = 0,
  size = 30,
  anon = false,
}: AvatarProps) {
  if (anon) {
    return (
      <div
        className="blessing-avatar blessing-avatar-anon"
        style={{ width: size, height: size, fontSize: Math.floor(size * 0.45) }}
        aria-hidden
      >
        ?
      </div>
    );
  }
  const label = (name ?? "").slice(0, 1) || "·";
  const base = (name ?? "") + String(seed);
  const hue = (hashCode(base) + seed * 47) % 360;
  return (
    <div
      className="blessing-avatar"
      style={{
        width: size,
        height: size,
        fontSize: Math.floor(size * 0.42),
        background: `oklch(88% 0.04 ${hue})`,
        color: `oklch(35% 0.06 ${hue})`,
      }}
      aria-hidden
    >
      {label.toUpperCase()}
    </div>
  );
}
