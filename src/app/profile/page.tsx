"use client";

import Link from "next/link";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession, signOut } from "next-auth/react";

function MenuChevron() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      style={{ color: "var(--blessing-fg-3)", flexShrink: 0 }}
      aria-hidden
    >
      <path
        d="M9 6l6 6-6 6"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function initialOf(name: string | null | undefined): string {
  if (!name) return "·";
  return name.slice(0, 1).toUpperCase();
}

export default function ProfilePage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "unauthenticated") {
      router.replace("/auth");
    }
  }, [status, router]);

  if (status === "loading" || status === "unauthenticated") {
    return null;
  }
  const u = session?.user as
    | {
        name?: string | null;
        email?: string | null;
        affiliation?: string;
        cell?: string;
      }
    | undefined;

  const me = {
    name: u?.name ?? "게스트",
    church: u?.affiliation ?? "교회 미인증",
    role: u?.cell ?? "성도",
    verified: !!u?.affiliation,
    joined: "2025. 04",
    posts: 0,
    comments: 0,
    prayers: 0,
    bookmarks: 0,
  };

  return (
    <div className="blessing-home">
      <div className="blessing-profile-head">
        <div
          className="blessing-profile-avatar"
          aria-hidden
          style={{
            background: `oklch(88% 0.04 ${
              (me.name.charCodeAt(0) * 17) % 360
            })`,
            color: `oklch(35% 0.06 ${(me.name.charCodeAt(0) * 17) % 360})`,
          }}
        >
          {initialOf(me.name)}
        </div>
        <div className="blessing-profile-name-line">
          <span className="blessing-profile-name">{me.name}</span>
          {me.verified && <span className="blessing-verify-badge">✓ 인증</span>}
        </div>
        <div className="blessing-profile-church">
          {me.church} · {me.role}
        </div>
        <div className="blessing-profile-joined">블레싱 가입 · {me.joined}</div>
        {status === "authenticated" ? (
          <button className="blessing-profile-edit-btn" type="button">
            프로필 편집
          </button>
        ) : (
          <Link href="/auth" className="blessing-profile-edit-btn">
            로그인
          </Link>
        )}
      </div>

      <div className="px-4">
      <div className="blessing-profile-stats">
        <div className="blessing-profile-stat">
          <div className="blessing-stat-num">{me.posts}</div>
          <div className="blessing-stat-label">작성한 글</div>
        </div>
        <div className="blessing-profile-stat">
          <div className="blessing-stat-num">{me.comments}</div>
          <div className="blessing-stat-label">댓글</div>
        </div>
        <div className="blessing-profile-stat">
          <div className="blessing-stat-num">{me.prayers}</div>
          <div className="blessing-stat-label">🙏 중보</div>
        </div>
        <div className="blessing-profile-stat">
          <div className="blessing-stat-num">{me.bookmarks}</div>
          <div className="blessing-stat-label">북마크</div>
        </div>
      </div>

      <div className="blessing-profile-menu-group">
        <div className="blessing-profile-menu-title">내 활동</div>
        <Link href="/my-articles" className="blessing-profile-menu-row">
          <span className="blessing-menu-emoji">📝</span>
          <span className="blessing-menu-label">내가 쓴 글</span>
          <span className="blessing-menu-badge">{me.posts}</span>
          <MenuChevron />
        </Link>
        <button className="blessing-profile-menu-row" type="button">
          <span className="blessing-menu-emoji">💬</span>
          <span className="blessing-menu-label">내 댓글</span>
          <span className="blessing-menu-badge">{me.comments}</span>
          <MenuChevron />
        </button>
        <button className="blessing-profile-menu-row" type="button">
          <span className="blessing-menu-emoji">🔖</span>
          <span className="blessing-menu-label">북마크</span>
          <span className="blessing-menu-badge">{me.bookmarks}</span>
          <MenuChevron />
        </button>
        <button className="blessing-profile-menu-row" type="button">
          <span className="blessing-menu-emoji">🙏</span>
          <span className="blessing-menu-label">기도 중인 제목</span>
          <span className="blessing-menu-badge">0</span>
          <MenuChevron />
        </button>
      </div>

      <div className="blessing-profile-menu-group">
        <div className="blessing-profile-menu-title">알림 & 메시지</div>
        <Link href="/notifications" className="blessing-profile-menu-row">
          <span className="blessing-menu-emoji">🔔</span>
          <span className="blessing-menu-label">알림</span>
          <MenuChevron />
        </Link>
        <Link href="/messages" className="blessing-profile-menu-row">
          <span className="blessing-menu-emoji">✉️</span>
          <span className="blessing-menu-label">쪽지함</span>
          <MenuChevron />
        </Link>
      </div>

      <div className="blessing-profile-menu-group">
        <div className="blessing-profile-menu-title">교회 & 인증</div>
        <Link href="/verify-church?return=/profile" className="blessing-profile-menu-row">
          <span className="blessing-menu-emoji">🏛️</span>
          <span className="blessing-menu-label">교회 인증</span>
          <span
            className="blessing-menu-badge"
            style={{
              background: "var(--blessing-accent-soft)",
              color: "var(--blessing-accent-strong)",
            }}
          >
            {me.church}
          </span>
          <MenuChevron />
        </Link>
        <Link href="/cell" className="blessing-profile-menu-row">
          <span className="blessing-menu-emoji">🫂</span>
          <span className="blessing-menu-label">나의 셀·목장</span>
          <MenuChevron />
        </Link>
      </div>

      <div className="blessing-profile-menu-group">
        <div className="blessing-profile-menu-title">설정</div>
        <button className="blessing-profile-menu-row" type="button">
          <span className="blessing-menu-emoji">🎨</span>
          <span className="blessing-menu-label">테마 및 표시</span>
          <MenuChevron />
        </button>
        <button className="blessing-profile-menu-row" type="button">
          <span className="blessing-menu-emoji">🔒</span>
          <span className="blessing-menu-label">개인정보 및 보안</span>
          <MenuChevron />
        </button>
        <button className="blessing-profile-menu-row" type="button">
          <span className="blessing-menu-emoji">❓</span>
          <span className="blessing-menu-label">고객센터 · FAQ</span>
          <MenuChevron />
        </button>
        {status === "authenticated" && (
          <button
            className="blessing-profile-menu-row"
            type="button"
            onClick={() => signOut({ callbackUrl: "/" })}
          >
            <span
              className="blessing-menu-emoji"
              style={{ color: "var(--blessing-hot)" }}
            >
              🚪
            </span>
            <span
              className="blessing-menu-label"
              style={{ color: "var(--blessing-hot)" }}
            >
              로그아웃
            </span>
            <span style={{ flex: 1 }} />
          </button>
        )}
      </div>

      <div className="blessing-profile-footer">
        blessing v1.2.0 · 2026
        <br />
        &quot;너희는 세상의 빛이라&quot; — 마태복음 5:14
      </div>
      </div>
    </div>
  );
}
