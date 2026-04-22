import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  const q = request.nextUrl.searchParams.get('q') ?? '';
  if (q.trim().length < 1) return NextResponse.json([]);

  try {
    // 주소가 없는 교회는 검색 결과에서 제외 (null 은 prisma 필터로 컷,
    // 빈 문자열은 fetch 후 JS 단에서 추가로 걸러냄)
    const candidates = await prisma.church.findMany({
      where: {
        name: { contains: q, mode: 'insensitive' },
        address: { not: null },
      },
      select: {
        id: true,
        name: true,
        address: true,
        city: true,
        district: true,
        phone: true,
      },
      take: 30,
      orderBy: { name: 'asc' },
    });

    const churches = candidates
      .filter((c) => typeof c.address === 'string' && c.address.trim().length > 0)
      .slice(0, 10);

    return NextResponse.json(churches);
  } catch {
    return NextResponse.json([], { status: 200 });
  }
}
