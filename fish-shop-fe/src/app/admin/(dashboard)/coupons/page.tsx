"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import DeleteConfirmModal from "@/components/common/DeleteConfirmModal";
import DetailModal from "@/components/common/DetailModal";
import ToastMessage from "@/components/common/ToastMessage";
import { adminCouponService } from "@/services/adminCoupon.service";
import { AdminCouponResponse, CouponDiscountType } from "@/types/coupon";
import CouponStatusToggle from "./CouponStatusToggle";

export const dynamic = "force-dynamic";

type StatusFilter = "all" | "active" | "inactive" | "expired" | "upcoming";

const currencyFormatter = new Intl.NumberFormat("vi-VN", {
  style: "currency",
  currency: "VND",
  maximumFractionDigits: 0,
});

const dateTimeFormatter = new Intl.DateTimeFormat("vi-VN", {
  dateStyle: "medium",
  timeStyle: "short",
});

const toDate = (value: string) => new Date(value);

const isExpired = (coupon: AdminCouponResponse) => toDate(coupon.endDate) < new Date();
const isNotStarted = (coupon: AdminCouponResponse) => toDate(coupon.startDate) > new Date();
const isUsedOut = (coupon: AdminCouponResponse) => coupon.usedCount >= coupon.usageLimit;

export default function AdminCouponsPage() {
  const router = useRouter();
  const pathname = usePathname();

  const [coupons, setCoupons] = useState<AdminCouponResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [deleteTarget, setDeleteTarget] = useState<AdminCouponResponse | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [detailTarget, setDetailTarget] = useState<AdminCouponResponse | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [toast, setToast] = useState<{ show: boolean; message: string; variant: "success" | "error" }>({
    show: false,
    message: "",
    variant: "success",
  });

  const showToast = useCallback((message: string, variant: "success" | "error") => {
    setToast({ show: true, message, variant });
    setTimeout(() => {
      setToast((prev) => ({ ...prev, show: false }));
    }, 2500);
  }, []);

  const fetchCoupons = useCallback(async () => {
    try {
      const response = await adminCouponService.getCoupons(0, 1000);
      setCoupons(response.content);
    } catch (error) {
      console.error(error);
      showToast("Không thể tải danh sách mã giảm giá.", "error");
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    fetchCoupons();
  }, [fetchCoupons]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const message = params.get("message");
    if (!message) {
      return;
    }

    const variant = params.get("variant") === "error" ? "error" : "success";
    showToast(message, variant);
    router.replace(pathname);
  }, [pathname, router, showToast]);

  const filteredCoupons = useMemo(() => {
    const keyword = search.trim().toLowerCase();

    const sortedCoupons = [...coupons].sort((a, b) => {
      const dateDiff = new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      return dateDiff !== 0 ? dateDiff : b.id - a.id;
    });

    return sortedCoupons.filter((item) => {
      const matchSearch = keyword.length === 0 || item.code.toLowerCase().includes(keyword);
      const expired = isExpired(item);
      const notStarted = isNotStarted(item);
      const usedOut = isUsedOut(item);

      const matchStatus =
        statusFilter === "all" ||
        (statusFilter === "active" && item.isActive && !expired && !notStarted && !usedOut) ||
        (statusFilter === "inactive" && !item.isActive) ||
        (statusFilter === "expired" && expired) ||
        (statusFilter === "upcoming" && notStarted);

      return matchSearch && matchStatus;
    });
  }, [coupons, search, statusFilter]);

  const PAGE_SIZE = 5;
  const totalPages = Math.max(1, Math.ceil(filteredCoupons.length / PAGE_SIZE));
  const pagedCoupons = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return filteredCoupons.slice(start, start + PAGE_SIZE);
  }, [currentPage, filteredCoupons]);

  useEffect(() => {
    setCurrentPage(1);
  }, [search, statusFilter, coupons.length]);

  useEffect(() => {
    setCurrentPage((prev) => Math.min(prev, totalPages));
  }, [totalPages]);

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) {
      return;
    }

    try {
      setIsDeleting(true);
      await adminCouponService.deleteCoupon(deleteTarget.id);
      await fetchCoupons();
      showToast("Xóa mã giảm giá thành công.", "success");
      setDeleteTarget(null);
    } catch (error) {
      console.error(error);
      showToast("Xóa mã giảm giá thất bại.", "error");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleOpenDetail = useCallback(async (couponId: number) => {
    setIsDetailOpen(true);
    setDetailLoading(true);
    try {
      const data = await adminCouponService.getCouponById(couponId);
      setDetailTarget(data);
    } catch (error) {
      console.error(error);
      showToast("Không thể tải chi tiết mã giảm giá.", "error");
      setIsDetailOpen(false);
    } finally {
      setDetailLoading(false);
    }
  }, [showToast]);

  const handleCloseDetail = () => {
    setIsDetailOpen(false);
    setDetailTarget(null);
  };

  const handleToggleStatus = async (id: number, isActive: boolean) => {
    try {
      await adminCouponService.toggleStatus(id, isActive);
      showToast(`${isActive ? "Kích hoạt" : "Vô hiệu hóa"} mã thành công.`, "success");
      await fetchCoupons();
    } catch (error) {
      console.error(error);
      showToast("Lỗi khi cập nhật trạng thái.", "error");
    }
  };

  const totalActiveCoupons = coupons.filter((item) => item.isActive && !isExpired(item) && !isNotStarted(item) && !isUsedOut(item)).length;
  const totalExpiredCoupons = coupons.filter((item) => isExpired(item)).length;

  const renderDetailItem = (label: string, value: React.ReactNode) => (
    <div className="grid grid-cols-[180px_1fr] gap-4 border-b border-slate-100 py-3">
      <p className="text-xs uppercase tracking-wider text-slate-400">{label}</p>
      <div className="text-sm text-slate-700">{value ?? "-"}</div>
    </div>
  );

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-lg">Đang tải...</div>
      </div>
    );
  }

  return (
    <div className="p-8 space-y-8">
      <ToastMessage show={toast.show} message={toast.message} variant={toast.variant} />

      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-headline font-extrabold text-primary">Quản lý Mã Giảm Giá</h2>
        </div>
        <Link
          href="/admin/coupons/add"
          className="bg-primary hover:bg-black text-white px-6 py-3 rounded-full text-sm font-bold flex items-center gap-2 transition-colors"
        >
          <span className="material-symbols-outlined text-sm">add</span> Thêm mới
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-surface-container-low p-5 rounded-2xl">
          <p className="text-xs text-slate-500 uppercase tracking-wider">Tổng mã</p>
          <p className="text-2xl font-extrabold text-primary mt-1">{coupons.length}</p>
        </div>
        <div className="bg-surface-container-low p-5 rounded-2xl">
          <p className="text-xs text-slate-500 uppercase tracking-wider">Đang hoạt động</p>
          <p className="text-2xl font-extrabold text-primary mt-1">{totalActiveCoupons}</p>
        </div>
        <div className="bg-surface-container-low p-5 rounded-2xl">
          <p className="text-xs text-slate-500 uppercase tracking-wider">Hết hạn</p>
          <p className="text-2xl font-extrabold text-primary mt-1">{totalExpiredCoupons}</p>
        </div>
      </div>

      <div className="bg-surface-container-low rounded-3xl p-4 flex flex-wrap items-center gap-4">
        <div className="min-w-64 flex-1">
          <input
            className="w-full bg-white border border-outline-variant/15 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/15"
            placeholder="Tìm theo mã coupon..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
        </div>
        <select
          className="bg-white border border-outline-variant/15 rounded-xl px-4 py-2.5 text-sm outline-none"
          value={statusFilter}
          onChange={(event) => setStatusFilter(event.target.value as StatusFilter)}
        >
          <option value="all">Tất cả trạng thái</option>
          <option value="active">Đang hoạt động</option>
          <option value="inactive">Đã khóa</option>
          <option value="expired">Hết hạn</option>
          <option value="upcoming">Chưa bắt đầu</option>
        </select>
        <p className="text-sm text-slate-500">{filteredCoupons.length} mã</p>
      </div>

      <div className="bg-surface-container-lowest rounded-4xl overflow-hidden shadow-sm border border-outline-variant/10">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-surface-container-low text-[10px] font-bold text-slate-500 uppercase tracking-widest border-b border-outline-variant/20">
                <th className="px-8 py-5">Mã</th>
                <th className="px-8 py-5">Loại giảm</th>
                <th className="px-8 py-5">Giá trị</th>
                <th className="px-8 py-5">Lượt dùng</th>
                <th className="px-8 py-5">Thời gian</th>
                <th className="px-8 py-5">Trạng thái</th>
                <th className="px-8 py-5">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/5">
              {filteredCoupons.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-10">Chưa có mã giảm giá nào.</td>
                </tr>
              ) : (
                pagedCoupons.map((coupon) => {
                  const expired = isExpired(coupon);
                  const notStarted = isNotStarted(coupon);
                  const usedOut = isUsedOut(coupon);
                  const rowClass = expired || notStarted || usedOut ? "opacity-70 bg-slate-50" : "";

                  return (
                    <tr key={coupon.id} className={`hover:bg-slate-50 transition-colors ${rowClass}`}>
                      <td className="px-8 py-4">
                        <div className="font-semibold text-on-surface">{coupon.code}</div>
                        <p className="text-xs text-slate-400">#{coupon.id}</p>
                      </td>
                      <td className="px-8 py-4 text-sm text-slate-600">
                        {coupon.discountType === CouponDiscountType.PERCENTAGE ? "Phần trăm (%)" : "Số tiền cố định (₫)"}
                      </td>
                      <td className="px-8 py-4 text-sm text-slate-600">
                        {coupon.discountValue}
                        {coupon.discountType === CouponDiscountType.PERCENTAGE ? "%" : "₫"}
                        {coupon.maxDiscountAmount ? (
                          <p className="text-xs text-slate-400 mt-1">Tối đa {currencyFormatter.format(coupon.maxDiscountAmount)}</p>
                        ) : null}
                      </td>
                      <td className="px-8 py-4 text-sm text-slate-600">
                        {coupon.usedCount}/{coupon.usageLimit}
                      </td>
                      <td className="px-8 py-4 text-sm text-slate-600">
                        <div>{dateTimeFormatter.format(new Date(coupon.startDate))}</div>
                        <div className="text-xs text-slate-400 mt-1">{dateTimeFormatter.format(new Date(coupon.endDate))}</div>
                      </td>
                      <td className="px-8 py-4">
                        <div className="flex flex-col gap-2">
                          <CouponStatusToggle id={coupon.id} isActive={coupon.isActive} onToggle={handleToggleStatus} />
                          <div className="flex flex-wrap gap-2">
                            {expired && <span className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded-full">Hết hạn</span>}
                            {notStarted && <span className="text-xs bg-amber-100 text-amber-700 px-2 py-1 rounded-full">Chưa bắt đầu</span>}
                            {usedOut && <span className="text-xs bg-slate-200 text-slate-700 px-2 py-1 rounded-full">Đã dùng hết</span>}
                            {!expired && !notStarted && !usedOut && coupon.isActive && (
                              <span className="text-xs bg-emerald-100 text-emerald-700 px-2 py-1 rounded-full">Đang hoạt động</span>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-4">
                        <div className="flex items-center gap-3">
                          <button
                            onClick={() => handleOpenDetail(coupon.id)}
                            className="text-slate-400 hover:text-primary transition-colors"
                            type="button"
                            aria-label="Xem chi tiết"
                          >
                            <span className="material-symbols-outlined text-[18px]">visibility</span>
                          </button>
                          <Link
                            href={`/admin/coupons/${coupon.id}/edit`}
                            className="text-slate-400 hover:text-primary transition-colors"
                          >
                            <span className="material-symbols-outlined text-[18px]">edit</span>
                          </Link>
                          <button
                            onClick={() => setDeleteTarget(coupon)}
                            className="text-slate-400 hover:text-error transition-colors"
                            type="button"
                          >
                            <span className="material-symbols-outlined text-[18px]">delete</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="flex justify-between items-center">
        <div className="text-sm text-gray-600">
          Trang {currentPage} / {totalPages}
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
            disabled={currentPage === 1}
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg disabled:opacity-50 hover:bg-gray-300"
          >
            Trước
          </button>
          <button
            onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
            disabled={currentPage === totalPages}
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg disabled:opacity-50 hover:bg-gray-300"
          >
            Tiếp
          </button>
        </div>
      </div>

      <DeleteConfirmModal
        isOpen={deleteTarget !== null}
        itemLabel={deleteTarget?.code}
        isDeleting={isDeleting}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDeleteConfirm}
      />

      <DetailModal
        isOpen={isDetailOpen}
        title="Chi tiết mã giảm giá"
        subtitle={detailTarget?.code}
        onClose={handleCloseDetail}
      >
        {detailLoading || !detailTarget ? (
          <div className="py-10 text-center text-slate-500">Đang tải chi tiết...</div>
        ) : (
          <div>
            {renderDetailItem("Mã", detailTarget.code)}
            {renderDetailItem("Loại giảm", detailTarget.discountType === CouponDiscountType.PERCENTAGE ? "Phần trăm (%)" : "Số tiền cố định (₫)")}
            {renderDetailItem(
              "Giá trị",
              `${detailTarget.discountValue}${detailTarget.discountType === CouponDiscountType.PERCENTAGE ? "%" : "₫"}`,
            )}
            {renderDetailItem("Giá trị đơn tối thiểu", currencyFormatter.format(detailTarget.minOrderValue))}
            {renderDetailItem(
              "Giảm tối đa",
              detailTarget.maxDiscountAmount ? currencyFormatter.format(detailTarget.maxDiscountAmount) : "-",
            )}
            {renderDetailItem("Số lượt sử dụng", `${detailTarget.usedCount}/${detailTarget.usageLimit}`)}
            {renderDetailItem("Bắt đầu", dateTimeFormatter.format(new Date(detailTarget.startDate)))}
            {renderDetailItem("Kết thúc", dateTimeFormatter.format(new Date(detailTarget.endDate)))}
            {renderDetailItem("Trạng thái", detailTarget.isActive ? "Đang kích hoạt" : "Đã tắt")}
            {renderDetailItem("Tạo lúc", dateTimeFormatter.format(new Date(detailTarget.createdAt)))}
          </div>
        )}
      </DetailModal>
    </div>
  );
}