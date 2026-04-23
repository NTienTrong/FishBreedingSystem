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

		const response = await fetch("/api/admin/uploads/cloudinary", {
			method: "POST",
			credentials: "include",
			body: formData,
		});

		const data = (await response.json()) as { secureUrl?: string; message?: string };
		if (!response.ok || !data.secureUrl) {
			throw new Error(data.message || "Upload ảnh thất bại.");
		}

		return data.secureUrl;
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
