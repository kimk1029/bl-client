"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import Avatar from "@/components/common/Avatar";
import {
  CELL_PAST,
  CELL_POSTS,
  CELL_PRAYERS,
  CELL_UPCOMING,
  MY_CELL,
  timeAgoKo,
  type CellPost,
  type CellPrayer as CellPrayerItem,
} from "@/lib/cellMock";

const ME = "은혜충만";

type Tab = "feed" | "prayer" | "meeting" | "members";

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
function IconInvite() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2M12 3a4 4 0 1 1 0 8 4 4 0 0 1 0-8ZM19 8v6M22 11h-6"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
function IconMore() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
      <circle cx="5" cy="12" r="1.7" fill="currentColor" />
      <circle cx="12" cy="12" r="1.7" fill="currentColor" />
      <circle cx="19" cy="12" r="1.7" fill="currentColor" />
    </svg>
  );
}
function IconPlus() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path d="M12 3v18M3 12h18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}
function IconMessage() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M4 6a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H9l-4 3V6Z"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default function CellPage() {
  const router = useRouter();
  const [tab, setTab] = useState<Tab>("feed");
  const [showInvite, setShowInvite] = useState(false);

  useEffect(() => {
    if (!showInvite) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setShowInvite(false);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [showInvite]);

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
          <div className="blessing-dm-title">{MY_CELL.name}</div>
          <div className="blessing-dm-subtitle">
            {MY_CELL.type} · {MY_CELL.church}
          </div>
        </div>
        <div className="blessing-detail-topbar-actions">
          <button
            type="button"
            className="blessing-detail-icon-btn"
            aria-label="멤버 초대"
            onClick={() => setShowInvite(true)}
          >
            <IconInvite />
          </button>
          <button
            type="button"
            className="blessing-detail-icon-btn"
            aria-label="더보기"
          >
            <IconMore />
          </button>
        </div>
      </header>

      <div className="blessing-hub-tabs">
        {([
          ["feed", "나눔피드"],
          ["prayer", "기도제목"],
          ["meeting", "모임일정"],
          ["members", "멤버"],
        ] as Array<[Tab, string]>).map(([id, label]) => (
          <button
            key={id}
            type="button"
            className={`blessing-hub-tab ${tab === id ? "blessing-hub-tab-active" : ""}`}
            onClick={() => setTab(id)}
          >
            {label}
          </button>
        ))}
      </div>

      <button
        type="button"
        className="blessing-cell-meeting-banner"
        onClick={() => setTab("meeting")}
      >
        <span className="blessing-cell-meeting-dot" />
        <span className="blessing-cell-meeting-info">
          <span className="blessing-cell-meeting-next">다음 모임</span>
          <span className="blessing-cell-meeting-when">
            {MY_CELL.nextMeeting.date} · {MY_CELL.nextMeeting.time}
          </span>
          <span className="blessing-cell-meeting-where">
            📍 {MY_CELL.nextMeeting.place}
          </span>
        </span>
        <span className="blessing-cell-attend-btn">참석 확인</span>
      </button>

      {tab === "feed" && <CellFeed />}
      {tab === "prayer" && <CellPrayer />}
      {tab === "meeting" && <CellMeeting />}
      {tab === "members" && <CellMembers />}

      {showInvite && (
        <div
          className="blessing-user-sheet-backdrop"
          role="dialog"
          aria-modal="true"
          aria-label="멤버 초대"
          onClick={() => setShowInvite(false)}
        >
          <div className="blessing-user-sheet" onClick={(e) => e.stopPropagation()}>
            <div className="blessing-user-sheet-handle" aria-hidden />
            <div className="blessing-user-sheet-head">
              <div
                className="blessing-mychurch-empty-icon"
                style={{ width: 44, height: 44 }}
                aria-hidden
              >
                <IconInvite />
              </div>
              <div className="blessing-user-sheet-head-info">
                <div className="blessing-user-sheet-name">멤버 초대</div>
                <div className="blessing-user-sheet-sub">{MY_CELL.name}</div>
              </div>
            </div>

            <div style={{ padding: "12px 4px 0" }}>
              <div className="blessing-cell-invite-code">
                <div className="blessing-cell-invite-label">초대 코드</div>
                <div className="blessing-cell-invite-num">
                  {MY_CELL.inviteCode}
                </div>
                <button
                  type="button"
                  className="blessing-btn-secondary"
                  style={{ height: 34, padding: "0 12px" }}
                  onClick={async () => {
                    try {
                      await navigator.clipboard.writeText(MY_CELL.inviteCode);
                      toast.success("초대 코드가 복사되었어요.");
                    } catch {
                      toast.error("복사에 실패했어요.");
                    }
                  }}
                >
                  복사
                </button>
              </div>
              <div className="blessing-cell-invite-or">또는</div>
              <button
                type="button"
                className="blessing-btn-primary"
                style={{ width: "100%" }}
                onClick={() =>
                  toast.message(
                    "카카오톡 공유는 실제 앱 연동 후 동작합니다.",
                  )
                }
              >
                카카오톡으로 초대 링크 보내기
              </button>
              <button
                type="button"
                className="blessing-btn-secondary"
                style={{ width: "100%", marginTop: 8, minHeight: 40 }}
                onClick={() => setShowInvite(false)}
              >
                닫기
              </button>
            </div>
          </div>
        </div>
      )}
      <div style={{ height: 40 }} />
    </div>
  );
}

