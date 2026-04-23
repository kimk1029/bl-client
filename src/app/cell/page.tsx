"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import Avatar from "@/components/common/Avatar";
import { shareOrCopy } from "@/lib/share";
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
const INFO_KEY = "blessing.myCell.info";

type Tab = "feed" | "prayer" | "meeting" | "members";

type CellInfoOverride = Partial<{
  name: string;
  type: string;
  church: string;
  meetDay: string;
  meetPlace: string;
  inviteCode: string;
}>;

type CellDraft = {
  name: string;
  type: string;
  meetDay?: string;
  meetPlace?: string;
};

function randomInviteCode(seed: string): string {
  const base = seed.replace(/[^A-Z0-9가-힣]/gi, "").slice(0, 4).toUpperCase();
  const tail = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `${base || "CELL"}-${tail}`;
}

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
      <circle
        cx="13"
        cy="8"
        r="4"
        stroke="currentColor"
        strokeWidth="1.7"
      />
      <path
        d="M5 21v-1c0-3.3 3.6-5 8-5s8 1.7 8 5v1"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M4 8v6M1 11h6"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
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
  // Christian cross (십자가): 수직 빔이 더 길고, 수평 빔은 위쪽 1/3 지점
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path d="M12 3v18M6 9h12" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
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
  const [cellInfo, setCellInfo] = useState<CellInfoOverride>({});
  const [showEdit, setShowEdit] = useState(false);
  const [showNotif, setShowNotif] = useState(false);

  useEffect(() => {
    try {
      const v = localStorage.getItem(HAS_CELL_KEY);
      setHasCell(v !== "false");
      const raw = localStorage.getItem(INFO_KEY);
      if (raw) {
        try {
          const info = JSON.parse(raw) as CellInfoOverride;
          setCellInfo(info);
          // Custom cell = 사용자가 직접 만들거나 가입한 목장.
          // mock 초기 데이터(모임·피드·기도제목·멤버)를 노출하지 않음.
          if (info.name) setUpcoming([]);
        } catch {
          /* ignore invalid JSON */
        }
      }
    } catch {
      setHasCell(true);
    }
  }, []);

  const myCell = useMemo(
    () => ({ ...MY_CELL, ...cellInfo }),
    [cellInfo],
  );
  const isCustom = !!cellInfo.name;

  useEffect(() => {
    const open =
      showInvite ||
      showMore ||
      showJoin ||
      showCreate ||
      showAddMtg ||
      showEdit ||
      showNotif;
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      setShowInvite(false);
      setShowMore(false);
      setShowJoin(false);
      setShowCreate(false);
      setShowAddMtg(false);
      setShowEdit(false);
      setShowNotif(false);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [showInvite, showMore, showJoin, showCreate, showAddMtg, showEdit, showNotif]);

  const persistHasCell = (v: boolean) => {
    try {
      localStorage.setItem(HAS_CELL_KEY, v ? "true" : "false");
    } catch {
      /* ignore storage failures */
    }
  };

  const persistInfo = (info: CellInfoOverride) => {
    setCellInfo(info);
    try {
      localStorage.setItem(INFO_KEY, JSON.stringify(info));
    } catch {
      /* ignore storage failures */
    }
  };

  const handleJoin = (code: string) => {
    const next: CellInfoOverride = {
      name: `초대코드 ${code}`,
      type: cellInfo.type ?? "목장",
      inviteCode: code,
    };
    persistHasCell(true);
    persistInfo(next);
    setUpcoming([]);
    setAttendMap({});
    setHasCell(true);
    setShowJoin(false);
    toast.success(`"${code}" 초대 코드로 목장에 가입했어요.`);
  };

  const handleCreate = (draft: CellDraft) => {
    const next: CellInfoOverride = {
      name: draft.name,
      type: draft.type,
      meetDay: draft.meetDay || undefined,
      meetPlace: draft.meetPlace || undefined,
      inviteCode: randomInviteCode(draft.name),
    };
    persistHasCell(true);
    persistInfo(next);
    setUpcoming([]);
    setAttendMap({});
    setHasCell(true);
    setShowCreate(false);
    toast.success(`"${draft.name}" ${draft.type}이 만들어졌어요.`);
  };

  const handleLeave = () => {
    if (typeof window !== "undefined" && !window.confirm("정말 목장에서 나가시겠어요?")) {
      return;
    }
    persistHasCell(false);
    setCellInfo({});
    setUpcoming(CELL_UPCOMING);
    setAttendMap({});
    try {
      localStorage.removeItem(INFO_KEY);
    } catch {
      /* ignore */
    }
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

  const handleEdit = (draft: CellDraft) => {
    const next: CellInfoOverride = {
      ...cellInfo,
      name: draft.name,
      type: draft.type,
      meetDay: draft.meetDay || undefined,
      meetPlace: draft.meetPlace || undefined,
    };
    persistInfo(next);
    setShowEdit(false);
    toast.success("목장 정보가 저장되었어요.");
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
      <div className="blessing-detail blessing-cell-detail">
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
          <div className="blessing-dm-title">{myCell.name}</div>
          <div className="blessing-dm-subtitle">
            {myCell.type} · {myCell.church}
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
          ["feed", "나눔피드", "💬"],
          ["prayer", "기도제목", "🙏"],
          ["meeting", "모임일정", "📅"],
          ["members", "멤버", "👥"],
        ] as Array<[Tab, string, string]>).map(([id, label, icon]) => (
          <button
            key={id}
            type="button"
            className={`blessing-hub-tab ${tab === id ? "blessing-hub-tab-active" : ""}`}
            onClick={() => setTab(id)}
          >
            <span className="blessing-cell-tab-icon" aria-hidden>
              {icon}
            </span>
            <span>{label}</span>
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

      {tab === "feed" && (
        <CellFeed key={isCustom ? "custom" : "mock"} isCustom={isCustom} />
      )}
      {tab === "prayer" && (
        <CellPrayer key={isCustom ? "custom" : "mock"} isCustom={isCustom} />
      )}
      {tab === "meeting" && (
        <CellMeeting
          upcoming={upcoming}
          attendMap={attendMap}
          onToggleAttend={toggleAttend}
          onAdd={() => setShowAddMtg(true)}
          showPast={!isCustom}
        />
      )}
      {tab === "members" && <CellMembers isCustom={isCustom} />}

      {showInvite && (
        <InviteSheet
          onClose={() => setShowInvite(false)}
          cellName={myCell.name}
          inviteCode={myCell.inviteCode}
        />
      )}
      {showMore && (
        <MoreSheet
          onClose={() => setShowMore(false)}
          onLeave={handleLeave}
          onEdit={() => {
            setShowMore(false);
            setShowEdit(true);
          }}
          onNotif={() => {
            setShowMore(false);
            setShowNotif(true);
          }}
          cellName={myCell.name}
        />
      )}
      {showEdit && (
        <EditSheet
          onClose={() => setShowEdit(false)}
          onSubmit={handleEdit}
          initial={{
            name: myCell.name,
            type: (myCell.type === "셀" ? "셀" : "목장") as "목장" | "셀",
            meetDay: myCell.meetDay,
            meetPlace: myCell.meetPlace,
          }}
        />
      )}
      {showNotif && <NotificationSheet onClose={() => setShowNotif(false)} />}
      {showAddMtg && (
        <AddMeetingSheet
          onClose={() => setShowAddMtg(false)}
          onSubmit={handleAddMeeting}
          cellName={myCell.name}
          defaultPlace={myCell.meetPlace}
          totalMembers={myCell.members.length}
        />
      )}
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
        👥
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

function CellFeed({ isCustom }: { isCustom: boolean }) {
  const [posts, setPosts] = useState<CellPost[]>(
    isCustom ? [] : CELL_POSTS,
  );
  const [draft, setDraft] = useState("");
  const [liked, setLiked] = useState<Set<number>>(new Set());
  const [prayed, setPrayed] = useState<Set<number>>(new Set());

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

  const toggleLike = (id: number) => {
    setLiked((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const togglePray = (id: number) => {
    setPrayed((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  return (
    <>
      <div className="blessing-cell-stats-bar">
        <div className="blessing-cell-stat">
          <strong>
            {isCustom
              ? posts.length
              : MY_CELL.postCount + (posts.length - CELL_POSTS.length)}
          </strong>
          <span>
            <span className="blessing-cell-stat-icon" aria-hidden>💬</span>
            나눔
          </span>
        </div>
        <div className="blessing-feed-stat-divider" />
        <div className="blessing-cell-stat">
          <strong>{isCustom ? 0 : MY_CELL.prayerCount}</strong>
          <span>
            <span className="blessing-cell-stat-icon" aria-hidden>🙏</span>
            기도제목
          </span>
        </div>
        <div className="blessing-feed-stat-divider" />
        <div className="blessing-cell-stat">
          <strong>{isCustom ? 1 : MY_CELL.members.length}</strong>
          <span>
            <span className="blessing-cell-stat-icon" aria-hidden>👥</span>
            멤버
          </span>
        </div>
        <div className="blessing-feed-stat-divider" />
        <div className="blessing-cell-stat">
          <strong style={{ color: "var(--blessing-accent-strong)" }}>
            LIVE
          </strong>
          <span>
            <span className="blessing-cell-stat-icon" aria-hidden>👥</span>
            목장
          </span>
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
                <button
                  type="button"
                  className={`blessing-cell-post-btn${liked.has(p.id) ? " blessing-cell-post-btn-on" : ""}`}
                  onClick={() => toggleLike(p.id)}
                  aria-pressed={liked.has(p.id)}
                >
                  {liked.has(p.id) ? "❤️" : "🤍"}{" "}
                  {p.likes + (liked.has(p.id) ? 1 : 0)}
                </button>
                <span className="blessing-cell-post-btn blessing-cell-post-btn-static">
                  💬 {p.comments}
                </span>
                <button
                  type="button"
                  className={`blessing-cell-post-btn${prayed.has(p.id) ? " blessing-cell-post-btn-on" : ""}`}
                  onClick={() => togglePray(p.id)}
                  aria-pressed={prayed.has(p.id)}
                  aria-label="중보"
                >
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

function CellPrayer({ isCustom }: { isCustom: boolean }) {
  const [prayers, setPrayers] = useState<CellPrayerItem[]>(
    isCustom ? [] : CELL_PRAYERS,
  );
  const [draft, setDraft] = useState("");
  const [joined, setJoined] = useState<Set<number>>(new Set());

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

  const toggleJoin = (ts: number) => {
    setJoined((prev) => {
      const next = new Set(prev);
      if (next.has(ts)) next.delete(ts);
      else next.add(ts);
      return next;
    });
  };

  return (
    <>
      <div className="blessing-cell-section-label">
        <span>
          <span className="blessing-cell-section-icon" aria-hidden>🙏</span>
          목장 기도제목
        </span>
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
              <button
                type="button"
                className={`blessing-cell-pray-btn${joined.has(p.ts) ? " blessing-cell-pray-btn-on" : ""}`}
                onClick={() => toggleJoin(p.ts)}
                aria-pressed={joined.has(p.ts)}
              >
                🙏 중보 {p.prays + (joined.has(p.ts) ? 1 : 0)}
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
  showPast,
}: {
  upcoming: CellMeetingItem[];
  attendMap: Record<string, boolean>;
  onToggleAttend: (key: string) => void;
  onAdd: () => void;
  showPast: boolean;
}) {
  return (
    <>
      <div className="blessing-cell-section-label">
        <span>
          <span className="blessing-cell-section-icon" aria-hidden>📅</span>
          예정된 모임
        </span>
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

      {showPast && (
        <>
          <div
            className="blessing-cell-section-label"
            style={{ marginTop: 8 }}
          >
            <span>
              <span className="blessing-cell-section-icon" aria-hidden>📋</span>
              지난 모임
            </span>
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
      )}
      {upcoming.length === 0 && (
        <div
          className="blessing-event-detail-missing"
          style={{ minHeight: 140 }}
        >
          <div>아직 예정된 모임이 없어요. &ldquo;+ 모임 추가&rdquo; 로 첫 모임을 등록해보세요.</div>
        </div>
      )}
    </>
  );
}

// ---------------------- Members tab ----------------------

function CellMembers({ isCustom }: { isCustom: boolean }) {
  const router = useRouter();
  const members = isCustom
    ? [{ name: ME, role: "목자", verified: false, isMe: true }]
    : MY_CELL.members;
  return (
    <>
      <div className="blessing-cell-section-label">
        <span>
          <span className="blessing-cell-section-icon" aria-hidden>👥</span>
          목장 멤버 {members.length}명
        </span>
      </div>
      <div className="blessing-cell-member-list">
        {members.map((m, i) => (
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
                  router.push(
                    `/messages/new?q=${encodeURIComponent(m.name)}`,
                  )
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
  // Track whether mousedown happened on the backdrop itself so that a text
  // drag-select that begins inside an input and ends outside the sheet does
  // NOT trigger a close (onClick would, because the "click" ends on the
  // backdrop even though it started on the input).
  const downOnBackdrop = useRef(false);
  return (
    <div
      className="blessing-user-sheet-backdrop"
      role="dialog"
      aria-modal="true"
      aria-label={title}
      onMouseDown={(e) => {
        downOnBackdrop.current = e.target === e.currentTarget;
      }}
      onMouseUp={(e) => {
        const close =
          downOnBackdrop.current && e.target === e.currentTarget;
        downOnBackdrop.current = false;
        if (close) onClose();
      }}
      onTouchStart={(e) => {
        downOnBackdrop.current = e.target === e.currentTarget;
      }}
      onTouchEnd={(e) => {
        const close =
          downOnBackdrop.current && e.target === e.currentTarget;
        downOnBackdrop.current = false;
        if (close) onClose();
      }}
    >
      <div className="blessing-user-sheet">
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

function InviteSheet({
  onClose,
  cellName,
  inviteCode,
}: {
  onClose: () => void;
  cellName: string;
  inviteCode: string;
}) {
  return (
    <SheetBase
      title="멤버 초대"
      subtitle={cellName}
      icon={<IconInvite />}
      onClose={onClose}
    >
      <div className="blessing-cell-invite-code">
        <div className="blessing-cell-invite-label">초대 코드</div>
        <div className="blessing-cell-invite-num">{inviteCode}</div>
        <button
          type="button"
          className="blessing-btn-secondary"
          style={{ height: 34, padding: "0 12px" }}
          onClick={async () => {
            try {
              await navigator.clipboard.writeText(inviteCode);
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
          shareOrCopy({
            title: `${cellName} 초대`,
            text: `${cellName} 목장 초대 코드: ${inviteCode}`,
            url: `/cell?invite=${encodeURIComponent(inviteCode)}`,
          })
        }
      >
        초대 링크 공유하기
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
  onEdit,
  onNotif,
  cellName,
}: {
  onClose: () => void;
  onLeave: () => void;
  onEdit: () => void;
  onNotif: () => void;
  cellName: string;
}) {
  return (
    <SheetBase
      title="목장 설정"
      subtitle={cellName}
      icon={<IconMore />}
      onClose={onClose}
    >
      <div className="blessing-user-sheet-menu">
        <button
          type="button"
          className="blessing-user-sheet-item"
          onClick={onEdit}
        >
          <span>✏️</span>
          <span>목장 정보 수정</span>
        </button>
        <button
          type="button"
          className="blessing-user-sheet-item"
          onClick={onNotif}
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
  onSubmit: (draft: CellDraft) => void;
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
      icon={<span style={{ fontSize: 24 }}>👥</span>}
      onClose={onClose}
    >
      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (!valid) return;
          onSubmit({
            name: name.trim(),
            type,
            meetDay: meetDay.trim(),
            meetPlace: meetPlace.trim(),
          });
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

function EditSheet({
  onClose,
  onSubmit,
  initial,
}: {
  onClose: () => void;
  onSubmit: (draft: CellDraft) => void;
  initial: { name: string; type: "목장" | "셀"; meetDay: string; meetPlace: string };
}) {
  const [name, setName] = useState(initial.name);
  const [type, setType] = useState<"목장" | "셀">(initial.type);
  const [meetDay, setMeetDay] = useState(initial.meetDay);
  const [meetPlace, setMeetPlace] = useState(initial.meetPlace);
  const valid = name.trim().length > 0;

  return (
    <SheetBase
      title="목장 정보 수정"
      subtitle={initial.name}
      icon={<span style={{ fontSize: 22 }}>✏️</span>}
      onClose={onClose}
    >
      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (!valid) return;
          onSubmit({
            name: name.trim(),
            type,
            meetDay: meetDay.trim(),
            meetPlace: meetPlace.trim(),
          });
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
            value={meetDay}
            onChange={(e) => setMeetDay(e.target.value)}
            maxLength={30}
          />
        </label>
        <label className="blessing-cell-field">
          <span className="blessing-cell-field-label">모임 장소</span>
          <input
            type="text"
            className="blessing-cell-field-input"
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
          저장
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

const NOTIF_KEY = "blessing.myCell.notif";
type NotifPrefs = {
  mentions: boolean;
  posts: boolean;
  prayers: boolean;
  meetings: boolean;
};
const DEFAULT_NOTIF: NotifPrefs = {
  mentions: true,
  posts: true,
  prayers: true,
  meetings: true,
};

function NotificationSheet({ onClose }: { onClose: () => void }) {
  const [prefs, setPrefs] = useState<NotifPrefs>(DEFAULT_NOTIF);
  useEffect(() => {
    try {
      const raw = localStorage.getItem(NOTIF_KEY);
      if (raw) setPrefs({ ...DEFAULT_NOTIF, ...JSON.parse(raw) });
    } catch {
      /* ignore */
    }
  }, []);

  const save = (next: NotifPrefs) => {
    setPrefs(next);
    try {
      localStorage.setItem(NOTIF_KEY, JSON.stringify(next));
    } catch {
      /* ignore */
    }
  };
  const toggle = (k: keyof NotifPrefs) => save({ ...prefs, [k]: !prefs[k] });

  const rows: Array<[keyof NotifPrefs, string, string]> = [
    ["mentions", "나를 언급한 댓글", "@ 멘션이 달리면 알림"],
    ["posts", "새 나눔", "멤버가 글을 올리면 알림"],
    ["prayers", "새 기도제목", "기도제목이 올라오면 알림"],
    ["meetings", "모임 리마인더", "다음 모임 하루 전 알림"],
  ];

  return (
    <SheetBase
      title="알림 설정"
      subtitle="이 목장의 알림만 개별 조정돼요"
      icon={<span style={{ fontSize: 22 }}>🔔</span>}
      onClose={onClose}
    >
      <div className="blessing-notif-list">
        {rows.map(([key, label, hint]) => (
          <button
            key={key}
            type="button"
            className="blessing-notif-row"
            onClick={() => toggle(key)}
            aria-pressed={prefs[key]}
          >
            <span className="blessing-notif-row-body">
              <span className="blessing-notif-row-label">{label}</span>
              <span className="blessing-notif-row-hint">{hint}</span>
            </span>
            <span
              className={`blessing-anon-switch${prefs[key] ? " blessing-anon-switch-on" : ""}`}
              aria-hidden
            />
          </button>
        ))}
      </div>
      <button
        type="button"
        className="blessing-btn-secondary"
        style={{ width: "100%", marginTop: 10, minHeight: 40 }}
        onClick={onClose}
      >
        닫기
      </button>
    </SheetBase>
  );
}

function AddMeetingSheet({
  onClose,
  onSubmit,
  cellName,
  defaultPlace,
  totalMembers,
}: {
  onClose: () => void;
  onSubmit: (m: CellMeetingItem) => void;
  cellName: string;
  defaultPlace: string;
  totalMembers: number;
}) {
  const [topic, setTopic] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("오후 7:30");
  const [place, setPlace] = useState(defaultPlace);

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
      subtitle={cellName}
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
            place: place.trim() || defaultPlace,
            topic: topic.trim(),
            attending: 0,
            total: totalMembers,
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
            placeholder={defaultPlace}
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
