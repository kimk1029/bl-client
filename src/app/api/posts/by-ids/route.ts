import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/posts/by-ids?ids=1,2,3
// Used by 북마크 화면 — returns posts for the given ID set.
// Anonymous posts are returned as minimal metadata (author hidden).
export async function GET(request: NextRequest) {
  const raw = request.nextUrl.searchParams.get("ids") ?? "";
  const ids = raw
    .split(",")
    .map((s) => Number(s.trim()))
    .filter((n) => Number.isFinite(n) && n > 0);

  if (ids.length === 0) return NextResponse.json([]);
  if (ids.length > 100) {
    return NextResponse.json(
      { error: "최대 100개까지 조회할 수 있어요." },
      { status: 400 },
    );
  }

  try {
    const posts = await prisma.post.findMany({
      where: { id: { in: ids } },
      include: {
        author: { select: { id: true, username: true } },
        _count: { select: { comments: true, likes: true } },
      },
    });

    // Preserve the order of the incoming ids.
    const byId = new Map(posts.map((p) => [p.id, p]));
    const ordered = ids.map((id) => byId.get(id)).filter(Boolean);

    return NextResponse.json(
      ordered.map((p) => ({
        id: p!.id,
        title: p!.title,
        content: p!.content,
        category: p!.tag,
        tag: p!.tag,
        created_at: p!.created_at.toISOString(),
        views: p!.views,
        is_anonymous: p!.is_anonymous,
        author: p!.is_anonymous ? null : p!.author,
        commentCount: p!._count.comments,
        likeCount: p!._count.likes,
      })),
    );
  } catch (err) {
    console.error("posts/by-ids error:", err);
    return NextResponse.json({ error: "서버 오류" }, { status: 500 });
  }
}
