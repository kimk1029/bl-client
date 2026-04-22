import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/apiAuth";

// GET /api/posts/my-prayers
// "기도 중인 제목" — prayer-category posts that the current user has either
// liked or commented on. Useful as a personal mid-section: the prayers I'm
// actively following.
export async function GET(request: NextRequest) {
  try {
    const me = await requireUser(request);
    if (!me) {
      return NextResponse.json({ error: "인증이 필요합니다." }, { status: 401 });
    }

    const posts = await prisma.post.findMany({
      where: {
        tag: "prayer",
        OR: [
          { likes: { some: { user_id: me.id } } },
          { comments: { some: { author_id: me.id } } },
        ],
      },
      orderBy: { created_at: "desc" },
      take: 50,
      include: {
        author: { select: { id: true, username: true } },
        _count: { select: { comments: true, likes: true } },
      },
    });

    return NextResponse.json(
      posts.map((p) => ({
        id: p.id,
        title: p.title,
        content: p.content,
        category: p.tag,
        tag: p.tag,
        created_at: p.created_at.toISOString(),
        views: p.views,
        is_anonymous: p.is_anonymous,
        author: p.is_anonymous ? null : p.author,
        commentCount: p._count.comments,
        likeCount: p._count.likes,
      })),
    );
  } catch (err) {
    console.error("posts/my-prayers error:", err);
    return NextResponse.json({ error: "서버 오류" }, { status: 500 });
  }
}
