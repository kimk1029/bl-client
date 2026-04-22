"use client";

import { useState } from "react";
import Link from "next/link";
import useSWR from "swr";
import { apiFetcher } from "@/lib/fetcher";
import type { EventItem } from "@/types/type";
import {
  eventBookmarks,
  useEventBookmarked,
} from "@/lib/eventBookmarks";
import { shareOrCopy } from "@/lib/share";

const FILTERS = [
  { id: "all", label: "전체" },
  { id: "bookmarked", label: "찜" },
  { id: "official", label: "공식 주최" },
  { id: "mission", label: "선교" },
  { id: "worship", label: "찬양" },
  { id: "youth", label: "청년" },
  { id: "study", label: "말씀" },
] as const;

type FilterId = (typeof FILTERS)[number]["id"];

function matchesTag(tag: string | null, filter: FilterId): boolean {
  if (filter === "all" || filter === "bookmarked") return true;
  if (!tag) return false;
  if (filter === "official") return tag === "공식 주최";
  if (filter === "mission") return tag === "선교";
  if (filter === "worship") return tag === "찬양";
  if (filter === "youth") return tag === "청년";
  if (filter === "study") return tag === "말씀";
  return true;
}

function IconBookmark({ filled }: { filled?: boolean }) {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill={filled ? "currentColor" : "none"}
      aria-hidden
    >
      <path
        d="M6 3h12v19l-6-4-6 4V3Z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function IconShare() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
      <circle cx="6" cy="12" r="2.5" stroke="currentColor" strokeWidth="1.6" />
      <circle cx="18" cy="6" r="2.5" stroke="currentColor" strokeWidth="1.6" />
      <circle cx="18" cy="18" r="2.5" stroke="currentColor" strokeWidth="1.6" />
      <path d="m8 11 8-4M8 13l8 4" stroke="currentColor" strokeWidth="1.6" />
    </svg>
  );
}

function BookmarkBtn({ id }: { id: number }) {
  const on = useEventBookmarked(id);
  return (
    <button
      type="button"
      className={`blessing-btn-secondary${on ? " blessing-btn-secondary-on" : ""}`}
      aria-label={on ? "찜 해제" : "찜하기"}
      aria-pressed={on}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        eventBookmarks.toggle(id);
      }}
    >
      <IconBookmark filled={on} />
    </button>
  );
}

function ShareBtn({ event }: { event: EventItem }) {
  return (
    <button
      type="button"
      className="blessing-btn-secondary"
      aria-label="이벤트 공유"
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        shareOrCopy({
          title: event.title,
          text: event.description,
          url: `/events/${event.id}`,
        });
      }}
    >
      <IconShare />
    </button>
  );
}

