import apiClient from "@/services/apiClient";
import {
  InventoryAdjustRequest,
  InventoryExportRequest,
  InventoryRestockRequest,
  StockLogResponse,
} from "@/types/inventory";

const API_URL = "/api/admin/inventory";

export const InventoryService = {
  async restock(data: InventoryRestockRequest): Promise<StockLogResponse> {
    const res = await apiClient.post<StockLogResponse>(`${API_URL}/restock`, data);
    return res.data;
  },

  async exportStock(data: InventoryExportRequest): Promise<StockLogResponse> {
    const res = await apiClient.post<StockLogResponse>(`${API_URL}/export`, data);
    return res.data;
  },

  async adjust(data: InventoryAdjustRequest): Promise<StockLogResponse> {
    const res = await apiClient.post<StockLogResponse>(`${API_URL}/adjust`, data);
    return res.data;
  },

  async getLogs(limit = 50): Promise<StockLogResponse[]> {
    const res = await apiClient.get<StockLogResponse[]>(`${API_URL}/logs?limit=${limit}`);
    return res.data;
  },
};
