import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/apiAuth";

export interface ThreadItem {
  otherUserId: number;
  otherUsername: string;
  otherAffiliation: string | null;
  lastMessage: {
    id: number;
    content: string;
    created_at: string;
    sender_id: number;
  };
  unread: number;
}

// GET /api/messages — list threads for the current user
export async function GET(request: NextRequest) {
  try {
    const me = await requireUser(request);
    if (!me) {
      return NextResponse.json({ error: "인증이 필요합니다." }, { status: 401 });
    }

    const messages = await prisma.message.findMany({
      where: {
        OR: [{ sender_id: me.id }, { receiver_id: me.id }],
      },
      orderBy: { created_at: "desc" },
      take: 500, // cap workload
      include: {
        sender: { select: { id: true, username: true, affiliation: true } },
        receiver: { select: { id: true, username: true, affiliation: true } },
      },
    });

    const byOther = new Map<number, ThreadItem>();
    for (const m of messages) {
      const other = m.sender_id === me.id ? m.receiver : m.sender;
      if (!other) continue;
      if (byOther.has(other.id)) continue; // first message is latest due to order
      byOther.set(other.id, {
        otherUserId: other.id,
        otherUsername: other.username,
        otherAffiliation: other.affiliation ?? null,
        lastMessage: {
          id: m.id,
          content: m.content,
          created_at: m.created_at.toISOString(),
          sender_id: m.sender_id,
        },
        unread: 0,
      });
    }

    // Count unread (received by me, read_at = null) per other user.
    if (byOther.size > 0) {
      const otherIds = [...byOther.keys()];
      const unreadGrouped = await prisma.message.groupBy({
        by: ["sender_id"],
        where: {
          receiver_id: me.id,
          read_at: null,
          sender_id: { in: otherIds },
        },
        _count: { _all: true },
      });
      for (const row of unreadGrouped) {
        const item = byOther.get(row.sender_id);
        if (item) item.unread = row._count._all;
      }
    }

    const threads = [...byOther.values()].sort(
      (a, b) =>
        new Date(b.lastMessage.created_at).getTime() -
        new Date(a.lastMessage.created_at).getTime(),
    );
    return NextResponse.json(threads);
  } catch (err) {
    console.error("messages GET error:", err);
    return NextResponse.json(
      { error: "쪽지함을 불러오지 못했습니다." },
      { status: 500 },
    );
  }
}

// POST /api/messages — send a new message
export async function POST(request: NextRequest) {
  try {
    const me = await requireUser(request);
    if (!me) {
      return NextResponse.json({ error: "인증이 필요합니다." }, { status: 401 });
    }
    const body = await request.json();
    const toRaw = body?.to ?? body?.receiver_id;
    const to = Number(toRaw);
    const content = String(body?.content ?? "").trim();
    if (!Number.isFinite(to) || to <= 0 || to === me.id) {
      return NextResponse.json(
        { error: "잘못된 수신자입니다." },
        { status: 400 },
      );
    }
    if (!content) {
      return NextResponse.json({ error: "내용을 입력하세요." }, { status: 400 });
    }
    if (content.length > 2000) {
      return NextResponse.json(
        { error: "쪽지는 2,000자까지 보낼 수 있어요." },
        { status: 400 },
      );
    }

    const receiver = await prisma.user.findUnique({
      where: { id: to },
      select: { id: true },
    });
    if (!receiver) {
      return NextResponse.json(
        { error: "수신자를 찾을 수 없어요." },
        { status: 404 },
      );
    }

    const created = await prisma.message.create({
      data: {
        content,
        sender_id: me.id,
        receiver_id: to,
      },
      include: {
        sender: { select: { id: true, username: true } },
        receiver: { select: { id: true, username: true } },
      },
    });

    return NextResponse.json(
      {
        id: created.id,
        content: created.content,
        created_at: created.created_at.toISOString(),
        sender_id: created.sender_id,
        receiver_id: created.receiver_id,
        sender: created.sender,
        receiver: created.receiver,
      },
      { status: 201 },
    );
  } catch (err) {
    console.error("messages POST error:", err);
    return NextResponse.json(
      { error: "쪽지 전송에 실패했습니다." },
      { status: 500 },
    );
  }
}
