import { NextResponse } from 'next/server';

// 임시 데이터 (실제로는 DB에서 가져와야 합니다)
const mockPosts = [
    {
        id: 1,
        title: "Next.js 시작하기",
        content: "Next.js는 React 기반의 프레임워크입니다...",
        created_at: "2024-03-20T10:00:00Z",
        author: {
            id: 1,
            username: "user1"
        }
    },
    {
        id: 2,
        title: "React Hooks 사용법",
        content: "React Hooks는 함수형 컴포넌트에서 상태를 관리할 수 있게 해줍니다...",
        created_at: "2024-03-19T15:30:00Z",
        author: {
            id: 2,
            username: "user2"
        }
    },
    {
        id: 3,
        title: "TypeScript 기초",
        content: "TypeScript는 JavaScript에 타입을 추가한 프로그래밍 언어입니다...",
        created_at: "2024-03-18T09:15:00Z",
        author: {
            id: 3,
            username: "user3"
        }
    }
];

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q');

    if (!query) {
        return NextResponse.json({ error: '검색어를 입력해주세요' }, { status: 400 });
    }

    try {
        // 검색어로 필터링
        const filteredPosts = mockPosts.filter(post => 
            post.title.toLowerCase().includes(query.toLowerCase()) ||
            post.content.toLowerCase().includes(query.toLowerCase())
        );

        return NextResponse.json(filteredPosts);
    } catch (error) {
        console.error('검색 중 오류가 발생했습니다:', error);
        return NextResponse.json(
            { error: '검색 중 오류가 발생했습니다' },
            { status: 500 }
        );
    }
} 