"use client";

import { use } from "react";
import Link from "next/link";
import useSWR from "swr";
import { apiFetcher } from "@/lib/fetcher";
import type { EventItem } from "@/types/type";
import {
  eventBookmarks,
  useEventBookmarked,
} from "@/lib/eventBookmarks";
import { shareOrCopy } from "@/lib/share";
import {
  formatEventDateLong,
  resolveEventDate,
} from "@/lib/eventDate";

function IconBookmark({ filled }: { filled?: boolean }) {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill={filled ? "currentColor" : "none"} aria-hidden>
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

export default function EventDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { data, error, isLoading } = useSWR<EventItem>(
    `/api/events/${id}`,
    apiFetcher,
  );
  const bookmarked = useEventBookmarked(Number(id));

  if (isLoading) {
    return (
      <div className="blessing-home">
        <div className="blessing-loading">
          <div className="blessing-spinner" aria-label="Loading" />
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="blessing-home">
        <div className="blessing-event-detail-missing">
          <div>이벤트를 찾을 수 없어요.</div>
          <Link href="/events" className="blessing-section-more">
            ← 이벤트 목록
          </Link>
        </div>
      </div>
    );
  }

  const e = data;
  const dt = resolveEventDate(e);
  const longDate = dt ? formatEventDateLong(dt) : e.date_text;

  return (
    <article className="blessing-event-detail">
      <div className="blessing-event-detail-cover">
        <span className="blessing-event-detail-cover-emoji">
          {e.cover ?? "📅"}
        </span>
        {e.tag && (
          <span
            className={`blessing-event-featured-tag blessing-tag-${e.tag_color ?? "accent"}`}
          >
            ● {e.tag}
          </span>
        )}
      </div>

      <div className="blessing-event-detail-body">
        <div className="blessing-event-detail-date">{longDate}</div>
        <h1 className="blessing-event-detail-title">{e.title}</h1>
        <p className="blessing-event-detail-desc">{e.description}</p>

        <dl className="blessing-event-detail-meta">
          <div>
            <dt>장소</dt>
            <dd>📍 {e.location ?? "장소 미정"}</dd>
          </div>
          {e.host && (
            <div>
              <dt>주최</dt>
              <dd>🏛 {e.host}</dd>
            </div>
          )}
          <div>
            <dt>참여</dt>
            <dd>👥 {e.ppl > 0 ? `${e.ppl.toLocaleString()}명` : "미정"}</dd>
          </div>
          <div>
            <dt>비용</dt>
            <dd>💰 {e.price ?? "무료"}</dd>
          </div>
        </dl>

        <div className="blessing-event-detail-actions">
          <button className="blessing-btn-primary" type="button">
            참가 신청
          </button>
          <button
            type="button"
            className={`blessing-btn-secondary${bookmarked ? " blessing-btn-secondary-on" : ""}`}
            aria-label={bookmarked ? "찜 해제" : "찜하기"}
            aria-pressed={bookmarked}
            onClick={() => eventBookmarks.toggle(e.id)}
          >
            <IconBookmark filled={bookmarked} />
            <span>{bookmarked ? "찜됨" : "찜"}</span>
          </button>
          <button
            type="button"
            className="blessing-btn-secondary"
            aria-label="이벤트 공유"
            onClick={() =>
              shareOrCopy({
                title: e.title,
                text: e.description,
                url: `/events/${e.id}`,
              })
            }
          >
            <IconShare />
            <span>공유</span>
          </button>
        </div>
      </div>
    </article>
  );
}
