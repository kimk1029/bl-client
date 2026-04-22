"use client";

import { useSession } from "next-auth/react";
import useSWR from "swr";
import { isUnread, useNotifsLastReadAt } from "@/lib/notifsRead";

interface ThreadItem {
  otherUserId: number;
  unread: number;
}
interface NotificationItem {
  id: string;
  created_at: string;
}

const tokenFetcher = async (url: string, token?: string | null) => {
  const res = await fetch(url, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
  if (!res.ok) throw new Error(`fetch ${url} ${res.status}`);
  return res.json();
};

/**
 * Aggregated unread counts for the global header bell.
 * - messages: sum of `unread` across threads
 * - notifications: items with created_at newer than the local lastReadAt
 * Polls every 30s for both sources — cheap background refresh.
 */
export function useUnreadCounts(): {
  total: number;
  messages: number;
  notifications: number;
  ready: boolean;
} {
  const { data: session, status } = useSession();
  const token = (session as { accessToken?: string } | null)?.accessToken;
  const isAuth = status === "authenticated";

  const { data: threads } = useSWR<ThreadItem[]>(
    isAuth ? "/api/messages" : null,
    (u: string) => tokenFetcher(u, token),
    { refreshInterval: 30_000, revalidateOnFocus: true, dedupingInterval: 5_000 },
  );
  const { data: notifs } = useSWR<NotificationItem[]>(
    isAuth ? "/api/notifications" : null,
    (u: string) => tokenFetcher(u, token),
    { refreshInterval: 30_000, revalidateOnFocus: true, dedupingInterval: 5_000 },
  );
  const lastReadAt = useNotifsLastReadAt();

  const messages = Array.isArray(threads)
    ? threads.reduce((acc, t) => acc + (t.unread ?? 0), 0)
    : 0;
  const notifications = Array.isArray(notifs)
    ? notifs.filter((n) => isUnread(n.created_at, lastReadAt)).length
    : 0;

  return {
    total: messages + notifications,
    messages,
    notifications,
    ready: isAuth,
  };
}
