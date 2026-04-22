"use client";

import Link from "next/link";
import useSWR from "swr";
import { apiFetcher } from "@/lib/fetcher";
import type { EventItem } from "@/types/type";
import SectionHeader from "./SectionHeader";

function parseDateBlock(e: EventItem): { num: string; day: string } {
  const raw = e.start_at ?? null;
  if (raw) {
    const d = new Date(raw);
    if (!Number.isNaN(d.getTime())) {
      const num = String(d.getDate()).padStart(2, "0");
      const days = ["일", "월", "화", "수", "목", "금", "토"];
      return { num, day: days[d.getDay()] };
    }
  }
  const text = (e.date_text ?? "").trim();
  const m = text.match(/(\d{1,2})/);
  return { num: m ? m[1] : text.slice(0, 2), day: "" };
}

export default function EventsRail() {
  const { data } = useSWR<EventItem[]>("/api/events?limit=4", apiFetcher);
  const events = Array.isArray(data) ? data : [];

  if (events.length === 0) return null;

  return (
    <section className="blessing-section">
      <SectionHeader
        icon="📅"
        title="다가오는 행사"
        en="Upcoming Events"
        moreHref="/events"
      />
      <div className="blessing-event-rail">
        {events.map((e) => {
          const { num, day } = parseDateBlock(e);
          return (
            <Link
              key={e.id}
              href={`/events/${e.id}`}
              className="blessing-event-card"
            >
              <div className="blessing-event-date">
                <span className="blessing-event-date-num">{num}</span>
                {day && <span className="blessing-event-date-day">{day}</span>}
              </div>
              <div className="blessing-event-title">{e.title}</div>
              <div className="blessing-event-where">
                📍 {e.location ?? "장소 미정"}
              </div>
              {e.ppl > 0 && (
                <div className="blessing-event-ppl">
                  {e.ppl.toLocaleString()}명 참여 예정
                </div>
              )}
            </Link>
          );
        })}
      </div>
    </section>
  );
}
