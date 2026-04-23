"use client";

import { Suspense, useMemo } from "react";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { topicByCategory } from "@/components/home/data/topics";

function HomeIcon({ active }: { active?: boolean }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M3 11 12 3l9 8v10H3V11Z"
        stroke="currentColor"
        strokeWidth={active ? 2 : 1.7}
        strokeLinejoin="round"
      />
    </svg>
  );
}

function GridIcon({ active }: { active?: boolean }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
      <rect x="3" y="3" width="7" height="7" stroke="currentColor" strokeWidth={active ? 2 : 1.7} />
      <rect x="14" y="3" width="7" height="7" stroke="currentColor" strokeWidth={active ? 2 : 1.7} />
      <rect x="3" y="14" width="7" height="7" stroke="currentColor" strokeWidth={active ? 2 : 1.7} />
      <rect x="14" y="14" width="7" height="7" stroke="currentColor" strokeWidth={active ? 2 : 1.7} />
    </svg>
  );
}

function CalendarIcon({ active }: { active?: boolean }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
      <rect
        x="3"
        y="5"
        width="18"
        height="16"
        rx="2"
        stroke="currentColor"
        strokeWidth={active ? 2 : 1.7}
      />
      <path
        d="M3 10h18M8 3v4M16 3v4"
        stroke="currentColor"
        strokeWidth={active ? 2 : 1.7}
        strokeLinecap="round"
      />
    </svg>
  );
}

function UserIcon({ active }: { active?: boolean }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
      <circle cx="12" cy="8" r="4" stroke="currentColor" strokeWidth={active ? 2 : 1.7} />
      <path
        d="M4 21c0-4 4-7 8-7s8 3 8 7"
        stroke="currentColor"
        strokeWidth={active ? 2 : 1.7}
        strokeLinecap="round"
      />
    </svg>
  );
}

function PlusIcon() {
  // Christian cross (십자가): 수직 빔이 더 길고, 수평 빔은 위쪽 1/3 지점
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M12 3v18M6 9h12"
        stroke="currentColor"
        strokeWidth="2.4"
        strokeLinecap="round"
      />
    </svg>
  );
}

const TABS = [
  { href: "/", label: "홈", Icon: HomeIcon },
  { href: "/topics", label: "토픽", Icon: GridIcon },
  { href: "/events", label: "이벤트", Icon: CalendarIcon },
  { href: "/profile", label: "나", Icon: UserIcon },
];

function ComposeFab() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const href = useMemo(() => {
    if (pathname === "/posts") {
      const cat = searchParams.get("category");
      if (cat) {
        const topic = topicByCategory(cat);
        if (topic) return `/posts/new?topic=${topic.id}`;
      }
    }
    if (pathname === "/cell") return "/posts/new?topic=cell";
    return "/posts/new";
  }, [pathname, searchParams]);

  return (
    <Link href={href} className="blessing-fab" aria-label="글쓰기">
      <PlusIcon />
    </Link>
  );
}

export default function BottomNav() {
  const pathname = usePathname();
  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  return (
    <nav className="blessing-bottom-nav">
      <div className="blessing-bottom-tabs">
        {TABS.slice(0, 2).map(({ href, label, Icon }) => {
          const active = isActive(href);
          return (
            <Link
              key={href}
              href={href}
              className={`blessing-tab ${active ? "blessing-tab-active" : ""}`}
            >
              <div className="blessing-tab-icon">
                <Icon active={active} />
              </div>
              <span className="blessing-tab-label">{label}</span>
            </Link>
          );
        })}

        <Suspense
          fallback={
            <Link href="/posts/new" className="blessing-fab" aria-label="글쓰기">
              <PlusIcon />
            </Link>
          }
        >
          <ComposeFab />
        </Suspense>

        {TABS.slice(2).map(({ href, label, Icon }) => {
          const active = isActive(href);
          return (
            <Link
              key={href}
              href={href}
              className={`blessing-tab ${active ? "blessing-tab-active" : ""}`}
            >
              <div className="blessing-tab-icon">
                <Icon active={active} />
              </div>
              <span className="blessing-tab-label">{label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
