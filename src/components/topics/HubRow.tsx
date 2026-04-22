"use client";

import Link from "next/link";
import type { Post } from "@/types/type";
import type { TopicMeta } from "@/components/home/data/topics";
import TopicIcon from "@/components/home/icons/TopicIcons";
import { formatTimeAgo, postsByCategory } from "@/components/home/lib/postAdapters";

export interface EnrichedTopic extends TopicMeta {
  count: number;
  newCount: number;
  sample?: Post;
}

export function enrichTopics(topics: TopicMeta[], posts: Post[]): EnrichedTopic[] {
  const dayMs = 24 * 60 * 60 * 1000;
  return topics.map((t) => {
    const items = t.mapsTo ? postsByCategory(posts, t.mapsTo) : [];
    const newCount = items.filter(
      (p) => Date.now() - new Date(p.created_at).getTime() < dayMs,
    ).length;
    return {
      ...t,
      count: items.length,
      newCount,
      sample: items[0],
    };
  });
}

export default function HubRow({ t }: { t: EnrichedTopic }) {
  const href = t.mapsTo ? `/posts?category=${t.mapsTo}` : `/posts?topic=${t.id}`;
  return (
    <Link href={href} className="blessing-hub-row">
      <div className="blessing-hub-row-icon">
        <TopicIcon id={t.id} size={44} />
      </div>
      <div className="blessing-hub-row-body">
        <div className="blessing-hub-row-head">
          <span className="blessing-hub-row-ko">{t.ko}</span>
          {t.anon && <span className="blessing-hub-row-flag">ANON</span>}
          {t.hot && (
            <span className="blessing-hub-row-flag blessing-hub-row-flag-hot">HOT</span>
          )}
        </div>
        <div className="blessing-hub-row-en">
          {t.en} · {t.count} posts
          {t.newCount > 0 ? ` · +${t.newCount} new` : ""}
        </div>
        {t.sample && (
          <div className="blessing-hub-row-sample">
            <span className="blessing-hub-row-sample-dot">›</span>
            <span className="blessing-hub-row-sample-title">{t.sample.title}</span>
            <span className="blessing-hub-row-sample-time">
              {formatTimeAgo(t.sample.created_at)}
            </span>
          </div>
        )}
      </div>
      <div className="blessing-hub-row-right">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden>
          <path
            d="M9 6l6 6-6 6"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>
    </Link>
  );
}
