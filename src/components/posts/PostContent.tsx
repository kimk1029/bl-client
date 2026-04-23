"use client";

import React, { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { toast } from "sonner";
import type { PostContentProps } from "@/types/type";
import { topicByCategory } from "@/components/home/data/topics";
import { formatTimeAgo } from "@/components/home/lib/postAdapters";
import { postBookmarks, usePostBookmarked } from "@/lib/postBookmarks";
import { shareOrCopy } from "@/lib/share";
import Avatar from "@/components/common/Avatar";
import UserLink from "@/components/users/UserLink";
import Comments from "./Comments";

const URL_LIKE = (id: number | string) => `/api/posts/${id}/like`;
const URL_POST = (id: number | string) => `/api/posts/${id}`;

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
function IconBookmark({ filled }: { filled?: boolean }) {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill={filled ? "currentColor" : "none"} aria-hidden>
      <path
        d="M6 3h12v19l-6-4-6 4V3Z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
    </svg>
  );
}
function IconShare() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
      <circle cx="6" cy="12" r="2.5" stroke="currentColor" strokeWidth="1.6" />
      <circle cx="18" cy="6" r="2.5" stroke="currentColor" strokeWidth="1.6" />
      <circle cx="18" cy="18" r="2.5" stroke="currentColor" strokeWidth="1.6" />
      <path d="m8 11 8-4M8 13l8 4" stroke="currentColor" strokeWidth="1.6" />
    </svg>
  );
}
function IconMore() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
      <circle cx="5" cy="12" r="1.7" fill="currentColor" />
      <circle cx="12" cy="12" r="1.7" fill="currentColor" />
      <circle cx="19" cy="12" r="1.7" fill="currentColor" />
    </svg>
  );
}
function IconHeart({ filled }: { filled?: boolean }) {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill={filled ? "currentColor" : "none"} aria-hidden>
      <path
        d="M12 20s-8-5-8-11a5 5 0 0 1 8-3 5 5 0 0 1 8 3c0 6-8 11-8 11Z"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinejoin="round"
      />
    </svg>
  );
}
function IconComment() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M4 6a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H9l-4 3V6Z"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinejoin="round"
      />
    </svg>
  );
}
function IconEye() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z" stroke="currentColor" strokeWidth="1.6" />
      <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.6" />
    </svg>
  );
}

interface KebabMenuProps {
  isMine: boolean;
  onEdit: () => void;
  onDelete: () => void;
  onCopyLink: () => void;
  onReport: () => void;
}

function KebabMenu(props: KebabMenuProps) {
  const [open, setOpen] = useState(false);
  const wrap = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      if (!wrap.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDoc);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const close = () => setOpen(false);

  return (
    <div className="blessing-kebab" ref={wrap}>
      <button
        type="button"
        className="blessing-detail-icon-btn"
        aria-label="더보기"
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
      >
        <IconMore />
      </button>
      {open && (
        <div role="menu" className="blessing-kebab-menu">
          {props.isMine && (
            <>
              <button
                type="button"
                role="menuitem"
                className="blessing-kebab-item"
                onClick={() => {
                  close();
                  props.onEdit();
                }}
              >
                ✏️ 수정하기
              </button>
              <button
                type="button"
                role="menuitem"
                className="blessing-kebab-item blessing-kebab-item-danger"
                onClick={() => {
                  close();
                  props.onDelete();
                }}
              >
                🗑 삭제하기
              </button>
              <div className="blessing-kebab-divider" />
            </>
          )}
          <button
            type="button"
            role="menuitem"
            className="blessing-kebab-item"
            onClick={() => {
              close();
              props.onCopyLink();
            }}
          >
            🔗 링크 복사
          </button>
          {!props.isMine && (
            <button
              type="button"
              role="menuitem"
              className="blessing-kebab-item"
              onClick={() => {
                close();
                props.onReport();
              }}
            >
              🚩 신고하기
            </button>
          )}
        </div>
      )}
    </div>
  );
}

