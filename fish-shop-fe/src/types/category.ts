export interface CategoryResponse {
  id: number;
  name: string;
  slug: string;
  description: string;
  parentId: number | null;
  parentName: string | null;
}

export interface CategoryRequest {
  name: string;
  description: string;
  parentId: number | null;
}
