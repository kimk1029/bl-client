"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import type { PostContentProps } from "@/types/type";
import { topicByCategory } from "@/components/home/data/topics";
import Comments from "./Comments";
import PostActions from "@/components/posts/PostActions";
import { showSuccess, showError } from "@/components/toast";

const URL_LIKE = (id: number | string) => `/api/posts/${id}/like`;

function formatDate(isoString: string): string {
  const d = new Date(isoString);
  const yy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  const hh = String(d.getHours()).padStart(2, "0");
  const mi = String(d.getMinutes()).padStart(2, "0");
  return `${yy}.${mm}.${dd} ${hh}:${mi}`;
}

export default function PostContent({
  post,
  isAnonymous = false,
  backUrl,
}: PostContentProps) {
  const router = useRouter();
  const { data: session } = useSession();

  const [likeCount, setLikeCount] = useState<number>(post.likeCount || 0);
  const [isLiked, setIsLiked] = useState<boolean>(!!post.liked);
  const [showForm, setShowForm] = useState<boolean>(false);
  const [isLiking, setIsLiking] = useState<boolean>(false);

  const topic = topicByCategory(post.category as string | undefined);
  const isMine = session?.user?.id === post.author?.id;
  const displayAuthor = isAnonymous
    ? "익명"
    : post.author?.username ?? "익명";

  const handleLike = async () => {
    if (!session) {
      showError("로그인 후 사용해주세요.");
      router.push("/auth");
      return;
    }
    if (isLiking) return;
    setIsLiking(true);

    const prevLiked = isLiked;
    const prevCount = likeCount;
    const nextLiked = !prevLiked;
    const nextCount = prevCount + (nextLiked ? 1 : -1);
    setIsLiked(nextLiked);
    setLikeCount(Math.max(0, nextCount));

    try {
      const res = await fetch(URL_LIKE(post.id), {
        method: "POST",
        headers: { Authorization: `Bearer ${session.accessToken}` },
      });
      if (!res.ok) throw new Error("fail");
      const result = await res.json();
      if (typeof result.likeCount === "number") setLikeCount(result.likeCount);
      if (typeof result.liked === "boolean") setIsLiked(result.liked);
      const finalLiked = typeof result.liked === "boolean" ? result.liked : nextLiked;
      showSuccess(finalLiked ? "좋아요가 반영되었습니다." : "좋아요가 취소되었습니다.");
    } catch {
      setIsLiked(prevLiked);
      setLikeCount(prevCount);
      showError("좋아요 요청에 실패했습니다.");
    } finally {
      setIsLiking(false);
    }
  };

  const handleCommentToggle = () => {
    if (!session) {
      showError("로그인 후 사용해주세요.");
      router.push("/auth");
      return;
    }
    setShowForm((v) => !v);
  };

  return (
    <div className="blessing-article">
      <button className="blessing-article-back" onClick={() => router.push(backUrl)}>
        ← 목록으로
      </button>

      {topic && (
        <div className="blessing-article-topic">
          <span>{topic.emoji}</span>
          {topic.ko}
        </div>
      )}

      <h1 className="blessing-article-title">{post.title}</h1>

      <div className="blessing-article-meta">
        <span className="blessing-post-author">{displayAuthor}</span>
        <span className="blessing-dot">·</span>
        <time>{formatDate(post.created_at)}</time>
        <span className="blessing-article-meta-stats">
          <span>👁 {post.views ?? 0}</span>
          <span>👍 {likeCount}</span>
          <span>💬 {post.commentCount ?? 0}</span>
        </span>
      </div>

      {Array.isArray(post.images) && post.images.length > 0 && (
        <div className="blessing-article-images">
          {post.images.map((image, index) => (
            <img
              key={index}
              src={`${process.env.NEXT_PUBLIC_IMG_URL ?? ""}/${image}`}
              alt={`post-${index}`}
            />
          ))}
        </div>
      )}

      <div className="blessing-article-body">{post.content}</div>

      {isMine && (
        <PostActions
          postId={post.id}
          backUrl={backUrl}
          onDeleted={() => router.push(backUrl)}
        />
      )}

      <div className="blessing-article-actions">
        <button
          onClick={handleLike}
          className={`blessing-article-action-btn ${isLiked ? "blessing-article-action-btn-liked" : ""}`}
          disabled={isLiking}
        >
          👍 좋아요 {likeCount}
        </button>
        <button
          onClick={handleCommentToggle}
          className="blessing-article-action-btn"
        >
          💬 댓글 {post.commentCount ?? 0}
        </button>
      </div>

      <div className="blessing-article-mini-actions">
        <button className="blessing-article-action-btn blessing-article-action-btn-mini">
          🔖 북마크
        </button>
        <button className="blessing-article-action-btn blessing-article-action-btn-mini">
          🔗 링크 복사
        </button>
      </div>

      <Comments
        postId={post.id}
        showForm={showForm}
        setShowForm={setShowForm}
        isAnonymous={isAnonymous}
      />
    </div>
  );
}
