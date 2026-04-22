"use client";

import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { toast } from "sonner";

interface ChurchResult {
  id: number;
  name: string;
  address: string | null;
  city: string | null;
  district: string | null;
}

type Step = 1 | 2 | 3;

const ROLES = [
  "청년부",
  "장년부",
  "새가족",
  "중고등부",
  "주일학교 교사",
  "목장 리더",
  "사역자·간사",
  "장로·권사",
] as const;

const METHODS = [
  {
    id: "kakao",
    emoji: "📱",
    title: "카카오톡 오픈프로필",
    desc: "가장 빠른 방법 · 1분",
  },
  {
    id: "email",
    emoji: "📧",
    title: "교회 이메일",
    desc: "도메인 인증 · 즉시",
  },
  {
    id: "registry",
    emoji: "📜",
    title: "등록 교적 확인",
    desc: "교회 행정팀 연동 · 1~3일",
  },
  {
    id: "guarantor",
    emoji: "👥",
    title: "기존 성도 2인 보증",
    desc: "이미 인증된 성도의 보증",
  },
] as const;

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
function IconSearch() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
      <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="1.8" />
      <path
        d="m20 20-3.5-3.5"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}

function VerifyChurchInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const returnTo = searchParams.get("return") || "/profile";
  const { data: session, update } = useSession();

  const [step, setStep] = useState<Step>(1);
  const [search, setSearch] = useState("");
  const [results, setResults] = useState<ChurchResult[]>([]);
  const [selected, setSelected] = useState<ChurchResult | null>(null);
  const [role, setRole] = useState<string | null>(null);
  const [method, setMethod] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (!search.trim()) {
      setResults([]);
      return;
    }
    debounceRef.current = setTimeout(async () => {
      try {
        const res = await fetch(
          `/api/churches/search?q=${encodeURIComponent(search.trim())}`,
        );
        if (!res.ok) throw new Error("fetch fail");
        const data = (await res.json()) as ChurchResult[];
        setResults(Array.isArray(data) ? data : []);
      } catch {
        setResults([]);
      }
    }, 250);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [search]);

  const nextDisabled = useMemo(() => {
    if (step === 1) return !selected;
    if (step === 2) return !role;
    if (step === 3) return !method;
    return true;
  }, [step, selected, role, method]);

  const onNext = async () => {
    if (step === 1 || step === 2) {
      setStep((s) => ((s + 1) as Step));
      return;
    }
    // Step 3 → log the verify request. Server also eagerly sets affiliation
    // so the user can access church-gated UI while their request is reviewed.
    if (!selected || !role || !method) return;
    const token = (session as { accessToken?: string } | null)?.accessToken;
    if (!token) {
      toast.error("로그인 후 이용할 수 있어요.");
      router.push("/auth");
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch("/api/verify-church", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          church_id: selected.id,
          church_name: selected.name,
          role,
          method,
        }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err?.error || "인증 요청에 실패했어요.");
      }
      await update({ user: { affiliation: selected.name } });
      toast.success(
        `${selected.name} 인증 요청이 접수됐어요. 검토 후 알림으로 알려드릴게요.`,
      );
      router.replace(returnTo);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "인증 요청 실패";
      toast.error(msg);
      setSubmitting(false);
    }
  };

  const onPrev = () => {
    if (step === 1) router.back();
    else setStep((s) => ((s - 1) as Step));
  };

  const churchArea = (c: ChurchResult) =>
    [c.city, c.district].filter(Boolean).join(" ") || "지역 정보 없음";

  return (
    <div className="blessing-detail blessing-verify">
      <header className="blessing-detail-topbar">
        <button
          type="button"
          className="blessing-detail-icon-btn"
          onClick={onPrev}
          aria-label="뒤로가기"
        >
          <IconBack />
        </button>
        <div className="blessing-detail-topbar-title-wrap">
          <div className="blessing-dm-title">교회 인증</div>
          <div className="blessing-dm-subtitle">{step} / 3</div>
        </div>
        <div className="blessing-detail-topbar-actions">
          <span style={{ width: 36 }} aria-hidden />
        </div>
      </header>

      <div className="blessing-verify-steps">
        {[1, 2, 3].map((s) => (
          <div
            key={s}
            className={`blessing-verify-step${s <= step ? " blessing-verify-step-active" : ""}`}
          >
            <div className="blessing-verify-step-num">{s}</div>
            <div className="blessing-verify-step-label">
              {s === 1 ? "교회 선택" : s === 2 ? "역할" : "인증"}
            </div>
          </div>
        ))}
      </div>

      <div className="blessing-verify-body">
        {step === 1 && (
          <>
            <div className="blessing-verify-title">
              어느 교회에 출석 중이신가요?
            </div>
            <div className="blessing-verify-sub">
              교회 이름 또는 지역을 검색하세요.
              <br />
              등록되지 않은 교회라면 직접 추가 요청을 보낼 수 있어요.
            </div>
            <div
              className="blessing-search-input-wrap"
              style={{ marginBottom: 14 }}
            >
              <IconSearch />
              <input
                type="search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="은혜교회, 강남구..."
                aria-label="교회 검색"
                autoComplete="off"
              />
            </div>
            {results.map((c) => {
              const on = selected?.id === c.id;
              return (
                <button
                  type="button"
                  key={c.id}
                  className={`blessing-church-row${on ? " blessing-church-row-selected" : ""}`}
                  onClick={() => setSelected(c)}
                >
                  <div className="blessing-church-icon">✞</div>
                  <div className="blessing-church-info">
                    <div className="blessing-church-name">{c.name}</div>
                    <div className="blessing-church-meta">{churchArea(c)}</div>
                  </div>
                  <span
                    className={`blessing-check${on ? " blessing-check-on" : ""}`}
                  >
                    {on ? "✓" : ""}
                  </span>
                </button>
              );
            })}
            {search.trim() &&
              results.findIndex((c) => c.name === search.trim()) < 0 && (
                <div className="blessing-church-add">
                  <span>
                    &lsquo;{search.trim()}&rsquo; 교회를 찾을 수 없어요
                  </span>
                  <button
                    type="button"
                    onClick={() =>
                      toast.message(
                        "교회 직접 등록은 곧 열립니다. 임시로 이름만 기록해 두세요.",
                      )
                    }
                  >
                    직접 등록
                  </button>
                </div>
              )}
          </>
        )}

        {step === 2 && selected && (
          <>
            <div className="blessing-verify-title">
              {selected.name}에서의
              <br />
              역할을 선택하세요
            </div>
            <div className="blessing-verify-sub">
              역할은 프로필에 표시되며 언제든 변경할 수 있어요.
            </div>
            <div className="blessing-role-list">
              {ROLES.map((r) => {
                const on = role === r;
                return (
                  <button
                    type="button"
                    key={r}
                    className={`blessing-role-row${on ? " blessing-role-row-selected" : ""}`}
                    onClick={() => setRole(r)}
                  >
                    <span>{r}</span>
                    <span
                      className={`blessing-check-small${on ? " blessing-check-small-on" : ""}`}
                    >
                      {on ? "✓" : ""}
                    </span>
                  </button>
                );
              })}
            </div>
          </>
        )}

        {step === 3 && selected && role && (
          <>
            <div className="blessing-verify-title">
              마지막으로 인증 방법을
              <br />
              선택해주세요
            </div>
            <div className="blessing-verify-sub">
              제출한 개인정보는 인증 완료 후 즉시 폐기됩니다.
            </div>
            <div className="blessing-verify-method-grid">
              {METHODS.map((m) => {
                const on = method === m.id;
                return (
                  <button
                    type="button"
                    key={m.id}
                    className={`blessing-verify-method${on ? " blessing-verify-method-on" : ""}`}
                    onClick={() => setMethod(m.id)}
                  >
                    <div className="blessing-verify-method-icon">{m.emoji}</div>
                    <div className="blessing-verify-method-title">{m.title}</div>
                    <div className="blessing-verify-method-desc">{m.desc}</div>
                  </button>
                );
              })}
            </div>
            <div className="blessing-verify-summary">
              <div>교회</div>
              <strong>{selected.name}</strong>
              <div>역할</div>
              <strong>{role}</strong>
            </div>
          </>
        )}
      </div>

      <div className="blessing-verify-footer">
        {step > 1 && (
          <button
            type="button"
            className="blessing-btn-secondary"
            onClick={onPrev}
            disabled={submitting}
          >
            이전
          </button>
        )}
        <button
          type="button"
          className="blessing-btn-primary"
          onClick={onNext}
          disabled={nextDisabled || submitting}
        >
          {step < 3
            ? "다음"
            : submitting
              ? "요청 중..."
              : "인증 요청하기"}
        </button>
      </div>
    </div>
  );
}

export default function VerifyChurchPage() {
  return (
    <Suspense
      fallback={
        <div className="blessing-loading">
          <div className="blessing-spinner" aria-label="Loading" />
        </div>
      }
    >
      <VerifyChurchInner />
    </Suspense>
  );
}
