export interface CategoryResponse {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  imageUrl: string | null;
  isActive: boolean;
  sortOrder?: number | null;
}

export interface CategoryRequest {
  name: string;
  description: string;
  imageUrl: string | null;
  isActive: boolean;
  sortOrder?: number | null;
}
