import type { EventItem } from "@/types/type";

const DAYS = ["일", "월", "화", "수", "목", "금", "토"];

export interface EventDayKey {
  year: number;
  month: number; // 0-indexed
  day: number;
}

export function dayKey(y: number, m: number, d: number): string {
  return `${y}-${String(m + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
}

// Parse start_at (ISO) preferentially, fall back to "M/D" or "M/DD" in date_text.
// Returns null if no date can be determined.
export function resolveEventDate(e: EventItem, now = new Date()): Date | null {
  if (e.start_at) {
    const d = new Date(e.start_at);
    if (!Number.isNaN(d.getTime())) return d;
  }
  const txt = (e.date_text ?? "").trim();
  if (!txt) return null;

  // Try YYYY-MM-DD or YYYY.MM.DD first
  const full = txt.match(/(\d{4})[./-](\d{1,2})[./-](\d{1,2})/);
  if (full) {
    const [, y, m, d] = full;
    const dt = new Date(
      Number(y),
      Math.max(0, Math.min(11, Number(m) - 1)),
      Math.max(1, Math.min(31, Number(d))),
    );
    if (!Number.isNaN(dt.getTime())) return dt;
  }

  // Try M/D or M/DD (assume current year, roll forward if already past)
  const md = txt.match(/(\d{1,2})[./-](\d{1,2})/);
  if (md) {
    const [, mStr, dStr] = md;
    const m = Math.max(1, Math.min(12, Number(mStr))) - 1;
    const d = Math.max(1, Math.min(31, Number(dStr)));
    let year = now.getFullYear();
    const guess = new Date(year, m, d);
    // If the guessed date is more than 60 days in the past, assume next year.
    if (guess.getTime() < now.getTime() - 60 * 24 * 3600 * 1000) {
      year += 1;
    }
    const dt = new Date(year, m, d);
    if (!Number.isNaN(dt.getTime())) return dt;
  }

  return null;
}

export function formatEventDate(d: Date): string {
  const m = d.getMonth() + 1;
  const day = d.getDate();
  return `${m}/${String(day).padStart(2, "0")} (${DAYS[d.getDay()]})`;
}

export function formatEventDateLong(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}.${m}.${day} (${DAYS[d.getDay()]})`;
}

export function dateBlockParts(d: Date): { num: string; day: string } {
  return {
    num: String(d.getDate()).padStart(2, "0"),
    day: DAYS[d.getDay()],
  };
}

export function monthLabel(d: Date): string {
  return `${d.getFullYear()}년 ${d.getMonth() + 1}월`;
}
