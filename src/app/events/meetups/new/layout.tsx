import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "모임 만들기",
  description: "독서모임·기도회·밥약 등 나만의 커뮤니티 모임을 만들어보세요.",
  alternates: { canonical: "/events/meetups/new" },
  robots: { index: false, follow: false },
};

export default function MeetupCreateLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
