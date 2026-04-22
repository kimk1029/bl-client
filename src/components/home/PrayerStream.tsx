"use client";

import Link from "next/link";
import SectionHeader from "./SectionHeader";
import { MOCK_PRAYERS } from "./data/mockPrayers";

export default function PrayerStream() {
  return (
    <section className="blessing-section">
      <SectionHeader
        icon="🙏"
        title="기도제목"
        en="Prayer Stream"
        moreHref="/posts?topic=prayer"
      />
      <div className="blessing-prayer-stream">
        {MOCK_PRAYERS.map((p) => (
          <Link key={p.id} href={`/posts?topic=prayer#${p.id}`} className="blessing-prayer-item">
            <span className="blessing-prayer-icon" aria-hidden>
              🙏
            </span>
            <span className="blessing-prayer-title">{p.title}</span>
            <span className="blessing-prayer-count">
              <span>🙏 {p.likes}</span>
              <span>{p.timeAgo}</span>
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}
