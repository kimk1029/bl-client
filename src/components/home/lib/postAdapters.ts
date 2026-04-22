import type { Post } from "@/types/type";

export function stripContent(s?: string): string {
  return (s || "").replace(/\s+/g, " ").trim();
}

export function formatTimeAgo(iso: string): string {
  const t = new Date(iso).getTime();
  const diff = Date.now() - t;
  const m = 60_000, h = 60 * m, d = 24 * h;
  if (diff < m) return "방금";
  if (diff < h) return `${Math.floor(diff / m)}분`;
  if (diff < d) return `${Math.floor(diff / h)}시간`;
  if (diff < 7 * d) return `${Math.floor(diff / d)}일`;
  return `${Math.floor(diff / (7 * d))}주`;
}

export function countComments(p: Post | (Post & { commentCount?: number })): number {
  const any = p as Post & { commentCount?: number };
  if (typeof any.commentCount === "number") return any.commentCount;
  if (typeof p.comments === "number") return p.comments;
  return 0;
}

export function formatViews(n: number): string {
  if (n >= 1000) return (n / 1000).toFixed(1) + "k";
  return String(n);
}

// Rank by engagement. No backend HOT signal — weight likes > comments > views.
export function pickHot(posts: Post[], limit = 5): Post[] {
  return [...posts]
    .sort((a, b) => {
      const sa = (a.likes ?? 0) * 2 + countComments(a) * 3 + (a.views ?? 0) * 0.05;
      const sb = (b.likes ?? 0) * 2 + countComments(b) * 3 + (b.views ?? 0) * 0.05;
      return sb - sa;
    })
    .slice(0, limit);
}

export function postsByCategory(posts: Post[], cat: string): Post[] {
  return posts
    .filter(p => p.category === cat)
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
}
