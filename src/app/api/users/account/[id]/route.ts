import { NextRequest, NextResponse } from 'next/server';
import { createApiUrl } from '@/utils/apiConfig';
import { buildAuthHeaders, getAccessToken } from '@/lib/authServer';

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        const upstreamUrl = createApiUrl(`/users/account/${id}`);
        const accessToken = await getAccessToken();
        const headers = await buildAuthHeaders();
        console.log('[users/account GET] accessToken exists:', !!accessToken);
        const res = await fetch(upstreamUrl, {
            headers,
            cache: 'no-store',
        });

        if (!res.ok) {
            const text = await res.text().catch(() => '');
            return NextResponse.json(
                { error: '계정 정보를 불러오는데 실패했습니다.', status: res.status, message: text },
                { status: res.status }
            );
        }

        const data = await res.json();
        return NextResponse.json(data);
    } catch (error) {
        return NextResponse.json(
            { error: '계정 정보를 불러오는데 실패했습니다.' },
            { status: 500 }
        );
    }
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const accessToken = await getAccessToken();
    if (!accessToken) {
      return NextResponse.json({ error: '인증이 필요합니다.' }, { status: 401 });
    }

    const body = await request.json();
    const upstreamUrl = createApiUrl(`/users/account/${id}`);
    const res = await fetch(upstreamUrl, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const text = await res.text().catch(() => '');
      return NextResponse.json(
        { error: '프로필 수정에 실패했습니다.', status: res.status, message: text },
        { status: res.status }
      );
    }

    const data = await res.json();
    return NextResponse.json(data);
  } catch (e) {
    return NextResponse.json({ error: '프로필 수정에 실패했습니다.' }, { status: 500 });
  }
}
