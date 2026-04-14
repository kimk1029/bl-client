import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  const q = request.nextUrl.searchParams.get('q') ?? '';
  if (q.trim().length < 1) return NextResponse.json([]);

  try {
    const churches = await prisma.church.findMany({
      where: {
        name: { contains: q, mode: 'insensitive' },
      },
      select: {
        id: true,
        name: true,
        address: true,
        city: true,
        district: true,
        phone: true,
      },
      take: 10,
      orderBy: { name: 'asc' },
    });
    return NextResponse.json(churches);
  } catch {
    return NextResponse.json([], { status: 200 });
  }
}
