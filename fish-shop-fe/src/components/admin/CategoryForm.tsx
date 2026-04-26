"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { CategoryService } from "@/services/category.service";
import { CategoryResponse } from "@/types/category";
import { validateCategory } from "@/validations/category";

interface CategoryFormProps {
  mode: "create" | "edit";
  categoryId?: number;
}

/** BFS thu thập bản thân + toàn bộ descendants để loại khỏi dropdown cha */
function collectDescendantIds(rootId: number, all: CategoryResponse[]): Set<number> {
  const result = new Set<number>([rootId]);
  const queue = [rootId];
  while (queue.length > 0) {
    const cur = queue.shift()!;
    for (const cat of all) {
      if (cat.parentId === cur && !result.has(cat.id)) {
        result.add(cat.id);
        queue.push(cat.id);
      }
    }
  }
  return result;
}

export default function CategoryForm({ mode, categoryId }: CategoryFormProps) {
  const router = useRouter();
  const isEdit = mode === "edit";
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [allCategories, setAllCategories] = useState<CategoryResponse[]>([]);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    parentId: "",
    imageUrl: "",
  });
  const [slugPreview, setSlugPreview] = useState("");

  // Upload state
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [uploadLoading, setUploadLoading] = useState(false);
  const [uploadError, setUploadError] = useState("");

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);

  /** Ids không được chọn làm cha */
  const invalidParentIds = useMemo<Set<number>>(() => {
    if (!isEdit || !categoryId) return new Set();
    return collectDescendantIds(categoryId, allCategories);
  }, [isEdit, categoryId, allCategories]);

  const pageTitle = useMemo(
    () =>
      isEdit
        ? categoryId ? `Cập nhật danh mục #${categoryId}` : "Cập nhật danh mục"
        : "Tạo danh mục mới",
    [isEdit, categoryId],
  );

  // ── Fetch data ────────────────────────────────────────────────────────────

  useEffect(() => {
    const fetchData = async () => {
      try {
        const all = await CategoryService.getAll();
        setAllCategories(all);

        if (isEdit) {
          if (!categoryId) { setErrors({ fetch: "Thiếu mã danh mục cần chỉnh sửa." }); return; }
          const detail = await CategoryService.getById(categoryId);
          setFormData({
            name: detail.name ?? "",
            description: detail.description ?? "",
            parentId: detail.parentId ? String(detail.parentId) : "",
            imageUrl: detail.imageUrl ?? "",
          });
          setSlugPreview(detail.slug ?? "");
          if (detail.imageUrl) setImagePreview(detail.imageUrl);
        }
      } catch (error: unknown) {
        const msg = error instanceof Error ? error.message : "Không thể tải dữ liệu danh mục.";
        setErrors({ fetch: msg });
      } finally {
        setPageLoading(false);
      }
    };
    fetchData();
  }, [categoryId, isEdit]);

  // ── Handlers ──────────────────────────────────────────────────────────────

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => { const n = { ...prev }; delete n[name]; return n; });
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate client-side
    const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"];
    if (!allowedTypes.includes(file.type)) {
      setUploadError("Chỉ chấp nhận định dạng JPG, PNG, WebP hoặc GIF.");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setUploadError("Ảnh không được vượt quá 5MB.");
      return;
    }

    setUploadError("");

    // Preview ngay lập tức (local blob)
    const localUrl = URL.createObjectURL(file);
    setImagePreview(localUrl);

    // Upload lên Cloudinary
    try {
      setUploadLoading(true);
      const secureUrl = await CategoryService.uploadImage(file);
      setFormData((prev) => ({ ...prev, imageUrl: secureUrl }));
      // Thay blob url bằng Cloudinary url
      setImagePreview(secureUrl);
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : "Upload ảnh thất bại.";
      setUploadError(msg);
      // Huỷ preview nếu upload lỗi
      setImagePreview(formData.imageUrl || null);
    } finally {
      setUploadLoading(false);
      // Reset input để có thể chọn lại cùng file
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleRemoveImage = () => {
    setImagePreview(null);
    setFormData((prev) => ({ ...prev, imageUrl: "" }));
    setUploadError("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const validation = validateCategory({ name: formData.name, description: formData.description });
    if (!validation.isValid) { setErrors(validation.errors); return; }

    if (uploadLoading) {
      setErrors({ submit: "Vui lòng chờ ảnh tải lên hoàn tất." });
      return;
    }

    setLoading(true);
    try {
      const payload = {
        name: formData.name.trim(),
        description: formData.description.trim(),
        imageUrl: formData.imageUrl || null,
        parentId: formData.parentId ? Number(formData.parentId) : null,
      };

      if (isEdit) {
        if (!categoryId) throw new Error("Thiếu mã danh mục để cập nhật.");
        await CategoryService.update(categoryId, payload);
      } else {
        await CategoryService.create(payload);
      }

      const msg = isEdit ? "Cập nhật danh mục thành công." : "Thêm danh mục thành công.";
      router.push(`/admin/categories?message=${encodeURIComponent(msg)}&variant=success`);
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : "Đã xảy ra lỗi hệ thống.";
      setErrors({ submit: msg });
    } finally {
      setLoading(false);
    }
  };

  // ── Parent select helpers ─────────────────────────────────────────────────

  const rootCategories = useMemo(
    () => allCategories.filter((c) => c.parentId === null).sort((a, b) => a.name.localeCompare(b.name, "vi")),
    [allCategories],
  );

  const childrenOf = useMemo(() => {
    const map: Record<number, CategoryResponse[]> = {};
    for (const cat of allCategories) {
      if (cat.parentId !== null) {
        if (!map[cat.parentId]) map[cat.parentId] = [];
        map[cat.parentId].push(cat);
      }
    }
    for (const k of Object.keys(map)) {
      map[Number(k)].sort((a, b) => a.name.localeCompare(b.name, "vi"));
    }
    return map;
  }, [allCategories]);

  const selectedParent = allCategories.find((c) => c.id === Number(formData.parentId));

  // ── Loading ───────────────────────────────────────────────────────────────

  if (pageLoading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[300px]">
        <div className="flex flex-col items-center gap-3 text-slate-400">
          <span className="material-symbols-outlined text-4xl animate-spin">autorenew</span>
          <span className="text-sm font-medium">Đang tải dữ liệu...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 min-h-screen">
      <form className="max-w-6xl mx-auto grid grid-cols-12 gap-8" onSubmit={handleSubmit}>

        {/* ── Header ── */}
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
              type="submit"
              disabled={loading || uploadLoading || !!errors.fetch}
              className="px-8 py-2.5 rounded-full bg-linear-to-br from-primary to-primary-container text-white font-bold text-sm shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-100 transition-all disabled:opacity-70 disabled:hover:scale-100"
            >
              {loading ? "Đang lưu..." : uploadLoading ? "Đang upload ảnh..." : isEdit ? "Lưu thay đổi" : "Lưu danh mục"}
            </button>
          </div>
        </div>

        {/* ── Error banners ── */}
        {errors.fetch && (
          <div className="col-span-12 p-4 bg-error/10 text-error rounded-xl text-sm font-medium flex items-center gap-2">
            <span className="material-symbols-outlined text-[18px]">error</span>
            {errors.fetch}
          </div>
        )}
        {errors.submit && (
          <div className="col-span-12 p-4 bg-error/10 text-error rounded-xl text-sm font-medium flex items-center gap-2">
            <span className="material-symbols-outlined text-[18px]">warning</span>
            {errors.submit}
          </div>
        )}

        {/* ── Main column ── */}
        <div className="col-span-12 lg:col-span-8 space-y-6">
          <section className="bg-surface-container-lowest p-8 rounded-xl space-y-6 shadow-sm">

            {/* Tên danh mục */}
            <div>
              <label className="block text-xs font-bold text-primary uppercase tracking-widest mb-2">
                Tên danh mục <span className="text-error">*</span>
              </label>
              <input
                name="name"
                type="text"
                maxLength={100}
                value={formData.name}
                onChange={handleChange}
                placeholder="Ví dụ: Cá Koi Nhật Bản"
                className={`w-full bg-surface-container-highest border-none rounded-lg px-4 py-3 text-on-surface focus:ring-2 focus:ring-primary/20 transition-all placeholder:text-slate-400 outline-none ${errors.name ? "ring-2 ring-error" : ""}`}
              />
              <div className="flex justify-between mt-1">
                {errors.name ? <p className="text-xs text-error font-medium">{errors.name}</p> : <span />}
                <span className="text-xs text-slate-400">{formData.name.length}/100</span>
              </div>
            </div>

            {/* Slug (chỉ khi edit) */}
            {isEdit && (
              <div>
                <label className="block text-xs font-bold text-primary uppercase tracking-widest mb-2">
                  Đường dẫn (Slug)
                </label>
                <div className="relative">
                  <input
                    type="text"
                    disabled
                    value={slugPreview}
                    className="w-full bg-slate-100 border-none rounded-lg px-4 py-3 text-slate-500 italic outline-none pr-10"
                  />
                  <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 text-[16px]" title="Slug tự động">
                    lock
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-1">
                  Slug được tạo tự động từ tên danh mục.
                </p>
              </div>
            )}

            {/* Mô tả */}
            <div>
              <label className="block text-xs font-bold text-primary uppercase tracking-widest mb-2">
                Mô tả ngắn
              </label>
              <textarea
                name="description"
                rows={4}
                maxLength={500}
                value={formData.description}
                onChange={handleChange}
                placeholder="Nhập mô tả của danh mục, sẽ hiển thị cho SEO..."
                className={`w-full bg-surface-container-highest border-none rounded-lg px-4 py-3 focus:ring-2 focus:ring-primary/20 outline-none resize-y ${errors.description ? "ring-2 ring-error" : ""}`}
              />
              <div className="flex justify-between mt-1">
                {errors.description ? <p className="text-xs text-error font-medium">{errors.description}</p> : <span />}
                <span className="text-xs text-slate-400">{formData.description.length}/500</span>
              </div>
            </div>
          </section>
        </div>

        {/* ── Side column ── */}
        <div className="col-span-12 lg:col-span-4 space-y-6">

          {/* ── Upload ảnh ── */}
          <section className="bg-surface-container-lowest p-6 rounded-xl shadow-sm space-y-4">
            <h3 className="text-xs font-bold text-primary uppercase tracking-widest flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[16px]">image</span>
              Hình ảnh đại diện
            </h3>

            {/* Hidden file input */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif"
              className="hidden"
              onChange={handleFileSelect}
            />

            {/* Preview / Dropzone */}
            {imagePreview ? (
              <div className="relative aspect-square w-full rounded-xl overflow-hidden border border-outline-variant/20 bg-surface-container-high group">
                <Image
                  src={imagePreview}
                  alt="Preview"
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 300px"
                />

                {/* Overlay khi upload đang chạy */}
                {uploadLoading && (
                  <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center gap-2">
                    <span className="material-symbols-outlined text-white text-4xl animate-spin">autorenew</span>
                    <span className="text-white text-xs font-medium">Đang tải lên Cloudinary...</span>
                  </div>
                )}

                {/* Actions overlay (hover) */}
                {!uploadLoading && (
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all flex items-center justify-center gap-3 opacity-0 group-hover:opacity-100">
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="p-2 rounded-full bg-white/90 text-slate-700 hover:bg-white transition-colors"
                      title="Đổi ảnh"
                    >
                      <span className="material-symbols-outlined text-[18px]">edit</span>
                    </button>
                    <button
                      type="button"
                      onClick={handleRemoveImage}
                      className="p-2 rounded-full bg-white/90 text-error hover:bg-white transition-colors"
                      title="Xóa ảnh"
                    >
                      <span className="material-symbols-outlined text-[18px]">delete</span>
                    </button>
                  </div>
                )}

                {/* Upload done badge */}
                {!uploadLoading && formData.imageUrl && (
                  <div className="absolute top-2 right-2 bg-green-500 text-white rounded-full px-2 py-0.5 text-[10px] font-bold flex items-center gap-1">
                    <span className="material-symbols-outlined text-[11px]">check_circle</span>
                    Cloudinary
                  </div>
                )}
              </div>
            ) : (
              /* Dropzone */
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="aspect-square w-full rounded-xl border-2 border-dashed border-outline-variant hover:border-primary bg-surface-container-high hover:bg-primary/5 transition-all flex flex-col items-center justify-center gap-3 group"
              >
                <span className="material-symbols-outlined text-4xl text-slate-300 group-hover:text-primary transition-colors">
                  add_photo_alternate
                </span>
                <div className="text-center">
                  <p className="text-xs font-bold text-slate-400 group-hover:text-primary transition-colors">
                    Click để chọn ảnh
                  </p>
                  <p className="text-[10px] text-slate-300 mt-0.5">
                    JPG, PNG, WebP — tối đa 5MB
                  </p>
                </div>
              </button>
            )}

            {/* Upload error */}
            {uploadError && (
              <div className="flex items-start gap-1.5 text-xs text-error bg-error/10 rounded-lg p-3">
                <span className="material-symbols-outlined text-[14px] mt-0.5 flex-shrink-0">error</span>
                {uploadError}
              </div>
            )}

            {/* URL hiện tại (nếu có) */}
            {formData.imageUrl && (
              <div className="bg-surface-container-high rounded-lg p-3 space-y-1">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">URL Cloudinary</p>
                <p className="text-[10px] text-slate-500 break-all font-mono leading-relaxed">
                  {formData.imageUrl}
                </p>
              </div>
            )}
          </section>

          {/* ── Phân cấp ── */}
          <section className="bg-surface-container-lowest p-6 rounded-xl shadow-sm space-y-4">
            <h3 className="text-xs font-bold text-primary uppercase tracking-widest flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[16px]">account_tree</span>
              Phân cấp danh mục
            </h3>

            <div>
              <label className="block text-xs font-medium text-on-surface-variant mb-1.5">
                Danh mục cha
              </label>
              <select
                name="parentId"
                value={formData.parentId}
                onChange={handleChange}
                className="w-full bg-surface-container-highest border-none rounded-lg px-4 py-3 focus:ring-2 focus:ring-primary/20 outline-none text-on-surface"
              >
                <option value="">— Không có (Danh mục gốc) —</option>
                {rootCategories.map((root) => {
                  const rootDisabled = invalidParentIds.has(root.id);
                  return (
                    <React.Fragment key={root.id}>
                      <option value={root.id} disabled={rootDisabled}
                        style={rootDisabled ? { color: "#94a3b8", fontStyle: "italic" } : {}}>
                        📁 {root.name}{rootDisabled ? " (không thể chọn)" : ""}
                      </option>
                      {(childrenOf[root.id] ?? []).map((child) => {
                        const childDisabled = invalidParentIds.has(child.id);
                        return (
                          <option key={child.id} value={child.id} disabled={childDisabled}
                            style={childDisabled ? { color: "#94a3b8", fontStyle: "italic" } : {}}>
                            {"    ↳ "}{child.name}{childDisabled ? " (không thể chọn)" : ""}
                          </option>
                        );
                      })}
                    </React.Fragment>
                  );
                })}
              </select>
            </div>

            {/* Preview phân cấp */}
            <div className="bg-surface-container-high rounded-lg p-4">
              <p className="text-xs font-bold text-on-surface-variant uppercase tracking-widest mb-3">
                Xem trước phân cấp
              </p>
              {formData.parentId ? (
                <div className="flex items-center gap-1.5 flex-wrap text-xs">
                  <span className="material-symbols-outlined text-[14px] text-slate-400">folder</span>
                  <span className="text-slate-500">{selectedParent?.name ?? "..."}</span>
                  <span className="material-symbols-outlined text-[13px] text-slate-300">chevron_right</span>
                  <span className="font-semibold text-primary">{formData.name || "(tên danh mục)"}</span>
                </div>
              ) : (
                <div className="flex items-center gap-1.5 text-xs">
                  <span className="material-symbols-outlined text-[14px] text-primary">folder_open</span>
                  <span className="font-semibold text-primary">{formData.name || "(tên danh mục)"}</span>
                  <span className="text-slate-400 italic">(gốc)</span>
                </div>
              )}
            </div>

            {isEdit && (
              <div className="text-xs text-slate-400 flex items-start gap-1.5 leading-relaxed bg-amber-50 border border-amber-100 rounded-lg p-3">
                <span className="material-symbols-outlined text-[14px] mt-0.5 text-amber-500 flex-shrink-0">info</span>
                <span>
                  Mục <span className="italic text-slate-500">(không thể chọn)</span> bị vô hiệu
                  hoá để tránh vòng lặp circular hierarchy.
                </span>
              </div>
            )}
          </section>

          {/* Thống kê */}
          <section className="bg-surface-container-lowest p-6 rounded-xl shadow-sm space-y-3">
            <h3 className="text-xs font-bold text-primary uppercase tracking-widest">Thống kê</h3>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-surface-container-high rounded-lg p-3 text-center">
                <p className="text-2xl font-extrabold text-primary">
                  {allCategories.filter((c) => c.parentId === null).length}
                </p>
                <p className="text-[10px] text-slate-500 uppercase tracking-widest mt-0.5">Danh mục gốc</p>
              </div>
              <div className="bg-surface-container-high rounded-lg p-3 text-center">
                <p className="text-2xl font-extrabold text-secondary">
                  {allCategories.filter((c) => c.parentId !== null).length}
                </p>
                <p className="text-[10px] text-slate-500 uppercase tracking-widest mt-0.5">Danh mục con</p>
              </div>
            </div>
          </section>
        </div>
      </form>
    </div>
  );
}