function CellFeed() {
  const [posts, setPosts] = useState<CellPost[]>(CELL_POSTS);
  const [draft, setDraft] = useState("");

  const submit = () => {
    const text = draft.trim();
    if (!text) return;
    setPosts((prev) => [
      {
        id: Date.now(),
        author: ME,
        text,
        ts: Date.now(),
        likes: 0,
        comments: 0,
      },
      ...prev,
    ]);
    setDraft("");
    toast.success("나눔이 올라갔어요.");
  };

  return (
    <>
      <div className="blessing-cell-stats-bar">
        <div className="blessing-cell-stat">
          <strong>{MY_CELL.postCount + (posts.length - CELL_POSTS.length)}</strong>
          <span>나눔</span>
        </div>
        <div className="blessing-feed-stat-divider" />
        <div className="blessing-cell-stat">
          <strong>{MY_CELL.prayerCount}</strong>
          <span>기도제목</span>
        </div>
        <div className="blessing-feed-stat-divider" />
        <div className="blessing-cell-stat">
          <strong>{MY_CELL.members.length}</strong>
          <span>멤버</span>
        </div>
        <div className="blessing-feed-stat-divider" />
        <div className="blessing-cell-stat">
          <strong style={{ color: "var(--blessing-accent-strong)" }}>
            LIVE
          </strong>
          <span>목장</span>
        </div>
      </div>

      <div className="blessing-cell-post-list">
        {posts.map((p) => (
          <article key={p.id} className="blessing-cell-post">
            <Avatar name={p.author} size={34} seed={p.id * 7} />
            <div className="blessing-cell-post-body">
              <div className="blessing-cell-post-head">
                <span className="blessing-cell-post-name">
                  {p.author}
                  {p.author === ME && (
                    <span className="blessing-me-badge">나</span>
                  )}
                </span>
                <span className="blessing-cell-post-time">
                  {timeAgoKo(Date.now() - p.ts)} 전
                </span>
              </div>
              <div className="blessing-cell-post-text">{p.text}</div>
              <div className="blessing-cell-post-actions">
                <button type="button" className="blessing-cell-post-btn">
                  ❤️ {p.likes}
                </button>
                <button type="button" className="blessing-cell-post-btn">
                  💬 {p.comments}
                </button>
                <button type="button" className="blessing-cell-post-btn">
                  🙏
                </button>
              </div>
            </div>
          </article>
        ))}
      </div>

      <form
        className="blessing-cell-quick-post blessing-cell-quick-post-sticky"
        onSubmit={(e) => {
          e.preventDefault();
          submit();
        }}
      >
        <Avatar name={ME} size={32} seed={1} />
        <input
          type="text"
          className="blessing-cell-quick-input"
          placeholder="목장 식구들과 나누고 싶은 것이 있나요?"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          maxLength={500}
        />
        <button
          type="submit"
          className="blessing-cell-quick-icon"
          disabled={!draft.trim()}
          aria-label="올리기"
        >
          <IconPlus />
        </button>
      </form>
    </>
  );
}

function CellPrayer() {
  const [prayers, setPrayers] = useState<CellPrayerItem[]>(CELL_PRAYERS);
  const [draft, setDraft] = useState("");

  const submit = () => {
    const text = draft.trim();
    if (!text) return;
    setPrayers((prev) => [
      { author: ME, text, ts: Date.now(), prays: 0 },
      ...prev,
    ]);
    setDraft("");
    toast.success("목장 기도제목이 올라갔어요.");
  };

  return (
    <>
      <div className="blessing-cell-section-label">
        <span>목장 기도제목</span>
      </div>
      <div className="blessing-cell-prayer-list">
        {prayers.map((p, i) => (
          <div key={`${p.ts}-${i}`} className="blessing-cell-prayer-item">
            <Avatar name={p.author} size={30} seed={i * 13} />
            <div className="blessing-cell-prayer-body">
              <div className="blessing-cell-post-head">
                <span className="blessing-cell-post-name">
                  {p.author}
                  {p.author === ME && (
                    <span className="blessing-me-badge">나</span>
                  )}
                </span>
                <span className="blessing-cell-post-time">
                  {timeAgoKo(Date.now() - p.ts)} 전
                </span>
              </div>
              <div className="blessing-cell-prayer-text">{p.text}</div>
              <button type="button" className="blessing-cell-pray-btn">
                🙏 중보 {p.prays}
              </button>
            </div>
          </div>
        ))}
      </div>
      <form
        className="blessing-cell-prayer-compose blessing-cell-prayer-compose-sticky"
        onSubmit={(e) => {
          e.preventDefault();
          submit();
        }}
      >
        <textarea
          className="blessing-cell-textarea"
          placeholder="목장 기도제목을 나눠주세요..."
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          maxLength={500}
        />
        <button
          type="submit"
          className="blessing-btn-primary"
          style={{ width: "100%", marginTop: 8 }}
          disabled={!draft.trim()}
        >
          기도제목 올리기
        </button>
      </form>
    </>
  );
}

