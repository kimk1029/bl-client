"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import useSWR from "swr";
import { toast } from "sonner";
import Avatar from "@/components/common/Avatar";
import { formatTimeAgo } from "@/components/home/lib/postAdapters";

interface VerifyRequest {
  id: number;
  church_id: number | null;
  church_name: string;
  role: string;
  method: string;
  status: "pending" | "approved" | "rejected";
  created_at: string;
  updated_at: string;
  user: {
    id: number;
    username: string;
    email: string;
    affiliation: string | null;
  } | null;
}

const METHOD_LABEL: Record<string, string> = {
  kakao: "카카오 오픈프로필",
  email: "교회 이메일",
  registry: "등록 교적",
  guarantor: "보증 2인",
};

const tokenFetcher = async (url: string, token?: string | null) => {
  const res = await fetch(url, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.error || `fetch ${url} ${res.status}`);
  }
  return res.json();
};

export default function AdminVerifyRequestsPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const token = (session as { accessToken?: string } | null)?.accessToken;
  const [tab, setTab] = useState<"pending" | "all">("pending");

  // Whoami — gate the page
  const { data: whoami, isLoading: whoamiLoading } = useSWR<{ admin: boolean }>(
    status === "authenticated" ? "/api/admin/whoami" : null,
    (u: string) => tokenFetcher(u, token),
  );

  useEffect(() => {
    if (status === "unauthenticated") router.replace("/auth");
  }, [status, router]);

  const shouldFetchList = whoami?.admin === true;
  const { data: requests, mutate } = useSWR<VerifyRequest[]>(
    shouldFetchList ? `/api/admin/verify-requests?status=${tab}` : null,
    (u: string) => tokenFetcher(u, token),
  );

  const updateStatus = async (
    id: number,
    next: "approved" | "rejected",
  ) => {
    if (!token) return;
    try {
      const res = await fetch(`/api/admin/verify-requests/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: next }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err?.error || "갱신 실패");
      }
      toast.success(next === "approved" ? "승인했어요." : "반려했어요.");
      mutate();
    } catch (err) {
      const msg = err instanceof Error ? err.message : "갱신 실패";
      toast.error(msg);
    }
  };

  if (status === "loading" || whoamiLoading) {
    return (
      <div className="blessing-home">
        <div className="blessing-loading">
          <div className="blessing-spinner" aria-label="Loading" />
        </div>
      </div>
    );
  }

  if (status !== "authenticated" || !whoami || !whoami.admin) {
    return (
      <div className="blessing-home">
        <div className="blessing-mychurch-empty">
          <div className="blessing-mychurch-empty-icon" aria-hidden>
            🔒
          </div>
          <div className="blessing-mychurch-empty-title">접근 권한 없음</div>
          <div className="blessing-mychurch-empty-msg">
            이 페이지는 blessing 운영자 전용입니다. 운영자 계정으로 로그인해
            주세요.
          </div>
          <Link href="/" className="blessing-btn-primary">
            홈으로
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="blessing-home">
      <div className="blessing-sort-bar">
        <button
          className={`blessing-sort-btn ${tab === "pending" ? "blessing-sort-btn-active" : ""}`}
          onClick={() => setTab("pending")}
        >
          대기중
        </button>
        <button
          className={`blessing-sort-btn ${tab === "all" ? "blessing-sort-btn-active" : ""}`}
          onClick={() => setTab("all")}
        >
          전체
        </button>
        <div style={{ flex: 1 }} />
        <span className="blessing-sort-meta">
          {Array.isArray(requests) ? requests.length : 0} 건
        </span>
      </div>

      {!requests ? (
        <div className="blessing-loading">
          <div className="blessing-spinner" aria-label="Loading" />
        </div>
      ) : requests.length === 0 ? (
        <div
          className="blessing-event-detail-missing"
          style={{ minHeight: 180 }}
        >
          <div>
            {tab === "pending"
              ? "대기 중인 인증 요청이 없어요."
              : "인증 요청 내역이 없어요."}
          </div>
        </div>
      ) : (
        <div className="blessing-admin-list">
          {requests.map((r) => (
            <div key={r.id} className="blessing-admin-row">
              <div className="blessing-admin-row-head">
                <Avatar
                  name={r.user?.username ?? "?"}
                  seed={r.user?.id ?? r.id}
                  size={40}
                />
                <div className="blessing-admin-row-head-info">
                  <div className="blessing-admin-row-user">
                    {r.user?.username ?? "(탈퇴 사용자)"}
                    <span className="blessing-admin-row-user-email">
                      {r.user?.email ?? ""}
                    </span>
                  </div>
                  <div className="blessing-admin-row-meta">
                    {formatTimeAgo(r.created_at)} 전 요청 ·{" "}
                    <span
                      className={`blessing-admin-status blessing-admin-status-${r.status}`}
                    >
                      {r.status === "pending"
                        ? "대기"
                        : r.status === "approved"
                          ? "승인"
                          : "반려"}
                    </span>
                  </div>
                </div>
              </div>
              <dl className="blessing-admin-row-body">
                <div>
                  <dt>교회</dt>
                  <dd>
                    {r.church_name}
                    {r.church_id && (
                      <span className="blessing-admin-row-id">
                        #{r.church_id}
                      </span>
                    )}
                  </dd>
                </div>
                <div>
                  <dt>역할</dt>
                  <dd>{r.role}</dd>
                </div>
                <div>
                  <dt>방법</dt>
                  <dd>{METHOD_LABEL[r.method] ?? r.method}</dd>
                </div>
              </dl>
              <div className="blessing-admin-row-actions">
                <button
                  type="button"
                  className="blessing-btn-secondary"
                  onClick={() => updateStatus(r.id, "rejected")}
                  disabled={r.status === "rejected"}
                >
                  반려
                </button>
                <button
                  type="button"
                  className="blessing-btn-primary"
                  onClick={() => updateStatus(r.id, "approved")}
                  disabled={r.status === "approved"}
                >
                  승인
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
      <div style={{ height: 40 }} />
    </div>
  );
}
