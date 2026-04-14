import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getIp } from '@/lib/apiAuth';

const parseId = (s: string) => {
  const n = Number(s);
  return Number.isFinite(n) ? n : null;
};

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: idStr } = await params;
    const id = parseId(idStr);
    if (id == null) return NextResponse.json({ error: 'invalid id' }, { status: 400 });
    const ip = getIp(request);

    await prisma.anonymousPost
      .update({ where: { id }, data: { views: { increment: 1 } } })
      .catch(() => null);

    const post = await prisma.anonymousPost.findUnique({ where: { id } });
    if (!post) return NextResponse.json({ error: 'not found' }, { status: 404 });
    return NextResponse.json({ ...post, isAuthor: post.ip_address === ip });
  } catch (err) {
    console.error('anon[id] GET error:', err);
    return NextResponse.json({ error: '서버 오류' }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: idStr } = await params;
    const id = parseId(idStr);
    if (id == null) return NextResponse.json({ error: 'invalid id' }, { status: 400 });
    const ip = getIp(request);
    const existing = await prisma.anonymousPost.findUnique({ where: { id } });
    if (!existing) return NextResponse.json({ error: 'not found' }, { status: 404 });
    if (existing.ip_address !== ip)
      return NextResponse.json({ error: '권한이 없습니다.' }, { status: 403 });

    const body = await request.json();
    const { title, content } = body ?? {};
    const post = await prisma.anonymousPost.update({
      where: { id },
      data: {
        ...(title ? { title } : {}),
        ...(content ? { content } : {}),
      },
    });
    return NextResponse.json(post);
  } catch (err) {
    console.error('anon[id] PUT error:', err);
    return NextResponse.json({ error: '서버 오류' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: idStr } = await params;
    const id = parseId(idStr);
    if (id == null) return NextResponse.json({ error: 'invalid id' }, { status: 400 });
    const ip = getIp(request);
    const existing = await prisma.anonymousPost.findUnique({ where: { id } });
    if (!existing) return NextResponse.json({ error: 'not found' }, { status: 404 });
    if (existing.ip_address !== ip)
      return NextResponse.json({ error: '권한이 없습니다.' }, { status: 403 });
    await prisma.anonymousPost.delete({ where: { id } });
    return new NextResponse(null, { status: 204 });
  } catch (err) {
    console.error('anon[id] DELETE error:', err);
    return NextResponse.json({ error: '서버 오류' }, { status: 500 });
  }
}
