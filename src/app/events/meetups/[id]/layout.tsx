import type { Metadata } from "next";
import { findMeetup } from "@/lib/meetupsMock";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const m = findMeetup(Number(id));
  if (!m) {
    return {
      title: "모임",
      robots: { index: false, follow: false },
    };
  }
  return {
    title: m.title,
    description: m.desc,
    alternates: { canonical: `/events/meetups/${m.id}` },
    openGraph: {
      title: m.title,
      description: m.desc,
      url: `/events/meetups/${m.id}`,
      type: "article",
    },
  };
}

export default function MeetupDetailLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
