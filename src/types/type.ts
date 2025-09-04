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
    };
    isAnonymous?: boolean;
    backUrl: string;
    comments?: Comment[];
    onCommentSubmit?: (content: string) => Promise<void>;
    showForm?: boolean;
    setShowForm?: (show: boolean) => void;
}
export interface PostListProps {
    posts: Post[];
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
    isAnonymous?: boolean;
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
    replies?: Comment[];
} 