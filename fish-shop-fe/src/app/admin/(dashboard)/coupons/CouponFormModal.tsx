'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import * as yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';
import { AdminCouponRequest, AdminCouponResponse } from '@/types/coupon';
import { adminCouponService } from '@/services/adminCoupon.service';

const validationSchema = yup.object().shape({
  code: yup
    .string()
    .required('Mã coupon không được để trống')
    .min(3, 'Mã phải có ít nhất 3 ký tự')
    .matches(/^[A-Z0-9_-]+$/, 'Mã chỉ chứa chữ hoa, số, gạch dưới hoặc gạch ngang'),
  discountType: yup
    .string()
    .required('Loại giảm không được để trống')
    .oneOf(['PERCENTAGE', 'FIXED_AMOUNT'], 'Loại giảm không hợp lệ'),
  discountValue: yup
    .number()
    .required('Giá trị giảm không được để trống')
    .positive('Giá trị phải lớn hơn 0'),
  minOrderValue: yup
    .number()
    .required('Giá trị đơn hàng tối thiểu không được để trống')
    .positive('Giá trị phải lớn hơn 0'),
  maxDiscountAmount: yup.number().nullable().typeError('Phải là số').positive('Phải lớn hơn 0'),
  usageLimit: yup
    .number()
    .required('Số lượt sử dụng không được để trống')
    .positive('Phải lớn hơn 0')
    .integer('Phải là số nguyên'),
  startDate: yup.string().required('Ngày bắt đầu không được để trống'),
  endDate: yup.string().required('Ngày kết thúc không được để trống'),
  isActive: yup.boolean(),
});

interface CouponFormModalProps {
  onClose: () => void;
  onSuccess: (coupon: AdminCouponResponse) => void;
}

export default function CouponFormModal({ onClose, onSuccess }: CouponFormModalProps) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    watch,
  } = useForm<AdminCouponRequest>({
    resolver: yupResolver(validationSchema),
    defaultValues: {
      isActive: true,
      discountType: 'PERCENTAGE',
    },
  });

  const discountType = watch('discountType');

  const onSubmit = async (data: AdminCouponRequest) => {
    try {
      const response = await adminCouponService.createCoupon(data);
      onSuccess(response);
    } catch (error: any) {
      console.error('Error creating coupon:', error);
      alert(error.message || 'Lỗi khi tạo mã giảm giá');
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-lg max-w-2xl w-full max-h-[90vh] overflow-auto">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-2xl font-bold text-gray-900">Tạo Mã Giảm Giá Mới</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl"
          >
            ×
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
          {/* Mã Coupon */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Mã Coupon <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              {...register('code')}
              placeholder="VD: SUMMER2024"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 uppercase"
            />
            {errors.code && <p className="text-red-500 text-sm mt-1">{errors.code.message}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Loại Giảm */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Loại Giảm <span className="text-red-500">*</span>
              </label>
              <select
                {...register('discountType')}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="PERCENTAGE">Phần Trăm (%)</option>
                <option value="FIXED_AMOUNT">Cố Định (₫)</option>
              </select>
              {errors.discountType && <p className="text-red-500 text-sm mt-1">{errors.discountType.message}</p>}
            </div>

            {/* Giá Trị Giảm */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Giá Trị Giảm {discountType === 'PERCENTAGE' ? '(%)' : '(₫)'} <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                step="0.01"
                {...register('discountValue')}
                placeholder={discountType === 'PERCENTAGE' ? 'VD: 10' : 'VD: 50000'}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              {errors.discountValue && <p className="text-red-500 text-sm mt-1">{errors.discountValue.message}</p>}
            </div>
          </div>

          {/* Giá Trị Đơn Hàng Tối Thiểu */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Giá Trị Đơn Hàng Tối Thiểu (₫) <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              step="0.01"
              {...register('minOrderValue')}
              placeholder="VD: 100000"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {errors.minOrderValue && <p className="text-red-500 text-sm mt-1">{errors.minOrderValue.message}</p>}
          </div>

          {/* Max Discount Amount (chỉ hiển thị nếu là PERCENTAGE) */}
          {discountType === 'PERCENTAGE' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Số Tiền Giảm Tối Đa (₫) (Tuỳ chọn)
              </label>
              <input
                type="number"
                step="0.01"
                {...register('maxDiscountAmount')}
                placeholder="VD: 500000"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              {errors.maxDiscountAmount && (
                <p className="text-red-500 text-sm mt-1">{errors.maxDiscountAmount.message}</p>
              )}
            </div>
          )}

          {/* Số Lượt Sử Dụng */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Số Lượt Sử Dụng <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              {...register('usageLimit')}
              placeholder="VD: 100"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {errors.usageLimit && <p className="text-red-500 text-sm mt-1">{errors.usageLimit.message}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Ngày Bắt Đầu */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Ngày Bắt Đầu <span className="text-red-500">*</span>
              </label>
              <input
                type="datetime-local"
                {...register('startDate')}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              {errors.startDate && <p className="text-red-500 text-sm mt-1">{errors.startDate.message}</p>}
            </div>

            {/* Ngày Kết Thúc */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Ngày Kết Thúc <span className="text-red-500">*</span>
              </label>
              <input
                type="datetime-local"
                {...register('endDate')}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              {errors.endDate && <p className="text-red-500 text-sm mt-1">{errors.endDate.message}</p>}
            </div>
          </div>

          {/* Active Status */}
          <div className="flex items-center gap-3">
            <input type="checkbox" {...register('isActive')} id="isActive" className="w-4 h-4 rounded" />
            <label htmlFor="isActive" className="text-sm font-medium text-gray-700">
              Kích hoạt mã ngay
            </label>
          </div>

          {/* Buttons */}
          <div className="flex justify-end gap-3 pt-6 border-t">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {isSubmitting ? 'Đang lưu...' : 'Tạo Mã'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
