"use client";

import Link from "next/link";
import type { Post } from "@/types/type";
import type { TopicMeta } from "./data/topics";
import SectionHeader from "./SectionHeader";
import { countComments, formatTimeAgo, postsByCategory } from "./lib/postAdapters";

interface Props {
  topic: TopicMeta;
  posts: Post[];
  limit?: number;
  excludeIds?: Set<number>;
}

export default function TopicLatestSection({
  topic,
  posts,
  limit = 3,
  excludeIds,
}: Props) {
  if (!topic.mapsTo) return null;
  const all = postsByCategory(posts, topic.mapsTo, {
    anonymous: topic.anon,
    titleKeywords: topic.titleKeywords,
  });
  const filtered = (excludeIds
    ? all.filter((p) => !excludeIds.has(p.id))
    : all
  ).slice(0, limit);
  if (filtered.length === 0) return null;

  return (
    <section className="blessing-section">
      <SectionHeader
        icon={topic.emoji}
        title={topic.ko}
        en={topic.en}
        count={all.length}
        moreHref={`/posts?category=${topic.mapsTo}`}
      />
      <div className="blessing-mag-wrap">
        {filtered.map((p) => {
          if (excludeIds) excludeIds.add(p.id);
          return (
            <Link key={p.id} href={`/posts/${p.id}`} className="blessing-mag-row">
              <div className="blessing-mag-body">
                <div className="blessing-mag-title">{p.title}</div>
                <div className="blessing-mag-meta">
                  <span className="blessing-post-author">
                    {p.author?.username ?? "익명"}
                  </span>
                  <span className="blessing-dot">·</span>
                  <span>{formatTimeAgo(p.created_at)}</span>
                  <span className="blessing-dot">·</span>
                  <span className="blessing-post-stat">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" aria-hidden>
                      <path
                        d="M4 6a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H9l-4 3V6Z"
                        stroke="currentColor"
                        strokeWidth="1.8"
                        strokeLinejoin="round"
                      />
                    </svg>
                    {countComments(p)}
                  </span>
                </div>
              </div>
              <div className="blessing-mag-thumb">{topic.emoji}</div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
