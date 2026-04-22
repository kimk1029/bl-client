import type { Metadata } from "next";
import { getSiteUrl, SITE } from "@/lib/site";

interface PostLite {
  id: number;
  title?: string;
  content?: string;
  author?: { username?: string } | null;
  is_anonymous?: boolean;
}

async function fetchPost(id: string): Promise<PostLite | null> {
  try {
    const res = await fetch(`${getSiteUrl()}/api/posts/${id}`, {
      next: { revalidate: 60 },
    });
    if (!res.ok) return null;
    return (await res.json()) as PostLite;
  } catch {
    return null;
  }
}

function clip(s: string | undefined, n: number): string {
  const v = (s || "").replace(/\s+/g, " ").trim();
  return v.length > n ? v.slice(0, n - 1) + "…" : v;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const post = await fetchPost(id);
  if (!post) {
    return {
      title: "글",
      description: SITE.description,
      alternates: { canonical: `/posts/${id}` },
    };
  }
  const author = post.is_anonymous
    ? "익명"
    : post.author?.username || "성도";
  const title = clip(post.title, 60) || "글";
  const description =
    clip(post.content, 140) ||
    `${author}님이 blessing에 올린 글을 읽어보세요.`;
  return {
    title,
    description,
    alternates: { canonical: `/posts/${id}` },
    openGraph: {
      type: "article",
      title,
      description,
      url: `/posts/${id}`,
      authors: [author],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
  };
}

export default function PostDetailLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
