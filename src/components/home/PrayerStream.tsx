"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import useSWR from "swr";
import { toast } from "sonner";
import { apiFetcher } from "@/lib/fetcher";
import type { Post } from "@/types/type";
import SectionHeader from "./SectionHeader";
import { countLikes, formatTimeAgo } from "./lib/postAdapters";

function PrayButton({ post }: { post: Post }) {
  const router = useRouter();
  const { data: session } = useSession();
  const [count, setCount] = useState<number>(countLikes(post));
  const [prayed, setPrayed] = useState<boolean>(
    !!(post as Post & { liked?: boolean }).liked,
  );
  const [pending, setPending] = useState(false);

  const onClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!session) {
      toast.error("로그인 후 기도해 주세요.");
      router.push("/auth");
      return;
    }
    if (pending) return;
    setPending(true);
    const prev = { count, prayed };
    const nextPrayed = !prayed;
    setPrayed(nextPrayed);
    setCount(Math.max(0, count + (nextPrayed ? 1 : -1)));
    try {
      const res = await fetch(`/api/posts/${post.id}/like`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${(session as { accessToken?: string }).accessToken ?? ""}`,
        },
      });
      if (!res.ok) throw new Error("fail");
      const json = (await res.json()) as { likeCount?: number; liked?: boolean };
      if (typeof json.likeCount === "number") setCount(json.likeCount);
      if (typeof json.liked === "boolean") setPrayed(json.liked);
    } catch {
      setCount(prev.count);
      setPrayed(prev.prayed);
      toast.error("기도 반영에 실패했어요.");
    } finally {
      setPending(false);
    }
  };

  return (
    <button
      type="button"
      className={`blessing-prayer-btn${prayed ? " blessing-prayer-btn-on" : ""}`}
      onClick={onClick}
      disabled={pending}
      aria-label="이 기도제목에 함께 기도하기"
    >
      <span aria-hidden>🙏</span>
      <span>{count}</span>
    </button>
  );
}

export default function PrayerStream() {
  const { data } = useSWR<Post[]>("/api/posts?category=prayer&limit=5", apiFetcher);
  const prayers = Array.isArray(data) ? data : [];

  return (
    <section className="blessing-section">
      <SectionHeader
        icon="🙏"
        title="기도제목"
        en="Prayer Stream"
        count={prayers.length}
        moreHref="/posts?category=prayer"
      />
      <div className="blessing-prayer-stream">
        {prayers.length === 0 ? (
          <Link
            href="/posts/new?topic=prayer"
            className="blessing-prayer-item blessing-prayer-empty"
          >
            <span className="blessing-prayer-icon" aria-hidden>
              🙏
            </span>
            <span className="blessing-prayer-title">
              아직 기도제목이 없어요. 먼저 나눠보시겠어요?
            </span>
            <span className="blessing-prayer-count">
              <span>시작하기</span>
            </span>
          </Link>
        ) : (
          prayers.slice(0, 3).map((p) => (
            <div key={p.id} className="blessing-prayer-item">
              <Link
                href={`/posts/${p.id}`}
                className="blessing-prayer-link"
                aria-label={p.title}
              >
                <span className="blessing-prayer-icon" aria-hidden>
                  🙏
                </span>
                <span className="blessing-prayer-title">{p.title}</span>
                <span className="blessing-prayer-time">
                  {formatTimeAgo(p.created_at)}
                </span>
              </Link>
              <PrayButton post={p} />
            </div>
          ))
        )}
      </div>
    </section>
  );
}
