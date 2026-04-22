"use client";

import {
  Suspense,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import useSWR from "swr";
import { apiFetcher } from "@/lib/fetcher";
import type { Post } from "@/types/type";
import {
  TOPICS,
  topicByCategory,
  type TopicMeta,
} from "@/components/home/data/topics";
import {
  countComments,
  countLikes,
  formatTimeAgo,
  pickHot,
} from "@/components/home/lib/postAdapters";
import { recentSearches, useRecentSearches } from "@/lib/recentSearches";

function IconBack() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M15 6l-6 6 6 6"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
function IconSearch() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
      <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="1.8" />
      <path
        d="m20 20-3.5-3.5"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}
function IconComment() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M4 6a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H9l-4 3V6Z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function highlight(text: string, q: string): ReactNode {
  if (!q) return text;
  try {
    const safe = q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const re = new RegExp(`(${safe})`, "gi");
    const parts = text.split(re);
    return parts.map((p, i) =>
      re.test(p) ? (
        <span key={`h-${i}`} className="blessing-search-hl">
          {p}
        </span>
      ) : (
        <span key={`t-${i}`}>{p}</span>
      ),
    );
  } catch {
    return text;
  }
}

function formatSnapshotTime(d: Date): string {
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  const hh = String(d.getHours()).padStart(2, "0");
  return `${mm}.${dd} ${hh}:00`;
}

function clipTitle(s: string, n = 22): string {
  const v = s.replace(/^[\[({][^\])}]+[\])}]\s*/, "").trim();
  return v.length > n ? v.slice(0, n - 1) + "…" : v;
}

function SearchContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get("q") ?? "";
  const [q, setQ] = useState(initialQuery);
  const [snapshotLabel, setSnapshotLabel] = useState("");
  const inputRef = useRef<HTMLInputElement | null>(null);
  const recents = useRecentSearches();

  useEffect(() => {
    // Auto-focus the input on mount, matching the prototype UX.
    const t = window.setTimeout(() => inputRef.current?.focus(), 60);
    setSnapshotLabel(formatSnapshotTime(new Date()));
    return () => window.clearTimeout(t);
  }, []);

  // Keep URL in sync (light debounce) so the state is shareable / back-button sane.
  useEffect(() => {
    const id = window.setTimeout(() => {
      const params = new URLSearchParams();
      if (q.trim()) params.set("q", q.trim());
      const qs = params.toString();
      router.replace(qs ? `/search?${qs}` : "/search", { scroll: false });
    }, 200);
    return () => window.clearTimeout(id);
  }, [q, router]);

  const trimmed = q.trim();

  const { data: allPosts } = useSWR<Post[]>("/api/posts", apiFetcher);
  const posts: Post[] = useMemo(
    () => (Array.isArray(allPosts) ? allPosts : []),
    [allPosts],
  );

  // Trending derives from top engagement posts' titles.
  const trending = useMemo(() => {
    const hot = pickHot(posts, 10);
    return hot.map((p, i) => ({
      q: clipTitle(p.title),
      rank: i + 1,
    }));
  }, [posts]);

  // Results: fetch from /api/search when query is set.
  const searchUrl = trimmed ? `/api/search?q=${encodeURIComponent(trimmed)}` : null;
  const { data: results, isLoading: searching } = useSWR<Post[]>(
    searchUrl,
    apiFetcher,
  );
  const resultList = Array.isArray(results) ? results : [];

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (trimmed) recentSearches.add(trimmed);
  };

  const openResult = (p: Post) => {
    if (trimmed) recentSearches.add(trimmed);
    router.push(`/posts/${p.id}`);
  };

  const fillQuery = (s: string) => {
    setQ(s);
    inputRef.current?.focus();
  };

  return (
    <div className="blessing-search">
      <header className="blessing-search-topbar">
        <button
          type="button"
          className="blessing-detail-icon-btn"
          onClick={() => router.back()}
          aria-label="뒤로가기"
        >
          <IconBack />
        </button>
        <form
          className="blessing-search-input-wrap"
          onSubmit={onSubmit}
          role="search"
        >
          <IconSearch />
          <input
            ref={inputRef}
            type="search"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="글, 닉네임, 교회명으로 검색"
            autoComplete="off"
            spellCheck={false}
            enterKeyHint="search"
            aria-label="검색어 입력"
          />
          {q && (
            <button
              type="button"
              className="blessing-search-clear"
              onClick={() => {
                setQ("");
                inputRef.current?.focus();
              }}
              aria-label="검색어 지우기"
            >
              ✕
            </button>
          )}
        </form>
      </header>

      {!trimmed ? (
        <>
          <div className="blessing-search-section-title">
            최근 검색
            {recents.length > 0 && (
              <button type="button" onClick={() => recentSearches.clear()}>
                전체 삭제
              </button>
            )}
          </div>
          {recents.length === 0 ? (
            <div className="blessing-search-empty-recents">
              최근 검색 기록이 없어요.
            </div>
          ) : (
            <div className="blessing-recent-chips">
              {recents.map((r) => (
                <span key={r} className="blessing-recent-chip">
                  <button type="button" onClick={() => fillQuery(r)}>
                    {r}
                  </button>
                  <button
                    type="button"
                    className="blessing-recent-chip-x"
                    onClick={() => recentSearches.remove(r)}
                    aria-label={`${r} 삭제`}
                  >
                    ✕
                  </button>
                </span>
              ))}
            </div>
          )}

          <div className="blessing-search-section-title">
            실시간 인기 검색어
            {snapshotLabel && (
              <span className="blessing-search-section-time">
                {snapshotLabel}
              </span>
            )}
          </div>
          <div className="blessing-trending-list">
            {trending.length === 0 ? (
              <div
                className="blessing-search-empty-recents"
                style={{ padding: "8px 16px 16px" }}
              >
                집계 중이에요. 잠시 후 다시 확인해 주세요.
              </div>
            ) : (
              trending.map((t) => (
                <button
                  type="button"
                  key={`${t.rank}-${t.q}`}
                  className="blessing-trending-row"
                  onClick={() => fillQuery(t.q)}
                >
                  <span
                    className={`blessing-trending-rank${t.rank <= 3 ? " blessing-trending-rank-top" : ""}`}
                  >
                    {t.rank}
                  </span>
                  <span className="blessing-trending-query">{t.q}</span>
                </button>
              ))
            )}
          </div>

          <div className="blessing-search-section-title">토픽 둘러보기</div>
          <div className="blessing-chip-row blessing-chip-row-wrap">
            {TOPICS.map((t: TopicMeta) => (
              <Link
                key={t.id}
                href={
                  t.mapsTo
                    ? `/posts?category=${t.mapsTo}`
                    : `/posts?topic=${t.id}`
                }
                className="blessing-chip"
              >
                <span style={{ fontSize: 13 }}>{t.emoji}</span>
                {t.ko}
              </Link>
            ))}
          </div>
          <div style={{ height: 24 }} />
        </>
      ) : (
        <>
          <div className="blessing-search-section-title">
            <span>
              <q className="blessing-search-qecho">{trimmed}</q> 검색 결과
            </span>
            <span className="blessing-search-section-time">
              {searching ? "검색 중…" : `${resultList.length}건`}
            </span>
          </div>
          {searching ? (
            <div className="blessing-loading">
              <div className="blessing-spinner" aria-label="Loading" />
            </div>
          ) : resultList.length === 0 ? (
            <div className="blessing-search-no-results">
              <div>결과가 없어요.</div>
              <div className="blessing-search-no-results-sub">
                다른 키워드로 검색해 보세요.
              </div>
            </div>
          ) : (
            <div className="blessing-search-results">
              {resultList.map((p) => {
                const topic = topicByCategory(
                  (p as unknown as { category?: string }).category,
                );
                return (
                  <button
                    type="button"
                    key={p.id}
                    className="blessing-post-row blessing-search-result-row"
                    onClick={() => openResult(p)}
                  >
                    <div className="blessing-post-body">
                      <div className="blessing-post-meta-top">
                        {topic && (
                          <span className="blessing-post-topic">
                            <span className="blessing-post-topic-emoji">
                              {topic.emoji}
                            </span>
                            {topic.ko}
                          </span>
                        )}
                      </div>
                      <div className="blessing-post-title">
                        {highlight(p.title, trimmed)}
                      </div>
                      <div className="blessing-post-meta-bottom">
                        <span className="blessing-post-author">
                          {p.is_anonymous
                            ? "🫧 익명"
                            : highlight(p.author?.username ?? "익명", trimmed)}
                        </span>
                        <span className="blessing-dot">·</span>
                        <span>{formatTimeAgo(p.created_at)}</span>
                        <span className="blessing-dot">·</span>
                        <span className="blessing-post-stat">
                          <IconComment />
                          {countComments(p)}
                        </span>
                        <span className="blessing-dot">·</span>
                        <span className="blessing-post-stat">
                          ❤ {countLikes(p)}
                        </span>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense
      fallback={
        <div className="blessing-loading">
          <div className="blessing-spinner" aria-label="Loading" />
        </div>
      }
    >
      <SearchContent />
    </Suspense>
  );
}
