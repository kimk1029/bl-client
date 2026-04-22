import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "새 글 쓰기",
  description: "blessing에 글을 작성하고 성도들과 함께 나눠보세요.",
  alternates: { canonical: "/posts/new" },
  robots: { index: false, follow: false },
};

export default function NewPostLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
