import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "대화",
  description: "성도님과 1:1 대화",
  robots: { index: false, follow: false },
};

export default function MessageThreadLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
