import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "게시판",
  description:
    "전국 성도들의 따뜻한 이야기. 기도제목·간증·청년부·자유게시판 등 다양한 글을 읽고 나눠보세요.",
  alternates: { canonical: "/posts" },
  openGraph: {
    title: "게시판 — blessing",
    description:
      "전국 성도들의 따뜻한 이야기. 기도제목·간증·청년부·자유게시판 등 다양한 글을 읽고 나눠보세요.",
    url: "/posts",
  },
};

export default function PostsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
