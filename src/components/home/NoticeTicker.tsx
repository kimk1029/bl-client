"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import type { Post } from "@/types/type";
import { formatTimeAgo } from "./lib/postAdapters";
import { SAMPLE_NOTICES } from "./data/sampleNotices";

const NOTICE_MARK = /^(📌|\[공지\]|\[교회 공지\]|📣)|공지|안내/;
const ROTATE_MS = 4000;

type TickerItem = {
  key: string;
  title: string;
  time: string;
  href?: string;
};

function PinIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path d="M12 2 9 9H4l5 5-3 8 6-5 6 5-3-8 5-5h-5l-3-7Z" fill="currentColor" />
    </svg>
  );
}

export default function NoticeTicker({ posts }: { posts: Post[] }) {
  const items: TickerItem[] = useMemo(() => {
    const real: TickerItem[] = posts
      .filter(
        (p) =>
          (p as Post & { pinned?: boolean }).pinned ||
          NOTICE_MARK.test(p.title),
      )
      .slice(0, 6)
      .map((p) => ({
        key: `p-${p.id}`,
        title: p.title,
        time: formatTimeAgo(p.created_at),
        href: `/posts/${p.id}`,
      }));
    const samples: TickerItem[] = SAMPLE_NOTICES.map((n) => ({
      key: `s-${n.id}`,
      title: n.title,
      time: n.timeAgo,
    }));
    const merged = [...real];
    for (const s of samples) {
      if (merged.length >= 4) break;
      merged.push(s);
    }
    return merged;
  }, [posts]);

  const [idx, setIdx] = useState(0);

  useEffect(() => {
    if (items.length <= 1) return;
    const t = setInterval(
      () => setIdx((i) => (i + 1) % items.length),
      ROTATE_MS,
    );
    return () => clearInterval(t);
  }, [items.length]);

  if (items.length === 0) return null;
  const current = items[idx % items.length] ?? items[0];

  const body = (
    <>
      <PinIcon />
      <strong>공지</strong>
      <span className="blessing-pinned-dot">·</span>
      <div className="blessing-pinned-ticker" aria-live="polite">
        <span key={current.key} className="blessing-pinned-slide">
          {current.title}
        </span>
      </div>
      <span className="blessing-pinned-time">{current.time}</span>
    </>
  );

  if (current.href) {
    return (
      <Link
        href={current.href}
        className="blessing-pinned"
        aria-label={`공지: ${current.title}`}
      >
        {body}
      </Link>
    );
  }
  return (
    <div className="blessing-pinned" aria-label={`공지: ${current.title}`}>
      {body}
    </div>
  );
}
