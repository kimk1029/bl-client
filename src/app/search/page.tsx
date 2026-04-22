"use client";

import React, { Suspense, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import type { Post } from "@/types/type";
import { topicByCategory } from "@/components/home/data/topics";
import {
  countComments,
  countLikes,
  formatTimeAgo,
} from "@/components/home/lib/postAdapters";

function highlight(text: string, q: string) {
  if (!q) return text;
  try {
    const safe = q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const re = new RegExp(`(${safe})`, "gi");
    return text.split(re).map((part, idx) =>
      re.test(part) ? (
        <mark key={`hl-${idx}`} className="blessing-search-mark">
          {part}
        </mark>
      ) : (
        <span key={`t-${idx}`}>{part}</span>
      ),
    );
  } catch {
    return text;
  }
}

function SearchContent() {
  const searchParams = useSearchParams();
  const query = searchParams.get("q") ?? "";
  const [results, setResults] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    const run = async () => {
      if (!query) {
        setResults([]);
        setIsLoading(false);
        return;
      }
      setIsLoading(true);
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
        const data = await res.json();
        if (!cancelled) setResults(Array.isArray(data) ? data : []);
      } catch {
        if (!cancelled) setResults([]);
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };
    run();
    return () => {
      cancelled = true;
    };
  }, [query]);

  const grouped = useMemo((): [string, Post[]][] => {
    const map = new Map<string, Post[]>();
    results.forEach((p) => {
      const key = (p as unknown as { category?: string }).category || "기타";
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(p);
    });
    return Array.from(map.entries());
  }, [results]);

  return (
    <div>
      <h1 className="blessing-search-heading">
        {query ? `"${query}" 검색 결과` : "검색어를 입력해주세요"}
      </h1>

      {isLoading ? (
        <div className="blessing-loading">
          <div className="blessing-spinner" aria-label="Loading" />
        </div>
      ) : results.length > 0 ? (
        <>
          {grouped.map(([cat, posts]) => {
            const topic = topicByCategory(cat);
            return (
              <section key={cat} className="blessing-section">
                <div className="blessing-section-header">
                  <div className="blessing-section-title-wrap">
                    {topic && (
                      <span className="blessing-section-icon">{topic.emoji}</span>
                    )}
                    <div>
                      <div className="blessing-section-title">
                        {topic?.ko ?? cat}
                      </div>
                      <div className="blessing-section-en">
                        {topic?.en ?? cat} · {posts.length}
                      </div>
                    </div>
                  </div>
                </div>
                <div className="blessing-mag-wrap">
                  {posts.map((post) => (
                    <Link
                      key={post.id}
                      href={`/posts/${post.id}`}
                      className="blessing-mag-row"
                    >
                      <div className="blessing-mag-body">
                        <div className="blessing-mag-title">
                          {highlight(post.title, query)}
                        </div>
                        <div
                          className="blessing-mag-meta"
                          style={{
                            color: "var(--blessing-fg-2)",
                            marginTop: 2,
                            marginBottom: 4,
                          }}
                        >
                          {highlight(post.content.slice(0, 140), query)}
                        </div>
                        <div className="blessing-mag-meta">
                          <span className="blessing-post-author">
                            {post.is_anonymous
                              ? "익명"
                              : post.author?.username ?? "익명"}
                          </span>
                          <span className="blessing-dot">·</span>
                          <span>{formatTimeAgo(post.created_at)}</span>
                          <span className="blessing-dot">·</span>
                          <span className="blessing-post-stat">💬 {countComments(post)}</span>
                          <span className="blessing-dot">·</span>
                          <span className="blessing-post-stat">👍 {countLikes(post)}</span>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </section>
            );
          })}
        </>
      ) : (
        <div className="blessing-list-empty">검색 결과가 없습니다.</div>
      )}
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense
      fallback={
        <div className="blessing-loading">
          <div className="blessing-spinner" aria-label="Loading" />
        </div>
      }
    >
      <SearchContent />
    </Suspense>
  );
}
