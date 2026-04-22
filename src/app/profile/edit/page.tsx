"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { toast } from "sonner";
import Avatar from "@/components/common/Avatar";
import ChurchSearch from "@/components/ChurchSearch";
import { DetailHeader } from "@/components/layout/DetailHeader";
import { Button } from "@/components/ui";

const FORBIDDEN = ["관리자", "admin", "blessing", "운영자"];

function validateNickname(s: string): { ok: boolean; reason?: string } {
  const v = s.trim();
  if (v.length < 2) return { ok: false, reason: "2자 이상 입력해 주세요." };
  if (v.length > 12) return { ok: false, reason: "12자 이하로 입력해 주세요." };
  if (FORBIDDEN.some((f) => v.toLowerCase().includes(f.toLowerCase()))) {
    return { ok: false, reason: "사용할 수 없는 단어가 포함돼 있어요." };
  }
  return { ok: true };
}

export default function ProfileEditPage() {
  const router = useRouter();
  const { data: session, status, update } = useSession();

  const [username, setUsername] = useState("");
  const [nickState, setNickState] = useState<"idle" | "checking" | "ok" | "err">("idle");
  const [nickMsg, setNickMsg] = useState<string | null>(null);
  const [churchName, setChurchName] = useState("");
  const [churchId, setChurchId] = useState<number | null>(null);
  const [bio, setBio] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.replace("/auth");
      return;
    }
    if (status !== "authenticated" || !session) return;
    if (!username && session.user?.name) setUsername(session.user.name);
    const aff = (session.user as { affiliation?: string | null } | undefined)
      ?.affiliation;
    if (!churchName && aff) setChurchName(aff);
  }, [session, status, router, username, churchName]);

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
  const currentName =
    (session?.user as { name?: string | null } | undefined)?.name ?? null;

  const checkNickname = async () => {
    const v = username.trim();
    const local = validateNickname(v);
    if (!local.ok) {
      setNickState("err");
      setNickMsg(local.reason ?? "사용할 수 없어요.");
      return;
    }
    if (currentName && v === currentName) {
      setNickState("ok");
      setNickMsg("현재 사용 중인 닉네임이에요.");
      return;
    }
    setNickState("checking");
    setNickMsg(null);
    try {
      const res = await fetch(
        `/api/users/check-username?username=${encodeURIComponent(v)}`,
      );
      if (!res.ok) throw new Error("fail");
      const json = (await res.json()) as {
        exists?: boolean;
        available?: boolean;
      };
      const available =
        typeof json.available === "boolean" ? json.available : !json.exists;
      if (available) {
        setNickState("ok");
        setNickMsg("사용 가능한 닉네임이에요.");
      } else {
        setNickState("err");
        setNickMsg("이미 사용 중인 닉네임이에요.");
      }
    } catch {
      setNickState("ok");
      setNickMsg("중복 확인은 실패했지만 저장은 계속할 수 있어요.");
    }
  };

  const canSave =
    nickState !== "checking" &&
    nickState !== "err" &&
    username.trim().length >= 2 &&
    !saving;

  const onSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId || !accessToken) return;
    if (nickState !== "ok") {
      await checkNickname();
      return;
    }
    setSaving(true);
    try {
      const res = await fetch(`/api/users/account/${userId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          username: username.trim(),
          affiliation: churchName.trim() || null,
          church_id: churchId,
          // bio 는 백엔드 스키마에 아직 없어 클라이언트 전용 (localStorage 저장 가능)
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
      const nextAffiliation =
        updated.affiliation ?? (churchName.trim() || null);
      await update({
        user: {
          username: updated.username ?? username.trim(),
          affiliation: nextAffiliation,
        },
      });
      if (bio) {
        try {
          window.localStorage.setItem("blessing:profileBio", bio);
        } catch {
          /* ignore */
        }
      }
      toast.success("프로필이 저장되었어요.");
      router.replace("/profile");
    } catch (err) {
      const msg = err instanceof Error ? err.message : "저장 실패";
      toast.error(msg);
      setSaving(false);
    }
  };

  return (
    <div className="blessing-detail">
      <DetailHeader
        title="프로필 편집"
        subtitle="Edit Profile"
        actions={
          <button
            type="button"
            className="blessing-submit-btn"
            disabled={!canSave}
            onClick={onSave as unknown as () => void}
          >
            {saving ? "저장 중..." : "저장"}
          </button>
        }
      />

      <form className="blessing-profile-edit" onSubmit={onSave}>
        <div className="blessing-profile-edit-avatar">
          <Avatar name={username || "나"} seed={userId ?? 0} size={86} />
          <div className="blessing-profile-edit-avatar-caption">
            아바타는 닉네임 첫 글자로 자동 생성돼요.
          </div>
        </div>

        <div className="blessing-settings-group-label">닉네임</div>
        <div className="blessing-settings-card">
          <div className="blessing-reg-field" style={{ borderBottom: "none" }}>
            <label className="blessing-reg-label">닉네임</label>
            <input
              className="blessing-reg-input"
              value={username}
              maxLength={12}
              placeholder="2~12자"
              onChange={(e) => {
                setUsername(e.target.value);
                setNickState("idle");
                setNickMsg(null);
              }}
            />
          </div>
        </div>
        <div className="blessing-profile-edit-nick-actions">
          <span className="blessing-onboard-nick-count">
            {username.length}/12
          </span>
          {nickState === "ok" && (
            <span className="blessing-onboard-nick-ok">✓ {nickMsg}</span>
          )}
          {nickState === "err" && (
            <span className="blessing-onboard-nick-err">✗ {nickMsg}</span>
          )}
          {nickState === "checking" && (
            <span className="blessing-onboard-nick-checking">중복 확인 중…</span>
          )}
          <button
            type="button"
            className="blessing-btn-secondary"
            style={{ height: 32, padding: "0 12px", marginLeft: "auto" }}
            onClick={checkNickname}
            disabled={nickState === "checking"}
          >
            중복 확인
          </button>
        </div>

        <div className="blessing-settings-group-label">출석 교회</div>
        <div className="blessing-settings-card" style={{ padding: "12px 16px" }}>
          <ChurchSearch
            initialValue={churchName}
            onChange={(name, id) => {
              setChurchName(name);
              setChurchId(id);
            }}
          />
          <div className="blessing-profile-edit-help">
            교회를 선택해야 내 교회 피드·셀·인증이 활성화돼요.
          </div>
          <button
            type="button"
            className="blessing-complete-verify-link"
            onClick={() =>
              router.push("/verify-church?return=/profile/edit")
            }
          >
            🏛 정식 교회 인증으로 진행 →
          </button>
        </div>

        <div className="blessing-settings-group-label">상태 메시지 (선택)</div>
        <div className="blessing-settings-card" style={{ padding: "12px 16px" }}>
          <textarea
            className="blessing-cell-textarea"
            placeholder="간단한 소개나 기도제목을 적어 보세요 (선택)"
            value={bio}
            onChange={(e) => setBio(e.target.value.slice(0, 160))}
          />
          <div className="blessing-profile-edit-help">
            {bio.length}/160 · 프로필에 표시돼요.
          </div>
        </div>

        <div className="blessing-profile-edit-footer">
          <Button
            variant="secondary"
            onClick={() => router.back()}
            type="button"
          >
            취소
          </Button>
          <Button
            variant="primary"
            type="submit"
            active={false}
            className={canSave ? "" : ""}
          >
            {saving ? "저장 중..." : "저장하기"}
          </Button>
        </div>
      </form>
      <div style={{ height: 40 }} />
    </div>
  );
}
