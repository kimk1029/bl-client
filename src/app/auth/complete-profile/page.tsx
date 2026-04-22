"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { toast } from "sonner";
import ChurchSearch from "@/components/ChurchSearch";

export default function CompleteProfilePage() {
  const router = useRouter();
  const { data: session, status, update } = useSession();

  const [username, setUsername] = useState("");
  const [churchName, setChurchName] = useState("");
  const [churchId, setChurchId] = useState<number | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.replace("/auth");
      return;
    }
    if (status !== "authenticated" || !session) return;
    const aff = (session.user as { affiliation?: string | null } | undefined)
      ?.affiliation;
    // Returning user who already has a church — don't force them here.
    if (aff) {
      router.replace("/");
      return;
    }
    if (session.user?.name && !username) {
      setUsername(session.user.name);
    }
  }, [session, status, router, username]);

  if (status === "loading" || status === "unauthenticated") {
    return (
      <div className="blessing-home">
        <div className="blessing-loading">
          <div className="blessing-spinner" aria-label="Loading" />
        </div>
      </div>
    );
  }

  const userId = (session?.user as { id?: number } | undefined)?.id;
  const accessToken = (session as { accessToken?: string } | null)?.accessToken;
  const canSubmit =
    !submitting && username.trim().length >= 2 && churchName.trim().length > 0;

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit || !userId || !accessToken) return;
    setSubmitting(true);
    try {
      const res = await fetch(`/api/users/account/${userId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          username: username.trim(),
          affiliation: churchName.trim(),
          church_id: churchId,
        }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err?.error || "저장 실패");
      }
      const updated = (await res.json()) as {
        username?: string;
        affiliation?: string | null;
      };
      await update({
        user: {
          username: updated.username ?? username.trim(),
          affiliation: updated.affiliation ?? churchName.trim(),
        },
      });
      toast.success("프로필이 저장되었습니다.");
      router.replace("/");
    } catch (err) {
      const msg = err instanceof Error ? err.message : "저장 실패";
      toast.error(msg);
      setSubmitting(false);
    }
  };

  const skip = () => router.replace("/");

  return (
    <div className="blessing-home">
      <div className="blessing-complete-wrap">
        <div className="blessing-complete-head">
          <div className="blessing-complete-title">환영합니다 🙌</div>
          <div className="blessing-complete-sub">
            사용하실 닉네임과 출석 교회를 등록해 주세요. 나중에 변경할 수 있어요.
          </div>
        </div>

        <form onSubmit={onSubmit} className="blessing-complete-form">
          <label className="blessing-complete-field">
            <span className="blessing-complete-label">닉네임</span>
            <input
              type="text"
              className="blessing-complete-input"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="예: 새벽이슬"
              minLength={2}
              maxLength={20}
              autoComplete="nickname"
              required
            />
            <span className="blessing-complete-help">
              2~20자. 공개 활동에 사용됩니다.
            </span>
          </label>

          <label className="blessing-complete-field">
            <span className="blessing-complete-label">출석 교회</span>
            <ChurchSearch
              initialValue={churchName}
              onChange={(name, id) => {
                setChurchName(name);
                setChurchId(id);
              }}
            />
            <span className="blessing-complete-help">
              목록에서 선택하면 교회 인증 피드를 이용할 수 있어요.
            </span>
          </label>

          <div className="blessing-complete-actions">
            <button
              type="button"
              className="blessing-btn-secondary"
              onClick={skip}
              disabled={submitting}
            >
              나중에
            </button>
            <button
              type="submit"
              className="blessing-btn-primary"
              disabled={!canSubmit}
            >
              {submitting ? "저장 중..." : "저장하고 시작하기"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
