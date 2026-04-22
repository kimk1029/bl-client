import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/apiAuth";

// POST /api/block — body: { targetId }
// Toggles block. Removes any existing follow in either direction on block.
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

    const existing = await prisma.block.findUnique({
      where: {
        blocker_id_blocked_id: {
          blocker_id: me.id,
          blocked_id: target,
        },
      },
      select: { id: true },
    });

    if (existing) {
      await prisma.block.delete({ where: { id: existing.id } });
      return NextResponse.json({ blocked: false });
    }

    const exists = await prisma.user.findUnique({
      where: { id: target },
      select: { id: true },
    });
    if (!exists) {
      return NextResponse.json({ error: "not found" }, { status: 404 });
    }

    // Tear down follows in both directions.
    await prisma.$transaction([
      prisma.follow.deleteMany({
        where: {
          OR: [
            { follower_id: me.id, followee_id: target },
            { follower_id: target, followee_id: me.id },
          ],
        },
      }),
      prisma.block.create({
        data: { blocker_id: me.id, blocked_id: target },
      }),
    ]);

    return NextResponse.json({ blocked: true });
  } catch (err) {
    console.error("block POST error:", err);
    return NextResponse.json({ error: "서버 오류" }, { status: 500 });
  }
}
