import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { toImageUrl } from '@/lib/uploads';

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const q = url.searchParams.get('q') || url.searchParams.get('query') || '';
    if (!q) return NextResponse.json([]);
    const posts = await prisma.post.findMany({
      where: {
        OR: [
          { title: { contains: q, mode: 'insensitive' } },
          { content: { contains: q, mode: 'insensitive' } },
        ],
      },
      orderBy: { created_at: 'desc' },
      include: {
        author: { select: { id: true, username: true } },
        _count: { select: { comments: true, likes: true } },
      },
    });
    return NextResponse.json(
      posts.map((p) => ({
        id: p.id,
        title: p.title,
        content: p.content,
        created_at: p.created_at,
        views: p.views,
        tag: p.tag,
        category: p.tag,
        author: p.author,
        commentCount: p._count.comments,
        likeCount: p._count.likes,
        imageUrls: (p.images ?? []).map(toImageUrl),
      }))
    );
  } catch (err) {
    console.error('search error:', err);
    return NextResponse.json({ error: '서버 오류' }, { status: 500 });
  }
}
