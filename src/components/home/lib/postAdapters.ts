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

export function countComments(p: Post): number {
  if (typeof p.commentCount === "number") return p.commentCount;
  if (typeof p.comments === "number") return p.comments;
  return 0;
}

export function countLikes(p: Post): number {
  if (typeof p.likeCount === "number") return p.likeCount;
  if (typeof p.likes === "number") return p.likes;
  return 0;
}

export function formatViews(n: number): string {
  if (n >= 1000) return (n / 1000).toFixed(1) + "k";
  return String(n);
}

// Rank by engagement. No backend HOT signal — weight likes > comments > views.
export function pickHot(posts: Post[], limit = 5): Post[] {
  return [...posts]
    .filter(p => !p.is_anonymous)
    .sort((a, b) => {
      const sa = countLikes(a) * 2 + countComments(a) * 3 + (a.views ?? 0) * 0.05;
      const sb = countLikes(b) * 2 + countComments(b) * 3 + (b.views ?? 0) * 0.05;
      return sb - sa;
    })
    .slice(0, limit);
}

export function postsByCategory(
  posts: Post[],
  cat: string,
  opts?: { anonymous?: boolean; titleKeywords?: string[] },
): Post[] {
  const kws = opts?.titleKeywords?.map((k) => k.toLowerCase()).filter(Boolean);
  return posts
    .filter((p) => p.category === cat)
    .filter((p) => {
      if (opts?.anonymous === true) return !!p.is_anonymous;
      if (opts?.anonymous === false) return !p.is_anonymous;
      return true;
    })
    .filter((p) => {
      if (!kws || kws.length === 0) return true;
      const t = (p.title || "").toLowerCase();
      return kws.some((k) => t.includes(k));
    })
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
}
