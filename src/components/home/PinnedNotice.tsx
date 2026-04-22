"use client";

import Link from "next/link";
import type { Post } from "@/types/type";
import { formatTimeAgo } from "./lib/postAdapters";

export default function PinnedNotice({ post }: { post: Post | null }) {
  if (!post) return null;
  return (
    <Link href={`/posts/${post.id}`} className="blessing-pinned" aria-label={`공지: ${post.title}`}>
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" aria-hidden>
        <path d="M12 2 9 9H4l5 5-3 8 6-5 6 5-3-8 5-5h-5l-3-7Z" fill="currentColor" />
      </svg>
      <strong>공지</strong>
      <span className="blessing-pinned-dot">·</span>
      <span className="blessing-pinned-title">{post.title}</span>
      <span className="blessing-pinned-time">{formatTimeAgo(post.created_at)}</span>
    </Link>
  );
}
