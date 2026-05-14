import { apiClient } from './apiClient';
import { CouponApplyRequest, CouponApplyResponse } from '@/types/coupon';

class CouponService {
  async applyCoupon(request: CouponApplyRequest): Promise<CouponApplyResponse> {
    const response = await apiClient.post('/api/v1/coupons/apply', request);
    return response.data;
  }
}

export const couponService = new CouponService();
