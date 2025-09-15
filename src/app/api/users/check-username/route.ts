import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { createApiUrl } from '@/utils/apiConfig';

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const username = url.searchParams.get('username');
    if (!username) {
      return NextResponse.json({ error: 'username is required' }, { status: 400 });
    }

    const session = await getServerSession(authOptions);
    const accessToken = (session as any)?.accessToken as string | undefined;

    const upstreamUrl = createApiUrl(`/users/check-username?username=${encodeURIComponent(username)}`);
    const res = await fetch(upstreamUrl, {
      headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : {},
      cache: 'no-store',
    });

    if (!res.ok) {
      const text = await res.text().catch(() => '');
      return NextResponse.json({ ok: false, message: text || '중복 확인 실패' }, { status: res.status });
    }

    const data = await res.json();
    return NextResponse.json(data);
  } catch (e) {
    return NextResponse.json({ ok: false, message: '중복 확인 실패' }, { status: 500 });
  }
}
