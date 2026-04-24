import apiClient from "@/services/apiClient";
import { BlogPostRequest, BlogPostResponse } from "@/types/blog";

const API_URL = "/api/admin/blog";

export const BlogService = {
  async getAll(): Promise<BlogPostResponse[]> {
    const res = await apiClient.get<BlogPostResponse[]>(API_URL);
    return res.data;
  },

  async getById(id: number): Promise<BlogPostResponse> {
    const res = await apiClient.get<BlogPostResponse>(`${API_URL}/${id}`);
    return res.data;
  },

  async create(data: BlogPostRequest): Promise<BlogPostResponse> {
    const res = await apiClient.post<BlogPostResponse>(API_URL, data);
    return res.data;
  },

  async update(id: number, data: BlogPostRequest): Promise<BlogPostResponse> {
    const res = await apiClient.put<BlogPostResponse>(`${API_URL}/${id}`, data);
    return res.data;
  },

  async delete(id: number): Promise<void> {
    await apiClient.delete(`${API_URL}/${id}`);
  },
};
