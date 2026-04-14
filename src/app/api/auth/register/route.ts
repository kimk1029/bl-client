import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcrypt';
import { prisma } from '@/lib/prisma';
import { signToken } from '@/lib/jwt';
import { computeLevel } from '@/utils/level';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { username, email, password, affiliation, church_id } = body ?? {};

    if (!username || !email || !password) {
      return NextResponse.json({ message: '필수 항목 누락' }, { status: 400 });
    }

    const [emailExists, usernameExists] = await Promise.all([
      prisma.user.findUnique({ where: { email } }),
      prisma.user.findUnique({ where: { username } }),
    ]);
    if (emailExists) {
      return NextResponse.json({ message: '이미 사용 중인 이메일입니다.' }, { status: 409 });
    }
    if (usernameExists) {
      return NextResponse.json({ message: '이미 사용 중인 유저네임입니다.' }, { status: 409 });
    }

    const hashed = await bcrypt.hash(password, 10);
    const affil = typeof affiliation === 'string' ? affiliation.trim() : '';
    const churchIdNum = Number.isInteger(church_id) ? church_id : null;

    const user = await prisma.user.create({
      data: {
        username,
        email,
        password: hashed,
        affiliation: affil ? affil : null,
        ...(churchIdNum ? { church_id: churchIdNum } : {}),
      },
    });

    const token = signToken({ id: user.id, email: user.email });
    const { level } = computeLevel(user.points);
    return NextResponse.json(
      {
        token,
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          affiliation: user.affiliation,
          points: user.points,
          level,
        },
      },
      { status: 201 }
    );
  } catch (err) {
    console.error('register error:', err);
    return NextResponse.json({ message: '서버 오류' }, { status: 500 });
  }
}
