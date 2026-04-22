interface ProgressBarProps {
  value: number;
  max: number;
  /** Force a specific fill color. Defaults to accent. */
  fillColor?: string;
  /** Bar height in px. */
  height?: number;
  className?: string;
}

export function ProgressBar({
  value,
  max,
  fillColor,
  height,
  className,
}: ProgressBarProps) {
  const pct = max > 0 ? Math.max(0, Math.min(100, (value / max) * 100)) : 0;
  return (
    <div
      className={`blessing-cell-mtg-attend-bar${className ? ` ${className}` : ""}`}
      style={height ? { height } : undefined}
      role="progressbar"
      aria-valuemin={0}
      aria-valuemax={max}
      aria-valuenow={value}
    >
      <div
        className="blessing-cell-mtg-attend-fill"
        style={{
          width: `${pct}%`,
          ...(fillColor ? { background: fillColor } : {}),
        }}
      />
    </div>
  );
}
