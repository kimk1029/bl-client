import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "쪽지",
  description: "성도님들과 주고받은 쪽지를 한 곳에서 확인하세요.",
  alternates: { canonical: "/messages" },
  robots: { index: false, follow: false },
};

export default function MessagesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
