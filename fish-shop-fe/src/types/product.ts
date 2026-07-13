export interface ProductResponse {
	id: number;
	name: string;
	slug: string;
	sku: string | null;
	summary: string | null;
	description: string | null;
	price: number;
	costPrice?: number | null;
	stockQuantity: number;
	isActive: boolean;
	createdAt: string;
	categories: ProductCategoryItemResponse[];
	images: ProductImageItemResponse[];
	attributeValues: ProductAttributeValueItemResponse[];
}

export interface ProductRequest {
	name: string;
	sku?: string | null;
	summary?: string | null;
	description?: string | null;
	price: number;
	costPrice?: number | null;
	stockQuantity?: number;
	isActive?: boolean;
	categoryIds: number[];
	images?: ProductImageRequest[];
	attributeValues?: ProductAttributeValueRequest[];
}

export interface ProductCategoryItemResponse {
	id: number;
	name: string;
}

export interface ProductImageItemResponse {
	id: number;
	imageUrl: string;
	isMain: boolean;
	sortOrder: number;
}

export interface ProductAttributeValueItemResponse {
	attributeId: number;
	attributeName: string;
	attrValue: string;
}

export interface ProductImageRequest {
	imageUrl: string;
	isMain?: boolean;
	sortOrder?: number;
}

export interface ProductAttributeValueRequest {
	attributeId: number;
	attrValue: string;
}