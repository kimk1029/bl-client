"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { MEETUP_TAG_OPTIONS } from "@/lib/meetupsMock";
import { shareOrCopy } from "@/lib/share";

type Step = 1 | 2 | 3;

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

interface FormState {
  title: string;
  date: string;
  time: string;
  place: string;
  max: string;
  desc: string;
  tags: string[];
  visibility: "open" | "church" | "closed";
}

const VISIBILITY_OPTIONS: Array<{
  id: FormState["visibility"];
  label: string;
  sub: string;
}> = [
  { id: "open", label: "전체 공개", sub: "모든 성도에게 보입니다" },
  { id: "church", label: "내 교회 공개", sub: "같은 교회 성도에게만 보입니다" },
  { id: "closed", label: "비공개", sub: "초대 링크로만 참가 가능" },
];

export default function CreateMeetupPage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>(1);
  const [form, setForm] = useState<FormState>({
    title: "",
    date: "",
    time: "",
    place: "",
    max: "",
    desc: "",
    tags: [],
    visibility: "open",
  });

  const set = <K extends keyof FormState>(key: K, value: FormState[K]) =>
    setForm((p) => ({ ...p, [key]: value }));

  const toggleTag = (t: string) =>
    setForm((p) => ({
      ...p,
      tags: p.tags.includes(t) ? p.tags.filter((x) => x !== t) : [...p.tags, t],
    }));

  const canNext1 = form.title.trim().length >= 2 && form.date.trim();
  const canSubmit = canNext1 && form.place.trim();

  if (step === 3) {
    return (
      <div className="blessing-detail">
        <header className="blessing-detail-topbar">
          <button
            type="button"
            className="blessing-detail-icon-btn"
            onClick={() => router.replace("/events")}
            aria-label="뒤로가기"
          >
            <IconBack />
          </button>
          <div className="blessing-detail-topbar-title-wrap">
            <div className="blessing-dm-title">모임 만들기 완료</div>
            <div className="blessing-dm-subtitle">Meetup Created</div>
          </div>
          <div className="blessing-detail-topbar-actions">
            <span style={{ width: 36 }} aria-hidden />
          </div>
        </header>
        <div className="blessing-meetup-done">
          <div className="blessing-meetup-done-icon">
            <svg width="56" height="56" viewBox="0 0 24 24" fill="none" aria-hidden>
              <circle cx="12" cy="12" r="10" fill="var(--blessing-accent)" />
              <path
                d="M7 12l4 4 6-7"
                stroke="white"
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
          <div className="blessing-meetup-done-title">
            모임이 만들어졌어요!
          </div>
          <div className="blessing-meetup-done-event">{form.title}</div>
          <div className="blessing-meetup-done-meta">
            {form.date} · {form.place}
          </div>
          <p className="blessing-meetup-done-notice">
            모임이 공개되었습니다. 링크를 공유해서 멤버를 초대해보세요.
          </p>
          <div className="blessing-meetup-done-actions">
            <Link href="/events" className="blessing-btn-primary">
              ← 모임 목록으로
            </Link>
            <button
              type="button"
              className="blessing-btn-secondary"
              onClick={() =>
                shareOrCopy({
                  title: form.title,
                  text: `${form.title} — ${form.date} · ${form.place}`,
                  url: "/events",
                })
              }
            >
              초대 링크 공유하기
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="blessing-detail">
      <header className="blessing-detail-topbar">
        <button
          type="button"
          className="blessing-detail-icon-btn"
          onClick={() =>
            step === 1 ? router.back() : setStep(((step - 1) as Step))
          }
          aria-label="뒤로가기"
        >
          <IconBack />
        </button>
        <div className="blessing-detail-topbar-title-wrap">
          <div className="blessing-dm-title">모임 만들기 {step}/2</div>
          <div className="blessing-dm-subtitle">나만의 모임을 시작해보세요</div>
        </div>
        <div className="blessing-detail-topbar-actions">
          {step === 2 ? (
            <button
              type="button"
              className="blessing-submit-btn"
              disabled={!canSubmit}
              onClick={() => {
                setStep(3);
              }}
            >
              완료
            </button>
          ) : (
            <span style={{ width: 36 }} aria-hidden />
          )}
        </div>
      </header>

      <div className="blessing-meetup-form">
        {step === 1 ? (
          <>
            <div className="blessing-settings-group-label">기본 정보</div>
            <div className="blessing-settings-card">
              <Field label="모임명">
                <input
                  className="blessing-reg-input"
                  value={form.title}
                  placeholder="예: 강남 크리스천 북클럽"
                  maxLength={40}
                  onChange={(e) => set("title", e.target.value)}
                />
              </Field>
              <Field label="날짜">
                <input
                  className="blessing-reg-input"
                  value={form.date}
                  placeholder="예: 05/01 (목)"
                  onChange={(e) => set("date", e.target.value)}
                />
              </Field>
              <Field label="시간">
                <input
                  className="blessing-reg-input"
                  value={form.time}
                  placeholder="예: 오후 7:00"
                  onChange={(e) => set("time", e.target.value)}
                />
              </Field>
              <Field label="장소" last>
                <input
                  className="blessing-reg-input"
                  value={form.place}
                  placeholder="온라인, 카페명 등"
                  onChange={(e) => set("place", e.target.value)}
                />
              </Field>
            </div>

            <div className="blessing-settings-group-label">카테고리 태그</div>
            <div className="blessing-settings-card" style={{ padding: "14px 16px" }}>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                {MEETUP_TAG_OPTIONS.map((t) => {
                  const on = form.tags.includes(t);
                  return (
                    <button
                      key={t}
                      type="button"
                      className={`blessing-chip ${on ? "blessing-chip-active" : ""}`}
                      onClick={() => toggleTag(t)}
                    >
                      #{t}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="blessing-settings-group-label">최대 인원 (선택)</div>
            <div className="blessing-settings-card">
              <Field label="인원" last>
                <input
                  className="blessing-reg-input"
                  type="number"
                  inputMode="numeric"
                  value={form.max}
                  placeholder="제한 없음"
                  onChange={(e) => set("max", e.target.value)}
                />
              </Field>
            </div>

            <div className="blessing-meetup-form-footer">
              <button
                type="button"
                className="blessing-btn-primary"
                disabled={!canNext1}
                onClick={() => setStep(2)}
              >
                다음 — 소개 작성하기
              </button>
            </div>
          </>
        ) : (
          <>
            <div className="blessing-settings-group-label">모임 소개</div>
            <div className="blessing-settings-card" style={{ padding: "14px 16px" }}>
              <textarea
                className="blessing-cell-textarea"
                style={{ minHeight: 140 }}
                placeholder="어떤 모임인지 소개해주세요. 참가 방법, 준비물, 분위기 등을 적어주세요."
                value={form.desc}
                onChange={(e) => set("desc", e.target.value)}
              />
            </div>

            <div className="blessing-settings-group-label">공개 설정</div>
            <div className="blessing-settings-card">
              {VISIBILITY_OPTIONS.map((v, idx) => {
                const on = form.visibility === v.id;
                return (
                  <button
                    type="button"
                    key={v.id}
                    className={`blessing-reg-option${on ? " blessing-reg-option-active" : ""}`}
                    style={
                      idx === VISIBILITY_OPTIONS.length - 1
                        ? { borderBottom: "none" }
                        : undefined
                    }
                    onClick={() => set("visibility", v.id)}
                  >
                    <div>
                      <div style={{ fontSize: 13.5, fontWeight: 600 }}>
                        {v.label}
                      </div>
                      <div
                        style={{
                          fontSize: 11.5,
                          color: "var(--blessing-fg-2)",
                          marginTop: 2,
                        }}
                      >
                        {v.sub}
                      </div>
                    </div>
                    <span className={`blessing-check${on ? " blessing-check-on" : ""}`}>
                      {on ? "✓" : ""}
                    </span>
                  </button>
                );
              })}
            </div>

            <div className="blessing-meetup-form-footer">
              <button
                type="button"
                className="blessing-btn-secondary"
                onClick={() => setStep(1)}
              >
                이전
              </button>
              <button
                type="button"
                className="blessing-btn-primary"
                disabled={!canSubmit}
                onClick={() => setStep(3)}
              >
                모임 만들기
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function Field({
  label,
  children,
  last,
}: {
  label: string;
  children: React.ReactNode;
  last?: boolean;
}) {
  return (
    <div className="blessing-reg-field" style={last ? { borderBottom: "none" } : undefined}>
      <label className="blessing-reg-label">{label}</label>
      {children}
    </div>
  );
}
