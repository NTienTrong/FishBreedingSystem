"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { CategoryService } from "@/services/category.service";
import { CategoryResponse } from "@/types/category";
import { validateCategory } from "@/validations/category";

interface CategoryFormProps {
  mode: "create" | "edit";
  categoryId?: number;
}

export default function CategoryForm({ mode, categoryId }: CategoryFormProps) {
  const router = useRouter();
  const isEdit = mode === "edit";

  const [categories, setCategories] = useState<CategoryResponse[]>([]);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    parentId: "",
  });
  const [slugPreview, setSlugPreview] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);

  const pageTitle = useMemo(() => {
    if (isEdit) {
      return categoryId ? `Cập nhật danh mục #${categoryId}` : "Cập nhật danh mục";
    }
    return "Tạo danh mục mới";
  }, [isEdit, categoryId]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const allCategories = await CategoryService.getAll();

        if (isEdit) {
          if (!categoryId) {
            setErrors({ fetch: "Thiếu mã danh mục cần chỉnh sửa." });
            return;
          }

          const categoryDetail = await CategoryService.getById(categoryId);

          // Exclude current category and its direct children to avoid simple cycles.
          const parentOptions = allCategories.filter(
            (cat) => cat.id !== categoryId && cat.parentId !== categoryId,
          );

          setCategories(parentOptions);
          setFormData({
            name: categoryDetail.name || "",
            description: categoryDetail.description || "",
            parentId: categoryDetail.parentId ? String(categoryDetail.parentId) : "",
          });
          setSlugPreview(categoryDetail.slug || "");
          return;
        }

        setCategories(allCategories);
      } catch (error: unknown) {
        const message = error instanceof Error ? error.message : "Không thể tải dữ liệu danh mục.";
        setErrors({ fetch: message });
      } finally {
        setPageLoading(false);
      }
    };

    fetchData();
  }, [categoryId, isEdit]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[name];
        return next;
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const validation = validateCategory({
      name: formData.name,
      description: formData.description,
    });

    if (!validation.isValid) {
      setErrors(validation.errors);
      return;
    }

    setLoading(true);
    try {
      const payload = {
        name: formData.name,
        description: formData.description,
        parentId: formData.parentId ? Number(formData.parentId) : null,
      };

      if (isEdit) {
        if (!categoryId) {
          throw new Error("Thiếu mã danh mục để cập nhật.");
        }
        await CategoryService.update(categoryId, payload);
      } else {
        await CategoryService.create(payload);
      }

      router.push("/admin/categories");
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
              Quản lý phân cấp sản phẩm và thuộc tính của trại giống.
            </p>
          </div>
          <div className="flex gap-3">
            <Link
              href="/admin/categories"
              className="px-6 py-2.5 rounded-full border border-outline-variant text-primary font-bold text-sm hover:bg-surface-container-low transition-colors"
            >
              Hủy
            </Link>
            <button
              className="px-8 py-2.5 rounded-full bg-linear-to-br from-primary to-primary-container text-white font-bold text-sm shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-100 transition-all disabled:opacity-70 disabled:hover:scale-100"
              type="submit"
              disabled={loading || !!errors.fetch}
            >
              {loading ? "Đang lưu..." : isEdit ? "Lưu thay đổi" : "Lưu danh mục"}
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
          <section className="bg-surface-container-lowest p-8 rounded-xl space-y-6 shadow-sm">
            <div className="grid grid-cols-2 gap-6">
              <div className="col-span-2">
                <label className="block text-xs font-bold text-primary uppercase tracking-widest mb-2">Tên danh mục</label>
                <input
                  className={`w-full bg-surface-container-highest border-none rounded-lg px-4 py-3 text-on-surface focus:ring-2 focus:ring-primary/20 transition-all placeholder:text-slate-400 outline-none ${errors.name ? "ring-2 ring-error" : ""}`}
                  placeholder="Ví dụ: Cá Koi Nhật Bản"
                  value={formData.name}
                  name="name"
                  onChange={handleChange}
                  type="text"
                />
                {errors.name && <p className="text-xs text-error font-medium mt-1">{errors.name}</p>}
              </div>

              {isEdit && (
                <div className="col-span-2 relative">
                  <label className="block text-xs font-bold text-primary uppercase tracking-widest mb-2">Đường dẫn (Slug)</label>
                  <input
                    className="w-full bg-slate-100 border-none rounded-lg px-4 py-3 text-slate-500 italic pr-24 outline-none"
                    value={slugPreview}
                    type="text"
                    disabled
                  />
                </div>
              )}

              <div className="col-span-2">
                <label className="block text-xs font-bold text-primary uppercase tracking-widest mb-2">Mô tả ngắn</label>
                <textarea
                  className={`w-full bg-surface-container-highest border-none rounded-lg px-4 py-3 focus:ring-2 focus:ring-primary/20 outline-none resize-y ${errors.description ? "ring-2 ring-error" : ""}`}
                  rows={4}
                  placeholder="Nhập mô tả của danh mục sẽ hiển thị cho SEO..."
                  value={formData.description}
                  name="description"
                  onChange={handleChange}
                ></textarea>
                {errors.description && <p className="text-xs text-error font-medium mt-1">{errors.description}</p>}
              </div>
            </div>
          </section>
        </div>

        {/* Side Column */}
        <div className="col-span-12 lg:col-span-4 space-y-6">
          <section className="bg-surface-container-lowest p-6 rounded-xl shadow-sm space-y-6">
            <div>
              <label className="text-xs font-medium text-on-surface-variant mb-1.5 flex items-center gap-1">
                <span className="material-symbols-outlined text-[16px]">account_tree</span> Danh mục cha
              </label>
              <select
                className="w-full bg-surface-container-highest border-none rounded-lg px-4 py-3 focus:ring-2 focus:ring-primary/20 outline-none"
                name="parentId"
                value={formData.parentId}
                onChange={handleChange}
              >
                <option value="">Không có (Danh mục gốc)</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>
          </section>

          <section className="bg-surface-container-lowest p-6 rounded-xl shadow-sm text-center">
            <label className="block text-xs font-bold text-primary uppercase tracking-widest mb-4">Hình ảnh đại diện</label>
            <div className="aspect-square w-full max-w-50 mx-auto rounded-xl bg-surface-container-high border-2 border-dashed border-outline-variant flex flex-col items-center justify-center cursor-pointer hover:border-primary transition-colors overflow-hidden relative group">
              <span className="material-symbols-outlined text-4xl text-slate-300 group-hover:text-primary transition-colors">add_photo_alternate</span>
              <span className="text-[10px] font-bold text-slate-400 group-hover:text-primary mt-2">SẮP CẬP NHẬT</span>
            </div>
          </section>
        </div>
      </form>
    </div>
  );
}
