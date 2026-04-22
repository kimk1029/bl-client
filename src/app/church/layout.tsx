import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "교회 찾기",
  description: "가까운 교회와 소속 교회를 찾고, 성도들과 연결되어 보세요.",
  alternates: { canonical: "/church" },
  openGraph: {
    title: "교회 찾기 — blessing",
    description: "가까운 교회와 소속 교회를 찾고, 성도들과 연결되어 보세요.",
    url: "/church",
  },
};

export default function ChurchLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
