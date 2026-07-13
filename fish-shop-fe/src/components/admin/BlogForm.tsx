"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { BlogService } from "@/services/blog.service";

interface BlogFormProps {
  mode: "create" | "edit";
  blogId?: number;
}

export default function BlogForm({ mode, blogId }: BlogFormProps) {
  const router = useRouter();
  const isEdit = mode === "edit";
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState<{
    title: string;
    slug: string;
    content: string;
    thumbnailUrl: string;
    status: "DRAFT" | "PUBLISHED" | "ARCHIVED";
  }>({
    title: "",
    slug: "",
    content: "",
    thumbnailUrl: "",
    status: "DRAFT",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);

  // Upload state
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [uploadLoading, setUploadLoading] = useState(false);
  const [uploadError, setUploadError] = useState("");

  const pageTitle = useMemo(() => {
    if (isEdit) {
      return blogId ? `Cập nhật bài viết #${blogId}` : "Cập nhật bài viết";
    }
    return "Viết bài mới";
  }, [blogId, isEdit]);

  useEffect(() => {
    const fetchData = async () => {
      if (!isEdit) {
        setPageLoading(false);
        return;
      }

      if (!blogId) {
        setErrors({ fetch: "Thiếu mã bài viết cần chỉnh sửa." });
        setPageLoading(false);
        return;
      }

      try {
        const detail = await BlogService.getById(blogId);
        setFormData({
          title: detail.title || "",
          slug: detail.slug || "",
          content: detail.content || "",
          thumbnailUrl: detail.thumbnailUrl || "",
          status: detail.status || "DRAFT",
        });
        if (detail.thumbnailUrl) {
          setImagePreview(detail.thumbnailUrl);
        }
      } catch (error: unknown) {
        const message = error instanceof Error ? error.message : "Không thể tải dữ liệu bài viết.";
        setErrors({ fetch: message });
      } finally {
        setPageLoading(false);
      }
    };

    fetchData();
  }, [blogId, isEdit]);

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

  const validate = () => {
    const nextErrors: Record<string, string> = {};

    if (!formData.title.trim()) {
      nextErrors.title = "Tiêu đề bài viết không được để trống.";
    }

    if (!formData.content.trim()) {
      nextErrors.content = "Nội dung bài viết không được để trống.";
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

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
    const localUrl = URL.createObjectURL(file);
    setImagePreview(localUrl);

    try {
      setUploadLoading(true);
      const secureUrl = await BlogService.uploadImage(file);
      setFormData((prev) => ({ ...prev, thumbnailUrl: secureUrl }));
      setImagePreview(secureUrl);
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : "Upload ảnh thất bại.";
      setUploadError(msg);
      setImagePreview(formData.thumbnailUrl || null);
    } finally {
      setUploadLoading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleRemoveImage = () => {
    setImagePreview(null);
    setFormData((prev) => ({ ...prev, thumbnailUrl: "" }));
    setUploadError("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) {
      return;
    }
    
    if (uploadLoading) {
      setErrors({ submit: "Vui lòng chờ ảnh tải lên hoàn tất." });
      return;
    }

    setLoading(true);
    try {
      const payload = {
        title: formData.title.trim(),
        slug: formData.slug.trim() || null,
        content: formData.content.trim(),
        thumbnailUrl: formData.thumbnailUrl.trim() || null,
        status: formData.status,
      };

      if (isEdit) {
        if (!blogId) {
          throw new Error("Thiếu mã bài viết để cập nhật.");
        }
        await BlogService.update(blogId, payload);
      } else {
        await BlogService.create(payload);
      }

      const message = isEdit ? "Cập nhật bài viết thành công." : "Thêm bài viết thành công.";
      router.push(`/admin/blog?message=${encodeURIComponent(message)}&variant=success`);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Không thể lưu bài viết.";
      setErrors({ submit: message });
    } finally {
      setLoading(false);
    }
  };

  if (pageLoading) {
    return <div className="p-8 text-slate-500">Đang tải dữ liệu bài viết...</div>;
  }

  return (
    <div className="p-8 min-h-[calc(100vh-72px)]">
      <form className="max-w-6xl mx-auto grid grid-cols-12 gap-8" onSubmit={handleSubmit}>
        {/* Header Actions */}
        <div className="col-span-12 flex justify-between items-end mb-4">
          <div>
            <h2 className="text-3xl font-headline font-extrabold text-primary tracking-tight">
              {pageTitle}
            </h2>
            <p className="text-on-surface-variant text-sm mt-1">
              Soạn thảo và quản lý nội dung xuất bản trên hệ thống.
            </p>
          </div>
          <div className="flex gap-3">
            <Link
              href="/admin/blog"
              className="px-6 py-2.5 rounded-full border border-outline-variant text-primary font-bold text-sm hover:bg-surface-container-low transition-colors"
            >
              Hủy
            </Link>
            <button
              className="px-8 py-2.5 rounded-full bg-linear-to-br from-primary to-primary-container text-white font-bold text-sm shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-100 transition-all disabled:opacity-70 disabled:hover:scale-100"
              type="submit"
              disabled={loading || uploadLoading || !!errors.fetch}
            >
              {loading ? "Đang lưu..." : isEdit ? "Lưu thay đổi" : "Lưu bài viết"}
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
          {/* General Info Card */}
          <section className="bg-surface-container-lowest p-8 rounded-xl space-y-6 shadow-sm">
            <div className="grid grid-cols-2 gap-6">
              <div className="col-span-2">
                <label className="block text-xs font-bold text-primary uppercase tracking-widest mb-2">Tiêu đề bài viết</label>
                <input
                  className={`w-full bg-surface-container-highest border-none rounded-lg px-4 py-3 text-[18px] font-bold text-on-surface focus:ring-2 focus:ring-primary/20 transition-all placeholder:text-slate-400 outline-none ${errors.title ? "ring-2 ring-error" : ""}`}
                  placeholder="Nhập tiêu đề ấn tượng..."
                  value={formData.title}
                  onChange={handleChange}
                  name="title"
                  type="text"
                />
                {errors.title && <p className="text-xs text-error font-medium mt-1">{errors.title}</p>}
              </div>
              
              <div className="col-span-2 relative">
                <label className="block text-xs font-bold text-primary uppercase tracking-widest mb-2">Đường dẫn (Slug)</label>
                <input
                  className="w-full bg-slate-100 border-none rounded-lg px-4 py-3 text-slate-500 italic outline-none"
                  placeholder="Để trống để hệ thống tự sinh"
                  value={formData.slug}
                  onChange={handleChange}
                  name="slug"
                  type="text"
                />
              </div>
            </div>
          </section>

          {/* Rich Text Editor Section */}
          <section className="bg-surface-container-lowest p-8 rounded-xl shadow-sm">
            <label className="block text-xs font-bold text-primary uppercase tracking-widest mb-4">Nội dung bài viết</label>
            <div className="border border-outline-variant/30 rounded-lg overflow-hidden flex flex-col min-h-100">
              <div className="bg-surface-container-low p-2 flex gap-1 border-b border-outline-variant/30 flex-wrap">
                <div className="flex bg-white rounded shadow-sm mr-2 border border-outline-variant/20 overflow-hidden">
                  <select className="border-none text-sm focus:ring-0 px-3 py-1">
                    <option>Normal text</option>
                    <option>Heading 1</option>
                    <option>Heading 2</option>
                    <option>Heading 3</option>
                  </select>
                </div>
                <button className="p-2 hover:bg-white rounded transition-colors text-on-surface-variant" type="button"><span className="material-symbols-outlined text-sm">format_bold</span></button>
                <button className="p-2 hover:bg-white rounded transition-colors text-on-surface-variant" type="button"><span className="material-symbols-outlined text-sm">format_italic</span></button>
                <button className="p-2 hover:bg-white rounded transition-colors text-on-surface-variant" type="button"><span className="material-symbols-outlined text-sm">format_underlined</span></button>
                <div className="w-px h-6 bg-outline-variant/30 mx-1"></div>
                <button className="p-2 hover:bg-white rounded transition-colors text-on-surface-variant" type="button"><span className="material-symbols-outlined text-sm">format_list_bulleted</span></button>
                <button className="p-2 hover:bg-white rounded transition-colors text-on-surface-variant" type="button"><span className="material-symbols-outlined text-sm">format_list_numbered</span></button>
                <div className="w-px h-6 bg-outline-variant/30 mx-1"></div>
                <button className="p-2 hover:bg-white rounded transition-colors text-on-surface-variant" type="button"><span className="material-symbols-outlined text-sm">link</span></button>
                <button className="p-2 hover:bg-white rounded transition-colors text-on-surface-variant" type="button"><span className="material-symbols-outlined text-sm">image</span></button>
                <button className="p-2 hover:bg-white rounded transition-colors text-on-surface-variant" type="button"><span className="material-symbols-outlined text-sm">code</span></button>
              </div>
              <textarea
                className={`w-full flex-1 border-none p-6 focus:ring-0 text-on-surface leading-loose resize-y outline-none ${errors.content ? "ring-2 ring-error" : ""}`}
                placeholder="Bắt đầu viết nội dung tại đây..."
                value={formData.content}
                onChange={handleChange}
                name="content"
              ></textarea>
            </div>
            {errors.content && <p className="text-xs text-error font-medium mt-2">{errors.content}</p>}
          </section>
        </div>

        {/* Side Column */}
        <div className="col-span-12 lg:col-span-4 space-y-6">
          {/* Status Section */}
          <section className="bg-surface-container-lowest p-6 rounded-xl shadow-sm space-y-3">
            <label className="block text-xs font-bold text-primary uppercase tracking-widest mb-4">Trạng thái xuất bản</label>
            <select
              name="status"
              value={formData.status}
              onChange={handleChange}
              className="w-full bg-surface-container-highest border-none rounded-lg px-4 py-3 text-on-surface focus:ring-2 focus:ring-primary/20 outline-none"
            >
              <option value="DRAFT">Bản nháp</option>
              <option value="PUBLISHED">Xuất bản</option>
              <option value="ARCHIVED">Lưu trữ</option>
            </select>
            <p className="text-xs text-slate-500 mt-2">
              Bài viết ở trạng thái <strong className="text-primary">Xuất bản</strong> sẽ hiển thị với người dùng trên website.
            </p>
          </section>

          {/* Thumbnail Section */}
          <section className="bg-surface-container-lowest p-6 rounded-xl shadow-sm space-y-4">
            <h3 className="text-xs font-bold text-primary uppercase tracking-widest flex items-center gap-1.5 mb-4">
              <span className="material-symbols-outlined text-[16px]">image</span>
              Ảnh bìa (Thumbnail)
            </h3>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif"
              className="hidden"
              onChange={handleFileSelect}
            />

            {imagePreview ? (
              <div className="relative aspect-video w-full rounded-xl overflow-hidden border border-outline-variant/20 bg-surface-container-high group">
                <img
                  src={imagePreview}
                  alt="Preview"
                  className="absolute inset-0 w-full h-full object-cover"
                />

                {uploadLoading && (
                  <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center gap-2">
                    <span className="material-symbols-outlined text-white text-4xl animate-spin">autorenew</span>
                    <span className="text-white text-xs font-medium">Đang tải lên Cloudinary...</span>
                  </div>
                )}

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
              </div>
            ) : (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="aspect-video w-full rounded-xl border-2 border-dashed border-outline-variant hover:border-primary bg-surface-container-high hover:bg-primary/5 transition-all flex flex-col items-center justify-center gap-3 group"
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

            {uploadError && (
              <div className="flex items-start gap-1.5 text-xs text-error bg-error/10 rounded-lg p-3">
                <span className="material-symbols-outlined text-[14px] mt-0.5 flex-shrink-0">error</span>
                {uploadError}
              </div>
            )}
          </section>

          {/* SEO Preview Section */}
          <section className="bg-surface-container-low/50 p-6 rounded-xl border border-dashed border-outline-variant/50 relative overflow-hidden">
            <h4 className="flex items-center gap-1 text-[10px] font-bold text-secondary uppercase mb-3">
              <span className="material-symbols-outlined text-[14px]">search</span>
              Bản xem trước SEO
            </h4>
            <div className="bg-white p-3 rounded shadow-sm border border-slate-100">
              <p className="text-[#1a0dab] text-sm font-medium truncate">DeepStream Pro - {formData.title || "Tiêu đề bài viết..."}</p>
              <p className="text-[11px] text-[#006621] truncate">https://deepstream.com/blog/{formData.slug || "duong-dan"}</p>
              <p className="text-xs text-slate-600 line-clamp-2 mt-1">
                {formData.content || "Mô tả ngắn hiển thị trên công cụ tìm kiếm phụ thuộc vào đoạn đầu của nội dung bài viết."}
              </p>
            </div>
          </section>
        </div>
      </form>
    </div>
  );
}
