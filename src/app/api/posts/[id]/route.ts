import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireUser, getAuthUser } from '@/lib/apiAuth';
import { toImageUrl } from '@/lib/uploads';

const parseId = (id: string) => {
  const n = Number(id);
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

    await prisma.post.update({ where: { id }, data: { views: { increment: 1 } } }).catch(() => null);

    const post = await prisma.post.findUnique({
      where: { id },
      include: {
        author: { select: { id: true, username: true } },
        _count: { select: { comments: true, likes: true } },
      },
    });
    if (!post) return NextResponse.json({ error: 'not found' }, { status: 404 });

    const me = await getAuthUser(request);
    let liked = false;
    if (me) {
      const like = await prisma.like.findUnique({
        where: { post_id_user_id: { post_id: id, user_id: me.id } },
      });
      liked = !!like;
    }

    return NextResponse.json({
      ...post,
      category: post.tag,
      commentCount: post._count.comments,
      likeCount: post._count.likes,
      liked,
      imageUrls: (post.images ?? []).map(toImageUrl),
    });
  } catch (err) {
    console.error('post GET error:', err);
    return NextResponse.json({ error: '서버 오류' }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireUser(request);
    if (!user) return NextResponse.json({ error: '인증이 필요합니다.' }, { status: 401 });
    const { id: idStr } = await params;
    const id = parseId(idStr);
    if (id == null) return NextResponse.json({ error: 'invalid id' }, { status: 400 });

    const existing = await prisma.post.findUnique({ where: { id }, select: { author_id: true } });
    if (!existing) return NextResponse.json({ error: 'not found' }, { status: 404 });
    if (existing.author_id !== user.id)
      return NextResponse.json({ error: '권한이 없습니다.' }, { status: 403 });

    const body = await request.json();
    const { title, content } = body ?? {};
    if (!title || !content)
      return NextResponse.json({ error: 'title/content 필수' }, { status: 400 });

    const post = await prisma.post.update({ where: { id }, data: { title, content } });
    return NextResponse.json(post);
  } catch (err) {
    console.error('post PUT error:', err);
    return NextResponse.json({ error: '서버 오류' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireUser(request);
    if (!user) return NextResponse.json({ error: '인증이 필요합니다.' }, { status: 401 });
    const { id: idStr } = await params;
    const id = parseId(idStr);
    if (id == null) return NextResponse.json({ error: 'invalid id' }, { status: 400 });

    const existing = await prisma.post.findUnique({ where: { id }, select: { author_id: true } });
    if (!existing) return NextResponse.json({ error: 'not found' }, { status: 404 });
    if (existing.author_id !== user.id)
      return NextResponse.json({ error: '권한이 없습니다.' }, { status: 403 });

    await prisma.post.delete({ where: { id } });
    return NextResponse.json({ message: '삭제되었습니다.' });
  } catch (err) {
    console.error('post DELETE error:', err);
    return NextResponse.json({ error: '서버 오류' }, { status: 500 });
  }
}
