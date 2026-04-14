import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireUser } from '@/lib/apiAuth';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireUser(request);
    if (!user) return NextResponse.json({ error: '인증이 필요합니다.' }, { status: 401 });
    const { id: idStr } = await params;
    const id = Number(idStr);
    if (!Number.isFinite(id)) return NextResponse.json({ error: 'invalid id' }, { status: 400 });

    const post = await prisma.post.findUnique({ where: { id }, select: { id: true, author_id: true } });
    if (!post) return NextResponse.json({ error: 'not found' }, { status: 404 });

    const existing = await prisma.like.findUnique({
      where: { post_id_user_id: { post_id: id, user_id: user.id } },
    });

    if (existing) {
      await prisma.$transaction([
        prisma.like.delete({ where: { id: existing.id } }),
        prisma.user.update({
          where: { id: post.author_id },
          data: { points: { decrement: 1 } },
        }),
        prisma.user.updateMany({
          where: { id: post.author_id, points: { lt: 0 } },
          data: { points: 0 },
        }),
      ]);
      return NextResponse.json({ liked: false, message: '좋아요 취소' });
    } else {
      await prisma.$transaction([
        prisma.like.create({ data: { post_id: id, user_id: user.id } }),
        prisma.user.update({
          where: { id: post.author_id },
          data: { points: { increment: 1 } },
        }),
      ]);
      return NextResponse.json({ liked: true, message: '좋아요' });
    }
  } catch (err) {
    console.error('like toggle error:', err);
    return NextResponse.json({ error: '서버 오류' }, { status: 500 });
  }
}
