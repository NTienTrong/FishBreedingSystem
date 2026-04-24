export interface BlogPostResponse {
  id: number;
  title: string;
  slug: string;
  content: string;
  thumbnailUrl: string | null;
  authorId: number | null;
  authorUsername: string | null;
  authorFullName: string | null;
  createdAt: string;
}

export interface BlogPostRequest {
  title: string;
  slug?: string | null;
  content: string;
  thumbnailUrl?: string | null;
}
