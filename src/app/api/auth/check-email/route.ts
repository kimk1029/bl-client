import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const { email } = (await request.json()) ?? {};
    if (!email) return NextResponse.json({ exists: false });
    const u = await prisma.user.findUnique({ where: { email } });
    return NextResponse.json({ exists: !!u });
  } catch (err) {
    console.error('check-email error:', err);
    return NextResponse.json({ message: '서버 오류' }, { status: 500 });
  }
}
