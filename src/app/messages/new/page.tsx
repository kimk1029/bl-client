"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import Avatar from "@/components/common/Avatar";

interface UserResult {
  id: number;
  username: string;
  affiliation: string | null;
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

export default function NewMessagePage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const token = (session as { accessToken?: string } | null)?.accessToken;

  const [query, setQuery] = useState("");
  const [results, setResults] = useState<UserResult[]>([]);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const reqSeq = useRef(0);

  useEffect(() => {
    const t = window.setTimeout(() => inputRef.current?.focus(), 60);
    return () => window.clearTimeout(t);
  }, []);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.replace("/auth");
    }
  }, [status, router]);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    const q = query.trim();
    if (!q) {
      setResults([]);
      setLoading(false);
      return;
    }
    if (!token) return;
    setLoading(true);
    const myTurn = ++reqSeq.current;
    debounceRef.current = setTimeout(async () => {
      try {
        const res = await fetch(
          `/api/users/search?q=${encodeURIComponent(q)}`,
          { headers: { Authorization: `Bearer ${token}` } },
        );
        if (!res.ok) throw new Error("fetch fail");
        const data = (await res.json()) as UserResult[];
        if (myTurn === reqSeq.current) {
          setResults(Array.isArray(data) ? data : []);
        }
      } catch {
        if (myTurn === reqSeq.current) setResults([]);
      } finally {
        if (myTurn === reqSeq.current) setLoading(false);
      }
    }, 220);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query, token]);

  const trimmed = query.trim();
  const hasTyped = trimmed.length > 0;
  const showResults = useMemo(() => results, [results]);

  if (status !== "authenticated") {
    return (
      <div className="blessing-home">
        <div className="blessing-loading">
          <div className="blessing-spinner" aria-label="Loading" />
        </div>
      </div>
    );
  }

  return (
    <div className="blessing-search">
      <header className="blessing-search-topbar">
        <button
          type="button"
          className="blessing-detail-icon-btn"
          onClick={() => router.back()}
          aria-label="뒤로가기"
        >
          <IconBack />
        </button>
        <div className="blessing-search-input-wrap">
          <IconSearch />
          <input
            ref={inputRef}
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="이름·교회로 성도 검색"
            autoComplete="off"
            aria-label="성도 검색"
          />
          {query && (
            <button
              type="button"
              className="blessing-search-clear"
              onClick={() => setQuery("")}
              aria-label="검색어 지우기"
            >
              ✕
            </button>
          )}
        </div>
      </header>

      <div className="blessing-search-section-title">
        <span>성도 검색</span>
        <span className="blessing-search-section-time">
          {loading ? "검색 중…" : hasTyped ? `${showResults.length}명` : "2자 이상 입력"}
        </span>
      </div>

      {!hasTyped ? (
        <div
          className="blessing-search-empty-recents"
          style={{ padding: "4px 16px 16px" }}
        >
          닉네임이나 출석 교회 이름으로 검색하세요.
        </div>
      ) : loading ? (
        <div className="blessing-loading">
          <div className="blessing-spinner" aria-label="Loading" />
        </div>
      ) : showResults.length === 0 ? (
        <div
          className="blessing-search-no-results"
          style={{ padding: "36px 20px" }}
        >
          <div>일치하는 성도가 없어요.</div>
          <div className="blessing-search-no-results-sub">
            다른 이름이나 교회로 다시 시도해 보세요.
          </div>
        </div>
      ) : (
        <div className="blessing-dm-list">
          {showResults.map((u) => (
            <Link
              key={u.id}
              href={`/messages/${u.id}`}
              className="blessing-dm-row"
            >
              <div className="blessing-dm-avatar-wrap">
                <Avatar name={u.username} size={42} seed={u.id * 13} />
              </div>
              <div className="blessing-dm-body">
                <div className="blessing-dm-head">
                  <span className="blessing-dm-name">
                    {u.username}
                    {u.affiliation && (
                      <span className="blessing-dm-church">
                        {" "}
                        · {u.affiliation}
                      </span>
                    )}
                  </span>
                </div>
                <div className="blessing-dm-preview-line">
                  <span className="blessing-dm-preview">쪽지 보내기 →</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
      <div style={{ height: 40 }} />
    </div>
  );
}
