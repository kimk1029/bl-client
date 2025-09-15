export type LevelInfo = {
  level: number;
  points: number;
  rangeStart: number;
  rangeEnd: number;
  progressPct: number; // 0~100
};

// Thresholds based on spec: L1:0+, L2:50+, L3:150+, L4:400+, L5:1000+
// We'll treat level n as points in [threshold[n-1], threshold[n]) where threshold[0]=0
const LEVEL_STARTS = [0, 50, 150, 400, 1000];

export const computeLevel = (pointsInput?: number | null): LevelInfo => {
  const points = Math.max(0, Number(pointsInput ?? 0) || 0);
  // find current level index
  let idx = 0;
  for (let i = 0; i < LEVEL_STARTS.length; i++) {
    if (points >= LEVEL_STARTS[i]) idx = i;
    else break;
  }
  const level = idx + 1; // L1 at start 0
  const rangeStart = LEVEL_STARTS[idx];
  const nextStart = LEVEL_STARTS[idx + 1] ?? (LEVEL_STARTS[LEVEL_STARTS.length - 1] + 1000);
  const rangeEnd = nextStart;
  const denom = Math.max(1, nextStart - rangeStart);
  const progressPct = Math.max(0, Math.min(100, Math.round(((points - rangeStart) / denom) * 100)));
  return { level, points, rangeStart, rangeEnd, progressPct };
};
