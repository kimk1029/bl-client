import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/apiAuth";

// GET /api/messages/[userId] — conversation with the given user
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> },
) {
  try {
    const me = await requireUser(request);
    if (!me) {
      return NextResponse.json({ error: "인증이 필요합니다." }, { status: 401 });
    }
    const { userId: userIdStr } = await params;
    const otherId = Number(userIdStr);
    if (!Number.isFinite(otherId) || otherId === me.id) {
      return NextResponse.json({ error: "invalid userId" }, { status: 400 });
    }

    const other = await prisma.user.findUnique({
      where: { id: otherId },
      select: { id: true, username: true, affiliation: true },
    });
    if (!other) {
      return NextResponse.json({ error: "상대를 찾을 수 없어요." }, { status: 404 });
    }

    const messages = await prisma.message.findMany({
      where: {
        OR: [
          { sender_id: me.id, receiver_id: otherId },
          { sender_id: otherId, receiver_id: me.id },
        ],
      },
      orderBy: { created_at: "asc" },
      take: 500,
      select: {
        id: true,
        content: true,
        created_at: true,
        sender_id: true,
        receiver_id: true,
        read_at: true,
      },
    });

    return NextResponse.json({
      other: {
        id: other.id,
        username: other.username,
        affiliation: other.affiliation ?? null,
      },
      messages: messages.map((m) => ({
        id: m.id,
        content: m.content,
        created_at: m.created_at.toISOString(),
        read_at: m.read_at ? m.read_at.toISOString() : null,
        sender_id: m.sender_id,
        receiver_id: m.receiver_id,
      })),
    });
  } catch (err) {
    console.error("messages/[userId] GET error:", err);
    return NextResponse.json(
      { error: "대화를 불러오지 못했어요." },
      { status: 500 },
    );
  }
}

// PATCH /api/messages/[userId] — mark all messages from userId as read
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> },
) {
  try {
    const me = await requireUser(request);
    if (!me) {
      return NextResponse.json({ error: "인증이 필요합니다." }, { status: 401 });
    }
    const { userId: userIdStr } = await params;
    const otherId = Number(userIdStr);
    if (!Number.isFinite(otherId)) {
      return NextResponse.json({ error: "invalid userId" }, { status: 400 });
    }
    const result = await prisma.message.updateMany({
      where: {
        receiver_id: me.id,
        sender_id: otherId,
        read_at: null,
      },
      data: { read_at: new Date() },
    });
    return NextResponse.json({ updated: result.count });
  } catch (err) {
    console.error("messages/[userId] PATCH error:", err);
    return NextResponse.json({ error: "서버 오류" }, { status: 500 });
  }
}
