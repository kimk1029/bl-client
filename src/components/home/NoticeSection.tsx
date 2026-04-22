"use client";

import Link from "next/link";
import type { Post } from "@/types/type";
import SectionHeader from "./SectionHeader";
import { formatTimeAgo, postsByCategory } from "./lib/postAdapters";

const NOTICE_HINT = /^(📌|\[공지\]|\[교회 공지\]|📣)|공지|모집|안내|주최|수련회|연합집회|행사/;

interface Props {
  posts: Post[];
  excludeIds?: Set<number>;
}

export default function NoticeSection({ posts, excludeIds }: Props) {
  const lifePosts = postsByCategory(posts, "life");
  const prioritized = [...lifePosts].sort((a, b) => {
    const ha = NOTICE_HINT.test(a.title) ? 1 : 0;
    const hb = NOTICE_HINT.test(b.title) ? 1 : 0;
    return hb - ha;
  });
  const pickable = excludeIds
    ? prioritized.filter((p) => !excludeIds.has(p.id))
    : prioritized;
  const items = pickable.slice(0, 5);

  return (
    <section className="blessing-section">
      <SectionHeader
        icon="📣"
        title="공지·행사"
        en="Notices & Events"
        count={lifePosts.length}
        moreHref="/posts?category=life"
      />
      <div className="blessing-notice-list">
        {items.length === 0 && (
          <div className="blessing-notice-item blessing-notice-empty">
            <span className="blessing-notice-badge">공지</span>
            <span className="blessing-notice-title">
              등록된 공지가 아직 없어요. 첫 공지를 남겨보세요.
            </span>
          </div>
        )}
        {items.map((p) => {
          if (excludeIds) excludeIds.add(p.id);
          const isPinned =
            (p as Post & { pinned?: boolean }).pinned ||
            NOTICE_HINT.test(p.title);
          return (
            <Link
              key={p.id}
              href={`/posts/${p.id}`}
              className="blessing-notice-item"
            >
              <span
                className={`blessing-notice-badge${isPinned ? " blessing-notice-badge-pin" : ""}`}
              >
                {isPinned ? "공지" : "NEW"}
              </span>
              <span className="blessing-notice-title">{p.title}</span>
              <span className="blessing-notice-time">
                {formatTimeAgo(p.created_at)}
              </span>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
