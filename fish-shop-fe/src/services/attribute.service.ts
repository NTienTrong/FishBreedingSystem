import { AttributeRequest, AttributeResponse } from "@/types/attribute";
import apiClient from "./apiClient";

const API_URL = '/api/admin/attributes';

export const AttributeService = {
    async getAll(): Promise<AttributeResponse[]> {
        const res = await apiClient.get<AttributeResponse[]>(API_URL);
        return res.data;
    },

    async getById(id: number): Promise<AttributeResponse> {
        const res = await apiClient.get<AttributeResponse>(`${API_URL}/${id}`);
        return res.data;
    },

    async create(data: AttributeRequest): Promise<AttributeResponse> {
        const res = await apiClient.post<AttributeResponse>(API_URL, data);
        return res.data;
    },

    async update(id: number, data: AttributeRequest): Promise<AttributeResponse> {
        const res = await apiClient.put<AttributeResponse>(`${API_URL}/${id}`, data);
        return res.data;
    },

    async delete(id: number): Promise<void> {
        await apiClient.delete(`${API_URL}/${id}`);
    }
};