export default function EventsPage() {
  const [filter, setFilter] = useState<FilterId>("all");
  const { data, error } = useSWR<EventItem[]>("/api/events", apiFetcher);
  const loaded = !!data || !!error;
  const all = Array.isArray(data) ? data : [];

  const bookmarks = useEventBookmarked; // satisfy eslint; used below per-item
  void bookmarks;

  const byTag = all.filter((e) => matchesTag(e.tag, filter));
  const visible =
    filter === "bookmarked"
      ? byTag.filter((e) => eventBookmarks.has(e.id))
      : byTag;
  const featured = visible.find((e) => e.featured);
  const rest = visible.filter((e) => !e.featured);

  return (
    <div className="blessing-home">
      <div className="blessing-chip-row">
        {FILTERS.map((f) => (
          <button
            key={f.id}
            className={`blessing-chip ${filter === f.id ? "blessing-chip-active" : ""}`}
            onClick={() => setFilter(f.id)}
          >
            {f.label}
          </button>
        ))}
      </div>

      <div className="px-4">
        {!loaded ? (
          <div className="blessing-loading">
            <div className="blessing-spinner" aria-label="Loading" />
          </div>
        ) : (
          <>
            {featured && (
              <div className="blessing-event-featured">
                <Link
                  href={`/events/${featured.id}`}
                  className="blessing-event-featured-cover"
                >
                  <span className="blessing-event-featured-emoji">
                    {featured.cover ?? "📅"}
                  </span>
                  {featured.tag && (
                    <span
                      className={`blessing-event-featured-tag blessing-tag-${featured.tag_color ?? "accent"}`}
                    >
                      ● {featured.tag}
                    </span>
                  )}
                </Link>
                <div className="blessing-event-featured-body">
                  <div className="blessing-event-featured-date">
                    {featured.date_text}
                  </div>
                  <Link
                    href={`/events/${featured.id}`}
                    className="blessing-event-featured-title"
                  >
                    {featured.title}
                  </Link>
                  <div className="blessing-event-featured-desc">
                    {featured.description}
                  </div>
                  <div className="blessing-event-featured-meta">
                    <span>📍 {featured.location ?? "-"}</span>
                    <span className="blessing-dot">·</span>
                    <span>👥 {featured.ppl.toLocaleString()}명</span>
                    {featured.price && (
                      <>
                        <span className="blessing-dot">·</span>
                        <span>💰 {featured.price}</span>
                      </>
                    )}
                  </div>
                  <div className="blessing-event-featured-actions">
                    <Link
                      href={`/events/${featured.id}`}
                      className="blessing-btn-primary"
                    >
                      자세히 보기
                    </Link>
                    <BookmarkBtn id={featured.id} />
                    <ShareBtn event={featured} />
                  </div>
                </div>
              </div>
            )}

            <div className="blessing-section-header">
              <div className="blessing-section-title-wrap">
                <div>
                  <div className="blessing-section-title">전체 이벤트</div>
                  <div className="blessing-section-en">
                    ALL EVENTS · {visible.length}
                  </div>
                </div>
              </div>
              <Link href="/events/calendar" className="blessing-section-more">
                달력으로 보기 →
              </Link>
            </div>

            <div className="blessing-event-list">
              {rest.length === 0 ? (
                <div
                  className="blessing-event-detail-missing"
                  style={{ minHeight: 120 }}
                >
                  <div>
                    {filter === "bookmarked"
                      ? "찜한 이벤트가 없어요. 마음에 드는 이벤트를 찜해보세요."
                      : "표시할 이벤트가 없어요."}
                  </div>
                </div>
              ) : (
                rest.map((e) => (
                  <div key={e.id} className="blessing-event-list-row">
                    <Link
                      href={`/events/${e.id}`}
                      className="blessing-event-list-cover"
                    >
                      {e.cover ?? "📅"}
                    </Link>
                    <Link
                      href={`/events/${e.id}`}
                      className="blessing-event-list-body"
                    >
                      <div className="blessing-event-list-tag-line">
                        {e.tag && (
                          <span
                            className={`blessing-event-list-tag blessing-tag-${e.tag_color ?? "accent"}`}
                          >
                            {e.tag}
                          </span>
                        )}
                        <span className="blessing-event-list-date">
                          {e.date_text}
                        </span>
                      </div>
                      <div className="blessing-event-list-title">{e.title}</div>
                      <div className="blessing-event-list-meta">
                        <span>📍 {e.location ?? "-"}</span>
                        {e.ppl > 0 && (
                          <>
                            <span className="blessing-dot">·</span>
                            <span>{e.ppl.toLocaleString()}명</span>
                          </>
                        )}
                        {e.price && (
                          <>
                            <span className="blessing-dot">·</span>
                            <span>{e.price}</span>
                          </>
                        )}
                      </div>
                    </Link>
                    <div className="blessing-event-list-actions">
                      <BookmarkBtn id={e.id} />
                      <ShareBtn event={e} />
                    </div>
                  </div>
                ))
              )}
            </div>
          </>
        )}

        <div className="blessing-end">· · · END · · ·</div>
      </div>
    </div>
  );
}
