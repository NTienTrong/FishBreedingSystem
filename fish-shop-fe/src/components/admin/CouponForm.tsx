"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { adminCouponService } from "@/services/adminCoupon.service";
import { AdminCouponRequest, CouponDiscountType } from "@/types/coupon";

interface CouponFormProps {
  mode: "create" | "edit";
  couponId?: number;
}

const normalizeDateTime = (value: string) => {
  if (!value) {
    return "";
  }

  return value.slice(0, 16);
};

export default function CouponForm({ mode, couponId }: CouponFormProps) {
  const router = useRouter();
  const isEdit = mode === "edit";

  const [pageLoading, setPageLoading] = useState(true);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formData, setFormData] = useState({
    code: "",
    discountType: CouponDiscountType.PERCENTAGE,
    discountValue: "",
    minOrderValue: "",
    maxDiscountAmount: "",
    usageLimit: "",
    startDate: "",
    endDate: "",
    isActive: true,
  });

  const pageTitle = useMemo(() => {
    if (isEdit) {
      return couponId ? `Cập nhật mã giảm giá #${couponId}` : "Cập nhật mã giảm giá";
    }

    return "Tạo mã giảm giá mới";
  }, [couponId, isEdit]);

  useEffect(() => {
    const fetchData = async () => {
      if (!isEdit) {
        setPageLoading(false);
        return;
      }

      if (!couponId) {
        setErrors({ fetch: "Thiếu mã giảm giá cần chỉnh sửa." });
        setPageLoading(false);
        return;
      }

      try {
        const detail = await adminCouponService.getCouponById(couponId);
        setFormData({
          code: detail.code ?? "",
          discountType: detail.discountType,
          discountValue: String(detail.discountValue ?? ""),
          minOrderValue: String(detail.minOrderValue ?? ""),
          maxDiscountAmount: detail.maxDiscountAmount != null ? String(detail.maxDiscountAmount) : "",
          usageLimit: String(detail.usageLimit ?? ""),
          startDate: normalizeDateTime(detail.startDate),
          endDate: normalizeDateTime(detail.endDate),
          isActive: Boolean(detail.isActive),
        });
      } catch (error: unknown) {
        const message = error instanceof Error ? error.message : "Không thể tải dữ liệu mã giảm giá.";
        setErrors({ fetch: message });
      } finally {
        setPageLoading(false);
      }
    };

    fetchData();
  }, [couponId, isEdit]);

  const clearFieldError = (field: string) => {
    if (!errors[field]) {
      return;
    }

    setErrors((prev) => {
      const next = { ...prev };
      delete next[field];
      return next;
    });
  };

  const handleChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value, type } = event.target;

    if (type === "checkbox") {
      const checkbox = event.target as HTMLInputElement;
      setFormData((prev) => ({ ...prev, [name]: checkbox.checked }));
      clearFieldError(name);
      return;
    }

    const nextValue = name === "code" ? value.toUpperCase() : value;
    setFormData((prev) => ({ ...prev, [name]: nextValue }));
    clearFieldError(name);
  };

  const validate = () => {
    const nextErrors: Record<string, string> = {};

    if (!formData.code.trim()) {
      nextErrors.code = "Mã coupon không được để trống.";
    } else if (formData.code.trim().length < 3) {
      nextErrors.code = "Mã phải có ít nhất 3 ký tự.";
    } else if (!/^[A-Z0-9_-]+$/.test(formData.code.trim())) {
      nextErrors.code = "Mã chỉ chứa chữ hoa, số, gạch dưới hoặc gạch ngang.";
    }

    if (!formData.discountType) {
      nextErrors.discountType = "Loại giảm không được để trống.";
    }

    const discountValue = Number(formData.discountValue);
    if (!formData.discountValue.trim() || Number.isNaN(discountValue) || discountValue <= 0) {
      nextErrors.discountValue = "Giá trị giảm phải lớn hơn 0.";
    }

    const minOrderValue = Number(formData.minOrderValue);
    if (!formData.minOrderValue.trim() || Number.isNaN(minOrderValue) || minOrderValue <= 0) {
      nextErrors.minOrderValue = "Giá trị đơn hàng tối thiểu phải lớn hơn 0.";
    }

    if (formData.discountType === CouponDiscountType.PERCENTAGE && formData.maxDiscountAmount.trim()) {
      const maxDiscountAmount = Number(formData.maxDiscountAmount);
      if (Number.isNaN(maxDiscountAmount) || maxDiscountAmount <= 0) {
        nextErrors.maxDiscountAmount = "Số tiền giảm tối đa phải lớn hơn 0.";
      }
    }

    const usageLimit = Number(formData.usageLimit);
    if (!formData.usageLimit.trim() || Number.isNaN(usageLimit) || usageLimit <= 0 || !Number.isInteger(usageLimit)) {
      nextErrors.usageLimit = "Số lượt sử dụng phải là số nguyên lớn hơn 0.";
    }

    if (!formData.startDate.trim()) {
      nextErrors.startDate = "Ngày bắt đầu không được để trống.";
    }

    if (!formData.endDate.trim()) {
      nextErrors.endDate = "Ngày kết thúc không được để trống.";
    }

    if (formData.startDate && formData.endDate && new Date(formData.endDate) <= new Date(formData.startDate)) {
      nextErrors.endDate = "Ngày kết thúc phải sau ngày bắt đầu.";
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!validate()) {
      return;
    }

    try {
      setLoading(true);

      const payload: AdminCouponRequest = {
        code: formData.code.trim(),
        discountType: formData.discountType,
        discountValue: Number(formData.discountValue),
        minOrderValue: Number(formData.minOrderValue),
        maxDiscountAmount: formData.maxDiscountAmount.trim()
          ? Number(formData.maxDiscountAmount)
          : undefined,
        usageLimit: Number(formData.usageLimit),
        startDate: formData.startDate,
        endDate: formData.endDate,
        isActive: formData.isActive,
      };

      if (isEdit) {
        if (!couponId) {
          throw new Error("Thiếu mã giảm giá để cập nhật.");
        }
        await adminCouponService.updateCoupon(couponId, payload);
      } else {
        await adminCouponService.createCoupon(payload);
      }

      const message = isEdit ? "Cập nhật mã giảm giá thành công." : "Thêm mã giảm giá thành công.";
      router.push(`/admin/coupons?message=${encodeURIComponent(message)}&variant=success`);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Không thể lưu mã giảm giá.";
      setErrors({ submit: message });
    } finally {
      setLoading(false);
    }
  };

  if (pageLoading) {
    return <div className="p-8 text-slate-500">Đang tải dữ liệu mã giảm giá...</div>;
  }

  return (
    <div className="p-8 min-h-screen">
      <form className="max-w-5xl mx-auto grid grid-cols-12 gap-8" onSubmit={handleSubmit}>
        <div className="col-span-12 flex justify-between items-end mb-4">
          <div>
            <h2 className="text-3xl font-headline font-extrabold text-primary tracking-tight">
              {pageTitle}
            </h2>
            <p className="text-on-surface-variant text-sm mt-1">
              Quản lý mã giảm giá, điều kiện áp dụng và thời gian hiệu lực.
            </p>
          </div>
          <div className="flex gap-3">
            <Link
              href="/admin/coupons"
              className="px-6 py-2.5 rounded-full border border-outline-variant text-primary font-bold text-sm hover:bg-surface-container-low transition-colors"
            >
              Hủy
            </Link>
            <button
              type="submit"
              disabled={loading || !!errors.fetch}
              className="px-8 py-2.5 rounded-full bg-linear-to-br from-primary to-primary-container text-white font-bold text-sm shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-100 transition-all disabled:opacity-70 disabled:hover:scale-100"
            >
              {loading ? "Đang lưu..." : isEdit ? "Lưu thay đổi" : "Tạo mã giảm giá"}
            </button>
          </div>
        </div>

        {errors.fetch && (
          <div className="col-span-12 p-4 bg-error/10 text-error rounded-xl text-sm font-medium">
            {errors.fetch}
          </div>
        )}

        {errors.submit && (
          <div className="col-span-12 p-4 bg-error/10 text-error rounded-xl text-sm font-medium">
            {errors.submit}
          </div>
        )}

        <div className="col-span-12 lg:col-span-8 space-y-6">
          <section className="bg-surface-container-lowest p-8 rounded-xl space-y-6 shadow-sm">
            <div className="grid grid-cols-2 gap-6">
              <div className="col-span-2">
                <label className="block text-xs font-bold text-primary uppercase tracking-widest mb-2">Mã coupon</label>
                <input
                  className={`w-full bg-surface-container-highest border-none rounded-lg px-4 py-3 text-on-surface focus:ring-2 focus:ring-primary/20 transition-all placeholder:text-slate-400 outline-none ${errors.code ? "ring-2 ring-error" : ""}`}
                  placeholder="VD: SUMMER2024"
                  value={formData.code}
                  name="code"
                  onChange={handleChange}
                  type="text"
                />
                {errors.code && <p className="text-xs text-error font-medium mt-1">{errors.code}</p>}
              </div>

              <div className="col-span-1">
                <label className="block text-xs font-bold text-primary uppercase tracking-widest mb-2">Loại giảm</label>
                <select
                  className={`w-full bg-surface-container-highest border-none rounded-lg px-4 py-3 text-on-surface focus:ring-2 focus:ring-primary/20 outline-none ${errors.discountType ? "ring-2 ring-error" : ""}`}
                  value={formData.discountType}
                  name="discountType"
                  onChange={handleChange}
                >
                  <option value={CouponDiscountType.PERCENTAGE}>Phần trăm (%)</option>
                  <option value={CouponDiscountType.FIXED_AMOUNT}>Số tiền cố định (₫)</option>
                </select>
                {errors.discountType && <p className="text-xs text-error font-medium mt-1">{errors.discountType}</p>}
              </div>

              <div className="col-span-1">
                <label className="block text-xs font-bold text-primary uppercase tracking-widest mb-2">
                  Giá trị giảm {formData.discountType === CouponDiscountType.PERCENTAGE ? "(%)" : "(₫)"}
                </label>
                <input
                  className={`w-full bg-surface-container-highest border-none rounded-lg px-4 py-3 text-on-surface focus:ring-2 focus:ring-primary/20 outline-none ${errors.discountValue ? "ring-2 ring-error" : ""}`}
                  placeholder={formData.discountType === CouponDiscountType.PERCENTAGE ? "VD: 10" : "VD: 50000"}
                  value={formData.discountValue}
                  name="discountValue"
                  onChange={handleChange}
                  type="number"
                  step="0.01"
                  min="0"
                />
                {errors.discountValue && <p className="text-xs text-error font-medium mt-1">{errors.discountValue}</p>}
              </div>

              <div className="col-span-2">
                <label className="block text-xs font-bold text-primary uppercase tracking-widest mb-2">Giá trị đơn hàng tối thiểu (₫)</label>
                <input
                  className={`w-full bg-surface-container-highest border-none rounded-lg px-4 py-3 text-on-surface focus:ring-2 focus:ring-primary/20 outline-none ${errors.minOrderValue ? "ring-2 ring-error" : ""}`}
                  placeholder="VD: 100000"
                  value={formData.minOrderValue}
                  name="minOrderValue"
                  onChange={handleChange}
                  type="number"
                  step="0.01"
                  min="0"
                />
                {errors.minOrderValue && <p className="text-xs text-error font-medium mt-1">{errors.minOrderValue}</p>}
              </div>

              {formData.discountType === CouponDiscountType.PERCENTAGE && (
                <div className="col-span-2">
                  <label className="block text-xs font-bold text-primary uppercase tracking-widest mb-2">Số tiền giảm tối đa (₫)</label>
                  <input
                    className={`w-full bg-surface-container-highest border-none rounded-lg px-4 py-3 text-on-surface focus:ring-2 focus:ring-primary/20 outline-none ${errors.maxDiscountAmount ? "ring-2 ring-error" : ""}`}
                    placeholder="VD: 500000"
                    value={formData.maxDiscountAmount}
                    name="maxDiscountAmount"
                    onChange={handleChange}
                    type="number"
                    step="0.01"
                    min="0"
                  />
                  {errors.maxDiscountAmount && <p className="text-xs text-error font-medium mt-1">{errors.maxDiscountAmount}</p>}
                </div>
              )}

              <div className="col-span-2">
                <label className="block text-xs font-bold text-primary uppercase tracking-widest mb-2">Số lượt sử dụng</label>
                <input
                  className={`w-full bg-surface-container-highest border-none rounded-lg px-4 py-3 text-on-surface focus:ring-2 focus:ring-primary/20 outline-none ${errors.usageLimit ? "ring-2 ring-error" : ""}`}
                  placeholder="VD: 100"
                  value={formData.usageLimit}
                  name="usageLimit"
                  onChange={handleChange}
                  type="number"
                  min="0"
                  step="1"
                />
                {errors.usageLimit && <p className="text-xs text-error font-medium mt-1">{errors.usageLimit}</p>}
              </div>

              <div className="col-span-1">
                <label className="block text-xs font-bold text-primary uppercase tracking-widest mb-2">Ngày bắt đầu</label>
                <input
                  className={`w-full bg-surface-container-highest border-none rounded-lg px-4 py-3 text-on-surface focus:ring-2 focus:ring-primary/20 outline-none ${errors.startDate ? "ring-2 ring-error" : ""}`}
                  value={formData.startDate}
                  name="startDate"
                  onChange={handleChange}
                  type="datetime-local"
                />
                {errors.startDate && <p className="text-xs text-error font-medium mt-1">{errors.startDate}</p>}
              </div>

              <div className="col-span-1">
                <label className="block text-xs font-bold text-primary uppercase tracking-widest mb-2">Ngày kết thúc</label>
                <input
                  className={`w-full bg-surface-container-highest border-none rounded-lg px-4 py-3 text-on-surface focus:ring-2 focus:ring-primary/20 outline-none ${errors.endDate ? "ring-2 ring-error" : ""}`}
                  value={formData.endDate}
                  name="endDate"
                  onChange={handleChange}
                  type="datetime-local"
                />
                {errors.endDate && <p className="text-xs text-error font-medium mt-1">{errors.endDate}</p>}
              </div>
            </div>
          </section>
        </div>

        <div className="col-span-12 lg:col-span-4 space-y-6">
          <section className="bg-surface-container-lowest p-6 rounded-xl shadow-sm space-y-6">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-bold text-primary uppercase tracking-widest">Kích hoạt ngay</label>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  checked={formData.isActive}
                  className="sr-only peer"
                  type="checkbox"
                  name="isActive"
                  onChange={handleChange}
                />
                <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:inset-s-0.5 after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-secondary"></div>
              </label>
            </div>

            <div className="rounded-2xl bg-slate-50 p-4 text-sm text-slate-600 space-y-2">
              <p className="font-semibold text-slate-900">Gợi ý cấu hình</p>
              <p>• Mã coupon nên viết hoa và không có dấu cách.</p>
              <p>• Mã giảm theo % có thể đặt giới hạn giảm tối đa.</p>
              <p>• Thời gian kết thúc phải sau thời gian bắt đầu.</p>
            </div>
          </section>
        </div>
      </form>
    </div>
  );
}
