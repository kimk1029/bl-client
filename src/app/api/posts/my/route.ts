import { NextRequest, NextResponse } from 'next/server';
import { createApiUrl } from '@/utils/apiConfig';
import { buildAuthHeaders, getAccessToken } from '@/lib/authServer';

export async function GET(request: NextRequest) {
    try {
        const upstreamUrl = createApiUrl('/posts/my');
        const accessToken = await getAccessToken();
        const headers = await buildAuthHeaders();
        console.log('[posts/my] accessToken exists:', !!accessToken);
        const res = await fetch(upstreamUrl, {
            headers,
            cache: 'no-store',
        });

        if (!res.ok) {
            const text = await res.text().catch(() => '');
            return NextResponse.json(
                { error: '내 게시글을 불러오는데 실패했습니다.', status: res.status, message: text },
                { status: res.status }
            );
        }

        const data = await res.json();
        return NextResponse.json(data);
    } catch (error) {
        return NextResponse.json(
            { error: '내 게시글을 불러오는데 실패했습니다.' },
            { status: 500 }
        );
    }
}