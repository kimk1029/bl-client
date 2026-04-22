import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthUser } from "@/lib/apiAuth";

// GET /api/users/[id]/follows?tab=followers|following
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
    const tab =
      request.nextUrl.searchParams.get("tab") === "following"
        ? "following"
        : "followers";

    const me = await getAuthUser(request);

    const rows =
      tab === "followers"
        ? await prisma.follow.findMany({
            where: { followee_id: id },
            orderBy: { created_at: "desc" },
            take: 100,
            include: {
              follower: {
                select: { id: true, username: true, affiliation: true },
              },
            },
          })
        : await prisma.follow.findMany({
            where: { follower_id: id },
            orderBy: { created_at: "desc" },
            take: 100,
            include: {
              followee: {
                select: { id: true, username: true, affiliation: true },
              },
            },
          });

    const users = rows.map((r) => {
      const u = tab === "followers" ? r.follower : r.followee;
      return {
        id: u.id,
        username: u.username,
        affiliation: u.affiliation ?? null,
      };
    });

    // Tag whether I follow each listed user.
    let following: Record<number, boolean> = {};
    if (me && users.length > 0) {
      const myFollows = await prisma.follow.findMany({
        where: {
          follower_id: me.id,
          followee_id: { in: users.map((u) => u.id) },
        },
        select: { followee_id: true },
      });
      following = Object.fromEntries(
        myFollows.map((f) => [f.followee_id, true]),
      );
    }

    return NextResponse.json(
      users.map((u) => ({
        ...u,
        isMe: me?.id === u.id,
        followedByMe: !!following[u.id],
      })),
    );
  } catch (err) {
    console.error("users/[id]/follows GET error:", err);
    return NextResponse.json({ error: "서버 오류" }, { status: 500 });
  }
}
