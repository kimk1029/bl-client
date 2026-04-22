import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireUser } from '@/lib/apiAuth';

const VALID_TAG_COLORS = ['hot', 'accent', 'pin'] as const;

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const limitParam = url.searchParams.get('limit');
    const featuredParam = url.searchParams.get('featured');
    const take = limitParam ? Math.min(Math.max(parseInt(limitParam, 10) || 0, 1), 100) : undefined;

    const where: any = {};
    if (featuredParam === 'true') where.featured = true;
    else if (featuredParam === 'false') where.featured = false;

    const events = await prisma.event.findMany({
      where,
      orderBy: [{ featured: 'desc' }, { start_at: 'asc' }, { created_at: 'desc' }],
      take,
      include: { author: { select: { id: true, username: true } } },
    });

    return NextResponse.json(events);
  } catch (err) {
    console.error('events GET error:', err);
    return NextResponse.json({ error: '이벤트를 불러오지 못했습니다.' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await requireUser(request);
    if (!user) return NextResponse.json({ error: '인증이 필요합니다.' }, { status: 401 });

    const body = await request.json();
    const title = String(body?.title ?? '').trim();
    const description = String(body?.description ?? body?.desc ?? '').trim();
    const dateText = String(body?.date_text ?? body?.date ?? '').trim();

    if (!title || !description || !dateText) {
      return NextResponse.json({ error: 'title/description/date_text 필수' }, { status: 400 });
    }

    const tagColorRaw = body?.tag_color ?? body?.tagColor;
    const tagColor =
      tagColorRaw && (VALID_TAG_COLORS as readonly string[]).includes(String(tagColorRaw))
        ? String(tagColorRaw)
        : null;

    const startAt = body?.start_at ? new Date(body.start_at) : null;

    const event = await prisma.event.create({
      data: {
        title,
        description,
        cover: body?.cover ? String(body.cover) : null,
        date_text: dateText,
        location: body?.location ? String(body.location) : (body?.where ? String(body.where) : null),
        host: body?.host ? String(body.host) : null,
        ppl: Number.isFinite(Number(body?.ppl)) ? Math.max(0, Math.floor(Number(body.ppl))) : 0,
        price: body?.price ? String(body.price) : null,
        tag: body?.tag ? String(body.tag) : null,
        tag_color: tagColor,
        featured: !!body?.featured,
        start_at: startAt && !isNaN(startAt.getTime()) ? startAt : null,
        author: { connect: { id: user.id } },
      },
    });

    return NextResponse.json(event, { status: 201 });
  } catch (err) {
    console.error('events POST error:', err);
    return NextResponse.json({ error: '이벤트 생성 실패' }, { status: 500 });
  }
}
