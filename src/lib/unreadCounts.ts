"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import useSWR, { mutate as swrMutate } from "swr";
import { isUnread, useNotifsLastReadAt } from "@/lib/notifsRead";

interface ThreadItem {
  otherUserId: number;
  unread: number;
}
interface NotificationItem {
  id: string;
  created_at: string;
}

const MSG_KEY = "/api/messages";
const NOTIF_KEY = "/api/notifications";

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
 *
 * No polling. Refresh triggers:
 *   1. Initial fetch on first mount (SWR default)
 *   2. Route change (client-side navigation) — via usePathname effect
 *   3. Window focus return (SWR `revalidateOnFocus`)
 *
 * Only the BellBadge component subscribes to this hook, so re-renders are
 * scoped — the rest of the page stays intact on refresh.
 */
export function useUnreadCounts(): {
  total: number;
  messages: number;
  notifications: number;
  ready: boolean;
} {
  const pathname = usePathname();
  const { data: session, status } = useSession();
  const token = (session as { accessToken?: string } | null)?.accessToken;
  const isAuth = status === "authenticated";

  const swrOptions = {
    revalidateOnFocus: true,
    revalidateIfStale: false,
    dedupingInterval: 3_000,
  } as const;

  const { data: threads } = useSWR<ThreadItem[]>(
    isAuth ? MSG_KEY : null,
    (u: string) => tokenFetcher(u, token),
    swrOptions,
  );
  const { data: notifs } = useSWR<NotificationItem[]>(
    isAuth ? NOTIF_KEY : null,
    (u: string) => tokenFetcher(u, token),
    swrOptions,
  );
  const lastReadAt = useNotifsLastReadAt();

  // Refresh both counts whenever the route changes. SWR's mutate is
  // component-agnostic, so only subscribers (the badge) re-render.
  useEffect(() => {
    if (!isAuth) return;
    swrMutate(MSG_KEY);
    swrMutate(NOTIF_KEY);
  }, [pathname, isAuth]);

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
