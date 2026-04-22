"use client";

import { useMemo, useState, useSyncExternalStore } from "react";
import Link from "next/link";
import useSWR from "swr";
import type { EventItem, Post } from "@/types/type";
import PostRow from "@/components/home/PostRow";
import { DetailHeader } from "@/components/layout/DetailHeader";
import { Button, EmptyState } from "@/components/ui";
import { useEventBookmarks } from "@/lib/eventBookmarks";
import {
  formatEventDate,
  resolveEventDate,
} from "@/lib/eventDate";
import { apiFetcher } from "@/lib/fetcher";
import { postBookmarks } from "@/lib/postBookmarks";

type Tab = "posts" | "events";

function usePostBookmarkIds(): ReadonlyArray<number> {
  const set = useSyncExternalStore(
    postBookmarks.subscribe,
    postBookmarks.get,
    postBookmarks.getServer,
  );
  return useMemo(() => Array.from(set).sort((a, b) => b - a), [set]);
}

export default function BookmarksPage() {
  const [tab, setTab] = useState<Tab>("posts");

  const postIds = usePostBookmarkIds();
  const eventSet = useEventBookmarks();
  const eventIds = useMemo(
    () => Array.from(eventSet).sort((a, b) => b - a),
    [eventSet],
  );

  const postsKey =
    postIds.length > 0 ? `/api/posts/by-ids?ids=${postIds.join(",")}` : null;
  const eventsKey =
    eventIds.length > 0
      ? `/api/events/by-ids?ids=${eventIds.join(",")}`
      : null;

  const { data: posts, isLoading: postsLoading } = useSWR<Post[]>(
    postsKey,
    apiFetcher,
  );
  const { data: events, isLoading: eventsLoading } = useSWR<EventItem[]>(
    eventsKey,
    apiFetcher,
  );

  const postList = Array.isArray(posts) ? posts : [];
  const eventList = Array.isArray(events) ? events : [];

  return (
    <div className="blessing-detail">
      <DetailHeader title="북마크" subtitle="Bookmarks" />

      <div className="blessing-hub-tabs">
        <button
          type="button"
          className={`blessing-hub-tab ${tab === "posts" ? "blessing-hub-tab-active" : ""}`}
          onClick={() => setTab("posts")}
        >
          글
          <span className="blessing-hub-tab-count">{postIds.length}</span>
        </button>
        <button
          type="button"
          className={`blessing-hub-tab ${tab === "events" ? "blessing-hub-tab-active" : ""}`}
          onClick={() => setTab("events")}
        >
          이벤트
          <span className="blessing-hub-tab-count">{eventIds.length}</span>
        </button>
      </div>

      {tab === "posts" ? (
        postIds.length === 0 ? (
          <EmptyState
            icon="🔖"
            title="북마크한 글이 없어요"
            message="게시글 상세에서 북마크 아이콘을 눌러 저장해 보세요."
            action={<Button href="/posts">게시판 둘러보기</Button>}
            minHeight={320}
          />
        ) : postsLoading && !posts ? (
          <div className="blessing-loading">
            <div className="blessing-spinner" aria-label="Loading" />
          </div>
        ) : (
          <div className="blessing-hot-list">
            {postList.map((p) => (
              <PostRow key={p.id} post={p} />
            ))}
            {postList.length < postIds.length && (
              <div className="blessing-bookmark-missing">
                일부 글은 삭제되어 표시되지 않아요.
              </div>
            )}
          </div>
        )
      ) : eventIds.length === 0 ? (
        <EmptyState
          icon="📅"
          title="찜한 이벤트가 없어요"
          message="이벤트 카드에서 찜 아이콘을 눌러 저장해 보세요."
          action={<Button href="/events">이벤트 보러 가기</Button>}
          minHeight={320}
        />
      ) : eventsLoading && !events ? (
        <div className="blessing-loading">
          <div className="blessing-spinner" aria-label="Loading" />
        </div>
      ) : (
        <div className="blessing-event-list">
          {eventList.map((e) => {
            const d = resolveEventDate(e);
            const dateLabel = d ? formatEventDate(d) : e.date_text;
            return (
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
                      {dateLabel}
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
                </Link>
              </div>
            );
          })}
          {eventList.length < eventIds.length && (
            <div className="blessing-bookmark-missing">
              일부 이벤트는 삭제되어 표시되지 않아요.
            </div>
          )}
        </div>
      )}
      <div style={{ height: 40 }} />
    </div>
  );
}
