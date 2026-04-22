import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "이벤트 달력",
  description:
    "다가오는 교회 행사·이벤트를 달력으로 한눈에 확인하세요. 날짜별로 공지와 연합집회를 찾아볼 수 있어요.",
  alternates: { canonical: "/events/calendar" },
  openGraph: {
    title: "이벤트 달력 — blessing",
    description:
      "다가오는 교회 행사·이벤트를 달력으로 한눈에 확인하세요.",
    url: "/events/calendar",
  },
};

export default function EventsCalendarLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
