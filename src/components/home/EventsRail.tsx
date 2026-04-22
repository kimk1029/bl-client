"use client";

import useSWR from "swr";
import { apiFetcher } from "@/lib/fetcher";
import type { EventItem } from "@/types/type";
import SectionHeader from "./SectionHeader";

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
        {events.map((e) => (
          <div key={e.id} className="blessing-event-card">
            <div className="blessing-event-emoji">{e.cover ?? "📅"}</div>
            <div className="blessing-event-title">{e.title}</div>
            <div className="blessing-event-where">📍 {e.location ?? "-"}</div>
            <div className="blessing-event-when">{e.date_text}</div>
          </div>
        ))}
      </div>
    </section>
  );
}
