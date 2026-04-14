import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getIp } from '@/lib/apiAuth';

const parseId = (s: string) => {
  const n = Number(s);
  return Number.isFinite(n) ? n : null;
};

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: idStr } = await params;
    const id = parseId(idStr);
    if (id == null) return NextResponse.json({ error: 'invalid id' }, { status: 400 });
    const comments = await prisma.anonymousComment.findMany({
      where: { post_id: id, parent_id: null },
      orderBy: { created_at: 'asc' },
      include: { replies: { orderBy: { created_at: 'asc' } } },
    });
    return NextResponse.json(comments);
  } catch (err) {
    console.error('anon comments GET error:', err);
    return NextResponse.json({ error: '서버 오류' }, { status: 500 });
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: idStr } = await params;
    const id = parseId(idStr);
    if (id == null) return NextResponse.json({ error: 'invalid id' }, { status: 400 });

    const body = await request.json();
    const content = String(body?.content ?? '').trim();
    const parentId = body?.parentId ?? body?.parent_id ?? null;
    if (!content) return NextResponse.json({ error: 'content 필수' }, { status: 400 });

    if (parentId) {
      const parent = await prisma.anonymousComment.findUnique({
        where: { id: String(parentId) },
      });
      if (!parent) return NextResponse.json({ error: '부모 댓글 없음' }, { status: 404 });
    }

    const comment = await prisma.anonymousComment.create({
      data: {
        content,
        ip_address: getIp(request),
        post_id: id,
        parent_id: parentId ? String(parentId) : null,
      },
    });
    return NextResponse.json(comment, { status: 201 });
  } catch (err) {
    console.error('anon comments POST error:', err);
    return NextResponse.json({ error: '서버 오류' }, { status: 500 });
  }
}
