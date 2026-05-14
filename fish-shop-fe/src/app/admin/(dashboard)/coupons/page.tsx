'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { AdminCouponResponse } from '@/types/coupon';
import { adminCouponService } from '@/services/adminCoupon.service';
import { ToastMessage } from '@/components/common/ToastMessage';
import CouponFormModal from './CouponFormModal';
import CouponStatusToggle from './CouponStatusToggle';

export default function AdminCouponsPage() {
  const router = useRouter();
  const [coupons, setCoupons] = useState<AdminCouponResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [size, setSize] = useState(10);
  const [totalPages, setTotalPages] = useState(0);
  const [showFormModal, setShowFormModal] = useState(false);
  const [toastMessage, setToastMessage] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  useEffect(() => {
    fetchCoupons();
  }, [page, size]);

  const fetchCoupons = async () => {
    try {
      setLoading(true);
      const response = await adminCouponService.getCoupons(page, size);
      setCoupons(response.content);
      setTotalPages(response.totalPages);
    } catch (error: any) {
      setToastMessage({
        message: error.message || 'Lỗi khi tải danh sách mã giảm giá',
        type: 'error',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateSuccess = (newCoupon: AdminCouponResponse) => {
    setToastMessage({
      message: `Tạo mã giảm giá thành công: ${newCoupon.code}`,
      type: 'success',
    });
    setShowFormModal(false);
    fetchCoupons();
  };

  const handleToggleStatus = async (id: number, isActive: boolean) => {
    try {
      await adminCouponService.toggleStatus(id, isActive);
      setToastMessage({
        message: `${isActive ? 'Kích hoạt' : 'Vô hiệu hóa'} mã thành công`,
        type: 'success',
      });
      fetchCoupons();
    } catch (error: any) {
      setToastMessage({
        message: error.message || 'Lỗi khi cập nhật trạng thái',
        type: 'error',
      });
    }
  };

  const isExpired = (endDate: string) => new Date(endDate) < new Date();
  const isNotStarted = (startDate: string) => new Date(startDate) > new Date();

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-lg">Đang tải...</div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Quản Lý Mã Giảm Giá</h1>
        <button
          onClick={() => setShowFormModal(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
        >
          + Tạo Mã Mới
        </button>
      </div>

      {/* Toast Message */}
      {toastMessage && (
        <ToastMessage
          message={toastMessage.message}
          type={toastMessage.type}
          onClose={() => setToastMessage(null)}
        />
      )}

      {/* Table */}
      <div className="overflow-x-auto border border-gray-200 rounded-lg">
        <table className="w-full">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Mã Code</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Loại Giảm</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Giá Trị</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Số Lượt</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Ngày Bắt Đầu</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Ngày Kết Thúc</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Trạng Thái</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Hành Động</th>
            </tr>
          </thead>
          <tbody>
            {coupons.map((coupon) => {
              const expired = isExpired(coupon.endDate);
              const notStarted = isNotStarted(coupon.startDate);
              const isInvalid = expired || notStarted || coupon.usedCount >= coupon.usageLimit;
              const rowClass = isInvalid ? 'opacity-50 bg-gray-50' : '';

              return (
                <tr key={coupon.id} className={`border-b hover:bg-gray-50 ${rowClass}`}>
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">{coupon.code}</td>
                  <td className="px-6 py-4 text-sm text-gray-700">
                    {coupon.discountType === 'PERCENTAGE' ? 'Phần Trăm (%)' : 'Cố Định (₫)'}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-700">
                    {coupon.discountValue}
                    {coupon.discountType === 'PERCENTAGE' ? '%' : '₫'}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-700">
                    {coupon.usedCount}/{coupon.usageLimit}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-700">
                    {new Date(coupon.startDate).toLocaleDateString('vi-VN')}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-700">
                    {new Date(coupon.endDate).toLocaleDateString('vi-VN')}
                    {expired && <span className="ml-2 text-xs bg-red-100 text-red-700 px-2 py-1 rounded">Hết hạn</span>}
                    {notStarted && <span className="ml-2 text-xs bg-yellow-100 text-yellow-700 px-2 py-1 rounded">Chưa bắt đầu</span>}
                  </td>
                  <td className="px-6 py-4 text-sm">
                    <CouponStatusToggle
                      id={coupon.id}
                      isActive={coupon.isActive}
                      onToggle={handleToggleStatus}
                    />
                  </td>
                  <td className="px-6 py-4 text-sm text-center">
                    {isInvalid && (
                      <span className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded">Hết hiệu lực</span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex justify-between items-center">
        <div className="text-sm text-gray-600">
          Trang {page + 1} / {totalPages}
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setPage(Math.max(0, page - 1))}
            disabled={page === 0}
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg disabled:opacity-50 hover:bg-gray-300"
          >
            Trước
          </button>
          <button
            onClick={() => setPage(Math.min(totalPages - 1, page + 1))}
            disabled={page === totalPages - 1}
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg disabled:opacity-50 hover:bg-gray-300"
          >
            Tiếp
          </button>
        </div>
      </div>

      {/* Modal Form */}
      {showFormModal && (
        <CouponFormModal
          onClose={() => setShowFormModal(false)}
          onSuccess={handleCreateSuccess}
        />
      )}
    </div>
  );
}
