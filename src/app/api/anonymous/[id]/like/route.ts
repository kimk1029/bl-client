import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getIp } from '@/lib/apiAuth';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: idStr } = await params;
    const id = Number(idStr);
    if (!Number.isFinite(id)) return NextResponse.json({ error: 'invalid id' }, { status: 400 });
    const ip = getIp(request);

    const post = await prisma.anonymousPost.findUnique({ where: { id }, select: { id: true } });
    if (!post) return NextResponse.json({ error: 'not found' }, { status: 404 });

    const existing = await prisma.anonymousLike.findUnique({
      where: { post_id_ip_address: { post_id: id, ip_address: ip } },
    });
    if (existing) {
      await prisma.anonymousLike.delete({ where: { id: existing.id } });
      return NextResponse.json({ liked: false, message: '좋아요 취소' });
    }
    await prisma.anonymousLike.create({ data: { post_id: id, ip_address: ip } });
    return NextResponse.json({ liked: true, message: '좋아요' });
  } catch (err) {
    console.error('anon like error:', err);
    return NextResponse.json({ error: '서버 오류' }, { status: 500 });
  }
}
