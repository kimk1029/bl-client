import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { computeLevel } from '@/utils/level';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
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

    const { level } = computeLevel(user.points);
    return NextResponse.json({ ...user, level });
  } catch (err) {
    console.error('user GET error:', err);
    return NextResponse.json({ error: '서버 오류' }, { status: 500 });
  }
}
