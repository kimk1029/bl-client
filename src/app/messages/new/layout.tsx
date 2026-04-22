import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "새 쪽지",
  description: "성도를 찾아 새 쪽지를 보내보세요.",
  alternates: { canonical: "/messages/new" },
  robots: { index: false, follow: false },
};

export default function NewMessageLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
