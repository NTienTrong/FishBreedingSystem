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

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
      maximumFractionDigits: 0,
    }).format(amount);

  const handleApply = async () => {
    const trimmed = couponCode.trim();
    if (!trimmed) {
      setError('Vui lòng nhập mã giảm giá');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const response = await couponService.applyCoupon({
        code: trimmed,
        orderTotal: subtotal,
      });
      onApplySuccess(response);
      setCouponCode('');
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Mã giảm giá không hợp lệ';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !loading && !isApplied) {
      e.preventDefault();
      handleApply();
    }
  };

  // === Applied State ===
  if (isApplied && appliedCoupon) {
    const discountValue = Number(appliedCoupon.discountValue) || 0;
    const discountAmount = Number(appliedCoupon.discountAmount) || 0;
    const maxDiscount = appliedCoupon.maxDiscountAmount ? Number(appliedCoupon.maxDiscountAmount) : null;

    return (
      <div className="rounded-xl bg-white/10 backdrop-blur-sm border border-white/15 p-4 transition-all duration-300 animate-[fadeIn_0.3s_ease-out]">
        {/* Header row */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-green-400/20 flex items-center justify-center">
              <span className="material-symbols-outlined text-green-400 text-sm">check_circle</span>
            </div>
            <span className="text-sm font-bold text-white/95">Mã giảm giá đã áp dụng</span>
          </div>
          <button
            onClick={onCancel}
            className="text-xs font-semibold text-white/60 hover:text-white/90 transition-colors px-2 py-1 rounded-md hover:bg-white/10"
            title="Hủy mã giảm giá"
          >
            <span className="material-symbols-outlined text-sm">close</span>
          </button>
        </div>

        {/* Coupon Badge */}
        <div className="flex items-center gap-3 bg-white/[0.07] rounded-lg p-3">
          <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-gradient-to-br from-green-400/30 to-emerald-500/20 flex items-center justify-center border border-green-400/20">
            <span className="material-symbols-outlined text-green-400 text-lg">confirmation_number</span>
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-white tracking-wide font-mono bg-white/10 px-2 py-0.5 rounded">
                {appliedCoupon.code}
              </span>
              <span className="text-xs font-semibold text-green-400 bg-green-400/10 px-1.5 py-0.5 rounded">
                {appliedCoupon.discountType === 'PERCENTAGE'
                  ? `-${discountValue}%`
                  : formatCurrency(discountValue)}
              </span>
            </div>
            <div className="flex items-center gap-1.5 mt-1.5">
              <span className="text-xs text-white/50">Tiết kiệm:</span>
              <span className="text-sm font-bold text-green-400">
                {formatCurrency(discountAmount)}
              </span>
              {appliedCoupon.discountType === 'PERCENTAGE' && maxDiscount && maxDiscount > 0 && (
                <span className="text-[10px] text-white/40">(tối đa {formatCurrency(maxDiscount)})</span>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // === Input State ===
  return (
    <div className="space-y-2.5">
      {/* Label */}
      <div className="flex items-center gap-2">
        <span className="material-symbols-outlined text-white/50 text-base">confirmation_number</span>
        <span className="text-xs font-bold uppercase tracking-wider text-white/50">
          Mã giảm giá
        </span>
      </div>

      {/* Input + Button */}
      <div className="flex gap-2">
        <div className="flex-1 relative">
          <input
            type="text"
            value={couponCode}
            onChange={(e) => {
              setCouponCode(e.target.value.toUpperCase());
              if (error) setError(null);
            }}
            onKeyDown={handleKeyDown}
            placeholder="Nhập mã tại đây..."
            disabled={loading}
            className={`
              w-full px-3.5 py-2.5 
              bg-white/[0.08] backdrop-blur-sm 
              border rounded-xl 
              text-sm text-white placeholder:text-white/30
              outline-none transition-all duration-200
              focus:bg-white/[0.12]
              disabled:opacity-50 disabled:cursor-not-allowed
              font-mono tracking-wider
              ${error
                ? 'border-red-400/50 focus:border-red-400/70 focus:ring-2 focus:ring-red-400/20'
                : 'border-white/10 focus:border-white/25 focus:ring-2 focus:ring-white/10'
              }
            `}
          />
          {couponCode.trim() && !loading && (
            <button
              onClick={() => { setCouponCode(''); setError(null); }}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition-colors"
              tabIndex={-1}
            >
              <span className="material-symbols-outlined text-sm">close</span>
            </button>
          )}
        </div>
        <button
          onClick={handleApply}
          disabled={loading || !couponCode.trim()}
          className="
            px-5 py-2.5 
            bg-white/15 hover:bg-white/25 active:bg-white/30
            text-white text-sm font-bold
            rounded-xl 
            disabled:opacity-30 disabled:cursor-not-allowed 
            transition-all duration-200
            flex items-center gap-1.5
            border border-white/10 hover:border-white/20
          "
        >
          {loading ? (
            <span className="material-symbols-outlined animate-spin text-base">progress_activity</span>
          ) : (
            <>
              <span className="material-symbols-outlined text-base">redeem</span>
              Áp dụng
            </>
          )}
        </button>
      </div>

      {/* Error Message */}
      {error && (
        <div className="flex items-center gap-1.5 px-1 animate-[fadeIn_0.2s_ease-out]">
          <span className="material-symbols-outlined text-red-400 text-sm">error</span>
          <p className="text-red-400 text-xs font-medium">{error}</p>
        </div>
      )}
    </div>
  );
}
