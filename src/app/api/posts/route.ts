import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireUser } from '@/lib/apiAuth';
import { saveUploadedFile, toImageUrl } from '@/lib/uploads';

const VALID_TAGS = ['technology', 'science', 'health', 'business', 'entertainment', 'news'] as const;
type Tag = typeof VALID_TAGS[number];

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const category = url.searchParams.get('category');
    const where: any = {};
    if (category && (VALID_TAGS as readonly string[]).includes(category)) {
      where.tag = category;
    }

    const posts = await prisma.post.findMany({
      where,
      orderBy: { created_at: 'desc' },
      include: {
        author: { select: { id: true, username: true } },
        _count: { select: { comments: true, likes: true } },
      },
    });

    const data = posts.map((p) => ({
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
      images: p.images ?? [],
    }));

    return NextResponse.json(data);
  } catch (err) {
    console.error('posts GET error:', err);
    return NextResponse.json({ error: '게시글을 불러오는데 실패했습니다.' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await requireUser(request);
    if (!user) return NextResponse.json({ error: '인증이 필요합니다.' }, { status: 401 });

    let title = '';
    let content = '';
    let category: Tag = 'news';
    const images: string[] = [];

    const contentType = request.headers.get('content-type') || '';
    if (contentType.includes('multipart/form-data')) {
      const fd = await request.formData();
      title = String(fd.get('title') ?? '');
      content = String(fd.get('content') ?? '');
      const cat = String(fd.get('category') ?? 'news');
      category = (VALID_TAGS as readonly string[]).includes(cat) ? (cat as Tag) : 'news';
      const file = fd.get('image');
      if (file && file instanceof File && file.size > 0) {
        const filename = await saveUploadedFile(file);
        images.push(filename);
      }
    } else {
      const body = await request.json();
      title = String(body?.title ?? '');
      content = String(body?.content ?? '');
      const cat = String(body?.category ?? body?.tag ?? 'news');
      category = (VALID_TAGS as readonly string[]).includes(cat) ? (cat as Tag) : 'news';
    }

    if (!title || !content) {
      return NextResponse.json({ error: 'title/content 필수' }, { status: 400 });
    }

    const [post] = await prisma.$transaction([
      prisma.post.create({
        data: {
          title,
          content,
          tag: category,
          images,
          author: { connect: { id: user.id } },
        },
      }),
      prisma.user.update({ where: { id: user.id }, data: { points: { increment: 10 } } }),
    ]);

    return NextResponse.json({ ...post, imageUrls: (post.images ?? []).map(toImageUrl) }, { status: 201 });
  } catch (err) {
    console.error('posts POST error:', err);
    return NextResponse.json({ error: '게시글 작성 실패' }, { status: 500 });
  }
}
