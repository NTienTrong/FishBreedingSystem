import { CouponApplyRequest, CouponApplyResponse } from '@/types/coupon';

class CouponService {
  async applyCoupon(request: CouponApplyRequest): Promise<CouponApplyResponse> {
    const response = await fetch('/api/customer/coupons/apply', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      const data = await response.json().catch(() => ({}));
      throw new Error(data.message || 'Mã giảm giá không hợp lệ');
    }

    return response.json();
  }
}

export const couponService = new CouponService();
