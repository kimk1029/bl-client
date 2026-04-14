import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireUser } from '@/lib/apiAuth';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: idStr } = await params;
    const id = Number(idStr);
    if (!Number.isFinite(id)) return NextResponse.json({ error: 'invalid id' }, { status: 400 });

    const comments = await prisma.comment.findMany({
      where: { post_id: id, parent_id: null },
      orderBy: { created_at: 'asc' },
      include: {
        author: { select: { id: true, username: true } },
        replies: {
          include: { author: { select: { id: true, username: true } } },
          orderBy: { created_at: 'asc' },
        },
      },
    });

    return NextResponse.json(comments);
  } catch (err) {
    console.error('comments GET error:', err);
    return NextResponse.json({ error: '서버 오류' }, { status: 500 });
  }
}

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

    const body = await request.json();
    const content = String(body?.content ?? '').trim();
    const parentId = body?.parentId ?? body?.parent_id ?? null;
    if (!content) return NextResponse.json({ error: 'content 필수' }, { status: 400 });

    if (parentId != null) {
      const parent = await prisma.comment.findUnique({ where: { id: Number(parentId) } });
      if (!parent) return NextResponse.json({ error: '부모 댓글 없음' }, { status: 404 });
    }

    const comment = await prisma.comment.create({
      data: {
        content,
        post_id: id,
        author_id: user.id,
        parent_id: parentId != null ? Number(parentId) : null,
      },
      include: { author: { select: { id: true, username: true } } },
    });
    return NextResponse.json(comment, { status: 201 });
  } catch (err) {
    console.error('comments POST error:', err);
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
    const url = new URL(request.url);
    const commentIdStr = url.searchParams.get('commentId');
    const commentId = Number(commentIdStr);
    if (!Number.isFinite(commentId))
      return NextResponse.json({ error: 'commentId 필수' }, { status: 400 });
    const { id: idStr } = await params;
    const postId = Number(idStr);

    const existing = await prisma.comment.findFirst({
      where: { id: commentId, post_id: postId },
      select: { author_id: true },
    });
    if (!existing) return NextResponse.json({ error: 'not found' }, { status: 404 });
    if (existing.author_id !== user.id)
      return NextResponse.json({ error: '권한이 없습니다.' }, { status: 403 });

    await prisma.comment.delete({ where: { id: commentId } });
    return NextResponse.json({ message: '삭제되었습니다.' });
  } catch (err) {
    console.error('comment DELETE error:', err);
    return NextResponse.json({ error: '서버 오류' }, { status: 500 });
  }
}
