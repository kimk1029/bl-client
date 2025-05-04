export type Topic = 'technology' | 'science' | 'health' | 'business' | 'entertainment';

export interface Post {
  id: number;
  title: string;
  content: string;
  created_at: string;
  author: {
    id: number;
    username: string;
  };
  views: number;
  likeCount: number;
  commentCount: number;
  liked: boolean;
} 