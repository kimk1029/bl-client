"use client";

import Link from "next/link";
import type { Post } from "@/types/type";
import { topicByCategory } from "./data/topics";
import { countComments, countLikes, formatTimeAgo, formatViews } from "./lib/postAdapters";
import UserLink from "@/components/users/UserLink";

interface Props {
  post: Post;
  rank?: number;
  showTopic?: boolean;
  hot?: boolean;
  pinned?: boolean;
}

export default function PostRow({ post, rank, showTopic = true, hot, pinned }: Props) {
  const topic = topicByCategory(post.category);
  const comments = countComments(post);
  return (
    <Link href={`/posts/${post.id}`} className="blessing-post-row">
      {rank !== undefined && <div className="blessing-post-rank">{rank}</div>}
      <div className="blessing-post-body">
        <div className="blessing-post-meta-top">
          {showTopic && topic && (
            <span className="blessing-post-topic">
              <span className="blessing-post-topic-emoji">{topic.emoji}</span>
              {topic.ko}
            </span>
          )}
          {pinned && (
            <span className="blessing-post-badge blessing-badge-pin">
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" aria-hidden>
                <path d="M12 2 9 9H4l5 5-3 8 6-5 6 5-3-8 5-5h-5l-3-7Z" fill="currentColor" />
              </svg>
              공지
            </span>
          )}
          {hot && !pinned && (
            <span className="blessing-post-badge blessing-badge-hot">
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" aria-hidden>
                <path
                  d="M12 2s-4 5-4 9a4 4 0 0 0 1 3 3 3 0 0 1 3-3c0-2 1-3 1-5 3 2 5 5 5 8a6 6 0 1 1-12 0c0-5 6-7 6-12Z"
                  fill="currentColor"
                />
              </svg>
              HOT
            </span>
          )}
        </div>
        <div className="blessing-post-title">
          {post.title}
          {comments > 0 && <span className="blessing-post-cc">[{comments}]</span>}
        </div>
        <div className="blessing-post-meta-bottom">
          <UserLink
            userId={post.is_anonymous ? null : post.author?.id ?? null}
            username={post.author?.username ?? "익명"}
            className="blessing-post-author"
            disabled={!!post.is_anonymous || !post.author}
          >
            {post.is_anonymous ? "🫧 익명" : post.author?.username ?? "익명"}
          </UserLink>
          <span className="blessing-dot">·</span>
          <span>{formatTimeAgo(post.created_at)}</span>
          <span className="blessing-dot">·</span>
          <span className="blessing-post-stat">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" aria-hidden>
              <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z" stroke="currentColor" strokeWidth="1.8" />
              <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.8" />
            </svg>
            {formatViews(post.views ?? 0)}
          </span>
          <span className="blessing-post-stat">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" aria-hidden>
              <path
                d="M12 20s-8-5-8-11a5 5 0 0 1 8-3 5 5 0 0 1 8 3c0 6-8 11-8 11Z"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinejoin="round"
              />
            </svg>
            {countLikes(post)}
          </span>
        </div>
      </div>
    </Link>
  );
}
