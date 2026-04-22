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

  return (
    <section className="blessing-section">
      <SectionHeader
        icon="🙏"
        title="기도제목"
        en="Prayer Stream"
        count={prayers.length}
        moreHref="/posts?category=prayer"
      />
      <div className="blessing-prayer-stream">
        {prayers.length === 0 ? (
          <Link
            href="/posts/new"
            className="blessing-prayer-item blessing-prayer-empty"
          >
            <span className="blessing-prayer-icon" aria-hidden>
              🙏
            </span>
            <span className="blessing-prayer-title">
              아직 기도제목이 없어요. 먼저 나눠보시겠어요?
            </span>
            <span className="blessing-prayer-count">
              <span>시작하기</span>
            </span>
          </Link>
        ) : (
          prayers.slice(0, 3).map((p) => (
            <Link
              key={p.id}
              href={`/posts/${p.id}`}
              className="blessing-prayer-item"
            >
              <span className="blessing-prayer-icon" aria-hidden>
                🙏
              </span>
              <span className="blessing-prayer-title">{p.title}</span>
              <span className="blessing-prayer-count">
                <span>🙏 {countLikes(p)}</span>
                <span>{formatTimeAgo(p.created_at)}</span>
              </span>
            </Link>
          ))
        )}
      </div>
    </section>
  );
}
