import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const { username } = (await request.json()) ?? {};
    if (!username) return NextResponse.json({ exists: false });
    const u = await prisma.user.findUnique({ where: { username } });
    return NextResponse.json({ exists: !!u });
  } catch (err) {
    console.error('check-username error:', err);
    return NextResponse.json({ message: '서버 오류' }, { status: 500 });
  }
}
