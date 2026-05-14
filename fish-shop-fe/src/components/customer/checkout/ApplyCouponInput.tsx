'use client';

import React, { useState } from 'react';
import { couponService } from '@/services/coupon.service';
import { CouponApplyResponse } from '@/types/coupon';

interface ApplyCouponInputProps {
  subtotal: number;
  onApplySuccess: (coupon: CouponApplyResponse) => void;
  onCancel: () => void;
  isApplied: boolean;
  appliedCoupon?: CouponApplyResponse | null;
}

export default function ApplyCouponInput({
  subtotal,
  onApplySuccess,
  onCancel,
  isApplied,
  appliedCoupon,
}: ApplyCouponInputProps) {
  const [couponCode, setCouponCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleApply = async () => {
    if (!couponCode.trim()) {
      setError('Vui lòng nhập mã giảm giá');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const response = await couponService.applyCoupon({
        code: couponCode.trim(),
        orderTotal: subtotal,
      });
      onApplySuccess(response);
      setCouponCode('');
    } catch (err: any) {
      setError(err.message || 'Mã giảm giá không hợp lệ');
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !loading && !isApplied) {
      handleApply();
    }
  };

  if (isApplied && appliedCoupon) {
    return (
      <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-3 flex-1">
            <span className="material-symbols-outlined text-green-600 mt-0.5">check_circle</span>
            <div>
              <p className="text-sm font-semibold text-green-900">Đã áp dụng mã: {appliedCoupon.code}</p>
              <p className="text-sm text-green-700 mt-1">
                Giảm: <span className="font-bold">
                  {appliedCoupon.discountType === 'PERCENTAGE' 
                    ? `${appliedCoupon.discountValue}%` 
                    : `₫${appliedCoupon.discountValue.toLocaleString()}`}
                </span>
                {appliedCoupon.discountAmount > 0 && (
                  <span className="ml-2">(-₫{appliedCoupon.discountAmount.toLocaleString()})</span>
                )}
              </p>
            </div>
          </div>
          <button
            onClick={onCancel}
            className="text-green-600 hover:text-green-700 text-sm font-semibold"
          >
            Hủy
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="mb-6 space-y-2">
      <label className="text-xs font-bold uppercase tracking-wider text-on-surface-variant">
        Nhập mã giảm giá
      </label>
      <div className="flex gap-2">
        <div className="flex-1">
          <input
            type="text"
            value={couponCode}
            onChange={(e) => {
              setCouponCode(e.target.value.toUpperCase());
              setError(null);
            }}
            onKeyPress={handleKeyPress}
            placeholder="VD: SUMMER2024"
            disabled={loading}
            className={`w-full px-3 py-2.5 bg-white border rounded-lg text-sm outline-none transition-all ${
              error
                ? 'border-red-300 focus:ring-2 focus:ring-red-200'
                : 'border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20'
            }`}
          />
          {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
        </div>
        <button
          onClick={handleApply}
          disabled={loading || !couponCode.trim()}
          className="px-4 py-2.5 bg-primary text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all text-sm font-medium"
        >
          {loading ? (
            <span className="material-symbols-outlined animate-spin text-base">progress_activity</span>
          ) : (
            'Áp dụng'
          )}
        </button>
      </div>
    </div>
  );
}
