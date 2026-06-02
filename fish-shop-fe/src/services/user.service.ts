import apiClient from "@/services/apiClient";
import { UserRequest, UserResponse } from "@/types/user";

const API_URL = "/api/admin/users";

export const UserService = {
  async getAll(): Promise<UserResponse[]> {
    const res = await apiClient.get<UserResponse[]>(API_URL);
    return res.data;
  },

  async getById(id: number): Promise<UserResponse> {
    const res = await apiClient.get<UserResponse>(`${API_URL}/${id}`);
    return res.data;
  },

  async create(data: UserRequest): Promise<UserResponse> {
    const res = await apiClient.post<UserResponse>(API_URL, data);
    return res.data;
  },

  async update(id: number, data: UserRequest): Promise<UserResponse> {
    const res = await apiClient.put<UserResponse>(`${API_URL}/${id}`, data);
    return res.data;
  },

  async delete(id: number): Promise<void> {
    await apiClient.delete(`${API_URL}/${id}`);
  },

  async toggleStatus(id: number, isActive: boolean): Promise<UserResponse> {
    const res = await apiClient.put<UserResponse>(`${API_URL}/${id}/status`, null, {
      params: { isActive },
    });
    return res.data;
  },
};
