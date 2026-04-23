import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireUser } from '@/lib/apiAuth';
import { saveUploadedFile, toImageUrl } from '@/lib/uploads';

const parseId = (s: string) => {
  const n = Number(s);
  return Number.isFinite(n) ? n : null;
};

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const me = await requireUser(request);
    if (!me) return NextResponse.json({ error: '인증이 필요합니다.' }, { status: 401 });
    const { id: idStr } = await params;
    const id = parseId(idStr);
    if (id == null) return NextResponse.json({ error: 'invalid id' }, { status: 400 });

    const user = await prisma.user.findUnique({
      where: { id: me.id },
      select: { affiliation: true },
    });
    if (!user?.affiliation?.trim())
      return NextResponse.json({ message: '교회 소속이 설정되지 않았습니다.' }, { status: 400 });

    const post = await prisma.affiliationPost.findUnique({
      where: { id },
      include: { author: { select: { id: true, username: true } } },
    });
    if (!post) return NextResponse.json({ error: 'not found' }, { status: 404 });
    if (post.affiliation !== user.affiliation)
      return NextResponse.json({ error: '권한이 없습니다.' }, { status: 403 });

    await prisma.affiliationPost
      .update({ where: { id }, data: { views: { increment: 1 } } })
      .catch(() => null);

    return NextResponse.json({ ...post, imageUrls: (post.images ?? []).map(toImageUrl) });
  } catch (err) {
    console.error('affiliation GET error:', err);
    return NextResponse.json({ error: '서버 오류' }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const me = await requireUser(request);
    if (!me) return NextResponse.json({ error: '인증이 필요합니다.' }, { status: 401 });
    const { id: idStr } = await params;
    const id = parseId(idStr);
    if (id == null) return NextResponse.json({ error: 'invalid id' }, { status: 400 });

    const existing = await prisma.affiliationPost.findUnique({
      where: { id },
      select: { author_id: true, images: true },
    });
    if (!existing) return NextResponse.json({ error: 'not found' }, { status: 404 });
    if (existing.author_id !== me.id)
      return NextResponse.json({ error: '권한이 없습니다.' }, { status: 403 });

    const fd = await request.formData();
    const title = fd.get('title');
    const content = fd.get('content');
    const data: { title?: string; content?: string; images?: string[] } = {};
    if (typeof title === 'string' && title) data.title = title;
    if (typeof content === 'string' && content) data.content = content;
    const file = fd.get('image');
    if (file && file instanceof File && file.size > 0) {
      const filename = await saveUploadedFile(file);
      data.images = [filename];
    }
    const post = await prisma.affiliationPost.update({ where: { id }, data });
    return NextResponse.json({ ...post, imageUrls: (post.images ?? []).map(toImageUrl) });
  } catch (err) {
    console.error('affiliation PUT error:', err);
    return NextResponse.json({ error: '서버 오류' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const me = await requireUser(request);
    if (!me) return NextResponse.json({ error: '인증이 필요합니다.' }, { status: 401 });
    const { id: idStr } = await params;
    const id = parseId(idStr);
    if (id == null) return NextResponse.json({ error: 'invalid id' }, { status: 400 });

    const existing = await prisma.affiliationPost.findUnique({
      where: { id },
      select: { author_id: true },
    });
    if (!existing) return NextResponse.json({ error: 'not found' }, { status: 404 });
    if (existing.author_id !== me.id)
      return NextResponse.json({ error: '권한이 없습니다.' }, { status: 403 });

    await prisma.affiliationPost.delete({ where: { id } });
    return new NextResponse(null, { status: 204 });
  } catch (err) {
    console.error('affiliation DELETE error:', err);
    return NextResponse.json({ error: '서버 오류' }, { status: 500 });
  }
}
