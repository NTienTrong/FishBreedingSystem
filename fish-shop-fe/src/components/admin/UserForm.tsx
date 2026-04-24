"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { UserService } from "@/services/user.service";
import { UserRole } from "@/types/user";

interface UserFormProps {
  mode: "create" | "edit";
  userId?: number;
}

export default function UserForm({ mode, userId }: UserFormProps) {
  const router = useRouter();
  const isEdit = mode === "edit";

  const [formData, setFormData] = useState({
    username: "",
    password: "",
    fullName: "",
    email: "",
    phone: "",
    address: "",
    role: "CUSTOMER" as UserRole,
    isActive: true,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);

  const pageTitle = useMemo(() => {
    if (isEdit) {
      return userId ? `Cập nhật người dùng #${userId}` : "Cập nhật người dùng";
    }

    return "Thêm người dùng mới";
  }, [isEdit, userId]);

  useEffect(() => {
    const fetchData = async () => {
      if (!isEdit) {
        setPageLoading(false);
        return;
      }

      if (!userId) {
        setErrors({ fetch: "Thiếu mã người dùng cần chỉnh sửa." });
        setPageLoading(false);
        return;
      }

      try {
        const detail = await UserService.getById(userId);
        setFormData({
          username: detail.username || "",
          password: "",
          fullName: detail.fullName || "",
          email: detail.email || "",
          phone: detail.phone || "",
          address: detail.address || "",
          role: detail.role?.toUpperCase() === "ADMIN" ? "ADMIN" : "CUSTOMER",
          isActive: Boolean(detail.isActive),
        });
      } catch (error: unknown) {
        const message = error instanceof Error ? error.message : "Không thể tải dữ liệu người dùng.";
        setErrors({ fetch: message });
      } finally {
        setPageLoading(false);
      }
    };

    fetchData();
  }, [isEdit, userId]);

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

  const handleChange = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = event.target;

    if (name === "isActive") {
      const checkboxTarget = event.target as HTMLInputElement;
      setFormData((prev) => ({ ...prev, isActive: checkboxTarget.checked }));
      clearFieldError("isActive");
      return;
    }

    setFormData((prev) => ({ ...prev, [name]: value }));
    clearFieldError(name);
  };

  const validate = (): boolean => {
    const nextErrors: Record<string, string> = {};

    if (!formData.username.trim()) {
      nextErrors.username = "Username không được để trống.";
    }

    if (!formData.fullName.trim()) {
      nextErrors.fullName = "Họ và tên không được để trống.";
    }

    if (!formData.email.trim()) {
      nextErrors.email = "Email không được để trống.";
    }

    if (!isEdit && !formData.password.trim()) {
      nextErrors.password = "Mật khẩu là bắt buộc khi tạo mới.";
    }

    if (formData.password && formData.password.trim().length > 0 && formData.password.trim().length < 6) {
      nextErrors.password = "Mật khẩu cần tối thiểu 6 ký tự.";
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

      const payload = {
        username: formData.username.trim(),
        fullName: formData.fullName.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim() || null,
        address: formData.address.trim() || null,
        role: formData.role,
        isActive: formData.isActive,
        ...(formData.password.trim() ? { password: formData.password.trim() } : {}),
      };

      if (isEdit) {
        if (!userId) {
          throw new Error("Thiếu mã người dùng để cập nhật.");
        }
        await UserService.update(userId, payload);
      } else {
        await UserService.create(payload);
      }

      const message = isEdit ? "Cập nhật người dùng thành công." : "Thêm người dùng thành công.";
      router.push(`/admin/users?message=${encodeURIComponent(message)}&variant=success`);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Không thể lưu người dùng.";
      setErrors({ submit: message });
    } finally {
      setLoading(false);
    }
  };

  if (pageLoading) {
    return <div className="p-8 text-slate-500">Đang tải dữ liệu người dùng...</div>;
  }

  return (
    <div className="p-8 min-h-screen">
      <form className="max-w-6xl mx-auto grid grid-cols-12 gap-8" onSubmit={handleSubmit}>
        <div className="col-span-12 flex justify-between items-end mb-4">
          <div>
            <h2 className="text-3xl font-headline font-extrabold text-primary tracking-tight">
              {pageTitle}
            </h2>
            <p className="text-on-surface-variant text-sm mt-1">
              Quản lý thông tin và phân quyền người dùng hệ thống.
            </p>
          </div>
          <div className="flex gap-3">
            <Link
              href="/admin/users"
              className="px-6 py-2.5 rounded-full border border-outline-variant text-primary font-bold text-sm hover:bg-surface-container-low transition-colors"
            >
              Hủy
            </Link>
            <button
              className="px-8 py-2.5 rounded-full bg-linear-to-br from-primary to-primary-container text-white font-bold text-sm shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-100 transition-all disabled:opacity-70 disabled:hover:scale-100"
              type="submit"
              disabled={loading || !!errors.fetch}
            >
              {loading ? "Đang lưu..." : isEdit ? "Lưu thay đổi" : "Tạo người dùng"}
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
              <div className="col-span-1">
                <label className="block text-xs font-bold text-primary uppercase tracking-widest mb-2">Username</label>
                <input
                  className={`w-full bg-surface-container-highest border-none rounded-lg px-4 py-3 text-on-surface focus:ring-2 focus:ring-primary/20 transition-all placeholder:text-slate-400 outline-none ${errors.username ? "ring-2 ring-error" : ""}`}
                  placeholder="Ví dụ: nguyenvana"
                  value={formData.username}
                  name="username"
                  onChange={handleChange}
                  type="text"
                />
                {errors.username && <p className="text-xs text-error font-medium mt-1">{errors.username}</p>}
              </div>

              <div className="col-span-1">
                <label className="block text-xs font-bold text-primary uppercase tracking-widest mb-2">Mật khẩu {isEdit ? "(để trống nếu không đổi)" : ""}</label>
                <input
                  className={`w-full bg-surface-container-highest border-none rounded-lg px-4 py-3 text-on-surface focus:ring-2 focus:ring-primary/20 outline-none ${errors.password ? "ring-2 ring-error" : ""}`}
                  placeholder={isEdit ? "Nhập mật khẩu mới nếu muốn" : "Nhập mật khẩu"}
                  value={formData.password}
                  name="password"
                  onChange={handleChange}
                  type="password"
                />
                {errors.password && <p className="text-xs text-error font-medium mt-1">{errors.password}</p>}
              </div>

              <div className="col-span-2">
                <label className="block text-xs font-bold text-primary uppercase tracking-widest mb-2">Họ và tên</label>
                <input
                  className={`w-full bg-surface-container-highest border-none rounded-lg px-4 py-3 text-on-surface focus:ring-2 focus:ring-primary/20 transition-all placeholder:text-slate-400 outline-none ${errors.fullName ? "ring-2 ring-error" : ""}`}
                  placeholder="Ví dụ: Nguyễn Văn A"
                  value={formData.fullName}
                  name="fullName"
                  onChange={handleChange}
                  type="text"
                />
                {errors.fullName && <p className="text-xs text-error font-medium mt-1">{errors.fullName}</p>}
              </div>

              <div className="col-span-1">
                <label className="block text-xs font-bold text-primary uppercase tracking-widest mb-2">Email</label>
                <input
                  className={`w-full bg-surface-container-highest border-none rounded-lg px-4 py-3 text-on-surface focus:ring-2 focus:ring-primary/20 outline-none ${errors.email ? "ring-2 ring-error" : ""}`}
                  placeholder="email@domain.com"
                  value={formData.email}
                  name="email"
                  onChange={handleChange}
                  type="email"
                />
                {errors.email && <p className="text-xs text-error font-medium mt-1">{errors.email}</p>}
              </div>

              <div className="col-span-1">
                <label className="block text-xs font-bold text-primary uppercase tracking-widest mb-2">Số điện thoại</label>
                <input
                  className="w-full bg-surface-container-highest border-none rounded-lg px-4 py-3 text-on-surface focus:ring-2 focus:ring-primary/20 outline-none"
                  placeholder="09xx xxx xxx"
                  value={formData.phone}
                  name="phone"
                  onChange={handleChange}
                  type="tel"
                />
              </div>

              <div className="col-span-2">
                <label className="block text-xs font-bold text-primary uppercase tracking-widest mb-2">Địa chỉ</label>
                <textarea
                  className="w-full bg-surface-container-highest border-none rounded-lg px-4 py-3 focus:ring-2 focus:ring-primary/20 outline-none resize-y"
                  rows={4}
                  placeholder="Nhập địa chỉ người dùng..."
                  value={formData.address}
                  name="address"
                  onChange={handleChange}
                ></textarea>
              </div>
            </div>
          </section>
        </div>

        <div className="col-span-12 lg:col-span-4 space-y-6">
          <section className="bg-surface-container-lowest p-6 rounded-xl shadow-sm space-y-6">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-bold text-primary uppercase tracking-widest">Trạng thái (Active)</label>
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

            <div>
              <label className="block text-xs font-medium text-on-surface-variant mb-1.5">Vai trò (Role)</label>
              <select
                className="w-full bg-surface-container-highest border-none rounded-lg px-4 py-3 focus:ring-2 focus:ring-primary/20 outline-none"
                value={formData.role}
                name="role"
                onChange={handleChange}
              >
                <option value="ADMIN">Quản trị viên (ADMIN)</option>
                <option value="CUSTOMER">Khách hàng (CUSTOMER)</option>
              </select>
            </div>
          </section>
        </div>
      </form>
    </div>
  );
}
