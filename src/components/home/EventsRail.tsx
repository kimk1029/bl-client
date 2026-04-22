import SectionHeader from "./SectionHeader";
import { MOCK_EVENTS } from "./data/mockEvents";

export default function EventsRail() {
  return (
    <section className="blessing-section">
      <SectionHeader
        icon="📅"
        title="다가오는 행사"
        en="Upcoming Events"
        moreHref="/events"
      />
      <div className="blessing-event-rail">
        {MOCK_EVENTS.slice(0, 4).map((e) => (
          <div key={e.id} className="blessing-event-card">
            <div className="blessing-event-emoji">{e.cover}</div>
            <div className="blessing-event-title">{e.title}</div>
            <div className="blessing-event-where">📍 {e.where}</div>
            <div className="blessing-event-when">{e.date}</div>
          </div>
        ))}
      </div>
    </section>
  );
}