export default function PostContent({
  post,
  backUrl,
}: PostContentProps) {
  const isAnonymous = !!post.is_anonymous;
  const router = useRouter();
  const { data: session } = useSession();
  const token = (session as { accessToken?: string } | null)?.accessToken;
  const postId = Number(post.id);

  const [likeCount, setLikeCount] = useState<number>(post.likeCount || 0);
  const [isLiked, setIsLiked] = useState<boolean>(!!post.liked);
  const [isLiking, setIsLiking] = useState(false);
  const bookmarked = usePostBookmarked(postId);

  const topic = topicByCategory(post.category as string | undefined);
  const isMine =
    (session?.user as { id?: number } | undefined)?.id === post.author?.id;
  const displayAuthor = isAnonymous
    ? "익명"
    : post.author?.username ?? "익명";

  const goBack = () => {
    if (typeof window !== "undefined" && window.history.length > 1) {
      router.back();
    } else {
      router.push(backUrl);
    }
  };

  const handleLike = async () => {
    if (!session || !token) {
      toast.error("로그인 후 사용해주세요.");
      router.push("/auth");
      return;
    }
    if (isLiking) return;
    setIsLiking(true);
    const prev = { liked: isLiked, count: likeCount };
    const nextLiked = !isLiked;
    setIsLiked(nextLiked);
    setLikeCount(Math.max(0, likeCount + (nextLiked ? 1 : -1)));
    try {
      const res = await fetch(URL_LIKE(post.id), {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("fail");
      const j = await res.json();
      if (typeof j.likeCount === "number") setLikeCount(j.likeCount);
      if (typeof j.liked === "boolean") setIsLiked(j.liked);
    } catch {
      setIsLiked(prev.liked);
      setLikeCount(prev.count);
      toast.error("공감 요청에 실패했어요.");
    } finally {
      setIsLiking(false);
    }
  };

  const handleShare = () =>
    shareOrCopy({
      title: post.title,
      text: (post.content || "").slice(0, 120),
      url: `/posts/${post.id}`,
    });

  const handleCopyLink = async () => {
    try {
      const full =
        typeof window !== "undefined"
          ? new URL(`/posts/${post.id}`, window.location.origin).toString()
          : `/posts/${post.id}`;
      await navigator.clipboard.writeText(full);
      toast.success("링크가 복사되었어요.");
    } catch {
      toast.error("복사에 실패했어요.");
    }
  };

  const handleDelete = async () => {
    if (!window.confirm("정말 이 글을 삭제할까요?")) return;
    try {
      const res = await fetch(URL_POST(post.id), {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token ?? ""}` },
      });
      if (!res.ok) throw new Error("fail");
      toast.success("삭제되었습니다.");
      router.push(backUrl);
    } catch {
      toast.error("삭제에 실패했어요.");
    }
  };

  const handleEdit = () => router.push(`${backUrl}/${post.id}/edit`);
  const handleReport = async () => {
    if (!token) {
      toast.error("로그인 후 신고할 수 있어요.");
      return;
    }
    try {
      const res = await fetch("/api/report", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          target_type: "post",
          target_id: post.id,
          reason: "inappropriate",
        }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(json?.error || "신고 실패");
      toast.success(
        json.duplicate ? "이미 접수된 신고예요." : "신고가 접수되었어요.",
      );
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "신고 실패");
    }
  };

  const isHot =
    (post as unknown as { hot?: boolean }).hot === true ||
    likeCount >= 100 ||
    (post.commentCount ?? 0) >= 50;

  return (
    <div className="blessing-detail">
      <header className="blessing-detail-topbar">
        <button
          type="button"
          className="blessing-detail-icon-btn"
          onClick={goBack}
          aria-label="뒤로가기"
        >
          <IconBack />
        </button>
        <div className="blessing-detail-topbar-title">
          {topic?.ko ?? "게시글"}
        </div>
        <div className="blessing-detail-topbar-actions">
          <button
            type="button"
            className={`blessing-detail-icon-btn${bookmarked ? " blessing-detail-icon-btn-on" : ""}`}
            onClick={() => postBookmarks.toggle(postId)}
            aria-label={bookmarked ? "북마크 해제" : "북마크"}
            aria-pressed={bookmarked}
          >
            <IconBookmark filled={bookmarked} />
          </button>
          <button
            type="button"
            className="blessing-detail-icon-btn"
            onClick={handleShare}
            aria-label="공유"
          >
            <IconShare />
          </button>
          <KebabMenu
            isMine={!!isMine}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onCopyLink={handleCopyLink}
            onReport={handleReport}
          />
        </div>
      </header>

      <div className="blessing-detail-body">
        <div className="blessing-detail-topic-line">
          {topic && (
            <Link
              href={`/posts?category=${topic.mapsTo ?? ""}`}
              className="blessing-post-topic"
            >
              <span className="blessing-post-topic-emoji">{topic.emoji}</span>
              {topic.ko}
            </Link>
          )}
          {isHot && (
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

        <h1 className="blessing-detail-title">{post.title}</h1>

        <div className="blessing-detail-author-line">
          <UserLink
            userId={isAnonymous ? null : post.author?.id ?? null}
            username={displayAuthor}
            disabled={isAnonymous || !post.author}
            className="blessing-detail-author-avatar"
          >
            <Avatar name={displayAuthor} seed={postId} size={38} anon={isAnonymous} />
          </UserLink>
          <div className="blessing-detail-author-info">
            <UserLink
              userId={isAnonymous ? null : post.author?.id ?? null}
              username={displayAuthor}
              disabled={isAnonymous || !post.author}
              className="blessing-detail-author-name"
            >
              {isAnonymous ? "🫧 익명" : displayAuthor}
            </UserLink>
            <div className="blessing-detail-author-church">
              {isAnonymous ? "익명 게시판" : "blessing 성도"}
            </div>
          </div>
          <div className="blessing-detail-meta-right">
            <span>{formatTimeAgo(post.created_at)} 전</span>
            <span className="blessing-dot">·</span>
            <IconEye />
            <span>{(post.views ?? 0).toLocaleString()}</span>
          </div>
        </div>

        {Array.isArray(post.images) && post.images.length > 0 && (
          <div className="blessing-detail-images">
            {post.images.map((image, index) => (
              <Image
                key={index}
                src={`${process.env.NEXT_PUBLIC_IMG_URL ?? ""}/${image}`}
                alt={`${post.title} 이미지 ${index + 1}`}
                width={1200}
                height={1200}
                unoptimized
                style={{ width: "100%", height: "auto" }}
              />
            ))}
          </div>
        )}

        <div className="blessing-detail-content">{post.content}</div>

        <div className="blessing-detail-reactions">
          <button
            type="button"
            className={`blessing-react-btn${isLiked ? " blessing-react-btn-on" : ""}`}
            onClick={handleLike}
            disabled={isLiking}
          >
            <IconHeart filled={isLiked} />
            <span>공감</span>
            <span className="blessing-react-count">{likeCount}</span>
          </button>
          <button
            type="button"
            className="blessing-react-btn"
            onClick={handleLike}
            disabled={isLiking}
          >
            <span aria-hidden>🙏</span>
            <span>중보</span>
            <span className="blessing-react-count">
              {Math.floor(likeCount * 0.4)}
            </span>
          </button>
          <button
            type="button"
            className="blessing-react-btn"
            onClick={() => {
              const el = document.getElementById("blessing-comment-input");
              el?.focus();
              el?.scrollIntoView({ block: "center", behavior: "smooth" });
            }}
          >
            <IconComment />
            <span>댓글</span>
            <span className="blessing-react-count">
              {post.commentCount ?? 0}
            </span>
          </button>
        </div>
      </div>

      <Comments
        postId={postId}
        postAuthorId={post.author?.id ?? null}
        commentCount={post.commentCount ?? 0}
      />
    </div>
  );
}
