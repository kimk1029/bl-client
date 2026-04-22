import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "나의 셀·목장",
  description: "소그룹·목장에서 나눔과 기도, 모임 일정, 멤버를 한 곳에서 관리하세요.",
  alternates: { canonical: "/cell" },
  robots: { index: false, follow: false },
};

export default function CellLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
