"use client";

import React from "react";
import Link from "next/link";
import type { PostListProps } from "@/types/type";
import { topicByCategory } from "@/components/home/data/topics";
import {
  countComments,
  countLikes,
  formatTimeAgo,
  formatViews,
  stripContent,
} from "@/components/home/lib/postAdapters";

export default function PostList({
  posts,
  currentPage,
  totalPages,
  onPageChange,
  isAnonymous = false,
  selectedCategory = "all",
}: PostListProps) {
  const basePath = isAnonymous ? "/anonymous" : "/posts";

  if (posts.length === 0) {
    return (
      <div className="blessing-list-empty">
        {selectedCategory === "all"
          ? "아직 게시글이 없습니다"
          : `${selectedCategory} 카테고리에 게시글이 없습니다`}
      </div>
    );
  }

  return (
    <div>
      <div className="blessing-mag-wrap">
        {posts.map((post) => {
          const topic = topicByCategory(post.category);
          const snippet = stripContent(post.content).slice(0, 140);
          return (
            <Link
              key={post.id}
              href={`${basePath}/${post.id}`}
              className="blessing-mag-row"
            >
              <div className="blessing-mag-body">
                {topic && (
                  <div className="blessing-post-topic" style={{ marginBottom: 6 }}>
                    <span className="blessing-post-topic-emoji">
                      {topic.emoji}
                    </span>
                    {topic.ko}
                  </div>
                )}
                <div className="blessing-mag-title">
                  {post.is_anonymous && "🫧 "}
                  {post.title}
                </div>
                {snippet && (
                  <div
                    className="blessing-mag-meta"
                    style={{
                      color: "var(--blessing-fg-2)",
                      marginTop: 2,
                      marginBottom: 4,
                    }}
                  >
                    {snippet}
                  </div>
                )}
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
                  <span className="blessing-dot">·</span>
                  <span className="blessing-post-stat">👁 {formatViews(post.views ?? 0)}</span>
                </div>
              </div>
            </Link>
          );
        })}
      </div>

      {totalPages > 1 && (
        <div className="blessing-pagination">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
            <button
              key={page}
              onClick={() => onPageChange(page)}
              className={`blessing-page-btn ${currentPage === page ? "blessing-page-btn-active" : ""}`}
            >
              {page}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
