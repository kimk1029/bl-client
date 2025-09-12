import { NextRequest, NextResponse } from 'next/server';
import { createApiUrl } from '@/utils/apiConfig';

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q');

    if (!query) {
        return NextResponse.json({ error: '검색어를 입력해주세요' }, { status: 400 });
    }

    try {
        // 실제 백엔드 검색 API로 프록시
        const upstream = createApiUrl(`/search?q=${encodeURIComponent(query)}`);
        const res = await fetch(upstream);
        if (!res.ok) {
            const text = await res.text();
            console.error('Upstream /search error', res.status, text);
            return NextResponse.json({ error: '검색 실패', status: res.status }, { status: 500 });
        }
        const data = await res.json();
        return NextResponse.json(data);
    } catch (error) {
        console.error('검색 중 오류가 발생했습니다:', error);
        return NextResponse.json(
            { error: '검색 중 오류가 발생했습니다' },
            { status: 500 }
        );
    }
} 