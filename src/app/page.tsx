"use client";

import React, { useMemo } from "react";
import Link from "next/link";
import useSWR from "swr";
import { useRouter } from "next/navigation";
import { useTheme } from "@/context/ThemeContext";
import { apiFetcher } from "@/lib/fetcher";
import { Post } from "@/types/type";
import { ChevronRight } from "lucide-react";
import { FaRegCommentDots } from "react-icons/fa";
import { AiOutlineEye } from "react-icons/ai";

const CATEGORIES = [
  { key: "technology",    label: "테크" },
  { key: "science",       label: "과학" },
  { key: "health",        label: "건강" },
  { key: "business",      label: "비즈니스" },
  { key: "entertainment", label: "엔터테인먼트" },
  { key: "news",          label: "뉴스" },
] as const;

const POSTS_PER_SECTION = 3;

const formatRelativeTime = (isoString: string): string => {
  const date = new Date(isoString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMinutes = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  if (diffHours < 24) {
    if (diffHours >= 1) return `${diffHours}시간전`;
    return `${Math.max(diffMinutes, 1)}분전`;
  }
  const yy = String(date.getFullYear()).slice(2);
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const dd = String(date.getDate()).padStart(2, "0");
  return `${yy}.${mm}.${dd}`;
};

const countComments = (p: any): number =>
  typeof p?.commentCount === "number"
    ? p.commentCount
    : typeof p?.comments === "number"
      ? p.comments
      : Array.isArray(p?.comments)
        ? p.comments.length
        : 0;

interface TopicSectionProps {
  categoryKey: string;
  label: string;
  posts: Post[];
  isDark: boolean;
}

const TopicSection: React.FC<TopicSectionProps> = ({ categoryKey, label, posts, isDark }) => {
  const router = useRouter();

  return (
    <section
      className={`rounded-xl overflow-hidden border ${
        isDark ? "border-gray-800 bg-gray-900" : "border-gray-100 bg-white"
      }`}
    >
      {/* Section header */}
      <div
        className={`flex items-center justify-between px-4 py-2.5 border-b ${
          isDark ? "border-gray-800" : "border-gray-100"
        }`}
      >
        <span
          className={`text-[13px] font-bold ${isDark ? "text-gray-100" : "text-gray-900"}`}
        >
          {label}
        </span>
        <Link
          href={`/posts?category=${categoryKey}`}
          className={`flex items-center gap-0.5 text-[12px] ${
            isDark ? "text-gray-400 hover:text-gray-200" : "text-gray-500 hover:text-gray-700"
          }`}
        >
          더보기 <ChevronRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* Post list */}
      {posts.length === 0 ? (
        <p
          className={`py-5 text-center text-[12px] ${
            isDark ? "text-gray-600" : "text-gray-400"
          }`}
        >
          아직 게시글이 없습니다
        </p>
      ) : (
        <ul>
          {posts.map((post, idx) => (
            <li
              key={post.id}
              onClick={() => router.push(`/posts/${post.id}`)}
              className={`cursor-pointer px-4 py-3 flex items-center justify-between gap-3 ${
                idx !== 0
                  ? `border-t ${isDark ? "border-gray-800" : "border-gray-100"}`
                  : ""
              } ${isDark ? "hover:bg-gray-800/60" : "hover:bg-gray-50"} transition-colors`}
            >
              {/* Title + meta */}
              <div className="min-w-0 flex-1">
                <p
                  className={`text-[14px] font-medium leading-snug truncate ${
                    isDark ? "text-gray-100" : "text-gray-900"
                  }`}
                >
                  {post.title}
                </p>
                <span
                  className={`text-[11px] ${isDark ? "text-gray-500" : "text-gray-400"}`}
                >
                  {formatRelativeTime(post.created_at)}
                </span>
              </div>

              {/* Stats */}
              <div
                className={`flex items-center gap-2 text-[11px] shrink-0 ${
                  isDark ? "text-gray-500" : "text-gray-400"
                }`}
              >
                <span className="inline-flex items-center gap-0.5">
                  <FaRegCommentDots className="w-3 h-3" />
                  {countComments(post)}
                </span>
                <span className="inline-flex items-center gap-0.5">
                  <AiOutlineEye className="w-3 h-3" />
                  {post.views ?? 0}
                </span>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
};

const Home: React.FC = () => {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const { data: posts, isLoading } = useSWR<Post[]>("/api/posts", apiFetcher);

  // 카테고리별 최신 N개씩 분류
  const byCategory = useMemo(() => {
    const all = Array.isArray(posts) ? posts : [];
    return CATEGORIES.map(({ key, label }) => ({
      key,
      label,
      posts: all.filter((p) => p.category === key).slice(0, POSTS_PER_SECTION),
    }));
  }, [posts]);

  return (
    <div className="space-y-3 pb-4">
      {/* 토픽 탭 */}
      <div className="overflow-x-auto no-scrollbar -mx-4 px-4 pt-1">
        <div className="flex gap-2 whitespace-nowrap">
          <Link
            href="/posts"
            className={`px-3 py-1.5 rounded-full text-[12px] font-semibold transition-colors ${
              isDark
                ? "bg-blue-600 text-white"
                : "bg-blue-600 text-white"
            }`}
          >
            전체
          </Link>
          {CATEGORIES.map((c) => (
            <Link
              key={c.key}
              href={`/posts?category=${c.key}`}
              className={`px-3 py-1.5 rounded-full text-[12px] font-medium transition-colors ${
                isDark
                  ? "bg-gray-800 text-gray-300 hover:bg-gray-700"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              {c.label}
            </Link>
          ))}
        </div>
      </div>

      {/* 로딩 */}
      {isLoading && (
        <div className="py-16 flex justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500" />
        </div>
      )}

      {/* 카테고리별 섹션 */}
      {!isLoading &&
        byCategory.map(({ key, label, posts: sectionPosts }) => (
          <TopicSection
            key={key}
            categoryKey={key}
            label={label}
            posts={sectionPosts}
            isDark={isDark}
          />
        ))}
    </div>
  );
};

export default Home;
