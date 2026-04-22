"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import useSWR, { mutate as swrMutate } from "swr";
import { toast } from "sonner";
import Avatar from "@/components/common/Avatar";

interface ThreadListItem {
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

interface ThreadMessage {
  id: number;
  content: string;
  created_at: string;
  read_at: string | null;
  sender_id: number;
  receiver_id: number;
}
interface ThreadPayload {
  other: { id: number; username: string; affiliation: string | null };
  messages: ThreadMessage[];
}

const tokenFetcher = async (url: string, token?: string | null) => {
  const res = await fetch(url, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
  if (!res.ok) throw new Error(`fetch ${url} ${res.status}`);
  return res.json();
};

function IconBack() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M15 6l-6 6 6 6"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
function IconPlus() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M12 5v14M5 12h14"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

function formatClock(iso: string): string {
  const d = new Date(iso);
  const hh = d.getHours();
  const mm = String(d.getMinutes()).padStart(2, "0");
  const ampm = hh >= 12 ? "오후" : "오전";
  const h12 = ((hh + 11) % 12) + 1;
  return `${ampm} ${h12}:${mm}`;
}

function dateLabel(iso: string, todayISO: string): string {
  const d = new Date(iso);
  const t = new Date(todayISO);
  if (
    d.getFullYear() === t.getFullYear() &&
    d.getMonth() === t.getMonth() &&
    d.getDate() === t.getDate()
  ) {
    return "오늘";
  }
  const yy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yy}.${mm}.${dd}`;
}

export default function MessageThreadPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const router = useRouter();
  const { data: session, status } = useSession();
  const token = (session as { accessToken?: string } | null)?.accessToken;
  const { id } = use(params);
  const otherId = Number(id);

  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const [todayISO, setTodayISO] = useState<string>("");
  useEffect(() => {
    setTodayISO(new Date().toISOString());
  }, []);

  const url = `/api/messages/${otherId}`;
  const { data, isLoading, error, mutate } = useSWR<ThreadPayload>(
    status === "authenticated" && Number.isFinite(otherId) ? url : null,
    (u: string) => tokenFetcher(u, token),
    { refreshInterval: 8000 },
  );

  // Mark as read once when the thread opens + whenever unread messages arrive.
  useEffect(() => {
    if (!data || !token) return;
    const hasUnread = data.messages.some(
      (m) => m.receiver_id !== otherId && m.read_at == null,
    );
    if (!hasUnread) return;
    fetch(url, {
      method: "PATCH",
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => {
        if (!res.ok) return;
        // Optimistically zero this thread's unread badge so the inbox/nav
        // updates instantly (polling will reconcile within 15s).
        swrMutate<ThreadListItem[] | undefined>(
          "/api/messages",
          (current) =>
            current
              ? current.map((t) =>
                  t.otherUserId === otherId ? { ...t, unread: 0 } : t,
                )
              : current,
          { revalidate: false },
        );
      })
      .catch(() => {});
  }, [data, token, url, otherId]);

  if (!Number.isFinite(otherId)) {
    return (
      <div className="blessing-home">
        <div className="blessing-event-detail-missing" style={{ minHeight: 240 }}>
          <div>잘못된 상대예요.</div>
          <Link href="/messages" className="blessing-section-more">
            ← 쪽지함
          </Link>
        </div>
      </div>
    );
  }

  if (status !== "authenticated") {
    return (
      <div className="blessing-home">
        <div className="blessing-mychurch-empty">
          <div className="blessing-mychurch-empty-icon" aria-hidden>
            ✉️
          </div>
          <div className="blessing-mychurch-empty-title">로그인이 필요해요</div>
          <div className="blessing-mychurch-empty-msg">
            쪽지 대화를 확인하려면 로그인해 주세요.
          </div>
          <Link href="/auth" className="blessing-btn-primary">
            로그인
          </Link>
        </div>
      </div>
    );
  }

  if (isLoading && !data) {
    return (
      <div className="blessing-home">
        <div className="blessing-loading">
          <div className="blessing-spinner" aria-label="Loading" />
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="blessing-home">
        <div className="blessing-event-detail-missing" style={{ minHeight: 240 }}>
          <div>대화를 불러올 수 없어요.</div>
          <Link href="/messages" className="blessing-section-more">
            ← 쪽지함
          </Link>
        </div>
      </div>
    );
  }

  const myId = (session?.user as { id?: number } | undefined)?.id ?? -1;
  const other = data.other;
  const title = other.username;
  const subtitle = other.affiliation ?? "범교회";

  const send = async (e: React.FormEvent) => {
    e.preventDefault();
    const v = text.trim();
    if (!v || sending) return;
    setSending(true);
    try {
      const res = await fetch("/api/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ to: otherId, content: v }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err?.error || "전송 실패");
      }
      setText("");
      mutate();
    } catch (err) {
      const msg = err instanceof Error ? err.message : "전송 실패";
      toast.error(msg);
    } finally {
      setSending(false);
    }
  };

  // Group messages with date dividers
  const renderedNodes: Array<
    { kind: "divider"; label: string; key: string } | { kind: "bubble"; m: ThreadMessage; showAvatar: boolean; key: string }
  > = [];
  let prevDay = "";
  data.messages.forEach((m, idx) => {
    const day = m.created_at.slice(0, 10);
    if (day !== prevDay) {
      renderedNodes.push({
        kind: "divider",
        label: dateLabel(m.created_at, todayISO || m.created_at),
        key: `d-${day}-${idx}`,
      });
      prevDay = day;
    }
    const fromMe = m.sender_id === myId;
    const prev = data.messages[idx - 1];
    const showAvatar =
      !fromMe && (!prev || prev.sender_id !== m.sender_id || prev.created_at.slice(0, 10) !== day);
    renderedNodes.push({
      kind: "bubble",
      m,
      showAvatar,
      key: `m-${m.id}`,
    });
  });

  return (
    <div className="blessing-detail">
      <header className="blessing-detail-topbar">
        <button
          type="button"
          className="blessing-detail-icon-btn"
          onClick={() => router.back()}
          aria-label="뒤로가기"
        >
          <IconBack />
        </button>
        <div className="blessing-detail-topbar-title-wrap">
          <div className="blessing-dm-title">{title}</div>
          <div className="blessing-dm-subtitle">{subtitle}</div>
        </div>
        <div className="blessing-detail-topbar-actions">
          <button
            type="button"
            className="blessing-detail-icon-btn"
            aria-label="더보기"
          >
            <span style={{ fontSize: 18, lineHeight: 1 }}>⋯</span>
          </button>
        </div>
      </header>

      <div className="blessing-thread-area">
        {renderedNodes.length === 0 ? (
          <div
            style={{
              textAlign: "center",
              padding: "48px 12px",
              color: "var(--blessing-fg-2)",
              fontSize: 13,
            }}
          >
            첫 쪽지를 보내보세요.
          </div>
        ) : (
          renderedNodes.map((node) => {
            if (node.kind === "divider") {
              return (
                <div key={node.key} className="blessing-thread-date-divider">
                  <span>{node.label}</span>
                </div>
              );
            }
            const m = node.m;
            const fromMe = m.sender_id === myId;
            return (
              <div
                key={node.key}
                className={`blessing-bubble-row blessing-bubble-${fromMe ? "me" : "them"}`}
              >
                {!fromMe &&
                  (node.showAvatar ? (
                    <Avatar
                      name={other.username}
                      size={28}
                      seed={other.id * 11}
                    />
                  ) : (
                    <div style={{ width: 28, flexShrink: 0 }} />
                  ))}
                <div
                  className={`blessing-bubble blessing-bubble-${fromMe ? "me" : "them"}-body`}
                >
                  {m.content}
                </div>
                <span className="blessing-bubble-time">{formatClock(m.created_at)}</span>
              </div>
            );
          })
        )}
      </div>

      <form className="blessing-comment-compose" onSubmit={send}>
        <button
          type="button"
          className="blessing-detail-icon-btn"
          aria-label="첨부"
        >
          <IconPlus />
        </button>
        <input
          type="text"
          placeholder="쪽지 입력…"
          value={text}
          onChange={(e) => setText(e.target.value)}
          aria-label="쪽지 입력"
          disabled={sending}
        />
        <button
          type="submit"
          className="blessing-comment-submit"
          disabled={sending || !text.trim()}
        >
          {sending ? "전송 중..." : "전송"}
        </button>
      </form>
    </div>
  );
}
