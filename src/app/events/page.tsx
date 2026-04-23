"use client";

import { useState } from "react";
import Link from "next/link";
import useSWR from "swr";
import { apiFetcher } from "@/lib/fetcher";
import type { EventItem } from "@/types/type";
import { Button } from "@/components/ui";
import {
  eventBookmarks,
  useEventBookmarked,
  useEventBookmarks,
} from "@/lib/eventBookmarks";
import { shareOrCopy } from "@/lib/share";
import {
  MEETUPS,
  MEETUP_FILTERS,
  type Meetup,
} from "@/lib/meetupsMock";

const EVENT_FILTERS = [
  { id: "all", label: "전체" },
  { id: "bookmarked", label: "찜" },
  { id: "official", label: "공식 주최" },
  { id: "mission", label: "선교" },
  { id: "worship", label: "찬양" },
  { id: "youth", label: "청년" },
  { id: "study", label: "말씀" },
] as const;

type Tab = "events" | "meetups";
type EventFilter = (typeof EVENT_FILTERS)[number]["id"];

function matchesEventTag(tag: string | null, filter: EventFilter): boolean {
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
function IconPlus() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path d="M12 3v18M3 12h18" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
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

function MeetupCard({ m }: { m: Meetup }) {
  const isFull = m.max > 0 && m.attending >= m.max;
  const fillPct = m.max > 0 ? Math.round((m.attending / m.max) * 100) : null;
  return (
    <Link href={`/events/meetups/${m.id}`} className="blessing-meetup-card">
      <div className="blessing-meetup-card-head">
        <div className="blessing-meetup-card-title">{m.title}</div>
        {isFull ? (
          <span className="blessing-meetup-full-badge">마감</span>
        ) : m.open ? (
          <span className="blessing-meetup-open-badge">모집중</span>
        ) : null}
      </div>
      <div className="blessing-meetup-card-meta">
        <span>📅 {m.date}</span>
        <span className="blessing-dot">·</span>
        <span>📍 {m.where}</span>
      </div>
      <div className="blessing-meetup-card-meta" style={{ marginTop: 3 }}>
        <span>
          👤 {m.host}
          {m.church ? ` · ${m.church}` : ""}
        </span>
      </div>
      <div className="blessing-meetup-card-tags">
        {m.tags.map((t) => (
          <span key={t} className="blessing-meetup-tag">
            #{t}
          </span>
        ))}
      </div>
      {m.max > 0 && fillPct !== null && (
        <div className="blessing-meetup-card-attend">
          <div className="blessing-cell-mtg-attend-bar" style={{ marginBottom: 4 }}>
            <div
              className="blessing-cell-mtg-attend-fill"
              style={{
                width: `${fillPct}%`,
                background: isFull
                  ? "var(--blessing-hot)"
                  : "var(--blessing-accent)",
              }}
            />
          </div>
          <span
            style={{
              fontSize: 11,
              color: "var(--blessing-fg-2)",
              fontFamily: "var(--blessing-mono)",
            }}
          >
            {m.attending}/{m.max}명{isFull ? " · 마감" : ""}
          </span>
        </div>
      )}
    </Link>
  );
}

export default function EventsPage() {
  const [tab, setTab] = useState<Tab>("events");
  const [eventFilter, setEventFilter] = useState<EventFilter>("all");
  const [meetupFilter, setMeetupFilter] = useState<string>("all");

  const { data, error } = useSWR<EventItem[]>("/api/events", apiFetcher);
  const loaded = !!data || !!error;
  const all = Array.isArray(data) ? data : [];
  const bookmarkedIds = useEventBookmarks();

  const byTag = all.filter((e) => matchesEventTag(e.tag, eventFilter));
  const eventsVisible =
    eventFilter === "bookmarked"
      ? byTag.filter((e) => bookmarkedIds.has(e.id))
      : byTag;
  const featured = eventsVisible.find((e) => e.featured);
  const rest = eventsVisible.filter((e) => !e.featured);

  const meetupsVisible =
    meetupFilter === "all"
      ? MEETUPS
      : MEETUPS.filter((m) => m.tags.includes(meetupFilter));

  const filters =
    tab === "events"
      ? EVENT_FILTERS.map((f) => ({ id: f.id as string, label: f.label }))
      : MEETUP_FILTERS;

  return (
    <div className="blessing-home">
      <div className="blessing-hub-tabs">
        <button
          type="button"
          className={`blessing-hub-tab ${tab === "events" ? "blessing-hub-tab-active" : ""}`}
          onClick={() => setTab("events")}
        >
          <span
            className="blessing-hub-tab-dot"
            style={{
              background:
                tab === "events"
                  ? "var(--blessing-hot)"
                  : "var(--blessing-fg-3)",
            }}
          />
          이벤트
          <span className="blessing-hub-tab-count">{all.length}</span>
        </button>
        <button
          type="button"
          className={`blessing-hub-tab ${tab === "meetups" ? "blessing-hub-tab-active" : ""}`}
          onClick={() => setTab("meetups")}
        >
          <svg
            width="12"
            height="12"
            viewBox="0 0 24 24"
            fill="none"
            aria-hidden
          >
            <path
              d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8ZM23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"
              stroke="currentColor"
              strokeWidth="1.6"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          모임
          <span className="blessing-hub-tab-count">{MEETUPS.length}</span>
        </button>
      </div>

      <div className="blessing-chip-row">
        {filters.map((f) => {
          const active =
            tab === "events" ? eventFilter === f.id : meetupFilter === f.id;
          return (
            <button
              key={f.id}
              className={`blessing-chip ${active ? "blessing-chip-active" : ""}`}
              onClick={() =>
                tab === "events"
                  ? setEventFilter(f.id as EventFilter)
                  : setMeetupFilter(f.id)
              }
            >
              {f.label}
            </button>
          );
        })}
      </div>

      {tab === "events" ? (
        <>
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
                      <Button href={`/events/${featured.id}`}>
                        자세히 보기
                      </Button>
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
                      ALL EVENTS · {eventsVisible.length}
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
                      {eventFilter === "bookmarked"
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
                        <div className="blessing-event-list-title">
                          {e.title}
                        </div>
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
        </>
      ) : (
        <>
          <Link
            href="/events/meetups/new"
            className="blessing-meetup-create-card"
          >
            <div className="blessing-meetup-create-icon">
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                aria-hidden
              >
                <path
                  d="M12 5v14M5 12h14"
                  stroke="currentColor"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                />
              </svg>
            </div>
            <div className="blessing-meetup-create-body">
              <div className="blessing-meetup-create-title">새 모임 만들기</div>
              <div className="blessing-meetup-create-sub">
                독서모임 · 기도회 · 밥약 등 자유롭게
              </div>
            </div>
            <span className="blessing-meetup-create-arrow">›</span>
          </Link>

          <div className="blessing-section-header">
            <div className="blessing-section-title-wrap">
              <div>
                <div className="blessing-section-title">커뮤니티 모임</div>
                <div className="blessing-section-en">
                  COMMUNITY · {meetupsVisible.length}
                </div>
              </div>
            </div>
            <Link
              href="/events/meetups/new"
              className="blessing-section-more"
              style={{ display: "inline-flex", alignItems: "center", gap: 4 }}
            >
              <IconPlus /> 만들기
            </Link>
          </div>

          <div className="blessing-meetup-list">
            {meetupsVisible.length === 0 ? (
              <div
                className="blessing-event-detail-missing"
                style={{ minHeight: 120 }}
              >
                <div>이 태그의 모임이 아직 없어요.</div>
              </div>
            ) : (
              meetupsVisible.map((m) => <MeetupCard key={m.id} m={m} />)
            )}
          </div>
        </>
      )}

      <div className="blessing-end">· · · END · · ·</div>
    </div>
  );
}
