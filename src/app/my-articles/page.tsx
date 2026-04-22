"use client";

import React, { useMemo, useState } from "react";
import useSWR from "swr";
import { useSession } from "next-auth/react";
import PostList from "@/components/posts/PostList";
import type { Post, Comment } from "@/types/type";
import { apiFetcher } from "@/lib/fetcher";

type TabKey = "posts" | "comments";

function normalizeToArray<T>(data: any): T[] {
  if (Array.isArray(data)) return data as T[];
  if (data && typeof data === "object") {
    const candidates = [
      data.items,
      data.content,
      data.data,
      data.list,
      data.results,
      data.posts,
    ];
    for (const c of candidates) {
      if (Array.isArray(c)) return c as T[];
    }
  }
  return [] as T[];
}

export default function MyArticlesPage() {
  const { data: session } = useSession();
  const [activeTab, setActiveTab] = useState<TabKey>("posts");

  const userId = (session?.user as unknown as { id?: string | number })?.id;
  const endpoint = userId ? `/api/users/account/${userId}` : null;

  const { data: accountData } = useSWR<any>(endpoint, apiFetcher, {
    revalidateOnFocus: false,
  });

  const myPosts = useMemo(
    () => normalizeToArray<Post>(accountData?.posts),
    [accountData],
  );
  const myComments = useMemo(
    () => normalizeToArray<Comment>(accountData?.comments),
    [accountData],
  );

  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  const pagedPosts = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return myPosts.slice(start, start + pageSize);
  }, [myPosts, currentPage]);

  const totalPages = Math.max(1, Math.ceil(myPosts.length / pageSize));

  return (
    <div>
      <div className="blessing-hub-tabs">
        <button
          className={`blessing-hub-tab ${activeTab === "posts" ? "blessing-hub-tab-active" : ""}`}
          onClick={() => setActiveTab("posts")}
        >
          <span
            className="blessing-hub-tab-dot"
            style={{
              background:
                activeTab === "posts"
                  ? "var(--blessing-accent)"
                  : "var(--blessing-fg-3)",
            }}
          />
          내가 쓴 글
        </button>
        <button
          className={`blessing-hub-tab ${activeTab === "comments" ? "blessing-hub-tab-active" : ""}`}
          onClick={() => setActiveTab("comments")}
        >
          <span
            className="blessing-hub-tab-dot"
            style={{
              background:
                activeTab === "comments"
                  ? "var(--blessing-accent)"
                  : "var(--blessing-fg-3)",
            }}
          />
          내가 쓴 댓글
        </button>
      </div>

      <div className="px-4">
        {activeTab === "posts" ? (
          <PostList
            posts={pagedPosts}
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        ) : myComments.length === 0 ? (
          <div className="blessing-list-empty">아직 작성한 댓글이 없습니다.</div>
        ) : (
          <div>
            {myComments.map((c) => (
              <div key={c.id} className="blessing-comment-row">
                <div className="blessing-comment-body">{c.content}</div>
                <div className="blessing-comment-meta">
                  {new Date(c.created_at).toLocaleString()}
                  {"postTitle" in (c as any) && (
                    <>
                      {" · "}
                      {(c as any).postTitle}
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
