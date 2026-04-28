import apiClient from "@/services/apiClient";
import { ProductRequest, ProductResponse } from "@/types/product";

const API_URL = "/api/admin/products";

export const ProductService = {
	async getAll(): Promise<ProductResponse[]> {
		const res = await apiClient.get<ProductResponse[]>(API_URL);
		return res.data;
	},

	async uploadImage(file: File): Promise<string> {
		const formData = new FormData();
		formData.append("file", file);

		const res = await apiClient.post<{ secureUrl: string; url: string }>(
			"/api/admin/uploads/images?folder=products",
			formData,
			{ headers: { "Content-Type": "multipart/form-data" } }
		);

		const url = res.data.secureUrl || res.data.url;
		if (!url) throw new Error("Upload ảnh thất bại: không nhận được URL.");
		return url;
	},

	async getById(id: number): Promise<ProductResponse> {
		const res = await apiClient.get<ProductResponse>(`${API_URL}/${id}`);
		return res.data;
	},

	async create(data: ProductRequest): Promise<ProductResponse> {
		const res = await apiClient.post<ProductResponse>(API_URL, data);
		return res.data;
	},

	async update(id: number, data: ProductRequest): Promise<ProductResponse> {
		const res = await apiClient.put<ProductResponse>(`${API_URL}/${id}`, data);
		return res.data;
	},

	async delete(id: number): Promise<void> {
		await apiClient.delete(`${API_URL}/${id}`);
	},
};
