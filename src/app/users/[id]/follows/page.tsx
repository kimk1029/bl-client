"use client";

import { Suspense, use, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";
import useSWR from "swr";
import { toast } from "sonner";
import Avatar from "@/components/common/Avatar";

interface FollowRow {
  id: number;
  username: string;
  affiliation: string | null;
  isMe: boolean;
  followedByMe: boolean;
}

type Tab = "followers" | "following";

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

function FollowsInner({ userId }: { userId: number }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initial: Tab =
    searchParams.get("tab") === "following" ? "following" : "followers";
  const [tab, setTab] = useState<Tab>(initial);
  const { data: session } = useSession();
  const token = (session as { accessToken?: string } | null)?.accessToken;

  const { data, isLoading, mutate } = useSWR<FollowRow[]>(
    `/api/users/${userId}/follows?tab=${tab}`,
    async (u: string) => {
      const res = await fetch(u, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (!res.ok) throw new Error("fetch fail");
      return res.json();
    },
  );

  const onToggle = async (row: FollowRow) => {
    if (!token) {
      toast.error("로그인 후 이용해 주세요.");
      router.push("/auth");
      return;
    }
    try {
      const res = await fetch("/api/follow", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ targetId: row.id }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err?.error || "실패");
      }
      mutate();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "요청 실패");
    }
  };

  const rows = Array.isArray(data) ? data : [];

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
          <div className="blessing-dm-title">팔로우</div>
          <div className="blessing-dm-subtitle">Followers / Following</div>
        </div>
        <div className="blessing-detail-topbar-actions">
          <span style={{ width: 36 }} aria-hidden />
        </div>
      </header>

      <div className="blessing-hub-tabs">
        <button
          type="button"
          className={`blessing-hub-tab ${tab === "followers" ? "blessing-hub-tab-active" : ""}`}
          onClick={() => setTab("followers")}
        >
          <span className="blessing-cell-tab-icon" aria-hidden>👥</span>
          <span>팔로워</span>
        </button>
        <button
          type="button"
          className={`blessing-hub-tab ${tab === "following" ? "blessing-hub-tab-active" : ""}`}
          onClick={() => setTab("following")}
        >
          <span className="blessing-cell-tab-icon" aria-hidden>🫂</span>
          <span>팔로잉</span>
        </button>
      </div>

      {isLoading && !data ? (
        <div className="blessing-loading">
          <div className="blessing-spinner" aria-label="Loading" />
        </div>
      ) : rows.length === 0 ? (
        <div
          className="blessing-event-detail-missing"
          style={{ minHeight: 200 }}
        >
          <div>
            {tab === "followers"
              ? "아직 팔로워가 없어요."
              : "팔로우 중인 성도가 없어요."}
          </div>
        </div>
      ) : (
        <div className="blessing-dm-list">
          {rows.map((r) => (
            <div key={r.id} className="blessing-dm-row blessing-follow-row">
              <Link
                href={`/users/${r.id}`}
                className="blessing-follow-row-left"
                style={{ textDecoration: "none", color: "inherit" }}
              >
                <Avatar name={r.username} size={44} seed={r.id * 13} />
                <div className="blessing-dm-body">
                  <div className="blessing-dm-head">
                    <span className="blessing-dm-name">
                      {r.username}
                      {r.affiliation && (
                        <span className="blessing-dm-church">
                          {" "}
                          · {r.affiliation}
                        </span>
                      )}
                    </span>
                  </div>
                </div>
              </Link>
              {!r.isMe && (
                <button
                  type="button"
                  className={`blessing-btn-secondary${r.followedByMe ? " blessing-btn-secondary-on" : ""}`}
                  onClick={() => onToggle(r)}
                  style={{ minWidth: 80, height: 34, padding: "0 12px" }}
                >
                  {r.followedByMe ? "팔로우 중" : "팔로우"}
                </button>
              )}
            </div>
          ))}
        </div>
      )}
      <div style={{ height: 40 }} />
    </div>
  );
}

export default function FollowsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const userId = Number(id);
  if (!Number.isFinite(userId)) {
    return (
      <div className="blessing-home">
        <div className="blessing-event-detail-missing" style={{ minHeight: 240 }}>
          <div>잘못된 사용자입니다.</div>
        </div>
      </div>
    );
  }
  return (
    <Suspense
      fallback={
        <div className="blessing-loading">
          <div className="blessing-spinner" aria-label="Loading" />
        </div>
      }
    >
      <FollowsInner userId={userId} />
    </Suspense>
  );
}
