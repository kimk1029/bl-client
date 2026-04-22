import type { Metadata } from "next";
import type { EventItem } from "@/types/type";
import { getSiteUrl, SITE } from "@/lib/site";

async function fetchEvent(id: string): Promise<EventItem | null> {
  try {
    const res = await fetch(`${getSiteUrl()}/api/events/${id}`, {
      next: { revalidate: 60 },
    });
    if (!res.ok) return null;
    return (await res.json()) as EventItem;
  } catch {
    return null;
  }
}

function clip(s: string | undefined | null, n: number): string {
  const v = (s || "").replace(/\s+/g, " ").trim();
  return v.length > n ? v.slice(0, n - 1) + "…" : v;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const e = await fetchEvent(id);
  if (!e) {
    return {
      title: "이벤트",
      description: SITE.description,
      alternates: { canonical: `/events/${id}` },
    };
  }
  const title = clip(e.title, 60) || "이벤트";
  const parts: string[] = [];
  if (e.date_text) parts.push(e.date_text);
  if (e.location) parts.push(e.location);
  const meta = parts.length ? `[${parts.join(" · ")}] ` : "";
  const description =
    meta + clip(e.description, 140 - meta.length) ||
    `blessing에서 진행되는 교회 이벤트를 확인해보세요.`;

  return {
    title,
    description,
    alternates: { canonical: `/events/${id}` },
    openGraph: {
      type: "article",
      title,
      description,
      url: `/events/${id}`,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
  };
}

export default function EventDetailLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
