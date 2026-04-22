"use client";

import Link from "next/link";
import useSWR from "swr";
import { apiFetcher } from "@/lib/fetcher";
import type { Post } from "@/types/type";
import SectionHeader from "./SectionHeader";
import { countLikes, formatTimeAgo } from "./lib/postAdapters";

export default function PrayerStream() {
  const { data } = useSWR<Post[]>("/api/posts?category=prayer&limit=5", apiFetcher);
  const prayers = Array.isArray(data) ? data : [];

  if (prayers.length === 0) return null;

  return (
    <section className="blessing-section">
      <SectionHeader
        icon="🙏"
        title="기도제목"
        en="Prayer Stream"
        moreHref="/posts?topic=prayer"
      />
      <div className="blessing-prayer-stream">
        {prayers.map((p) => (
          <Link key={p.id} href={`/posts/${p.id}`} className="blessing-prayer-item">
            <span className="blessing-prayer-icon" aria-hidden>
              🙏
            </span>
            <span className="blessing-prayer-title">{p.title}</span>
            <span className="blessing-prayer-count">
              <span>🙏 {countLikes(p)}</span>
              <span>{formatTimeAgo(p.created_at)}</span>
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}
