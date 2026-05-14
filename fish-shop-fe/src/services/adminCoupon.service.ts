import { apiClient } from './apiClient';
import { AdminCouponRequest, AdminCouponResponse, PageResponse } from '@/types/coupon';

class AdminCouponService {
  async createCoupon(request: AdminCouponRequest): Promise<AdminCouponResponse> {
    const response = await apiClient.post('/api/v1/admin/coupons', request);
    return response.data;
  }

  async getCoupons(page: number = 0, size: number = 10): Promise<PageResponse<AdminCouponResponse>> {
    const response = await apiClient.get('/api/v1/admin/coupons', {
      params: { page, size },
    });
    return response.data;
  }

  async toggleStatus(id: number, isActive: boolean): Promise<AdminCouponResponse> {
    const response = await apiClient.patch(`/api/v1/admin/coupons/${id}/status`, null, {
      params: { isActive },
    });
    return response.data;
  }
}

export const adminCouponService = new AdminCouponService();
