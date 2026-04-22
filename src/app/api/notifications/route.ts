import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/apiAuth";

export interface NotificationItem {
  id: string;
  type: "reply" | "mention" | "like" | "prayer" | "system" | "event";
  who: string;
  action: string;
  preview?: string | null;
  on?: string | null;
  postId?: number | null;
  commentId?: number | null;
  created_at: string;
}

const MAX_ITEMS = 40;

export async function GET(request: NextRequest) {
  try {
    const user = await requireUser(request);
    if (!user) {
      return NextResponse.json({ error: "인증이 필요합니다." }, { status: 401 });
    }

    const lookbackDays = 30;
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - lookbackDays);

    // My comment IDs for "reply to my comment" lookup
    const myCommentIds = (
      await prisma.comment.findMany({
        where: { author_id: user.id },
        select: { id: true },
      })
    ).map((c) => c.id);

    // Recent comments on my posts or replies to my comments, authored by others
    const rawComments = await prisma.comment.findMany({
      where: {
        created_at: { gte: cutoff },
        author_id: { not: user.id },
        OR: [
          { post: { is: { author_id: user.id } } },
          myCommentIds.length > 0 ? { parent_id: { in: myCommentIds } } : { id: -1 },
        ],
      },
      orderBy: { created_at: "desc" },
      take: MAX_ITEMS,
      include: {
        author: { select: { id: true, username: true } },
        post: { select: { id: true, title: true, author_id: true } },
      },
    });

    const items: NotificationItem[] = rawComments.map((c) => {
      const isReplyToMyComment = c.parent_id != null && myCommentIds.includes(c.parent_id);
      const type: NotificationItem["type"] = isReplyToMyComment ? "reply" : "reply";
      const action = isReplyToMyComment ? "답글을 남겼어요" : "댓글을 남겼어요";
      return {
        id: `comment:${c.id}`,
        type,
        who: c.author?.username ?? "성도",
        action,
        preview: c.content?.slice(0, 140) ?? null,
        on: c.post?.title ?? null,
        postId: c.post?.id ?? null,
        commentId: c.id,
        created_at: c.created_at.toISOString(),
      };
    });

    // Per-post aggregated likes on my posts (within lookback). Without a Like.created_at we
    // can only surface aggregate counts, not per-event, so we emit one summary per post.
    const myPostsWithLikes = await prisma.post.findMany({
      where: { author_id: user.id, created_at: { gte: cutoff } },
      orderBy: { created_at: "desc" },
      take: 20,
      select: {
        id: true,
        title: true,
        created_at: true,
        _count: { select: { likes: true } },
        likes: {
          take: 1,
          include: { user: { select: { id: true, username: true } } },
        },
      },
    });
    myPostsWithLikes.forEach((p) => {
      const n = p._count.likes;
      if (n <= 0) return;
      const first = p.likes[0]?.user;
      if (!first) return;
      const who =
        n > 1 ? `${first.username} 외 ${n - 1}명` : first.username ?? "성도";
      items.push({
        id: `like:${p.id}`,
        type: "like",
        who,
        action: "공감했어요",
        on: p.title,
        postId: p.id,
        created_at: p.created_at.toISOString(),
      });
    });

    // If the account has no activity at all, fall back to a single system welcome.
    if (items.length === 0) {
      items.push({
        id: "system:welcome",
        type: "system",
        who: "blessing",
        action: "환영합니다 ✞",
        preview: "첫 글을 남기고 성도님들과 소통을 시작해보세요.",
        created_at: new Date().toISOString(),
      });
    }

    items.sort(
      (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
    );

    return NextResponse.json(items.slice(0, MAX_ITEMS));
  } catch (err) {
    console.error("notifications GET error:", err);
    return NextResponse.json(
      { error: "알림을 불러오지 못했습니다." },
      { status: 500 },
    );
  }
}
