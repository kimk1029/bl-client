"use client";

import { useState } from "react";
import type { Post } from "@/types/type";
import PostRow from "@/components/home/PostRow";
import { countComments, pickHot } from "@/components/home/lib/postAdapters";

const MY_CHURCH_NAME = "은혜교회";
const MY_CHURCH_AREA = "서울 강남구";
const MY_CHURCH_VERIFIED = 312;
const MY_CHURCH_MEMBERS = 2400;

type SortKey = "latest" | "hot" | "comments";

export default function MyChurchFeed({ posts }: { posts: Post[] }) {
  const [sort, setSort] = useState<SortKey>("latest");

  let sorted = [...posts];
  if (sort === "latest") {
    sorted.sort(
      (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
    );
  } else if (sort === "hot") {
    sorted = pickHot(sorted, sorted.length);
  } else {
    sorted.sort((a, b) => countComments(b) - countComments(a));
  }

  const dayMs = 24 * 60 * 60 * 1000;
  const newToday = posts.filter(
    (p) => Date.now() - new Date(p.created_at).getTime() < dayMs,
  ).length;
  const activeAuthors = new Set(
    posts.map((p) => p.author?.username ?? "").filter(Boolean),
  ).size;

  return (
    <div className="blessing-hub-area">
      <div className="blessing-feed-church-strip">
        <div className="blessing-feed-church-left">
          <div className="blessing-feed-church-icon">
            <svg width="22" height="22" viewBox="0 0 40 40" fill="none" aria-hidden>
              <circle
                cx="20"
                cy="20"
                r="18.5"
                stroke="currentColor"
                strokeWidth="1.6"
                opacity="0.6"
              />
              <rect
                x="12"
                y="18"
                width="16"
                height="14"
                rx="1.5"
                fill="currentColor"
                opacity="0.2"
              />
              <polygon points="20,8 10,18 30,18" fill="currentColor" opacity="0.5" />
              <rect
                x="17"
                y="24"
                width="6"
                height="8"
                rx="1"
                fill="currentColor"
                opacity="0.7"
              />
            </svg>
          </div>
          <div>
            <div className="blessing-feed-church-name">{MY_CHURCH_NAME}</div>
            <div className="blessing-feed-church-meta">
              {MY_CHURCH_AREA} · {MY_CHURCH_VERIFIED}명 인증
            </div>
          </div>
        </div>
        <div className="blessing-feed-church-right">
          <div className="blessing-feed-live-dot" />
          <span className="blessing-feed-live-label">LIVE</span>
        </div>
      </div>

      <div className="blessing-feed-stats-row">
        <div className="blessing-feed-stat">
          <strong>{posts.length}</strong>
          <span>전체 글</span>
        </div>
        <div className="blessing-feed-stat-divider" />
        <div className="blessing-feed-stat">
          <strong style={{ color: "var(--blessing-accent-strong)" }}>
            +{newToday}
          </strong>
          <span>오늘</span>
        </div>
        <div className="blessing-feed-stat-divider" />
        <div className="blessing-feed-stat">
          <strong>{activeAuthors}</strong>
          <span>활동 성도</span>
        </div>
        <div className="blessing-feed-stat-divider" />
        <div className="blessing-feed-stat">
          <strong>{MY_CHURCH_MEMBERS.toLocaleString()}</strong>
          <span>총 성도</span>
        </div>
      </div>

      <div className="blessing-mychurch-privacy">
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" aria-hidden>
          <path
            d="M6 10V8a6 6 0 0 1 12 0v2M5 10h14v11H5Z"
            stroke="currentColor"
            strokeWidth="1.7"
            strokeLinejoin="round"
          />
        </svg>
        <span>
          <strong>{MY_CHURCH_NAME} 인증 성도</strong>만 보고 쓸 수 있는 공간입니다
        </span>
      </div>

      <div className="blessing-sort-bar">
        <button
          className={`blessing-sort-btn ${sort === "latest" ? "blessing-sort-btn-active" : ""}`}
          onClick={() => setSort("latest")}
        >
          최신순
        </button>
        <button
          className={`blessing-sort-btn ${sort === "hot" ? "blessing-sort-btn-active" : ""}`}
          onClick={() => setSort("hot")}
        >
          인기순
        </button>
        <button
          className={`blessing-sort-btn ${sort === "comments" ? "blessing-sort-btn-active" : ""}`}
          onClick={() => setSort("comments")}
        >
          댓글순
        </button>
        <div style={{ flex: 1 }} />
        <span className="blessing-sort-meta">{sorted.length} POSTS</span>
      </div>

      <div className="blessing-feed-list">
        {sorted.map((p) => (
          <PostRow key={p.id} post={p} showTopic />
        ))}
        {sorted.length === 0 && (
          <div className="blessing-hub-empty">
            <div className="blessing-hub-empty-big">—</div>
            <div>아직 {MY_CHURCH_NAME}에서 올라온 글이 없어요</div>
          </div>
        )}
      </div>

      <div className="blessing-end">· END OF {MY_CHURCH_NAME} FEED ·</div>
    </div>
  );
}
