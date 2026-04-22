"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import useSWR from "swr";
import Link from "next/link";
import { toast } from "sonner";
import Avatar from "@/components/common/Avatar";
import { formatTimeAgo } from "@/components/home/lib/postAdapters";
import { apiFetcher } from "@/lib/fetcher";
import type { EventItem } from "@/types/type";
import {
  useEventBookmarks,
} from "@/lib/eventBookmarks";
import { resolveEventDate } from "@/lib/eventDate";
import {
  isUnread,
  notifsRead,
  useNotifsLastReadAt,
} from "@/lib/notifsRead";

type NotifType =
  | "reply"
  | "mention"
  | "like"
  | "prayer"
  | "system"
  | "event";

interface NotificationItem {
  id: string;
  type: NotifType;
  who: string;
  action: string;
  preview?: string | null;
  on?: string | null;
  postId?: number | null;
  commentId?: number | null;
  eventId?: number | null;
  created_at: string;
}

const NOTIF_EMOJI: Record<NotifType, string> = {
  reply: "💬",
  mention: "@",
  like: "❤",
  prayer: "🙏",
  system: "✞",
  event: "📅",
};

const tokenFetcher = async (url: string, token?: string | null) => {
  const res = await fetch(url, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
  if (!res.ok) throw new Error(`fetch ${url} ${res.status}`);
  return res.json();
};

function buildEventReminders(
  events: EventItem[],
  bookmarks: ReadonlySet<number>,
): NotificationItem[] {
  if (events.length === 0 || bookmarks.size === 0) return [];
  const now = new Date();
  const horizonMs = 7 * 24 * 60 * 60 * 1000;
  const items: NotificationItem[] = [];
  for (const e of events) {
    if (!bookmarks.has(e.id)) continue;
    const d = resolveEventDate(e, now);
    if (!d) continue;
    const diff = d.getTime() - now.getTime();
    if (diff < -24 * 60 * 60 * 1000 || diff > horizonMs) continue;
    const days = Math.round(diff / (24 * 60 * 60 * 1000));
    const label =
      days <= 0
        ? "오늘 열리는 이벤트예요"
        : days === 1
        ? "내일 열리는 이벤트예요"
        : `D-${days} · 찜한 이벤트가 다가와요`;
    items.push({
      id: `event:${e.id}`,
      type: "event",
      who: "blessing",
      action: label,
      preview: e.title,
      on: e.location ?? undefined,
      eventId: e.id,
      // Weight reminders slightly later so they sort between newest replies.
      created_at: d.toISOString(),
    });
  }
  return items;
}

function NotifRow({
  n,
  unread,
  onOpen,
}: {
  n: NotificationItem;
  unread: boolean;
  onOpen: () => void;
}) {
  return (
    <button
      type="button"
      className={`blessing-notif-row${unread ? " blessing-notif-unread" : ""}`}
      onClick={onOpen}
    >
      <div className="blessing-notif-icon-wrap">
        <Avatar name={n.who} size={36} seed={Number(n.id.split(":")[1] ?? 1) || 1} />
        <span className={`blessing-notif-type-badge blessing-notif-type-${n.type}`}>
          {NOTIF_EMOJI[n.type]}
        </span>
      </div>
      <div className="blessing-notif-body">
        <div className="blessing-notif-text">
          <strong>{n.who}</strong> {n.action}
        </div>
        {n.preview && (
          <div className="blessing-notif-preview">&ldquo;{n.preview}&rdquo;</div>
        )}
        {n.on && <div className="blessing-notif-on">› {n.on}</div>}
        <div className="blessing-notif-time">
          {formatTimeAgo(n.created_at)} 전
        </div>
      </div>
      {unread && <span className="blessing-notif-dot-mark" aria-hidden />}
    </button>
  );
}

export default function NotificationsPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const token = (session as { accessToken?: string } | null)?.accessToken;

  useEffect(() => {
    if (status === "unauthenticated") {
      router.replace("/auth");
    }
  }, [status, router]);

  const lastReadAt = useNotifsLastReadAt();
  const bookmarks = useEventBookmarks();
  const [filter, setFilter] = useState<"all" | "unread">("all");

  const { data: notifs, isLoading } = useSWR<NotificationItem[]>(
    status === "authenticated" ? "/api/notifications" : null,
    (url: string) => tokenFetcher(url, token),
  );

  const { data: events } = useSWR<EventItem[]>("/api/events", apiFetcher);

  const allItems = useMemo(() => {
    const base = Array.isArray(notifs) ? notifs : [];
    const reminders = buildEventReminders(
      Array.isArray(events) ? events : [],
      bookmarks,
    );
    const merged = [...base, ...reminders];
    merged.sort(
      (a, b) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
    );
    return merged;
  }, [notifs, events, bookmarks]);

  const unreadCount = useMemo(
    () => allItems.filter((n) => isUnread(n.created_at, lastReadAt)).length,
    [allItems, lastReadAt],
  );

  const filtered =
    filter === "unread"
      ? allItems.filter((n) => isUnread(n.created_at, lastReadAt))
      : allItems;

  const openNotif = (n: NotificationItem) => {
    if (n.postId != null) {
      router.push(`/posts/${n.postId}`);
    } else if (n.eventId != null) {
      router.push(`/events/${n.eventId}`);
    }
  };

  const markAllRead = () => {
    notifsRead.markAllRead();
    toast.success("모든 알림을 읽음으로 표시했어요.");
  };

  return (
    <div className="blessing-home">
      <div className="blessing-sort-bar">
        <button
          className={`blessing-sort-btn ${filter === "all" ? "blessing-sort-btn-active" : ""}`}
          onClick={() => setFilter("all")}
        >
          전체 {allItems.length}
        </button>
        <button
          className={`blessing-sort-btn ${filter === "unread" ? "blessing-sort-btn-active" : ""}`}
          onClick={() => setFilter("unread")}
        >
          안 읽음 {unreadCount}
        </button>
        <div style={{ flex: 1 }} />
        <button
          className="blessing-sort-btn"
          onClick={markAllRead}
          disabled={unreadCount === 0}
        >
          모두 읽음
        </button>
      </div>

      {status !== "authenticated" ? (
        <div className="blessing-mychurch-empty">
          <div className="blessing-mychurch-empty-icon" aria-hidden>
            🔔
          </div>
          <div className="blessing-mychurch-empty-title">
            로그인하고 알림 확인하기
          </div>
          <div className="blessing-mychurch-empty-msg">
            내 글·댓글에 달린 반응과 찜한 이벤트 소식을 이곳에서 받아볼 수 있어요.
          </div>
          <Link href="/auth" className="blessing-btn-primary">
            로그인
          </Link>
        </div>
      ) : isLoading && !notifs ? (
        <div className="blessing-loading">
          <div className="blessing-spinner" aria-label="Loading" />
        </div>
      ) : filtered.length === 0 ? (
        <div
          className="blessing-event-detail-missing"
          style={{ minHeight: 240 }}
        >
          <div>
            {filter === "unread"
              ? "읽지 않은 알림이 없어요."
              : "아직 받은 알림이 없어요."}
          </div>
        </div>
      ) : (
        <div className="blessing-notif-list">
          {filtered.map((n) => (
            <NotifRow
              key={n.id}
              n={n}
              unread={isUnread(n.created_at, lastReadAt)}
              onOpen={() => openNotif(n)}
            />
          ))}
        </div>
      )}
      <div style={{ height: 40 }} />
    </div>
  );
}
