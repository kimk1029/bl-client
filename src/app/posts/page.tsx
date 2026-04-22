"use client";

import React, { Suspense, useEffect, useMemo, useState } from "react";
import useSWR from "swr";
import PostList from "@/components/posts/PostList";
import type { Post, Topic } from "@/types/type";
import { useSearchParams } from "next/navigation";
import { apiFetcher } from "@/lib/fetcher";

const CATEGORY_LABELS: Record<Topic, string> = {
  worship: "예배/설교",
  prayer: "기도/QT",
  life: "교회생활",
  faith: "신앙고민",
  mission: "봉사/선교",
  youth: "청년/셀",
  free: "자유게시판",
};
const categories: Topic[] = ["worship", "prayer", "life", "faith", "mission", "youth", "free"];

function PostsContent() {
  const searchParams = useSearchParams();
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedCategory, setSelectedCategory] = useState<Topic | "all">("all");
  const pageSize = 10;

  const { data, error } = useSWR<Post[]>("/api/posts", apiFetcher);

  useEffect(() => {
    const cat = searchParams.get("category") as Topic | null;
    if (cat && categories.includes(cat)) {
      setSelectedCategory(cat);
      setCurrentPage(1);
    }
  }, [searchParams]);

  const filteredPosts = useMemo(() => {
    if (!data || !Array.isArray(data)) return [];
    return selectedCategory === "all"
      ? data
      : data.filter((post) => post && post.category === selectedCategory);
  }, [data, selectedCategory]);

  const totalPages = Math.max(1, Math.ceil(filteredPosts.length / pageSize));
  const startIndex = (currentPage - 1) * pageSize;
  const currentPosts = filteredPosts.slice(startIndex, startIndex + pageSize);

  if (error) {
    return <div className="blessing-list-error">게시글을 불러오지 못했습니다.</div>;
  }
  if (!data) {
    return (
      <div className="blessing-loading">
        <div className="blessing-spinner" aria-label="Loading" />
      </div>
    );
  }

  return (
    <div className="px-4">
      <div className="blessing-chip-row">
        <button
          onClick={() => {
            setSelectedCategory("all");
            setCurrentPage(1);
          }}
          className={`blessing-chip ${selectedCategory === "all" ? "blessing-chip-active" : ""}`}
        >
          전체
        </button>
        {categories.map((c) => (
          <button
            key={c}
            onClick={() => {
              setSelectedCategory(c);
              setCurrentPage(1);
            }}
            className={`blessing-chip ${selectedCategory === c ? "blessing-chip-active" : ""}`}
          >
            {CATEGORY_LABELS[c]}
          </button>
        ))}
      </div>

      <PostList
        posts={currentPosts}
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
        selectedCategory={selectedCategory}
      />
    </div>
  );
}

export default function PostsPage() {
  return (
    <Suspense
      fallback={
        <div className="blessing-loading">
          <div className="blessing-spinner" aria-label="Loading" />
        </div>
      }
    >
      <PostsContent />
    </Suspense>
  );
}
