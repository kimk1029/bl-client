import { NextRequest, NextResponse } from 'next/server';
import { buildAuthHeaders } from '@/lib/authServer';
import { createApiUrl } from '@/utils/apiConfig';

export async function GET() {
  try {
    const headers = await buildAuthHeaders();
    const upstream = await fetch(createApiUrl('/affiliations'), { headers });
    if (!upstream.ok) {
      const text = await upstream.text().catch(() => '');
      return NextResponse.json({ message: text || '목록 조회 실패' }, { status: upstream.status });
    }
    const data = await upstream.json();
    return NextResponse.json(data);
  } catch (e) {
    return NextResponse.json({ message: '서버 오류' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const headers = await buildAuthHeaders();
    const upstream = await fetch(createApiUrl('/affiliations'), {
      method: 'POST',
      headers: headers,
      body: formData,
    });
    if (!upstream.ok) {
      const text = await upstream.text().catch(() => '');
      return NextResponse.json({ message: text || '생성 실패' }, { status: upstream.status });
    }
    const data = await upstream.json();
    return NextResponse.json(data);
  } catch (e) {
    return NextResponse.json({ message: '서버 오류' }, { status: 500 });
  }
}
