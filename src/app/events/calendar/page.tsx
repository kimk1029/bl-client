"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import useSWR from "swr";
import { apiFetcher } from "@/lib/fetcher";
import type { EventItem } from "@/types/type";
import {
  dateBlockParts,
  dayKey,
  formatEventDate,
  monthLabel,
  resolveEventDate,
} from "@/lib/eventDate";

const WEEK = ["일", "월", "화", "수", "목", "금", "토"];

export default function EventsCalendarPage() {
  const { data, isLoading } = useSWR<EventItem[]>("/api/events", apiFetcher);
  const all = Array.isArray(data) ? data : [];

  // Stable month state: start with null to avoid SSR Date mismatch.
  const [cursor, setCursor] = useState<{ y: number; m: number } | null>(null);
  useEffect(() => {
    const now = new Date();
    setCursor({ y: now.getFullYear(), m: now.getMonth() });
  }, []);

  const [selectedKey, setSelectedKey] = useState<string | null>(null);

  // Bucket events by day key
  const { eventsByDay, eventsDated } = useMemo(() => {
    const now = new Date();
    const map = new Map<string, EventItem[]>();
    const dated: Array<{ e: EventItem; d: Date; k: string }> = [];
    for (const e of all) {
      const d = resolveEventDate(e, now);
      if (!d) continue;
      const k = dayKey(d.getFullYear(), d.getMonth(), d.getDate());
      if (!map.has(k)) map.set(k, []);
      map.get(k)!.push(e);
      dated.push({ e, d, k });
    }
    return { eventsByDay: map, eventsDated: dated };
  }, [all]);

  if (!cursor || isLoading) {
    return (
      <div className="blessing-home">
        <div className="blessing-loading">
          <div className="blessing-spinner" aria-label="Loading" />
        </div>
      </div>
    );
  }

  const first = new Date(cursor.y, cursor.m, 1);
  const daysInMonth = new Date(cursor.y, cursor.m + 1, 0).getDate();
  const leadingBlanks = first.getDay();
  const cells: Array<{ day: number; k: string } | null> = [];
  for (let i = 0; i < leadingBlanks; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) {
    cells.push({ day: d, k: dayKey(cursor.y, cursor.m, d) });
  }
  while (cells.length % 7 !== 0) cells.push(null);

  const prev = () => {
    const m = cursor.m - 1;
    setCursor(m < 0 ? { y: cursor.y - 1, m: 11 } : { y: cursor.y, m });
    setSelectedKey(null);
  };
  const next = () => {
    const m = cursor.m + 1;
    setCursor(m > 11 ? { y: cursor.y + 1, m: 0 } : { y: cursor.y, m });
    setSelectedKey(null);
  };

  const today = new Date();
  const todayKey = dayKey(today.getFullYear(), today.getMonth(), today.getDate());

  const dayList = selectedKey
    ? eventsByDay.get(selectedKey) ?? []
    : eventsDated
        .filter((x) => x.d.getFullYear() === cursor.y && x.d.getMonth() === cursor.m)
        .sort((a, b) => a.d.getTime() - b.d.getTime())
        .map((x) => x.e);

  return (
    <div className="blessing-home">
      <div className="blessing-calendar">
        <div className="blessing-calendar-header">
          <button
            type="button"
            className="blessing-calendar-nav"
            onClick={prev}
            aria-label="이전 달"
          >
            ‹
          </button>
          <div className="blessing-calendar-month">{monthLabel(first)}</div>
          <button
            type="button"
            className="blessing-calendar-nav"
            onClick={next}
            aria-label="다음 달"
          >
            ›
          </button>
        </div>

        <div className="blessing-calendar-grid-head">
          {WEEK.map((w, i) => (
            <div
              key={w}
              className={`blessing-calendar-dow${i === 0 ? " blessing-calendar-dow-sun" : ""}${i === 6 ? " blessing-calendar-dow-sat" : ""}`}
            >
              {w}
            </div>
          ))}
        </div>

        <div className="blessing-calendar-grid">
          {cells.map((c, i) => {
            if (!c) return <div key={`b-${i}`} className="blessing-calendar-cell blessing-calendar-cell-blank" />;
            const count = eventsByDay.get(c.k)?.length ?? 0;
            const isToday = c.k === todayKey;
            const isSelected = c.k === selectedKey;
            const dow = (leadingBlanks + c.day - 1) % 7;
            return (
              <button
                key={c.k}
                type="button"
                className={`blessing-calendar-cell${isToday ? " blessing-calendar-cell-today" : ""}${isSelected ? " blessing-calendar-cell-selected" : ""}${dow === 0 ? " blessing-calendar-cell-sun" : ""}${dow === 6 ? " blessing-calendar-cell-sat" : ""}${count === 0 ? " blessing-calendar-cell-empty" : ""}`}
                onClick={() => setSelectedKey(isSelected ? null : c.k)}
                aria-label={`${c.day}일 ${count}건`}
              >
                <span className="blessing-calendar-cell-num">{c.day}</span>
                {count > 0 && (
                  <span
                    className="blessing-calendar-cell-dot"
                    aria-label={`${count}건`}
                  >
                    {count > 1 && <span>{count}</span>}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      <div className="blessing-section-header">
        <div className="blessing-section-title-wrap">
          <div>
            <div className="blessing-section-title">
              {selectedKey ? "선택한 날짜의 이벤트" : "이 달의 이벤트"}
            </div>
            <div className="blessing-section-en">
              {selectedKey ? selectedKey : monthLabel(first)} · {dayList.length}
            </div>
          </div>
        </div>
        <Link href="/events" className="blessing-section-more">
          목록으로 →
        </Link>
      </div>

      <div className="blessing-event-list">
        {dayList.length === 0 ? (
          <div className="blessing-event-detail-missing" style={{ minHeight: 120 }}>
            <div>
              {selectedKey
                ? "이 날짜엔 열리는 이벤트가 없어요."
                : "이 달에 표시할 이벤트가 없어요."}
            </div>
          </div>
        ) : (
          dayList.map((e) => {
            const d = resolveEventDate(e) ?? new Date();
            const parts = dateBlockParts(d);
            return (
              <Link
                key={e.id}
                href={`/events/${e.id}`}
                className="blessing-event-list-row"
              >
                <div
                  className="blessing-event-list-cover"
                  style={{ flexDirection: "column", gap: 0, padding: 6 }}
                >
                  <span style={{ fontSize: 18, fontWeight: 800, lineHeight: 1 }}>
                    {parts.num}
                  </span>
                  <span
                    style={{
                      fontSize: 10,
                      color: "var(--blessing-fg-2)",
                      fontFamily: "var(--blessing-mono)",
                    }}
                  >
                    {parts.day}
                  </span>
                </div>
                <div className="blessing-event-list-body">
                  <div className="blessing-event-list-tag-line">
                    {e.tag && (
                      <span
                        className={`blessing-event-list-tag blessing-tag-${e.tag_color ?? "accent"}`}
                      >
                        {e.tag}
                      </span>
                    )}
                    <span className="blessing-event-list-date">
                      {formatEventDate(d)}
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
                  </div>
                </div>
              </Link>
            );
          })
        )}
      </div>
    </div>
  );
}
