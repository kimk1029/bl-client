import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getIp } from '@/lib/apiAuth';

export async function GET() {
  try {
    const posts = await prisma.anonymousPost.findMany({
      orderBy: { created_at: 'desc' },
      include: { _count: { select: { comments: true, likes: true } } },
    });
    return NextResponse.json(
      posts.map((p) => ({
        id: p.id,
        title: p.title,
        content: p.content,
        created_at: p.created_at,
        views: p.views,
        comments: p._count.comments,
        likes: p._count.likes,
      }))
    );
  } catch (err) {
    console.error('anon GET error:', err);
    return NextResponse.json({ error: '서버 오류' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { title, content } = body ?? {};
    if (!title || !content)
      return NextResponse.json({ error: 'title/content 필수' }, { status: 400 });
    const post = await prisma.anonymousPost.create({
      data: { title, content, ip_address: getIp(request) },
    });
    return NextResponse.json(post, { status: 201 });
  } catch (err) {
    console.error('anon POST error:', err);
    return NextResponse.json({ error: '서버 오류' }, { status: 500 });
  }
}
