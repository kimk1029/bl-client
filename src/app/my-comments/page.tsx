"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import useSWR from "swr";
import { formatTimeAgo } from "@/components/home/lib/postAdapters";
import { DetailHeader } from "@/components/layout/DetailHeader";
import { Button, EmptyState } from "@/components/ui";

interface MyComment {
  id: number;
  content: string;
  created_at: string;
  postId: number;
  postTitle?: string | null;
}

const tokenFetcher = async (url: string, token?: string | null) => {
  const res = await fetch(url, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
  if (!res.ok) throw new Error(`fetch ${url} ${res.status}`);
  return res.json();
};

export default function MyCommentsPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const token = (session as { accessToken?: string } | null)?.accessToken;

  useEffect(() => {
    if (status === "unauthenticated") router.replace("/auth");
  }, [status, router]);

  const { data, isLoading } = useSWR<MyComment[]>(
    status === "authenticated" ? "/api/comments/my" : null,
    (u: string) => tokenFetcher(u, token),
  );

  const comments = Array.isArray(data) ? data : [];

  return (
    <div className="blessing-detail">
      <DetailHeader title="내 댓글" subtitle="My Comments" />

      {status !== "authenticated" ? (
        <EmptyState
          icon="💬"
          title="로그인이 필요해요"
          message="내가 남긴 댓글을 모아보려면 로그인해 주세요."
          action={<Button href="/auth">로그인</Button>}
          minHeight={280}
        />
      ) : isLoading && !data ? (
        <div className="blessing-loading">
          <div className="blessing-spinner" aria-label="Loading" />
        </div>
      ) : comments.length === 0 ? (
        <EmptyState
          icon="💬"
          title="아직 남긴 댓글이 없어요"
          message="기도제목이나 간증 글에 따뜻한 한마디를 남겨보세요."
          action={<Button href="/posts">게시판 둘러보기</Button>}
          minHeight={320}
        />
      ) : (
        <>
          <div className="blessing-section-header">
            <div className="blessing-section-title-wrap">
              <div>
                <div className="blessing-section-title">내 댓글</div>
                <div className="blessing-section-en">
                  COMMENTS · {comments.length}
                </div>
              </div>
            </div>
          </div>

          <div className="blessing-my-comments-list">
            {comments.map((c) => (
              <Link
                key={c.id}
                href={`/posts/${c.postId}`}
                className="blessing-my-comment-row"
              >
                <div className="blessing-my-comment-on">
                  <span className="blessing-my-comment-on-arrow">›</span>
                  <span className="blessing-my-comment-on-title">
                    {c.postTitle ?? "삭제된 글"}
                  </span>
                </div>
                <div className="blessing-my-comment-text">{c.content}</div>
                <div className="blessing-my-comment-time">
                  {formatTimeAgo(c.created_at)} 전
                </div>
              </Link>
            ))}
          </div>
        </>
      )}
      <div style={{ height: 40 }} />
    </div>
  );
}
