export interface CategoryResponse {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  imageUrl: string | null;
  parentId: number | null;
  parentName: string | null;
}

export interface CategoryRequest {
  name: string;
  description: string;
  imageUrl: string | null;
  parentId: number | null;
}
