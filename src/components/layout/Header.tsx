"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useSyncExternalStore } from "react";
import { useTheme } from "@/context/ThemeContext";
import { composeBus, composeServerSnapshot } from "@/lib/composeBus";
import { useUnreadCounts } from "@/lib/unreadCounts";
import LogoMark from "./LogoMark";

function BellBadge() {
  const { total, ready } = useUnreadCounts();
  if (!ready || total <= 0) return null;
  const label = total > 99 ? "99+" : String(total);
  return (
    <span className="blessing-bell-badge" aria-label={`읽지 않은 알림 ${total}개`}>
      {label}
    </span>
  );
}

function IconSearch({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden>
      <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="1.8" />
      <path d="m20 20-3.5-3.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

function IconBell() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M6 8a6 6 0 1 1 12 0c0 5 2 6 2 8H4c0-2 2-3 2-8Z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
      <path d="M10 20a2 2 0 0 0 4 0" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

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

function IconEdit() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M3 21v-4l12-12 4 4L7 21H3Z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
      <path d="m13 6 4 4" stroke="currentColor" strokeWidth="1.6" />
    </svg>
  );
}

function IconCog() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
      <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.7" />
      <path
        d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1Z"
        stroke="currentColor"
        strokeWidth="1.4"
      />
    </svg>
  );
}

function IconSun() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
      <circle cx="12" cy="12" r="4" stroke="currentColor" strokeWidth="1.8" />
      <path
        d="M12 2v2M12 20v2M4.2 4.2l1.4 1.4M18.4 18.4l1.4 1.4M2 12h2M20 12h2M4.2 19.8l1.4-1.4M18.4 5.6l1.4-1.4"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}

function IconMoon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8Z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
    </svg>
  );
}

interface SubHeader {
  title: string;
  subtitle?: string;
}

const SUB_HEADERS: Record<string, SubHeader> = {
  "/posts/new": { title: "새 글 쓰기", subtitle: "New Post" },
  "/events": { title: "이벤트", subtitle: "Events & Announcements" },
  "/profile": { title: "마이페이지", subtitle: "My Profile" },
  "/posts": { title: "게시판", subtitle: "Posts" },
  "/search": { title: "검색", subtitle: "Search" },
  "/church": { title: "교회", subtitle: "Churches" },
  "/my-articles": { title: "내 글", subtitle: "My Articles" },
  "/notifications": { title: "알림", subtitle: "Notifications" },
  "/messages": { title: "쪽지", subtitle: "Messages" },
  "/verify-church": { title: "교회 인증", subtitle: "Church Verification" },
  "/auth": { title: "로그인", subtitle: "Sign In" },
  "/about": { title: "소개", subtitle: "About" },
};

function resolveSubHeader(pathname: string): SubHeader | null {
  if (SUB_HEADERS[pathname]) return SUB_HEADERS[pathname];
  // longer keys first so /posts/new wins over /posts
  const keys = Object.keys(SUB_HEADERS).sort((a, b) => b.length - a.length);
  for (const key of keys) {
    if (pathname.startsWith(key + "/")) return SUB_HEADERS[key];
  }
  return null;
}

export default function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === "dark";

  const goSearch = () => router.push("/search");
  const goNotif = () => router.push("/notifications");

  // Post detail owns its own header (back + bookmark + share + kebab).
  if (/^\/posts\/\d+(\/|$)/.test(pathname)) return null;
  // Search owns its own top bar with the live input field.
  if (pathname === "/search") return null;
  // Message thread has a custom header (peer name + subtitle + ⋯).
  if (/^\/messages\/\d+(\/|$)/.test(pathname)) return null;
  // New-message composer owns a search-style top bar.
  if (pathname === "/messages/new") return null;
  // Church verify 3-step wizard has its own header with dynamic step subtitle.
  if (pathname === "/verify-church") return null;
  // Public user profile has its own header (back + more menu).
  if (/^\/users\/\d+(\/|$)/.test(pathname)) return null;

  if (pathname === "/") {
    return (
      <header className="blessing-topbar">
        <div className="blessing-topbar-inner">
          <Link href="/" className="blessing-logo" aria-label="홈">
            <LogoMark size={26} />
            <span className="blessing-logo-text">blessing</span>
          </Link>
          <button
            type="button"
            className="blessing-search-trigger"
            onClick={goSearch}
            aria-label="검색"
          >
            <IconSearch />
            <span className="blessing-search-placeholder">
              기도제목, 설교노트, 청년부...
            </span>
          </button>
          <button
            type="button"
            className="blessing-icon-btn blessing-bell-btn"
            onClick={goNotif}
            aria-label="알림"
          >
            <IconBell />
            <BellBadge />
          </button>
          <button
            type="button"
            className="blessing-icon-btn"
            onClick={toggleTheme}
            aria-label="테마 전환"
          >
            {isDark ? <IconSun /> : <IconMoon />}
          </button>
        </div>
      </header>
    );
  }

  if (pathname === "/topics") {
    return (
      <header className="blessing-topbar">
        <div className="blessing-topbar-inner">
          <Link href="/" className="blessing-logo" aria-label="홈">
            <LogoMark size={26} />
            <span className="blessing-logo-text">토픽</span>
          </Link>
          <div style={{ flex: 1 }} />
          <button
            type="button"
            className="blessing-icon-btn"
            onClick={() => router.push("/posts/new")}
            aria-label="글쓰기"
          >
            <IconEdit />
          </button>
        </div>
      </header>
    );
  }

  const sub = resolveSubHeader(pathname);
  const title = sub?.title ?? "blessing";
  const subtitle = sub?.subtitle;
  const isProfile = pathname.startsWith("/profile");
  const isCompose = pathname === "/posts/new";

  return (
    <header className="blessing-topbar">
      <div className="blessing-topbar-inner">
        <button
          type="button"
          className="blessing-icon-btn"
          onClick={() => router.back()}
          aria-label="뒤로가기"
        >
          <IconBack />
        </button>
        <div className="blessing-back-title-wrap">
          <div className="blessing-back-title">{title}</div>
          {subtitle && <div className="blessing-back-subtitle">{subtitle}</div>}
        </div>
        {pathname === "/events" && (
          <button
            type="button"
            className="blessing-icon-btn"
            onClick={goSearch}
            aria-label="검색"
          >
            <IconSearch />
          </button>
        )}
        {isProfile && (
          <button
            type="button"
            className="blessing-icon-btn"
            aria-label="설정"
          >
            <IconCog />
          </button>
        )}
        {isCompose && <ComposeSubmitButton />}
      </div>
    </header>
  );
}

function ComposeSubmitButton() {
  const { canSubmit, onSubmit } = useSyncExternalStore(
    composeBus.subscribe,
    composeBus.get,
    () => composeServerSnapshot,
  );
  return (
    <button
      type="button"
      className="blessing-submit-btn"
      disabled={!canSubmit}
      onClick={() => onSubmit?.()}
    >
      등록
    </button>
  );
}
