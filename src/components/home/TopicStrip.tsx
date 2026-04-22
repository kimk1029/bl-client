"use client";

import Link from "next/link";
import { TOPICS } from "./data/topics";
import TopicIcon from "./icons/TopicIcons";

export default function TopicStrip() {
  const visible = TOPICS.slice(0, 14);
  return (
    <div className="blessing-topic-strip">
      {visible.map((t) => {
        const href = t.mapsTo ? `/posts?category=${t.mapsTo}` : `/posts?topic=${t.id}`;
        return (
          <Link key={t.id} href={href} className="blessing-topic-tile">
            <div className="blessing-topic-tile-icon">
              <TopicIcon id={t.id} size={38} />
              {t.hot && <span className="blessing-topic-tile-hot" />}
            </div>
            <div className="blessing-topic-tile-label">{t.ko}</div>
          </Link>
        );
      })}
    </div>
  );
}
