import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "이벤트",
  description:
    "연합집회·단기선교·찬양제·청년부 수련회까지. 다가오는 교회 행사와 공지를 한 번에.",
  alternates: { canonical: "/events" },
  openGraph: {
    title: "이벤트 — blessing",
    description:
      "연합집회·단기선교·찬양제·청년부 수련회까지. 다가오는 교회 행사와 공지를 한 번에.",
    url: "/events",
  },
};

export default function EventsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
