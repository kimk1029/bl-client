"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import type { Post } from "@/types/type";
import { TOPICS } from "@/components/home/data/topics";
import { TOPIC_GROUPS } from "@/components/home/lib/topicGroups";
import TopicIcon from "@/components/home/icons/TopicIcons";
import HubRow, { enrichTopics } from "./HubRow";

export default function TopicBrowser({ posts }: { posts: Post[] }) {
  const [query, setQuery] = useState("");

  const enriched = useMemo(() => enrichTopics(TOPICS, posts), [posts]);
  const q = query.trim().toLowerCase();
  const filtered = q
    ? enriched.filter(
        (t) => t.ko.includes(query) || t.en.toLowerCase().includes(q),
      )
    : enriched;

  const total = posts.length;
  const dayMs = 24 * 60 * 60 * 1000;
  const totalNew = posts.filter(
    (p) => Date.now() - new Date(p.created_at).getTime() < dayMs,
  ).length;
  const picks = enriched.filter((t) => t.hot).slice(0, 4);

  return (
    <div className="blessing-hub-area">
      <div className="blessing-hub-strip">
        <div className="blessing-hub-strip-row">
          <div className="blessing-hub-strip-cell">
            <div className="blessing-hub-strip-num">{TOPICS.length}</div>
            <div className="blessing-hub-strip-k">토픽</div>
          </div>
          <div className="blessing-hub-strip-divider" />
          <div className="blessing-hub-strip-cell">
            <div className="blessing-hub-strip-num">{total.toLocaleString()}</div>
            <div className="blessing-hub-strip-k">전체 글</div>
          </div>
          <div className="blessing-hub-strip-divider" />
          <div className="blessing-hub-strip-cell">
            <div
              className="blessing-hub-strip-num"
              style={{ color: "var(--blessing-accent-strong)" }}
            >
              +{totalNew}
            </div>
            <div className="blessing-hub-strip-k">오늘 새 글</div>
          </div>
        </div>
      </div>

      <div className="blessing-hub-search">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
          <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="1.8" />
          <path d="m20 20-3.5-3.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
        </svg>
        <input
          type="text"
          placeholder="기도제목, 청년부, career..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        {query && (
          <button className="blessing-hub-search-clear" onClick={() => setQuery("")}>
            지우기
          </button>
        )}
      </div>

      {q ? (
        <>
          <div className="blessing-hub-section-label">
            <span>검색 결과</span>
            <span className="blessing-hub-section-meta">{filtered.length} RESULTS</span>
          </div>
          <div className="blessing-hub-list">
            {filtered.map((t) => (
              <HubRow key={t.id} t={t} />
            ))}
            {filtered.length === 0 && (
              <div className="blessing-hub-empty">
                <div className="blessing-hub-empty-big">—</div>
                <div>&quot;{query}&quot;에 맞는 토픽이 없어요</div>
              </div>
            )}
          </div>
        </>
      ) : (
        <>
          <div className="blessing-hub-section-label">
            <span>
              Picks <span>지금 뜨는</span>
            </span>
            <span className="blessing-hub-section-meta">HOT NOW</span>
          </div>
          <div className="blessing-hub-picks">
            {picks.map((t, i) => {
              const href = t.mapsTo
                ? `/posts?category=${t.mapsTo}`
                : `/posts?topic=${t.id}`;
              return (
                <Link
                  key={t.id}
                  href={href}
                  className={`blessing-hub-pick blessing-hub-pick-${i % 4}`}
                >
                  <div className="blessing-hub-pick-icon">
                    <TopicIcon id={t.id} size={44} />
                  </div>
                  <div className="blessing-hub-pick-bottom">
                    <div className="blessing-hub-pick-ko">{t.ko}</div>
                    <div className="blessing-hub-pick-en">{t.en}</div>
                    <div className="blessing-hub-pick-meta">
                      <span className="blessing-hub-pill-hot">HOT</span>
                      <span>+{t.newCount}</span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>

          {TOPIC_GROUPS.map((g) => {
            const rows = enriched.filter((t) =>
              (g.ids as string[]).includes(t.id),
            );
            if (!rows.length) return null;
            return (
              <div key={g.key}>
                <div className="blessing-hub-section-label">
                  <span>{g.label}</span>
                  <span className="blessing-hub-section-meta">
                    {rows.length} topics
                  </span>
                </div>
                <div className="blessing-hub-list">
                  {rows.map((t) => (
                    <HubRow key={t.id} t={t} />
                  ))}
                </div>
              </div>
            );
          })}
        </>
      )}

      <div className="blessing-end">· END OF TOPICS ·</div>
    </div>
  );
}
