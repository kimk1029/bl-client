import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const username = url.searchParams.get('username');
  if (!username) return NextResponse.json({ exists: false });
  const u = await prisma.user.findUnique({ where: { username } });
  return NextResponse.json({ exists: !!u });
}

export async function POST(request: NextRequest) {
  const { username } = (await request.json()) ?? {};
  if (!username) return NextResponse.json({ exists: false });
  const u = await prisma.user.findUnique({ where: { username } });
  return NextResponse.json({ exists: !!u });
}
