"use client";

import type { Post } from "@/types/type";
import SectionHeader from "./SectionHeader";
import PostRow from "./PostRow";
import { pickHot } from "./lib/postAdapters";

export default function HotSection({
  posts,
  outputIds,
}: {
  posts: Post[];
  outputIds?: Set<number>;
}) {
  const hot = pickHot(posts, 5);
  if (hot.length === 0) return null;
  if (outputIds) hot.forEach((p) => outputIds.add(p.id));
  return (
    <section className="blessing-section">
      <SectionHeader
        icon="🔥"
        title="실시간 HOT"
        en="Hot Now"
        count={hot.length}
        moreHref="/posts?sort=hot"
      />
      <div className="blessing-hot-list">
        {hot.map((p, i) => (
          <PostRow key={p.id} post={p} rank={i + 1} hot />
        ))}
      </div>
    </section>
  );
}
