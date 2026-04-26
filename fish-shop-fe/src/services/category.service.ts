import { CategoryRequest, CategoryResponse } from '@/types/category';
import apiClient from '@/services/apiClient';

const API_URL = '/api/admin/categories';

export const CategoryService = {
  /** Lấy toàn bộ danh mục (cả cha lẫn con) */
  async getAll(): Promise<CategoryResponse[]> {
    const res = await apiClient.get<CategoryResponse[]>(API_URL);
    return res.data;
  },

  async getById(id: number): Promise<CategoryResponse> {
    const res = await apiClient.get<CategoryResponse>(`${API_URL}/${id}`);
    return res.data;
  },

  async create(data: CategoryRequest): Promise<CategoryResponse> {
    const res = await apiClient.post<CategoryResponse>(API_URL, data);
    return res.data;
  },

  async update(id: number, data: CategoryRequest): Promise<CategoryResponse> {
    const res = await apiClient.put<CategoryResponse>(`${API_URL}/${id}`, data);
    return res.data;
  },

  async delete(id: number): Promise<void> {
    await apiClient.delete(`${API_URL}/${id}`);
  },

  /**
   * Upload ảnh lên Cloudinary qua backend proxy.
   * Endpoint: POST /api/admin/uploads/images?folder=categories
   * Trả về secureUrl để lưu vào imageUrl của CategoryRequest.
   */
  async uploadImage(file: File): Promise<string> {
    const formData = new FormData();
    formData.append('file', file);

    const res = await apiClient.post<{ secureUrl: string; url: string }>(
      '/api/admin/uploads/images?folder=categories',
      formData,
      { headers: { 'Content-Type': 'multipart/form-data' } },
    );

    const url = res.data.secureUrl || res.data.url;
    if (!url) throw new Error('Upload ảnh thất bại: không nhận được URL.');
    return url;
  },
};
