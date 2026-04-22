"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import Avatar from "@/components/common/Avatar";
import { DMS } from "./data";

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

export default function MessagesPage() {
  const [query, setQuery] = useState("");
  const filtered = useMemo(() => {
    const q = query.trim();
    if (!q) return DMS;
    return DMS.filter(
      (d) =>
        d.who.includes(q) ||
        (d.church ?? "").includes(q) ||
        d.preview.includes(q),
    );
  }, [query]);

  return (
    <div className="blessing-home">
      <div className="blessing-dm-search">
        <div className="blessing-search-input-wrap">
          <IconSearch />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="성도님 이름 검색"
            aria-label="쪽지 검색"
          />
        </div>
      </div>

      {filtered.length === 0 ? (
        <div
          className="blessing-event-detail-missing"
          style={{ minHeight: 200 }}
        >
          <div>검색 결과가 없어요.</div>
        </div>
      ) : (
        <div className="blessing-dm-list">
          {filtered.map((dm) => (
            <Link
              key={dm.id}
              href={`/messages/${dm.id}`}
              className="blessing-dm-row"
            >
              <div className="blessing-dm-avatar-wrap">
                <Avatar name={dm.who} size={46} seed={dm.id * 11} anon={dm.anon} />
                {dm.online && <span className="blessing-dm-online" />}
                {dm.official && <span className="blessing-dm-official">✓</span>}
              </div>
              <div className="blessing-dm-body">
                <div className="blessing-dm-head">
                  <span className="blessing-dm-name">
                    {dm.anon ? "🫧 익명" : dm.who}
                    {dm.church && !dm.anon && (
                      <span className="blessing-dm-church"> · {dm.church}</span>
                    )}
                  </span>
                  <span className="blessing-dm-time">{dm.time}</span>
                </div>
                <div className="blessing-dm-preview-line">
                  <span className="blessing-dm-preview">{dm.preview}</span>
                  {dm.unread > 0 && (
                    <span className="blessing-dm-unread">{dm.unread}</span>
                  )}
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
      <div style={{ height: 40 }} />
    </div>
  );
}
