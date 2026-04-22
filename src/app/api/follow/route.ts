import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/apiAuth";

// POST /api/follow — body: { targetId }
// Toggles follow. Returns { followed: boolean, followers: number }.
export async function POST(request: NextRequest) {
  try {
    const me = await requireUser(request);
    if (!me) {
      return NextResponse.json({ error: "인증이 필요합니다." }, { status: 401 });
    }
    const body = await request.json();
    const target = Number(body?.targetId ?? body?.userId);
    if (!Number.isFinite(target) || target <= 0 || target === me.id) {
      return NextResponse.json({ error: "invalid target" }, { status: 400 });
    }

    const existing = await prisma.follow.findUnique({
      where: {
        follower_id_followee_id: {
          follower_id: me.id,
          followee_id: target,
        },
      },
      select: { id: true },
    });

    if (existing) {
      await prisma.follow.delete({ where: { id: existing.id } });
    } else {
      // Prevent following if either party has blocked the other.
      const [b1, b2] = await Promise.all([
        prisma.block.findUnique({
          where: {
            blocker_id_blocked_id: {
              blocker_id: me.id,
              blocked_id: target,
            },
          },
          select: { id: true },
        }),
        prisma.block.findUnique({
          where: {
            blocker_id_blocked_id: {
              blocker_id: target,
              blocked_id: me.id,
            },
          },
          select: { id: true },
        }),
      ]);
      if (b1 || b2) {
        return NextResponse.json(
          { error: "차단된 사용자와는 팔로우할 수 없어요." },
          { status: 403 },
        );
      }

      const exists = await prisma.user.findUnique({
        where: { id: target },
        select: { id: true },
      });
      if (!exists) {
        return NextResponse.json({ error: "not found" }, { status: 404 });
      }

      await prisma.follow.create({
        data: { follower_id: me.id, followee_id: target },
      });
    }

    const followers = await prisma.follow.count({
      where: { followee_id: target },
    });

    return NextResponse.json({ followed: !existing, followers });
  } catch (err) {
    console.error("follow POST error:", err);
    return NextResponse.json({ error: "서버 오류" }, { status: 500 });
  }
}