function CellMeeting() {
  return (
    <>
      <div className="blessing-cell-section-label">
        <span>예정된 모임</span>
        <button type="button" className="blessing-cell-add-btn">
          + 모임 추가
        </button>
      </div>
      <div className="blessing-cell-mtg-list">
        {CELL_UPCOMING.map((m, i) => {
          const isNext = i === 0;
          const [mm, dayOnly] = m.date.split(" ");
          return (
            <article
              key={i}
              className={`blessing-cell-mtg-card${isNext ? " blessing-cell-mtg-next" : ""}`}
            >
              {isNext && (
                <span className="blessing-cell-mtg-next-badge">NEXT</span>
              )}
              <div className="blessing-cell-mtg-date-col">
                <div className="blessing-cell-mtg-date">{mm}</div>
                <div className="blessing-cell-mtg-day">{dayOnly ?? ""}</div>
              </div>
              <div className="blessing-cell-mtg-body">
                <div className="blessing-cell-mtg-topic">{m.topic}</div>
                <div className="blessing-cell-mtg-meta">
                  <span>🕖 {m.time}</span>
                  <span className="blessing-dot">·</span>
                  <span>📍 {m.place}</span>
                </div>
                {m.attending != null && (
                  <div className="blessing-cell-mtg-attend">
                    <div className="blessing-cell-mtg-attend-bar">
                      <div
                        className="blessing-cell-mtg-attend-fill"
                        style={{ width: `${(m.attending / m.total) * 100}%` }}
                      />
                    </div>
                    <span>
                      {m.attending}/{m.total}명 참석 확인
                    </span>
                  </div>
                )}
                {isNext && (
                  <button
                    type="button"
                    className="blessing-btn-primary"
                    style={{ width: "100%", marginTop: 10, height: 38, fontSize: 13 }}
                  >
                    참석 확인하기
                  </button>
                )}
              </div>
            </article>
          );
        })}
      </div>

      <div className="blessing-cell-section-label" style={{ marginTop: 8 }}>
        <span>지난 모임</span>
      </div>
      <div className="blessing-cell-mtg-list">
        {CELL_PAST.map((m, i) => (
          <article key={i} className="blessing-cell-mtg-past">
            <div className="blessing-cell-mtg-past-date">{m.date}</div>
            <div className="blessing-cell-mtg-past-body">
              <div className="blessing-cell-mtg-topic">{m.topic}</div>
              {m.highlight && (
                <div className="blessing-cell-mtg-highlight">
                  💬 {m.highlight}
                </div>
              )}
              <div
                style={{
                  fontSize: 11,
                  color: "var(--blessing-fg-2)",
                  fontFamily: "var(--blessing-mono)",
                  marginTop: 4,
                }}
              >
                {m.attending}/{m.total}명 참석
              </div>
            </div>
          </article>
        ))}
      </div>
    </>
  );
}

function CellMembers() {
  const router = useRouter();
  return (
    <>
      <div className="blessing-cell-section-label">
        <span>목장 멤버 {MY_CELL.members.length}명</span>
      </div>
      <div className="blessing-cell-member-list">
        {MY_CELL.members.map((m, i) => (
          <div key={i} className="blessing-cell-member-row">
            <Avatar name={m.name} size={40} seed={i * 11} />
            <div className="blessing-cell-member-info">
              <div className="blessing-cell-member-name">
                {m.name}
                {m.isMe && <span className="blessing-me-badge">나</span>}
              </div>
              <div className="blessing-cell-member-role">
                {m.role}
                {m.verified ? " · ✓ 인증" : ""}
              </div>
            </div>
            {!m.isMe && (
              <button
                type="button"
                className="blessing-cell-member-msg"
                aria-label={`${m.name}님에게 쪽지`}
                onClick={() =>
                  toast.message("실제 쪽지 연결은 사용자 ID 매핑 후 동작합니다.")
                }
              >
                <IconMessage />
              </button>
            )}
          </div>
        ))}
      </div>
      <div style={{ padding: 16 }}>
        <Link
          href="/messages/new"
          className="blessing-btn-primary"
          style={{ width: "100%" }}
        >
          멤버 초대하기
        </Link>
      </div>
    </>
  );
}
