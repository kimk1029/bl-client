"use client";

import { useEffect, useMemo, useState } from "react";
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
  type CellMeeting as CellMeetingItem,
  type CellPost,
  type CellPrayer as CellPrayerItem,
} from "@/lib/cellMock";

const ME = "은혜충만";
const HAS_CELL_KEY = "blessing.myCell.hasCell";

type Tab = "feed" | "prayer" | "meeting" | "members";

function IconBack() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path d="M15 6l-6 6 6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
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
function IconCheck() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path d="M5 12l5 5 9-11" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
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

function mtgKey(m: Pick<CellMeetingItem, "date" | "topic" | "time">): string {
  return `${m.date}|${m.time}|${m.topic}`;
}

export default function CellPage() {
  const router = useRouter();
  const [hasCell, setHasCell] = useState<boolean | null>(null);
  const [tab, setTab] = useState<Tab>("feed");
  const [showInvite, setShowInvite] = useState(false);
  const [showMore, setShowMore] = useState(false);
  const [showJoin, setShowJoin] = useState(false);
  const [showCreate, setShowCreate] = useState(false);
  const [showAddMtg, setShowAddMtg] = useState(false);
  const [upcoming, setUpcoming] = useState<CellMeetingItem[]>(CELL_UPCOMING);
  const [attendMap, setAttendMap] = useState<Record<string, boolean>>({});

  useEffect(() => {
    try {
      const v = localStorage.getItem(HAS_CELL_KEY);
      setHasCell(v !== "false");
    } catch {
      setHasCell(true);
    }
  }, []);

  useEffect(() => {
    const open =
      showInvite || showMore || showJoin || showCreate || showAddMtg;
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      setShowInvite(false);
      setShowMore(false);
      setShowJoin(false);
      setShowCreate(false);
      setShowAddMtg(false);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [showInvite, showMore, showJoin, showCreate, showAddMtg]);

  const persistHasCell = (v: boolean) => {
    try {
      localStorage.setItem(HAS_CELL_KEY, v ? "true" : "false");
    } catch {
      /* ignore storage failures */
    }
  };

  const handleJoin = (code: string) => {
    persistHasCell(true);
    setHasCell(true);
    setShowJoin(false);
    toast.success(`"${code}" 초대 코드로 목장에 가입했어요.`);
  };

  const handleCreate = (name: string) => {
    persistHasCell(true);
    setHasCell(true);
    setShowCreate(false);
    toast.success(`"${name}" 목장이 만들어졌어요.`);
  };

  const handleLeave = () => {
    if (typeof window !== "undefined" && !window.confirm("정말 목장에서 나가시겠어요?")) {
      return;
    }
    persistHasCell(false);
    setHasCell(false);
    setShowMore(false);
    setTab("feed");
    toast.success("목장에서 나왔어요.");
  };

  const handleAddMeeting = (m: CellMeetingItem) => {
    setUpcoming((prev) =>
      [m, ...prev].sort((a, b) => a.date.localeCompare(b.date)),
    );
    setShowAddMtg(false);
    toast.success("새 모임이 등록되었어요.");
  };

  const toggleAttend = (key: string) => {
    setAttendMap((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  if (hasCell === null) {
    return (
      <div className="blessing-loading">
        <div className="blessing-spinner" aria-label="Loading" />
      </div>
    );
  }

  if (!hasCell) {
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
            <div className="blessing-dm-title">나의 셀·목장</div>
            <div className="blessing-dm-subtitle">My Cell · Small Group</div>
          </div>
        </header>

        <CellEmpty
          onJoin={() => setShowJoin(true)}
          onCreate={() => setShowCreate(true)}
        />

        {showJoin && (
          <JoinSheet
            onClose={() => setShowJoin(false)}
            onSubmit={handleJoin}
          />
        )}
        {showCreate && (
          <CreateSheet
            onClose={() => setShowCreate(false)}
            onSubmit={handleCreate}
          />
        )}

        <div style={{ height: 40 }} />
      </div>
    );
  }

  const nextMeeting = upcoming[0];
  const nextKey = nextMeeting ? mtgKey(nextMeeting) : null;
  const nextAttending = nextKey ? !!attendMap[nextKey] : false;

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
            onClick={() => setShowMore(true)}
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

      {nextMeeting && (
        <div className="blessing-cell-meeting-banner">
          <button
            type="button"
            className="blessing-cell-meeting-info-btn"
            onClick={() => setTab("meeting")}
          >
            <span className="blessing-cell-meeting-dot" />
            <span className="blessing-cell-meeting-info">
              <span className="blessing-cell-meeting-next">다음 모임</span>
              <span className="blessing-cell-meeting-when">
                {nextMeeting.date} · {nextMeeting.time}
              </span>
              <span className="blessing-cell-meeting-where">
                📍 {nextMeeting.place}
              </span>
            </span>
          </button>
          <button
            type="button"
            className={`blessing-cell-attend-btn${nextAttending ? " blessing-cell-attend-btn-on" : ""}`}
            onClick={() => nextKey && toggleAttend(nextKey)}
          >
            {nextAttending ? (
              <>
                <IconCheck /> 참석 확정
              </>
            ) : (
              "참석 확인"
            )}
          </button>
        </div>
      )}

      {tab === "feed" && <CellFeed />}
      {tab === "prayer" && <CellPrayer />}
      {tab === "meeting" && (
        <CellMeeting
          upcoming={upcoming}
          attendMap={attendMap}
          onToggleAttend={toggleAttend}
          onAdd={() => setShowAddMtg(true)}
        />
      )}
      {tab === "members" && <CellMembers />}

      {showInvite && (
        <InviteSheet onClose={() => setShowInvite(false)} />
      )}
      {showMore && (
        <MoreSheet
          onClose={() => setShowMore(false)}
          onLeave={handleLeave}
        />
      )}
      {showAddMtg && (
        <AddMeetingSheet
          onClose={() => setShowAddMtg(false)}
          onSubmit={handleAddMeeting}
        />
      )}

      <div style={{ height: 40 }} />
    </div>
  );
}

// ---------------------- Empty state ----------------------

function CellEmpty({
  onJoin,
  onCreate,
}: {
  onJoin: () => void;
  onCreate: () => void;
}) {
  return (
    <div className="blessing-cell-empty">
      <div className="blessing-cell-empty-emoji" aria-hidden>
        🫂
      </div>
      <div className="blessing-cell-empty-title">
        아직 속한 목장이 없어요
      </div>
      <div className="blessing-cell-empty-msg">
        나의 셀이나 목장을 만들어보세요.
        <br />
        초대 코드가 있다면 기존 목장에 합류할 수도 있어요.
      </div>
      <div className="blessing-cell-empty-actions">
        <button
          type="button"
          className="blessing-btn-primary"
          onClick={onCreate}
        >
          목장 만들기
        </button>
        <button
          type="button"
          className="blessing-btn-secondary blessing-cell-empty-alt"
          onClick={onJoin}
        >
          초대 코드로 가입
        </button>
      </div>
    </div>
  );
}

// ---------------------- Feed tab ----------------------

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

// ---------------------- Prayer tab ----------------------

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

// ---------------------- Meeting tab ----------------------

function CellMeeting({
  upcoming,
  attendMap,
  onToggleAttend,
  onAdd,
}: {
  upcoming: CellMeetingItem[];
  attendMap: Record<string, boolean>;
  onToggleAttend: (key: string) => void;
  onAdd: () => void;
}) {
  return (
    <>
      <div className="blessing-cell-section-label">
        <span>예정된 모임</span>
        <button
          type="button"
          className="blessing-cell-add-btn"
          onClick={onAdd}
        >
          + 모임 추가
        </button>
      </div>
      <div className="blessing-cell-mtg-list">
        {upcoming.map((m, i) => {
          const isNext = i === 0;
          const [mm, dayOnly] = m.date.split(" ");
          const key = mtgKey(m);
          const mine = !!attendMap[key];
          const baseAttending = m.attending ?? 0;
          const displayAttending = baseAttending + (mine ? 1 : 0);
          return (
            <article
              key={key}
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
                <div className="blessing-cell-mtg-attend">
                  <div className="blessing-cell-mtg-attend-bar">
                    <div
                      className="blessing-cell-mtg-attend-fill"
                      style={{
                        width: `${Math.min(100, (displayAttending / m.total) * 100)}%`,
                      }}
                    />
                  </div>
                  <span>
                    {displayAttending}/{m.total}명 참석 확인
                  </span>
                </div>
                <button
                  type="button"
                  className={mine ? "blessing-btn-secondary" : "blessing-btn-primary"}
                  style={{
                    width: "100%",
                    marginTop: 10,
                    height: 38,
                    fontSize: 13,
                    gap: 4,
                  }}
                  onClick={() => onToggleAttend(key)}
                >
                  {mine ? "참석 취소" : isNext ? "참석 확인하기" : "참석"}
                </button>
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

// ---------------------- Members tab ----------------------

function CellMembers() {
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

// ---------------------- Bottom sheets ----------------------

function SheetBase({
  title,
  subtitle,
  icon,
  onClose,
  children,
}: {
  title: string;
  subtitle?: string;
  icon: React.ReactNode;
  onClose: () => void;
  children: React.ReactNode;
}) {
  return (
    <div
      className="blessing-user-sheet-backdrop"
      role="dialog"
      aria-modal="true"
      aria-label={title}
      onClick={onClose}
    >
      <div className="blessing-user-sheet" onClick={(e) => e.stopPropagation()}>
        <div className="blessing-user-sheet-handle" aria-hidden />
        <div className="blessing-user-sheet-head">
          <div
            className="blessing-mychurch-empty-icon"
            style={{ width: 44, height: 44 }}
            aria-hidden
          >
            {icon}
          </div>
          <div className="blessing-user-sheet-head-info">
            <div className="blessing-user-sheet-name">{title}</div>
            {subtitle && (
              <div className="blessing-user-sheet-sub">{subtitle}</div>
            )}
          </div>
        </div>
        <div style={{ padding: "12px 4px 0" }}>{children}</div>
      </div>
    </div>
  );
}

function InviteSheet({ onClose }: { onClose: () => void }) {
  return (
    <SheetBase
      title="멤버 초대"
      subtitle={MY_CELL.name}
      icon={<IconInvite />}
      onClose={onClose}
    >
      <div className="blessing-cell-invite-code">
        <div className="blessing-cell-invite-label">초대 코드</div>
        <div className="blessing-cell-invite-num">{MY_CELL.inviteCode}</div>
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
          toast.message("카카오톡 공유는 실제 앱 연동 후 동작합니다.")
        }
      >
        카카오톡으로 초대 링크 보내기
      </button>
      <button
        type="button"
        className="blessing-btn-secondary"
        style={{ width: "100%", marginTop: 8, minHeight: 40 }}
        onClick={onClose}
      >
        닫기
      </button>
    </SheetBase>
  );
}

function MoreSheet({
  onClose,
  onLeave,
}: {
  onClose: () => void;
  onLeave: () => void;
}) {
  return (
    <SheetBase
      title="목장 설정"
      subtitle={MY_CELL.name}
      icon={<IconMore />}
      onClose={onClose}
    >
      <div className="blessing-user-sheet-menu">
        <button
          type="button"
          className="blessing-user-sheet-item"
          onClick={() =>
            toast.message("목장 정보 수정은 방장만 가능합니다.")
          }
        >
          <span>✏️</span>
          <span>목장 정보 수정</span>
        </button>
        <button
          type="button"
          className="blessing-user-sheet-item"
          onClick={() =>
            toast.message("알림 설정은 곧 제공될 예정이에요.")
          }
        >
          <span>🔔</span>
          <span>알림 설정</span>
        </button>
        <div className="blessing-user-sheet-divider" />
        <button
          type="button"
          className="blessing-user-sheet-item blessing-user-sheet-item-danger"
          onClick={onLeave}
        >
          <span>🚪</span>
          <span>목장 나가기</span>
        </button>
      </div>
      <button
        type="button"
        className="blessing-btn-secondary"
        style={{ width: "100%", marginTop: 8, minHeight: 40 }}
        onClick={onClose}
      >
        닫기
      </button>
    </SheetBase>
  );
}

function JoinSheet({
  onClose,
  onSubmit,
}: {
  onClose: () => void;
  onSubmit: (code: string) => void;
}) {
  const [code, setCode] = useState("");
  const trimmed = code.trim();
  return (
    <SheetBase
      title="목장 가입"
      subtitle="받으신 초대 코드를 입력해주세요"
      icon={<IconInvite />}
      onClose={onClose}
    >
      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (!trimmed) return;
          onSubmit(trimmed.toUpperCase());
        }}
        className="blessing-cell-sheet-form"
      >
        <label className="blessing-cell-field">
          <span className="blessing-cell-field-label">초대 코드</span>
          <input
            type="text"
            className="blessing-cell-field-input"
            placeholder="예: GRACE-7X4B"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            autoFocus
            autoCapitalize="characters"
            maxLength={20}
          />
        </label>
        <button
          type="submit"
          className="blessing-btn-primary"
          style={{ width: "100%", marginTop: 12 }}
          disabled={!trimmed}
        >
          이 코드로 가입하기
        </button>
        <button
          type="button"
          className="blessing-btn-secondary"
          style={{ width: "100%", marginTop: 8, minHeight: 40 }}
          onClick={onClose}
        >
          취소
        </button>
      </form>
    </SheetBase>
  );
}

function CreateSheet({
  onClose,
  onSubmit,
}: {
  onClose: () => void;
  onSubmit: (name: string) => void;
}) {
  const [name, setName] = useState("");
  const [type, setType] = useState<"목장" | "셀">("목장");
  const [meetDay, setMeetDay] = useState("매주 금요일");
  const [meetPlace, setMeetPlace] = useState("");
  const valid = name.trim().length > 0;

  return (
    <SheetBase
      title="목장 만들기"
      subtitle="나의 셀이나 목장을 직접 만들어보세요"
      icon={<span style={{ fontSize: 24 }}>🫂</span>}
      onClose={onClose}
    >
      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (!valid) return;
          onSubmit(name.trim());
        }}
        className="blessing-cell-sheet-form"
      >
        <div className="blessing-cell-field-row">
          <button
            type="button"
            className={`blessing-cell-type-pill${type === "목장" ? " blessing-cell-type-pill-on" : ""}`}
            onClick={() => setType("목장")}
          >
            목장
          </button>
          <button
            type="button"
            className={`blessing-cell-type-pill${type === "셀" ? " blessing-cell-type-pill-on" : ""}`}
            onClick={() => setType("셀")}
          >
            셀
          </button>
        </div>
        <label className="blessing-cell-field">
          <span className="blessing-cell-field-label">
            {type} 이름 <span style={{ color: "var(--blessing-hot)" }}>*</span>
          </span>
          <input
            type="text"
            className="blessing-cell-field-input"
            placeholder={`예: 다음세대 3${type}`}
            value={name}
            onChange={(e) => setName(e.target.value)}
            autoFocus
            maxLength={30}
          />
        </label>
        <label className="blessing-cell-field">
          <span className="blessing-cell-field-label">정기 모임 요일</span>
          <input
            type="text"
            className="blessing-cell-field-input"
            placeholder="예: 매주 금요일 오후 7:30"
            value={meetDay}
            onChange={(e) => setMeetDay(e.target.value)}
            maxLength={30}
          />
        </label>
        <label className="blessing-cell-field">
          <span className="blessing-cell-field-label">모임 장소 (선택)</span>
          <input
            type="text"
            className="blessing-cell-field-input"
            placeholder="예: 스타벅스 강남역점"
            value={meetPlace}
            onChange={(e) => setMeetPlace(e.target.value)}
            maxLength={40}
          />
        </label>
        <button
          type="submit"
          className="blessing-btn-primary"
          style={{ width: "100%", marginTop: 12 }}
          disabled={!valid}
        >
          {type} 만들기
        </button>
        <button
          type="button"
          className="blessing-btn-secondary"
          style={{ width: "100%", marginTop: 8, minHeight: 40 }}
          onClick={onClose}
        >
          취소
        </button>
      </form>
    </SheetBase>
  );
}

function AddMeetingSheet({
  onClose,
  onSubmit,
}: {
  onClose: () => void;
  onSubmit: (m: CellMeetingItem) => void;
}) {
  const [topic, setTopic] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("오후 7:30");
  const [place, setPlace] = useState(MY_CELL.meetPlace);

  const defaultDate = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() + 7);
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    const wd = ["일", "월", "화", "수", "목", "금", "토"][d.getDay()];
    return `${mm}/${dd} (${wd})`;
  }, []);

  const valid = topic.trim().length > 0;

  return (
    <SheetBase
      title="모임 추가"
      subtitle={MY_CELL.name}
      icon={<span style={{ fontSize: 22 }}>📅</span>}
      onClose={onClose}
    >
      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (!valid) return;
          onSubmit({
            date: date.trim() || defaultDate,
            time: time.trim() || "오후 7:30",
            place: place.trim() || MY_CELL.meetPlace,
            topic: topic.trim(),
            attending: 0,
            total: MY_CELL.members.length,
          });
        }}
        className="blessing-cell-sheet-form"
      >
        <label className="blessing-cell-field">
          <span className="blessing-cell-field-label">
            주제 <span style={{ color: "var(--blessing-hot)" }}>*</span>
          </span>
          <input
            type="text"
            className="blessing-cell-field-input"
            placeholder="예: 요한복음 15장 — 포도나무와 가지"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            autoFocus
            maxLength={60}
          />
        </label>
        <label className="blessing-cell-field">
          <span className="blessing-cell-field-label">날짜</span>
          <input
            type="text"
            className="blessing-cell-field-input"
            placeholder={defaultDate}
            value={date}
            onChange={(e) => setDate(e.target.value)}
            maxLength={20}
          />
        </label>
        <label className="blessing-cell-field">
          <span className="blessing-cell-field-label">시간</span>
          <input
            type="text"
            className="blessing-cell-field-input"
            placeholder="오후 7:30"
            value={time}
            onChange={(e) => setTime(e.target.value)}
            maxLength={20}
          />
        </label>
        <label className="blessing-cell-field">
          <span className="blessing-cell-field-label">장소</span>
          <input
            type="text"
            className="blessing-cell-field-input"
            placeholder={MY_CELL.meetPlace}
            value={place}
            onChange={(e) => setPlace(e.target.value)}
            maxLength={40}
          />
        </label>
        <button
          type="submit"
          className="blessing-btn-primary"
          style={{ width: "100%", marginTop: 12 }}
          disabled={!valid}
        >
          모임 등록
        </button>
        <button
          type="button"
          className="blessing-btn-secondary"
          style={{ width: "100%", marginTop: 8, minHeight: 40 }}
          onClick={onClose}
        >
          취소
        </button>
      </form>
    </SheetBase>
  );
}
