"use client";

import React from "react";
import { useParams, useRouter } from "next/navigation";
import useSWR from "swr";
import { useSession } from "next-auth/react";
import PostContent from "@/components/posts/PostContent";

const fetcher = (url: string, token?: string) =>
  fetch(url, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  }).then((res) => {
    if (!res.ok) throw new Error("Network response was not ok");
    return res.json();
  });

const URL_POST = (id: number | string) => `/api/posts/${id}`;

export default function PostDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { data: session } = useSession();
  const id = Number(params.id);

  const { data: postData, error, mutate } = useSWR(URL_POST(id), (url) =>
    fetcher(url, session?.accessToken),
  );

  if (error) {
    return (
      <div className="blessing-list-error" style={{ paddingTop: 40 }}>
        <p>게시글을 불러오는 중 오류가 발생했습니다.</p>
        <button
          onClick={() => router.push("/posts")}
          className="blessing-btn-primary"
          style={{ marginTop: 16 }}
        >
          목록으로 돌아가기
        </button>
      </div>
    );
  }

  if (!postData) {
    return (
      <div className="blessing-loading">
        <div className="blessing-spinner" aria-label="Loading" />
      </div>
    );
  }

  return <PostContent post={postData} backUrl="/posts" mutate={mutate} />;
}
