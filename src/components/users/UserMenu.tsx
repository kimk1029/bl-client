"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { toast } from "sonner";
import Avatar from "@/components/common/Avatar";

interface UserMenuProps {
  open: boolean;
  onClose: () => void;
  userId: number;
  username: string;
  affiliation?: string | null;
}

type RelationState = {
  isMe: boolean;
  followed: boolean;
  blocked: boolean;
  blockedMe: boolean;
};

interface ReportOption {
  id: string;
  label: string;
}

const REPORT_REASONS: ReportOption[] = [
  { id: "spam", label: "스팸·광고" },
  { id: "harassment", label: "비방·괴롭힘" },
  { id: "inappropriate", label: "부적절한 내용" },
  { id: "impersonation", label: "사칭·가짜 계정" },
  { id: "other", label: "기타" },
];

export default function UserMenu({
  open,
  onClose,
  userId,
  username,
  affiliation,
}: UserMenuProps) {
  const router = useRouter();
  const { data: session } = useSession();
  const token = (session as { accessToken?: string } | null)?.accessToken;

  const [rel, setRel] = useState<RelationState>({
    isMe: false,
    followed: false,
    blocked: false,
    blockedMe: false,
  });
  const [mode, setMode] = useState<"menu" | "report" | "block">("menu");
  const [reason, setReason] = useState<string>("spam");
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);

  // Hydrate relationship flags whenever the sheet opens.
  useEffect(() => {
    if (!open) return;
    setMode("menu");
    setNote("");
    setReason("spam");
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(`/api/users/${userId}`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
        if (!res.ok) return;
        const data = (await res.json()) as { relation?: Partial<RelationState> };
        if (cancelled || !data?.relation) return;
        setRel({
          isMe: !!data.relation.isMe,
          followed: !!data.relation.followed,
          blocked: !!data.relation.blocked,
          blockedMe: !!data.relation.blockedMe,
        });
      } catch {
        // ignore
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [open, userId, token]);

  // Close on ESC
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  const requireAuth = (): boolean => {
    if (!session || !token) {
      toast.error("로그인 후 이용할 수 있어요.");
      router.push("/auth");
      onClose();
      return false;
    }
    return true;
  };

  const go = (href: string) => {
    onClose();
    router.push(href);
  };

  const onFollow = async () => {
    if (!requireAuth() || busy) return;
    setBusy(true);
    try {
      const res = await fetch("/api/follow", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token!}`,
        },
        body: JSON.stringify({ targetId: userId }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err?.error || "실패");
      }
      const json = (await res.json()) as { followed: boolean };
      setRel((r) => ({ ...r, followed: json.followed }));
      toast.success(json.followed ? `${username}님을 팔로우했어요.` : "팔로우를 해제했어요.");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "요청 실패");
    } finally {
      setBusy(false);
    }
  };

  const onBlockConfirm = async () => {
    if (!requireAuth() || busy) return;
    setBusy(true);
    try {
      const res = await fetch("/api/block", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token!}`,
        },
        body: JSON.stringify({ targetId: userId }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err?.error || "실패");
      }
      const json = (await res.json()) as { blocked: boolean };
      setRel((r) => ({ ...r, blocked: json.blocked, followed: false }));
      toast.success(json.blocked ? `${username}님을 차단했어요.` : "차단을 해제했어요.");
      onClose();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "요청 실패");
    } finally {
      setBusy(false);
    }
  };

  const onReportSubmit = async () => {
    if (!requireAuth() || busy) return;
    setBusy(true);
    try {
      const res = await fetch("/api/report", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token!}`,
        },
        body: JSON.stringify({
          target_type: "user",
          target_id: userId,
          reason,
          note: note.trim() || undefined,
        }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err?.error || "실패");
      }
      toast.success("신고가 접수됐어요. 검토 후 조치할게요.");
      onClose();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "요청 실패");
    } finally {
      setBusy(false);
    }
  };

  const sheetTitle =
    mode === "menu"
      ? rel.isMe
        ? "내 계정"
        : `${username}`
      : mode === "report"
        ? "신고하기"
        : "차단 확인";

  return (
    <div
      className="blessing-user-sheet-backdrop"
      role="dialog"
      aria-modal="true"
      aria-label={sheetTitle}
      onClick={onClose}
    >
      <div
        className="blessing-user-sheet"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="blessing-user-sheet-handle" aria-hidden />
        <div className="blessing-user-sheet-head">
          <Avatar name={username} seed={userId * 13} size={44} />
          <div className="blessing-user-sheet-head-info">
            <div className="blessing-user-sheet-name">{username}</div>
            {affiliation && (
              <div className="blessing-user-sheet-sub">{affiliation}</div>
            )}
          </div>
        </div>

        {mode === "menu" && (
          <div className="blessing-user-sheet-menu">
            <button
              type="button"
              className="blessing-user-sheet-item"
              onClick={() => go(`/users/${userId}`)}
            >
              <span>👤</span>
              <span>프로필 보기</span>
            </button>
            <button
              type="button"
              className="blessing-user-sheet-item"
              onClick={() => go(`/users/${userId}#posts`)}
            >
              <span>📝</span>
              <span>쓴 글 보기</span>
            </button>
            <button
              type="button"
              className="blessing-user-sheet-item"
              onClick={() => go(`/users/${userId}/follows?tab=followers`)}
            >
              <span>🫂</span>
              <span>팔로워 · 팔로잉</span>
            </button>

            {rel.isMe ? (
              <>
                <div className="blessing-user-sheet-divider" />
                <button
                  type="button"
                  className="blessing-user-sheet-item"
                  onClick={() => go("/profile")}
                >
                  <span>⚙</span>
                  <span>내 정보 관리</span>
                </button>
                <button
                  type="button"
                  className="blessing-user-sheet-item blessing-user-sheet-item-danger"
                  onClick={() => {
                    onClose();
                    signOut({ callbackUrl: "/" });
                  }}
                >
                  <span>🚪</span>
                  <span>로그아웃</span>
                </button>
              </>
            ) : (
              <>
                <div className="blessing-user-sheet-divider" />
                <button
                  type="button"
                  className="blessing-user-sheet-item"
                  disabled={busy || rel.blocked || rel.blockedMe}
                  onClick={() => go(`/messages/${userId}`)}
                >
                  <span>✉️</span>
                  <span>쪽지 보내기</span>
                </button>
                <button
                  type="button"
                  className={`blessing-user-sheet-item${rel.followed ? " blessing-user-sheet-item-on" : ""}`}
                  disabled={busy || rel.blocked || rel.blockedMe}
                  onClick={onFollow}
                >
                  <span>{rel.followed ? "✓" : "＋"}</span>
                  <span>{rel.followed ? "팔로우 중" : "팔로우"}</span>
                </button>
                <div className="blessing-user-sheet-divider" />
                <button
                  type="button"
                  className="blessing-user-sheet-item blessing-user-sheet-item-danger"
                  onClick={() => setMode("report")}
                >
                  <span>🚩</span>
                  <span>신고하기</span>
                </button>
                <button
                  type="button"
                  className="blessing-user-sheet-item blessing-user-sheet-item-danger"
                  onClick={() => setMode("block")}
                >
                  <span>🚫</span>
                  <span>{rel.blocked ? "차단 해제" : "차단하기"}</span>
                </button>
              </>
            )}
          </div>
        )}

        {mode === "report" && (
          <div className="blessing-user-sheet-form">
            <div className="blessing-user-sheet-sectiontitle">신고 사유</div>
            <div className="blessing-report-reasons">
              {REPORT_REASONS.map((r) => (
                <button
                  type="button"
                  key={r.id}
                  className={`blessing-report-reason${reason === r.id ? " blessing-report-reason-on" : ""}`}
                  onClick={() => setReason(r.id)}
                >
                  {r.label}
                </button>
              ))}
            </div>
            <div className="blessing-user-sheet-sectiontitle">상세 내용 (선택)</div>
            <textarea
              className="blessing-report-note"
              placeholder="구체적인 상황을 알려주시면 판단에 도움이 돼요. (최대 500자)"
              maxLength={500}
              value={note}
              onChange={(e) => setNote(e.target.value)}
            />
            <div className="blessing-user-sheet-actions">
              <button
                type="button"
                className="blessing-btn-secondary"
                onClick={() => setMode("menu")}
                disabled={busy}
              >
                돌아가기
              </button>
              <button
                type="button"
                className="blessing-btn-primary"
                onClick={onReportSubmit}
                disabled={busy}
              >
                {busy ? "전송 중..." : "신고 보내기"}
              </button>
            </div>
          </div>
        )}

        {mode === "block" && (
          <div className="blessing-user-sheet-form">
            <p className="blessing-user-sheet-copy">
              {rel.blocked
                ? `${username}님의 차단을 해제할까요? 해제 후 다시 서로의 글·프로필을 볼 수 있어요.`
                : `${username}님을 차단하면 이 계정의 글·댓글·쪽지가 서로 보이지 않아요. 설정에서 언제든 해제할 수 있어요.`}
            </p>
            <div className="blessing-user-sheet-actions">
              <button
                type="button"
                className="blessing-btn-secondary"
                onClick={() => setMode("menu")}
                disabled={busy}
              >
                취소
              </button>
              <button
                type="button"
                className={rel.blocked ? "blessing-btn-primary" : "blessing-btn-danger"}
                onClick={onBlockConfirm}
                disabled={busy}
              >
                {busy ? "처리 중..." : rel.blocked ? "차단 해제" : "차단하기"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
