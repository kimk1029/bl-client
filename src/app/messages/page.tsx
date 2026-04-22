"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import useSWR from "swr";
import Avatar from "@/components/common/Avatar";
import { formatTimeAgo } from "@/components/home/lib/postAdapters";

interface ThreadItem {
  otherUserId: number;
  otherUsername: string;
  otherAffiliation: string | null;
  lastMessage: {
    id: number;
    content: string;
    created_at: string;
    sender_id: number;
  };
  unread: number;
}

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

const tokenFetcher = async (url: string, token?: string | null) => {
  const res = await fetch(url, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
  if (!res.ok) throw new Error(`fetch ${url} ${res.status}`);
  return res.json();
};

export default function MessagesPage() {
  const { data: session, status } = useSession();
  const token = (session as { accessToken?: string } | null)?.accessToken;
  const [query, setQuery] = useState("");

  const { data: threads, isLoading } = useSWR<ThreadItem[]>(
    status === "authenticated" ? "/api/messages" : null,
    (url: string) => tokenFetcher(url, token),
  );

  const filtered = useMemo(() => {
    const list = Array.isArray(threads) ? threads : [];
    const q = query.trim();
    if (!q) return list;
    return list.filter(
      (t) =>
        t.otherUsername.includes(q) ||
        (t.otherAffiliation ?? "").includes(q) ||
        t.lastMessage.content.includes(q),
    );
  }, [threads, query]);

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
            disabled={status !== "authenticated"}
          />
        </div>
        {status === "authenticated" && (
          <Link
            href="/messages/new"
            className="blessing-dm-new-btn"
            aria-label="새 쪽지"
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              aria-hidden
            >
              <path
                d="M3 21v-4l12-12 4 4L7 21H3Z"
                stroke="currentColor"
                strokeWidth="1.7"
                strokeLinejoin="round"
              />
              <path d="m13 6 4 4" stroke="currentColor" strokeWidth="1.7" />
            </svg>
          </Link>
        )}
      </div>

      {status !== "authenticated" ? (
        <div className="blessing-mychurch-empty">
          <div className="blessing-mychurch-empty-icon" aria-hidden>
            ✉️
          </div>
          <div className="blessing-mychurch-empty-title">
            로그인하고 쪽지 주고받기
          </div>
          <div className="blessing-mychurch-empty-msg">
            성도님들과 1:1로 따뜻한 이야기를 나눠보세요.
          </div>
          <Link href="/auth" className="blessing-btn-primary">
            로그인
          </Link>
        </div>
      ) : isLoading && !threads ? (
        <div className="blessing-loading">
          <div className="blessing-spinner" aria-label="Loading" />
        </div>
      ) : filtered.length === 0 ? (
        <div
          className="blessing-event-detail-missing"
          style={{ minHeight: 200 }}
        >
          <div>
            {query.trim()
              ? "검색 결과가 없어요."
              : "아직 받은 쪽지가 없어요."}
          </div>
        </div>
      ) : (
        <div className="blessing-dm-list">
          {filtered.map((t) => {
            const sentByMe =
              t.lastMessage.sender_id !== t.otherUserId;
            const previewPrefix = sentByMe ? "나: " : "";
            return (
              <Link
                key={t.otherUserId}
                href={`/messages/${t.otherUserId}`}
                className="blessing-dm-row"
              >
                <div className="blessing-dm-avatar-wrap">
                  <Avatar
                    name={t.otherUsername}
                    size={46}
                    seed={t.otherUserId * 11}
                  />
                </div>
                <div className="blessing-dm-body">
                  <div className="blessing-dm-head">
                    <span className="blessing-dm-name">
                      {t.otherUsername}
                      {t.otherAffiliation && (
                        <span className="blessing-dm-church">
                          {" "}
                          · {t.otherAffiliation}
                        </span>
                      )}
                    </span>
                    <span className="blessing-dm-time">
                      {formatTimeAgo(t.lastMessage.created_at)}
                    </span>
                  </div>
                  <div className="blessing-dm-preview-line">
                    <span className="blessing-dm-preview">
                      {previewPrefix}
                      {t.lastMessage.content}
                    </span>
                    {t.unread > 0 && (
                      <span className="blessing-dm-unread">{t.unread}</span>
                    )}
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
      <div style={{ height: 40 }} />
    </div>
  );
}
