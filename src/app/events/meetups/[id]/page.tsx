"use client";

import { use, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { findMeetup } from "@/lib/meetupsMock";
import { meetupBookmarks, useMeetupBookmarked } from "@/lib/meetupBookmarks";
import { shareOrCopy } from "@/lib/share";

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
function IconBookmark() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
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

export default function MeetupDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const router = useRouter();
  const { id } = use(params);
  const meetupId = Number(id);
  const m = findMeetup(meetupId);
  const [joined, setJoined] = useState(false);
  const bookmarked = useMeetupBookmarked(meetupId);

  if (!m) {
    return (
      <div className="blessing-home">
        <div className="blessing-event-detail-missing" style={{ minHeight: 240 }}>
          <div>모임을 찾을 수 없어요.</div>
          <Link href="/events" className="blessing-section-more">
            ← 이벤트 & 모임
          </Link>
        </div>
      </div>
    );
  }

  const isFull = m.max > 0 && m.attending >= m.max;
  const fillPct = m.max > 0 ? Math.round((m.attending / m.max) * 100) : null;

  return (
    <div className="blessing-detail">
      <header className="blessing-detail-topbar">
        <button
          type="button"
          className="blessing-detail-icon-btn"
          onClick={() => router.back()}
          aria-label="뒤로가기"
        >
          <IconBack />
        </button>
        <div className="blessing-detail-topbar-title-wrap">
          <div className="blessing-dm-title">{m.title}</div>
          <div className="blessing-dm-subtitle">Meetup Detail</div>
        </div>
        <div className="blessing-detail-topbar-actions">
          <button
            type="button"
            className="blessing-detail-icon-btn"
            aria-label={bookmarked ? "찜 해제" : "찜"}
            aria-pressed={bookmarked}
            style={
              bookmarked
                ? { color: "var(--blessing-accent-strong)" }
                : undefined
            }
            onClick={() => {
              meetupBookmarks.toggle(meetupId);
              toast.success(bookmarked ? "찜을 해제했어요." : "모임을 찜했어요.");
            }}
          >
            <IconBookmark />
          </button>
          <button
            type="button"
            className="blessing-detail-icon-btn"
            aria-label="공유"
            onClick={() =>
              shareOrCopy({
                title: m.title,
                text: m.desc,
                url: `/events/meetups/${m.id}`,
              })
            }
          >
            <IconShare />
          </button>
        </div>
      </header>

      <div className="blessing-event-detail-body">
        <div className="blessing-meetup-detail-tags">
          {m.tags.map((t) => (
            <span key={t} className="blessing-meetup-tag">
              #{t}
            </span>
          ))}
          {isFull ? (
            <span className="blessing-meetup-full-badge">마감</span>
          ) : m.open ? (
            <span className="blessing-meetup-open-badge">모집중</span>
          ) : null}
        </div>
        <h1 className="blessing-event-detail-title">{m.title}</h1>

        <dl className="blessing-event-detail-meta">
          <div>
            <dt>일정</dt>
            <dd>📅 {m.date}</dd>
          </div>
          <div>
            <dt>장소</dt>
            <dd>📍 {m.where}</dd>
          </div>
          {m.max > 0 && (
            <div>
              <dt>인원</dt>
              <dd>
                👥 {m.attending}/{m.max}명
              </dd>
            </div>
          )}
          <div>
            <dt>주최</dt>
            <dd>👤 {m.host}</dd>
          </div>
        </dl>

        <p className="blessing-event-detail-desc" style={{ marginTop: 18 }}>
          {m.desc}
        </p>

        {m.max > 0 && fillPct !== null && (
          <div className="blessing-meetup-progress">
            <div className="blessing-meetup-progress-head">
              <span>참가 현황</span>
              <span className="blessing-meetup-progress-count">
                <strong
                  style={{
                    color: isFull
                      ? "var(--blessing-hot)"
                      : "var(--blessing-accent-strong)",
                  }}
                >
                  {m.attending}명
                </strong>
                <span style={{ color: "var(--blessing-fg-2)" }}>
                  {" "}
                  / {m.max}명
                </span>
              </span>
            </div>
            <div className="blessing-cell-mtg-attend-bar" style={{ height: 8 }}>
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
          </div>
        )}

        <div className="blessing-event-detail-actions" style={{ marginTop: 24 }}>
          {joined ? (
            <div
              style={{
                flex: 1,
                textAlign: "center",
                padding: "12px",
                background: "var(--blessing-accent-soft)",
                borderRadius: 12,
                fontSize: 14,
                fontWeight: 700,
                color: "var(--blessing-accent-strong)",
              }}
            >
              ✓ 참가 신청 완료
            </div>
          ) : (
            <button
              type="button"
              className="blessing-btn-primary"
              disabled={isFull}
              onClick={() => {
                setJoined(true);
                toast.success("모임에 참가했어요!");
              }}
            >
              {isFull ? "모집 마감" : "모임 참가하기 →"}
            </button>
          )}
        </div>
      </div>
      <div style={{ height: 40 }} />
    </div>
  );
}
