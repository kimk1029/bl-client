"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { toast } from "sonner";
import Avatar from "@/components/common/Avatar";
import LogoMark from "@/components/layout/LogoMark";

type Step = 1 | 2 | 3; // 1 welcome, 2 nickname, 3 church prompt

const FORBIDDEN = ["관리자", "admin", "blessing", "운영자"];

function isValidNickname(s: string): { ok: boolean; reason?: string } {
  const v = s.trim();
  if (v.length < 2) return { ok: false, reason: "2자 이상 입력해 주세요." };
  if (v.length > 12) return { ok: false, reason: "12자 이하로 입력해 주세요." };
  if (FORBIDDEN.some((f) => v.toLowerCase().includes(f.toLowerCase()))) {
    return { ok: false, reason: "사용할 수 없는 단어가 포함돼 있어요." };
  }
  return { ok: true };
}

export default function CompleteProfilePage() {
  const router = useRouter();
  const { data: session, status, update } = useSession();

  const [step, setStep] = useState<Step>(1);
  const [nickname, setNickname] = useState("");
  const [nickState, setNickState] = useState<"idle" | "checking" | "ok" | "err">("idle");
  const [nickMsg, setNickMsg] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.replace("/auth");
      return;
    }
    if (status !== "authenticated" || !session) return;
    const aff = (session.user as { affiliation?: string | null } | undefined)
      ?.affiliation;
    // 이미 교회 인증까지 끝난 사용자는 홈으로
    if (aff) {
      router.replace("/");
      return;
    }
    if (session.user?.name && !nickname) setNickname(session.user.name);
  }, [session, status, router, nickname]);

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

  const checkNicknameAvailability = async () => {
    const v = nickname.trim();
    const local = isValidNickname(v);
    if (!local.ok) {
      setNickState("err");
      setNickMsg(local.reason ?? "사용할 수 없는 닉네임이에요.");
      return;
    }
    setNickState("checking");
    setNickMsg(null);
    try {
      const res = await fetch(
        `/api/users/check-username?username=${encodeURIComponent(v)}`,
      );
      if (!res.ok) throw new Error("fetch fail");
      const json = (await res.json()) as { available?: boolean; exists?: boolean };
      const available =
        typeof json.available === "boolean" ? json.available : !json.exists;
      // 만약 현재 내 이름이면 available 로 취급
      const currentName =
        (session?.user as { name?: string | null } | undefined)?.name ?? null;
      const isSameAsCurrent = currentName != null && currentName === v;
      if (available || isSameAsCurrent) {
        setNickState("ok");
        setNickMsg(
          isSameAsCurrent ? "현재 사용 중인 닉네임이에요." : "사용 가능한 닉네임이에요.",
        );
      } else {
        setNickState("err");
        setNickMsg("이미 사용 중인 닉네임이에요.");
      }
    } catch {
      // 중복 체크 실패 시 UX는 진행시키되 경고만
      setNickState("ok");
      setNickMsg(
        "중복 확인에 실패했지만 그대로 사용할 수 있어요. 저장 시 자동으로 조정됩니다.",
      );
    }
  };

  const saveNickname = async () => {
    if (!userId || !accessToken) return;
    if (nickState !== "ok") {
      await checkNicknameAvailability();
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
        body: JSON.stringify({ username: nickname.trim() }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err?.error || "저장 실패");
      }
      const updated = (await res.json()) as { username?: string };
      await update({
        user: {
          username: updated.username ?? nickname.trim(),
        },
      });
      setStep(3);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "저장 실패";
      toast.error(msg);
    } finally {
      setSaving(false);
    }
  };

  const goSkip = () => router.replace("/");
  const goVerify = () => router.push("/verify-church?return=/");

  return (
    <div className="blessing-detail">
      <header className="blessing-onboard-topbar">
        <LogoMark size={26} />
        <span className="blessing-onboard-brand">blessing</span>
      </header>

      <div className="blessing-onboard-body">
        <div className="blessing-onboard-dots" aria-label={`단계 ${step}/3`}>
          {[1, 2, 3].map((i) => (
            <span
              key={i}
              className={`blessing-onboard-dot${i <= step ? " blessing-onboard-dot-active" : ""}`}
            />
          ))}
        </div>

        {step === 1 && (
          <>
            <div style={{ fontSize: 56, textAlign: "center", marginBottom: 8 }}>
              🎉
            </div>
            <h1 className="blessing-onboard-title" style={{ textAlign: "center" }}>
              blessing에 오신 것을
              <br />
              환영해요!
            </h1>
            <p className="blessing-onboard-sub" style={{ textAlign: "center" }}>
              한국 교회 성도들이 함께 기도하고 나누는 커뮤니티예요.
              <br />몇 단계만 거치면 바로 시작할 수 있어요.
            </p>
            <button
              type="button"
              className="blessing-btn-primary"
              style={{ width: "100%", marginTop: 28 }}
              onClick={() => setStep(2)}
            >
              시작하기 →
            </button>
          </>
        )}

        {step === 2 && (
          <>
            <h1 className="blessing-onboard-title">닉네임을 정해볼까요?</h1>
            <p className="blessing-onboard-sub">
              커뮤니티에서 쓰는 이름이에요. 언제든 바꿀 수 있어요. (2~12자)
            </p>

            <div className="blessing-onboard-nick-preview">
              <Avatar name={nickname || "나"} size={52} seed={42} />
              <span className="blessing-onboard-nick-display">
                {nickname || "닉네임"}
              </span>
            </div>

            <div className="blessing-onboard-nick-field">
              <input
                className="blessing-complete-input"
                placeholder="예: 새벽이슬, 믿음이..."
                value={nickname}
                maxLength={12}
                onChange={(e) => {
                  setNickname(e.target.value);
                  setNickState("idle");
                  setNickMsg(null);
                }}
              />
              <div className="blessing-onboard-nick-meta">
                {nickState === "ok" && (
                  <span className="blessing-onboard-nick-ok">
                    ✓ {nickMsg ?? "사용 가능"}
                  </span>
                )}
                {nickState === "err" && (
                  <span className="blessing-onboard-nick-err">
                    ✗ {nickMsg ?? "사용 불가"}
                  </span>
                )}
                {nickState === "checking" && (
                  <span className="blessing-onboard-nick-checking">
                    중복 확인 중…
                  </span>
                )}
                <span className="blessing-onboard-nick-count">
                  {nickname.length}/12
                </span>
              </div>
              <button
                type="button"
                className="blessing-btn-primary"
                style={{ width: "100%", marginTop: 8 }}
                disabled={saving || nickState === "checking"}
                onClick={
                  nickState === "ok" ? saveNickname : checkNicknameAvailability
                }
              >
                {nickState === "ok"
                  ? saving
                    ? "저장 중..."
                    : "이 닉네임으로 시작하기 →"
                  : "중복 확인"}
              </button>
            </div>

            <div className="blessing-onboard-tips">
              <div className="blessing-onboard-tip-title">닉네임 가이드</div>
              {[
                "실명 대신 신앙적 닉네임을 추천해요",
                "익명 게시판에서는 항상 비공개로 작성돼요",
                "닉네임은 언제든 프로필에서 변경 가능",
              ].map((tip) => (
                <div key={tip} className="blessing-onboard-tip">
                  <span>·</span>
                  {tip}
                </div>
              ))}
            </div>
          </>
        )}

        {step === 3 && (
          <>
            <h1 className="blessing-onboard-title">
              마지막으로,
              <br />
              교회를 인증해볼까요?
            </h1>
            <p className="blessing-onboard-sub">
              교회 인증을 하면 더 많은 기능이 열려요.
              <br />내 교회 피드, 목장 참여, 전용 토픽 등.
            </p>
            <div className="blessing-onboard-benefits">
              {[
                { icon: "⛪", title: "내 교회 피드", desc: "같은 교회 성도들과 소통" },
                { icon: "👥", title: "셀·목장 참여", desc: "소그룹 나눔 및 기도" },
                { icon: "✓", title: "인증 뱃지", desc: "신뢰할 수 있는 성도로 표시" },
              ].map((b) => (
                <div key={b.icon} className="blessing-onboard-benefit">
                  <span className="blessing-onboard-benefit-icon">{b.icon}</span>
                  <div>
                    <div className="blessing-onboard-benefit-title">
                      {b.title}
                    </div>
                    <div className="blessing-onboard-benefit-desc">{b.desc}</div>
                  </div>
                </div>
              ))}
            </div>
            <button
              type="button"
              className="blessing-btn-primary"
              style={{ width: "100%", marginTop: 24 }}
              onClick={goVerify}
            >
              교회 인증하기 →
            </button>
            <button
              type="button"
              className="blessing-onboard-skip"
              onClick={goSkip}
            >
              나중에 할게요 (홈으로)
            </button>
            <Link
              href="/"
              style={{
                display: "block",
                textAlign: "center",
                marginTop: 6,
                fontSize: 11.5,
                color: "var(--blessing-fg-3)",
              }}
            >
              건너뛰고 둘러보기
            </Link>
          </>
        )}
      </div>
    </div>
  );
}
