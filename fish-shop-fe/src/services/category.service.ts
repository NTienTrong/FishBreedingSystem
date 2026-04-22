import { CategoryRequest, CategoryResponse } from '@/types/category';
import apiClient from '@/services/apiClient';

const API_URL = '/api/admin/categories';

export const CategoryService = {
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
  }
};
