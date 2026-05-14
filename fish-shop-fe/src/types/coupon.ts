export enum CouponDiscountType {
  PERCENTAGE = 'PERCENTAGE',
  FIXED_AMOUNT = 'FIXED_AMOUNT',
}

export interface AdminCouponRequest {
  code: string;
  discountType: CouponDiscountType;
  discountValue: number;
  minOrderValue: number;
  maxDiscountAmount?: number;
  usageLimit: number;
  startDate: string;
  endDate: string;
  isActive: boolean;
}

export interface AdminCouponResponse {
  id: number;
  code: string;
  discountType: CouponDiscountType;
  discountValue: number;
  minOrderValue: number;
  maxDiscountAmount?: number;
  usageLimit: number;
  usedCount: number;
  startDate: string;
  endDate: string;
  isActive: boolean;
  createdAt: string;
}

export interface CouponApplyRequest {
  code: string;
  orderTotal: number;
}

export interface CouponApplyResponse {
  code: string;
  discountType: CouponDiscountType;
  discountValue: number;
  maxDiscountAmount?: number;
  discountAmount: number;
}

export interface PageResponse<T> {
  content: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
}
