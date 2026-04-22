import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { computeLevel } from "@/utils/level";
import { getAuthUser } from "@/lib/apiAuth";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id: idStr } = await params;
    const id = Number(idStr);
    if (!Number.isFinite(id)) {
      return NextResponse.json({ error: "invalid id" }, { status: 400 });
    }

    const me = await getAuthUser(request);

    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        username: true,
        email: true,
        affiliation: true,
        points: true,
        created_at: true,
        _count: {
          select: {
            posts: true,
            comments: true,
            followers: true,
            following: true,
          },
        },
      },
    });
    if (!user) {
      return NextResponse.json({ error: "not found" }, { status: 404 });
    }

    // Relationship flags between the current viewer and this user.
    let followed = false;
    let blocked = false;
    let blockedMe = false;
    if (me && me.id !== id) {
      const [f, b, b2] = await Promise.all([
        prisma.follow.findUnique({
          where: {
            follower_id_followee_id: { follower_id: me.id, followee_id: id },
          },
          select: { id: true },
        }),
        prisma.block.findUnique({
          where: {
            blocker_id_blocked_id: { blocker_id: me.id, blocked_id: id },
          },
          select: { id: true },
        }),
        prisma.block.findUnique({
          where: {
            blocker_id_blocked_id: { blocker_id: id, blocked_id: me.id },
          },
          select: { id: true },
        }),
      ]);
      followed = !!f;
      blocked = !!b;
      blockedMe = !!b2;
    }

    const { level } = computeLevel(user.points);
    const isMe = !!me && me.id === user.id;

    return NextResponse.json({
      id: user.id,
      username: user.username,
      // Hide email on public profile for other users.
      email: isMe ? user.email : null,
      affiliation: user.affiliation,
      points: user.points,
      level,
      created_at: user.created_at.toISOString(),
      counts: {
        posts: user._count.posts,
        comments: user._count.comments,
        followers: user._count.followers,
        following: user._count.following,
      },
      relation: {
        isMe,
        followed,
        blocked,
        blockedMe,
      },
    });
  } catch (err) {
    console.error("user GET error:", err);
    return NextResponse.json({ error: "서버 오류" }, { status: 500 });
  }
}
