import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "기도 중인 제목",
  description: "내가 공감하거나 댓글로 나눴던 기도제목들을 모아봐요.",
  alternates: { canonical: "/my-prayers" },
  robots: { index: false, follow: false },
};

export default function MyPrayersLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
