export type Topic = 'technology' | 'science' | 'health' | 'business' | 'entertainment';

export interface Post {
    id: number;
    title: string;
    content: string;
    created_at: string;
    views: number;
    author: {
        id: number;
        username: string;
    };
    comments: number;
    likes: number;
    category: Topic;
}

export interface PostContentProps {
    post: {
        id: number;
        title: string;
        content: string;
        created_at: string;
        author?: {
            id: number;
            username: string;
        };
        views: number;
        likeCount: number;
        commentCount: number;
        liked?: boolean;
        anonymousId?: string;
        images?: string[];
        // 상세 화면 메타 표기를 위해 카테고리/태그를 선택적으로 지원
        category?: Topic | string;
        tag?: string;
    };
    isAnonymous?: boolean;
    backUrl: string;
    comments?: Comment[];
    onCommentSubmit?: (content: string) => Promise<void>;
    showForm?: boolean;
    setShowForm?: (show: boolean) => void;
    mutate?: () => void;
}
export interface PostListProps {
    posts: Post[];
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
    isAnonymous?: boolean;
    selectedCategory?: Topic | 'all';
}
export interface Comment {
    id: number;
    content: string;
    created_at: string;
    author: {
        id: number;
        username: string;
        avatarUrl?: string;
    };
    // 대댓글 트리를 구성하기 위한 선택 속성
    parentId?: number;
    replies?: Comment[];
} 