"use client";

import { useState } from "react";
import useSWR from "swr";
import { apiFetcher } from "@/lib/fetcher";
import type { EventItem } from "@/types/type";

const FILTERS = [
  { id: "all", label: "전체" },
  { id: "official", label: "공식 주최" },
  { id: "mission", label: "선교" },
  { id: "worship", label: "찬양" },
  { id: "youth", label: "청년" },
  { id: "study", label: "말씀" },
] as const;

type FilterId = (typeof FILTERS)[number]["id"];

function matchesFilter(tag: string | null, filter: FilterId): boolean {
  if (filter === "all") return true;
  if (!tag) return false;
  if (filter === "official") return tag === "공식 주최";
  if (filter === "mission") return tag === "선교";
  if (filter === "worship") return tag === "찬양";
  if (filter === "youth") return tag === "청년";
  if (filter === "study") return tag === "말씀";
  return true;
}

export default function EventsPage() {
  const [filter, setFilter] = useState<FilterId>("all");
  const { data, error } = useSWR<EventItem[]>("/api/events", apiFetcher);
  const loaded = !!data || !!error;
  const all = Array.isArray(data) ? data : [];
  const visible = all.filter((e) => matchesFilter(e.tag, filter));
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
          <div className="blessing-event-featured-cover">
            <span className="blessing-event-featured-emoji">{featured.cover ?? "📅"}</span>
            {featured.tag && (
              <span
                className={`blessing-event-featured-tag blessing-tag-${featured.tag_color ?? "accent"}`}
              >
                ● {featured.tag}
              </span>
            )}
          </div>
          <div className="blessing-event-featured-body">
            <div className="blessing-event-featured-date">{featured.date_text}</div>
            <div className="blessing-event-featured-title">{featured.title}</div>
            <div className="blessing-event-featured-desc">{featured.description}</div>
            <div className="blessing-event-featured-meta">
              <span>📍 {featured.location ?? "-"}</span>
              <span className="blessing-dot">·</span>
              <span>👥 {featured.ppl.toLocaleString()}명</span>
              <span className="blessing-dot">·</span>
              <span>💰 {featured.price ?? "-"}</span>
            </div>
            <div className="blessing-event-featured-actions">
              <button className="blessing-btn-primary">참가 신청</button>
              <button className="blessing-btn-secondary" aria-label="북마크">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
                  <path
                    d="M6 3h12v19l-6-4-6 4V3Z"
                    stroke="currentColor"
                    strokeWidth="1.6"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>
              <button className="blessing-btn-secondary" aria-label="공유">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
                  <circle cx="6" cy="12" r="2.5" stroke="currentColor" strokeWidth="1.6" />
                  <circle cx="18" cy="6" r="2.5" stroke="currentColor" strokeWidth="1.6" />
                  <circle cx="18" cy="18" r="2.5" stroke="currentColor" strokeWidth="1.6" />
                  <path d="m8 11 8-4M8 13l8 4" stroke="currentColor" strokeWidth="1.6" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="blessing-section-header">
        <div className="blessing-section-title-wrap">
          <div>
            <div className="blessing-section-title">전체 이벤트</div>
            <div className="blessing-section-en">ALL EVENTS · {visible.length}</div>
          </div>
        </div>
        <button className="blessing-section-more" type="button">
          달력으로 보기 →
        </button>
      </div>

      <div className="blessing-event-list">
        {rest.map((e) => (
          <div key={e.id} className="blessing-event-list-row">
            <div className="blessing-event-list-cover">{e.cover ?? "📅"}</div>
            <div className="blessing-event-list-body">
              <div className="blessing-event-list-tag-line">
                {e.tag && (
                  <span
                    className={`blessing-event-list-tag blessing-tag-${e.tag_color ?? "accent"}`}
                  >
                    {e.tag}
                  </span>
                )}
                <span className="blessing-event-list-date">{e.date_text}</span>
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
            </div>
          </div>
        ))}
      </div>
        </>
      )}

      <div className="blessing-end">· · · END · · ·</div>
      </div>
    </div>
  );
}
