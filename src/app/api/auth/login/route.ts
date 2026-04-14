import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcrypt';
import { prisma } from '@/lib/prisma';
import { signToken } from '@/lib/jwt';
import { computeLevel } from '@/utils/level';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = body ?? {};
    if (!email || !password) {
      return NextResponse.json({ message: '이메일/비밀번호 필수' }, { status: 400 });
    }

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return NextResponse.json({ message: '이메일 또는 비밀번호가 올바르지 않습니다.' }, { status: 401 });
    }

    const ok = await bcrypt.compare(password, user.password);
    if (!ok) {
      return NextResponse.json({ message: '이메일 또는 비밀번호가 올바르지 않습니다.' }, { status: 401 });
    }

    // 일일 로그인 보상 (+1 point)
    const today = new Date().toISOString().slice(0, 10); // YYYY-MM-DD
    let points = user.points;
    if (user.last_login_reward_date !== today) {
      const updated = await prisma.user.update({
        where: { id: user.id },
        data: { points: { increment: 1 }, last_login_reward_date: today },
      });
      points = updated.points;
    }

    const token = signToken({ id: user.id, email: user.email });
    const { level } = computeLevel(points);
    return NextResponse.json({
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        affiliation: user.affiliation,
        points,
        level,
      },
    });
  } catch (err) {
    console.error('login error:', err);
    return NextResponse.json({ message: '서버 오류' }, { status: 500 });
  }
}
