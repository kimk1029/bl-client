import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { toImageUrl } from "@/lib/uploads";

// GET /api/users/[id]/posts — public posts authored by the user
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id: idStr } = await params;
    const id = Number(idStr);
    if (!Number.isFinite(id)) {
      return NextResponse.json({ error: "invalid id" }, { status: 400 });
    }
    const posts = await prisma.post.findMany({
      where: { author_id: id },
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
        created_at: p.created_at.toISOString(),
        views: p.views,
        is_anonymous: p.is_anonymous,
        category: p.tag,
        tag: p.tag,
        author: p.author
          ? { id: p.author.id, username: p.author.username }
          : null,
        comments: p._count.comments,
        likes: p._count.likes,
        commentCount: p._count.comments,
        likeCount: p._count.likes,
        imageUrls: (p.images ?? []).map(toImageUrl),
      })),
    );
  } catch (err) {
    console.error("users/[id]/posts GET error:", err);
    return NextResponse.json({ error: "서버 오류" }, { status: 500 });
  }
}
