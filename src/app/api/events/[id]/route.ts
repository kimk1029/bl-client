import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireUser } from '@/lib/apiAuth';

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const eventId = parseInt(id, 10);
    if (!Number.isFinite(eventId)) {
      return NextResponse.json({ error: '잘못된 id' }, { status: 400 });
    }

    const event = await prisma.event.findUnique({
      where: { id: eventId },
      include: { author: { select: { id: true, username: true } } },
    });

    if (!event) {
      return NextResponse.json({ error: '이벤트를 찾을 수 없습니다.' }, { status: 404 });
    }

    return NextResponse.json(event);
  } catch (err) {
    console.error('event GET error:', err);
    return NextResponse.json({ error: '이벤트 조회 실패' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await requireUser(request);
    if (!user) return NextResponse.json({ error: '인증이 필요합니다.' }, { status: 401 });

    const { id } = await params;
    const eventId = parseInt(id, 10);
    if (!Number.isFinite(eventId)) {
      return NextResponse.json({ error: '잘못된 id' }, { status: 400 });
    }

    const event = await prisma.event.findUnique({ where: { id: eventId } });
    if (!event) {
      return NextResponse.json({ error: '이벤트를 찾을 수 없습니다.' }, { status: 404 });
    }
    if (event.author_id !== user.id) {
      return NextResponse.json({ error: '권한이 없습니다.' }, { status: 403 });
    }

    await prisma.event.delete({ where: { id: eventId } });
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('event DELETE error:', err);
    return NextResponse.json({ error: '이벤트 삭제 실패' }, { status: 500 });
  }
}
