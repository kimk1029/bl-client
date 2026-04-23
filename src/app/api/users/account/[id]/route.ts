import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcrypt';
import { prisma } from '@/lib/prisma';
import { requireUser } from '@/lib/apiAuth';
import { computeLevel } from '@/utils/level';
import { toImageUrl } from '@/lib/uploads';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const me = await requireUser(request);
    if (!me) return NextResponse.json({ error: '인증이 필요합니다.' }, { status: 401 });

    const { id: idStr } = await params;
    const id = Number(idStr);
    if (!Number.isFinite(id)) return NextResponse.json({ error: 'invalid id' }, { status: 400 });

    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        username: true,
        email: true,
        affiliation: true,
        points: true,
        created_at: true,
      },
    });
    if (!user) return NextResponse.json({ error: 'not found' }, { status: 404 });

    const [posts, comments] = await Promise.all([
      prisma.post.findMany({
        where: { author_id: id },
        orderBy: { created_at: 'desc' },
        select: {
          id: true,
          title: true,
          content: true,
          created_at: true,
          views: true,
          tag: true,
          images: true,
        },
      }),
      prisma.comment.findMany({
        where: { author_id: id },
        orderBy: { created_at: 'desc' },
        include: { post: { select: { id: true, title: true } } },
      }),
    ]);

    const { level } = computeLevel(user.points);
    return NextResponse.json({
      user: { ...user, level },
      posts: posts.map((p) => ({
        ...p,
        category: p.tag,
        imageUrls: (p.images ?? []).map(toImageUrl),
      })),
      comments: comments.map((c) => ({
        id: c.id,
        content: c.content,
        created_at: c.created_at,
        postId: c.post_id,
        postTitle: c.post?.title,
      })),
    });
  } catch (err) {
    console.error('account GET error:', err);
    return NextResponse.json({ error: '서버 오류' }, { status: 500 });
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const me = await requireUser(request);
    if (!me) return NextResponse.json({ error: '인증이 필요합니다.' }, { status: 401 });
    const { id: idStr } = await params;
    const id = Number(idStr);
    if (!Number.isFinite(id)) return NextResponse.json({ error: 'invalid id' }, { status: 400 });
    if (id !== me.id)
      return NextResponse.json({ error: '본인 계정만 수정할 수 있습니다.' }, { status: 403 });

    const body = await request.json();
    const data: {
      username?: string;
      password?: string;
      affiliation?: string | null;
      church_id?: number | null;
    } = {};
    if (typeof body?.username === 'string' && body.username.trim()) data.username = body.username.trim();
    if (typeof body?.password === 'string' && body.password.length > 0) {
      data.password = await bcrypt.hash(body.password, 10);
    }
    if ('affiliation' in (body ?? {})) {
      const a = typeof body.affiliation === 'string' ? body.affiliation.trim() : '';
      data.affiliation = a ? a : null;
    }
    if ('church_id' in (body ?? {})) {
      const raw = body.church_id;
      if (raw === null || raw === undefined || raw === '') {
        data.church_id = null;
      } else {
        const n = Number(raw);
        data.church_id = Number.isFinite(n) && n > 0 ? n : null;
      }
    }

    const updated = await prisma.user.update({
      where: { id },
      data,
      select: {
        id: true,
        username: true,
        email: true,
        affiliation: true,
        points: true,
        created_at: true,
      },
    });
    const { level } = computeLevel(updated.points);
    return NextResponse.json({ ...updated, level });
  } catch (err) {
    console.error('account PATCH error:', err);
    return NextResponse.json({ error: '서버 오류' }, { status: 500 });
  }
}
