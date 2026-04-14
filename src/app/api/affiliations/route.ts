import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireUser } from '@/lib/apiAuth';
import { saveUploadedFile, toImageUrl } from '@/lib/uploads';

export async function GET(request: NextRequest) {
  try {
    const me = await requireUser(request);
    if (!me) return NextResponse.json({ error: '인증이 필요합니다.' }, { status: 401 });

    const user = await prisma.user.findUnique({
      where: { id: me.id },
      select: { affiliation: true },
    });
    if (!user?.affiliation?.trim()) {
      return NextResponse.json({ message: '교회 소속이 설정되지 않았습니다.' }, { status: 400 });
    }

    const posts = await prisma.affiliationPost.findMany({
      where: { affiliation: user.affiliation },
      orderBy: { created_at: 'desc' },
      include: { author: { select: { id: true, username: true } } },
    });
    return NextResponse.json(
      posts.map((p) => ({ ...p, imageUrls: (p.images ?? []).map(toImageUrl) }))
    );
  } catch (err) {
    console.error('affiliations GET error:', err);
    return NextResponse.json({ error: '서버 오류' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const me = await requireUser(request);
    if (!me) return NextResponse.json({ error: '인증이 필요합니다.' }, { status: 401 });

    const user = await prisma.user.findUnique({
      where: { id: me.id },
      select: { affiliation: true },
    });
    if (!user?.affiliation?.trim()) {
      return NextResponse.json({ message: '교회 소속이 설정되지 않았습니다.' }, { status: 400 });
    }

    const fd = await request.formData();
    const title = String(fd.get('title') ?? '');
    const content = String(fd.get('content') ?? '');
    if (!title || !content)
      return NextResponse.json({ error: 'title/content 필수' }, { status: 400 });

    const images: string[] = [];
    const file = fd.get('image');
    if (file && file instanceof File && file.size > 0) {
      const filename = await saveUploadedFile(file);
      images.push(filename);
    }

    const post = await prisma.affiliationPost.create({
      data: {
        title,
        content,
        affiliation: user.affiliation,
        images,
        author: { connect: { id: me.id } },
      },
    });
    return NextResponse.json({ ...post, imageUrls: images.map(toImageUrl) }, { status: 201 });
  } catch (err) {
    console.error('affiliations POST error:', err);
    return NextResponse.json({ error: '서버 오류' }, { status: 500 });
  }
}
