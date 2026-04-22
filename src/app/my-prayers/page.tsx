"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import useSWR from "swr";
import type { Post } from "@/types/type";
import {
  countLikes,
  formatTimeAgo,
} from "@/components/home/lib/postAdapters";
import { DetailHeader } from "@/components/layout/DetailHeader";
import { Button, EmptyState } from "@/components/ui";

const tokenFetcher = async (url: string, token?: string | null) => {
  const res = await fetch(url, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
  if (!res.ok) throw new Error(`fetch ${url} ${res.status}`);
  return res.json();
};

export default function MyPrayersPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const token = (session as { accessToken?: string } | null)?.accessToken;

  useEffect(() => {
    if (status === "unauthenticated") router.replace("/auth");
  }, [status, router]);

  const { data, isLoading } = useSWR<Post[]>(
    status === "authenticated" ? "/api/posts/my-prayers" : null,
    (u: string) => tokenFetcher(u, token),
  );

  const prayers = Array.isArray(data) ? data : [];

  return (
    <div className="blessing-detail">
      <DetailHeader title="기도 중인 제목" subtitle="Praying For" />

      {status !== "authenticated" ? (
        <EmptyState
          icon="🙏"
          title="로그인이 필요해요"
          message="내가 함께 기도 중인 제목을 모아보려면 로그인해 주세요."
          action={<Button href="/auth">로그인</Button>}
          minHeight={280}
        />
      ) : isLoading && !data ? (
        <div className="blessing-loading">
          <div className="blessing-spinner" aria-label="Loading" />
        </div>
      ) : prayers.length === 0 ? (
        <EmptyState
          icon="🙏"
          title="함께 기도 중인 제목이 없어요"
          message="기도제목에 공감(🙏)하거나 댓글을 남기면 이곳에 모입니다."
          action={<Button href="/posts?category=prayer">기도제목 보러 가기</Button>}
          minHeight={320}
        />
      ) : (
        <>
          <div className="blessing-section-header">
            <div className="blessing-section-title-wrap">
              <span className="blessing-section-icon">🙏</span>
              <div>
                <div className="blessing-section-title">기도 중인 제목</div>
                <div className="blessing-section-en">
                  PRAYING · {prayers.length}
                </div>
              </div>
            </div>
          </div>
          <div className="blessing-prayer-stream">
            {prayers.map((p) => (
              <Link
                key={p.id}
                href={`/posts/${p.id}`}
                className="blessing-prayer-item"
              >
                <span className="blessing-prayer-icon" aria-hidden>
                  🙏
                </span>
                <span className="blessing-prayer-title">{p.title}</span>
                <span className="blessing-prayer-count">
                  <span>🙏 {countLikes(p)}</span>
                  <span>{formatTimeAgo(p.created_at)}</span>
                </span>
              </Link>
            ))}
          </div>
        </>
      )}
      <div style={{ height: 40 }} />
    </div>
  );
}
