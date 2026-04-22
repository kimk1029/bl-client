import type { Metadata } from "next";
import { getSiteUrl, SITE } from "@/lib/site";

interface LitePublicUser {
  id: number;
  username: string;
  affiliation: string | null;
}

async function fetchUser(id: string): Promise<LitePublicUser | null> {
  try {
    const res = await fetch(`${getSiteUrl()}/api/users/${id}`, {
      next: { revalidate: 60 },
    });
    if (!res.ok) return null;
    return (await res.json()) as LitePublicUser;
  } catch {
    return null;
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const u = await fetchUser(id);
  if (!u) {
    return {
      title: "성도",
      description: SITE.description,
      alternates: { canonical: `/users/${id}` },
    };
  }
  const title = `${u.username}`;
  const description = u.affiliation
    ? `${u.username} · ${u.affiliation} 성도의 프로필과 글을 확인하세요.`
    : `${u.username} 성도의 프로필과 글을 확인하세요.`;
  return {
    title,
    description,
    alternates: { canonical: `/users/${u.id}` },
    openGraph: {
      title: `${title} — blessing`,
      description,
      url: `/users/${u.id}`,
      type: "profile",
    },
  };
}

export default function UserProfileLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
