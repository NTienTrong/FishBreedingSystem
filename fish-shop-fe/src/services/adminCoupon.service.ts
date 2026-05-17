import apiClient from '@/services/apiClient';
import { AdminCouponRequest, AdminCouponResponse, PageResponse } from '@/types/coupon';

class AdminCouponService {
  async createCoupon(request: AdminCouponRequest): Promise<AdminCouponResponse> {
    const response = await apiClient.post('/api/admin/coupons', request);
    return response.data;
  }

  async getCoupons(page: number = 0, size: number = 5): Promise<PageResponse<AdminCouponResponse>> {
    const response = await apiClient.get('/api/admin/coupons', {
      params: { page, size },
    });
    return response.data;
  }

  async getCouponById(id: number): Promise<AdminCouponResponse> {
    const response = await apiClient.get(`/api/admin/coupons/${id}`);
    return response.data;
  }

  async updateCoupon(id: number, request: AdminCouponRequest): Promise<AdminCouponResponse> {
    const response = await apiClient.put(`/api/admin/coupons/${id}`, request);
    return response.data;
  }

  async deleteCoupon(id: number): Promise<void> {
    await apiClient.delete(`/api/admin/coupons/${id}`);
  }

  async toggleStatus(id: number, isActive: boolean): Promise<AdminCouponResponse> {
    const response = await apiClient.patch(`/api/admin/coupons/${id}/status`, null, {
      params: { isActive },
    });
    return response.data;
  }
}

export const adminCouponService = new AdminCouponService();
