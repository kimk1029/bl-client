import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireUser } from '@/lib/apiAuth';

export async function GET(request: NextRequest) {
  try {
    const user = await requireUser(request);
    if (!user) return NextResponse.json({ error: '인증이 필요합니다.' }, { status: 401 });
    const comments = await prisma.comment.findMany({
      where: { author_id: user.id },
      orderBy: { created_at: 'desc' },
      include: { post: { select: { id: true, title: true } } },
    });
    return NextResponse.json(
      comments.map((c) => ({
        id: c.id,
        content: c.content,
        created_at: c.created_at,
        postId: c.post_id,
        postTitle: c.post?.title,
      }))
    );
  } catch (err) {
    console.error('comments/my error:', err);
    return NextResponse.json({ error: '서버 오류' }, { status: 500 });
  }
}
