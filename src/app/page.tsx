"use client";

import React from "react";
import Link from "next/link";
import useSWR from "swr";
import { useRouter } from "next/navigation";
import { useTheme } from "@/context/ThemeContext";
import { apiFetcher } from "@/lib/fetcher";
import { Post } from "@/types/type";
import { Church, MessagesSquare, Users, Flame, ChevronRight } from "lucide-react";
import { FaRegCommentDots } from "react-icons/fa";
import { AiOutlineEye } from "react-icons/ai";

const CHURCH_IMAGE =
  "https://images.unsplash.com/photo-1438032005730-c779502df39b?w=1200&q=80&auto=format&fit=crop";

const categories = [
  { key: "technology", label: "테크" },
  { key: "science", label: "과학" },
  { key: "health", label: "건강" },
  { key: "business", label: "비즈니스" },
  { key: "entertainment", label: "엔터테인먼트" },
  { key: "news", label: "뉴스" },
];

const quickLinks = [
  { href: "/posts", label: "전체 토픽", icon: MessagesSquare },
  { href: "/church", label: "우리 교회", icon: Church },
  { href: "/my-articles", label: "내 글 모음", icon: Users },
  { href: "/search", label: "검색", icon: Flame },
];

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

const stripContent = (s?: string) => (s || "").replace(/\s+/g, " ").trim();

const countComments = (p: any): number =>
  typeof p?.commentCount === "number"
    ? p.commentCount
    : typeof p?.comments === "number"
      ? p.comments
      : Array.isArray(p?.comments)
        ? p.comments.length
        : 0;

const Home: React.FC = () => {
  const router = useRouter();
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const { data: posts } = useSWR<Post[]>("/api/posts", apiFetcher);

  const recent = Array.isArray(posts) ? posts.slice(0, 6) : [];

  return (
    <div className="-mx-4">
      {/* Hero Banner */}
      <div className="px-4">
        <div className="relative h-44 md:h-52 rounded-2xl overflow-hidden bg-gradient-to-br from-indigo-500 via-blue-500 to-sky-500">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={CHURCH_IMAGE}
            alt="Church banner"
            className="absolute inset-0 w-full h-full object-cover"
            onError={(e) => {
              (e.currentTarget as HTMLImageElement).style.display = "none";
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
          <div className="absolute bottom-4 left-5 right-5 text-white">
            <p className="text-[11px] uppercase tracking-wider opacity-90 mb-1">Today&apos;s Blessing</p>
            <h2 className="text-xl md:text-2xl font-bold leading-tight">
              오늘도 축복받는 하루를
            </h2>
            <p className="text-sm opacity-90 mt-1">
              믿음으로 함께 나누는 공간
            </p>
          </div>
        </div>
      </div>

      {/* Quick actions */}
      <div className="px-4 mt-4">
        <div className="grid grid-cols-4 gap-2">
          {quickLinks.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className={`flex flex-col items-center gap-1.5 py-3 rounded-xl border text-center transition-colors ${isDark
                ? "border-gray-800 bg-gray-800/40 hover:bg-gray-800 text-gray-200"
                : "border-gray-100 bg-gray-50 hover:bg-gray-100 text-gray-700"
                }`}
            >
              <Icon className="w-5 h-5" />
              <span className="text-[11px] font-medium">{label}</span>
            </Link>
          ))}
        </div>
      </div>

      {/* Category chips */}
      <div className="mt-5 px-4">
        <div className="flex items-center justify-between mb-2">
          <h3 className={`text-sm font-bold ${isDark ? "text-gray-100" : "text-gray-900"}`}>
            토픽 둘러보기
          </h3>
        </div>
        <div className="overflow-x-auto no-scrollbar -mx-4 px-4">
          <div className="flex gap-2 whitespace-nowrap">
            {categories.map((c) => (
              <button
                key={c.key}
                onClick={() => router.push(`/posts?category=${c.key}`)}
                className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${isDark
                  ? "bg-gray-800 text-gray-200 hover:bg-gray-700"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
              >
                #{c.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Recent posts feed */}
      <div className="mt-6 px-4">
        <div className="flex items-center justify-between mb-2">
          <h3 className={`text-sm font-bold ${isDark ? "text-gray-100" : "text-gray-900"}`}>
            최근 게시글
          </h3>
          <Link
            href="/posts"
            className={`flex items-center gap-0.5 text-xs ${isDark ? "text-gray-400" : "text-gray-500"}`}
          >
            더보기 <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {!posts ? (
          <div className="py-10 flex justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500" />
          </div>
        ) : recent.length === 0 ? (
          <p className={`py-10 text-center text-sm ${isDark ? "text-gray-500" : "text-gray-400"}`}>
            아직 게시글이 없습니다
          </p>
        ) : (
          <ul>
            {recent.map((post, idx) => (
              <li
                key={post.id}
                onClick={() => router.push(`/posts/${post.id}`)}
                className={`cursor-pointer py-4 ${idx !== 0
                  ? `border-t ${isDark ? "border-gray-800" : "border-gray-100"}`
                  : ""
                  }`}
              >
                <div
                  className={`inline-block mb-1 text-[11px] font-medium ${isDark ? "text-blue-400" : "text-blue-600"}`}
                >
                  #{post.category}
                </div>
                <h4
                  className={`text-[15px] font-semibold leading-snug line-clamp-2 ${isDark ? "text-gray-50" : "text-gray-900"}`}
                >
                  {post.title}
                </h4>
                {stripContent(post.content) && (
                  <p
                    className={`mt-1 text-[13px] leading-snug line-clamp-2 ${isDark ? "text-gray-400" : "text-gray-600"}`}
                  >
                    {stripContent(post.content)}
                  </p>
                )}
                <div
                  className={`mt-2 flex items-center gap-x-2 text-[12px] ${isDark ? "text-gray-500" : "text-gray-500"}`}
                >
                  <span className="truncate max-w-[120px]">
                    {post.author?.username ?? "익명"}
                  </span>
                  <span aria-hidden>·</span>
                  <span>{formatRelativeTime(post.created_at)}</span>
                  <span aria-hidden>·</span>
                  <span className="inline-flex items-center gap-1">
                    <FaRegCommentDots className="w-3.5 h-3.5" />
                    {countComments(post)}
                  </span>
                  <span aria-hidden>·</span>
                  <span className="inline-flex items-center gap-1">
                    <AiOutlineEye className="w-3.5 h-3.5" />
                    {post.views ?? 0}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default Home;
