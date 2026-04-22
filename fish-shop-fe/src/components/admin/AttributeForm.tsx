"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AttributeService } from "@/services/attribute.service";

interface AttributeFormProps {
  mode: "create" | "edit";
  attributeId?: number;
}

export default function AttributeForm({ mode, attributeId }: AttributeFormProps) {
  const router = useRouter();
  const isEdit = mode === "edit";

  const [name, setName] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);

  const pageTitle = useMemo(() => {
    if (isEdit) {
      return attributeId ? `Cập nhật thuộc tính #${attributeId}` : "Cập nhật thuộc tính";
    }

    return "Thêm thuộc tính mới";
  }, [attributeId, isEdit]);

  useEffect(() => {
    const fetchData = async () => {
      if (!isEdit) {
        setPageLoading(false);
        return;
      }

      if (!attributeId) {
        setErrors({ fetch: "Thiếu mã thuộc tính cần chỉnh sửa." });
        setPageLoading(false);
        return;
      }

      try {
        const detail = await AttributeService.getById(attributeId);
        setName(detail.name || "");
      } catch (error: unknown) {
        const message = error instanceof Error ? error.message : "Không thể tải dữ liệu thuộc tính.";
        setErrors({ fetch: message });
      } finally {
        setPageLoading(false);
      }
    };

    fetchData();
  }, [attributeId, isEdit]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const trimmedName = name.trim();
    if (!trimmedName) {
      setErrors({ name: "Tên thuộc tính không được để trống." });
      return;
    }

    if (trimmedName.length > 50) {
      setErrors({ name: "Tên thuộc tính không được vượt quá 50 ký tự." });
      return;
    }

    setLoading(true);
    try {
      const payload = { name: trimmedName };

      if (isEdit) {
        if (!attributeId) {
          throw new Error("Thiếu mã thuộc tính để cập nhật.");
        }
        await AttributeService.update(attributeId, payload);
      } else {
        await AttributeService.create(payload);
      }

      router.push("/admin/attributes");
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Đã xảy ra lỗi hệ thống";
      setErrors({ submit: message });
    } finally {
      setLoading(false);
    }
  };

  if (pageLoading) {
    return <div className="p-8 text-slate-500">Đang tải dữ liệu...</div>;
  }

  return (
    <div className="p-8 min-h-screen">
      <form className="max-w-6xl mx-auto grid grid-cols-12 gap-8" onSubmit={handleSubmit}>
        {/* Header Actions */}
        <div className="col-span-12 flex justify-between items-end mb-4">
          <div>
            <h2 className="text-3xl font-headline font-extrabold text-primary tracking-tight">
              {pageTitle}
            </h2>
            <p className="text-on-surface-variant text-sm mt-1">
              Quản lý thuộc tính cho sản phẩm trong hệ thống quản trị.
            </p>
          </div>
          <div className="flex gap-3">
            <Link
              href="/admin/attributes"
              className="px-6 py-2.5 rounded-full border border-outline-variant text-primary font-bold text-sm hover:bg-surface-container-low transition-colors"
            >
              Hủy
            </Link>
            <button
              className="px-8 py-2.5 rounded-full bg-linear-to-br from-primary to-primary-container text-white font-bold text-sm shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-100 transition-all disabled:opacity-70 disabled:hover:scale-100"
              type="submit"
              disabled={loading || !!errors.fetch}
            >
              {loading ? "Đang lưu..." : isEdit ? "Lưu thay đổi" : "Tạo thuộc tính"}
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

        {/* Main Column */}
        <div className="col-span-12 lg:col-span-8 space-y-6">
          <section className="bg-surface-container-lowest p-8 rounded-xl space-y-6 shadow-sm border-l-4 border-secondary">
            <div className="grid grid-cols-2 gap-6">
              <div className="col-span-2">
                <label className="block text-xs font-bold text-primary uppercase tracking-widest mb-2">Tên thuộc tính</label>
                <input
                  className={`w-full bg-surface-container-highest border-none rounded-lg px-4 py-3 text-on-surface focus:ring-2 focus:ring-primary/20 transition-all placeholder:text-slate-400 outline-none ${errors.name ? "ring-2 ring-error" : ""}`}
                  placeholder="Ví dụ: Độ pH"
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                    if (errors.name) {
                      setErrors((prev) => {
                        const next = { ...prev };
                        delete next.name;
                        return next;
                      });
                    }
                  }}
                  type="text"
                />
                {errors.name && <p className="text-xs text-error font-medium mt-1">{errors.name}</p>}
              </div>
            </div>
          </section>
        </div>

        {/* Side Column
        <div className="col-span-12 lg:col-span-4 space-y-6">
          <section className="bg-surface-container-lowest p-6 rounded-xl shadow-sm space-y-6">
            <div>
              <label className="text-xs font-medium text-on-surface-variant mb-1.5 flex items-center gap-1">
                <span className="material-symbols-outlined text-[16px]">info</span> Thông tin API
              </label>
              <div className="rounded-xl bg-surface-container-highest p-4 text-sm text-on-surface-variant leading-6">
                Module này đang dùng API thật tại endpoint
                <span className="font-semibold text-primary"> /api/admin/attributes</span>.
              </div>
            </div>
          </section>
        </div> */}
      </form>
    </div>
  );
}
