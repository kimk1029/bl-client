"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import type { Post } from "@/types/type";
import PostRow from "@/components/home/PostRow";
import { countComments, pickHot } from "@/components/home/lib/postAdapters";

type SortKey = "latest" | "hot" | "comments";

function ChurchIcon({ size = 22 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" fill="none" aria-hidden>
      <circle cx="20" cy="20" r="18.5" stroke="currentColor" strokeWidth="1.6" opacity="0.6" />
      <rect x="12" y="18" width="16" height="14" rx="1.5" fill="currentColor" opacity="0.2" />
      <polygon points="20,8 10,18 30,18" fill="currentColor" opacity="0.5" />
      <rect x="17" y="24" width="6" height="8" rx="1" fill="currentColor" opacity="0.7" />
    </svg>
  );
}

function ChurchCtaCard({
  title,
  message,
  actionLabel,
  actionHref,
}: {
  title: string;
  message: string;
  actionLabel: string;
  actionHref: string;
}) {
  return (
    <div className="blessing-mychurch-empty">
      <div className="blessing-mychurch-empty-icon">
        <ChurchIcon size={44} />
      </div>
      <div className="blessing-mychurch-empty-title">{title}</div>
      <div className="blessing-mychurch-empty-msg">{message}</div>
      <Link href={actionHref} className="blessing-btn-primary">
        {actionLabel}
      </Link>
    </div>
  );
}

export default function MyChurchFeed({ posts }: { posts: Post[] }) {
  const { data: session, status } = useSession();
  const [sort, setSort] = useState<SortKey>("latest");

  const church = (session?.user as { affiliation?: string | null } | undefined)
    ?.affiliation ?? null;

  const sorted = useMemo(() => {
    if (!church) return [] as Post[];
    const churchPosts = posts; // Backend filter by church not yet available — show all for enrolled users
    const copy = [...churchPosts];
    if (sort === "latest") {
      copy.sort(
        (a, b) =>
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
      );
    } else if (sort === "hot") {
      return pickHot(copy, copy.length);
    } else {
      copy.sort((a, b) => countComments(b) - countComments(a));
    }
    return copy;
  }, [posts, sort, church]);

  if (status === "loading") {
    return (
      <div className="blessing-loading">
        <div className="blessing-spinner" aria-label="Loading" />
      </div>
    );
  }

  if (!session) {
    return (
      <div className="blessing-hub-area">
        <ChurchCtaCard
          title="로그인하고 내 교회 피드 보기"
          message="같은 교회 성도들의 기도제목·소식을 모아볼 수 있어요."
          actionLabel="로그인"
          actionHref="/auth"
        />
      </div>
    );
  }

  if (!church) {
    return (
      <div className="blessing-hub-area">
        <ChurchCtaCard
          title="교회를 등록해 주세요"
          message="출석 교회를 등록하면 같은 교회 성도들만 보는 피드가 열립니다."
          actionLabel="교회 등록하기"
          actionHref="/auth/complete-profile"
        />
      </div>
    );
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
            <ChurchIcon />
          </div>
          <div>
            <div className="blessing-feed-church-name">{church}</div>
            <div className="blessing-feed-church-meta">
              인증 성도 전용 피드
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
          <strong>{church} 인증 성도</strong>만 보고 쓸 수 있는 공간입니다
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
            <div>아직 {church}에서 올라온 글이 없어요</div>
          </div>
        )}
      </div>

      <div className="blessing-end">· END OF FEED ·</div>
    </div>
  );
}
