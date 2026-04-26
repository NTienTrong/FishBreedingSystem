"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import DeleteConfirmModal from "@/components/common/DeleteConfirmModal";
import ToastMessage from "@/components/common/ToastMessage";
import { BlogService } from "@/services/blog.service";
import { BlogPostResponse } from "@/types/blog";

const dateFormatter = new Intl.DateTimeFormat("vi-VN", {
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
});

export default function AdminBlogPage() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [blogPosts, setBlogPosts] = useState<BlogPostResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [deleteTarget, setDeleteTarget] = useState<BlogPostResponse | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
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

  const fetchBlogPosts = useCallback(async () => {
    try {
      const data = await BlogService.getAll();
      setBlogPosts(data);
    } catch (error) {
      console.error(error);
      showToast("Không thể tải danh sách bài viết.", "error");
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    fetchBlogPosts();
  }, [fetchBlogPosts]);

  useEffect(() => {
    const message = searchParams.get("message");
    if (!message) {
      return;
    }

    const variant = searchParams.get("variant") === "error" ? "error" : "success";
    showToast(message, variant);
    router.replace(pathname);
  }, [pathname, router, searchParams, showToast]);

  const filteredPosts = useMemo(() => {
    const keyword = search.trim().toLowerCase();
    if (!keyword) {
      return blogPosts;
    }

    return blogPosts.filter((item) => {
      return (
        item.title.toLowerCase().includes(keyword) ||
        item.slug.toLowerCase().includes(keyword) ||
        (item.authorFullName ?? "").toLowerCase().includes(keyword)
      );
    });
  }, [blogPosts, search]);

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) {
      return;
    }

    try {
      setIsDeleting(true);
      await BlogService.delete(deleteTarget.id);
      await fetchBlogPosts();
      showToast("Xóa bài viết thành công.", "success");
      setDeleteTarget(null);
    } catch (error) {
      console.error(error);
      showToast("Xóa bài viết thất bại.", "error");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="p-8 space-y-8">
      <ToastMessage show={toast.show} message={toast.message} variant={toast.variant} />

      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-headline font-extrabold text-primary">Quản lý Bài viết</h2>
        </div>
        <Link
          href="/admin/blog/add"
          className="bg-primary hover:bg-black text-white px-6 py-3 rounded-full text-sm font-bold flex items-center gap-2 transition-colors"
        >
          <span className="material-symbols-outlined text-sm">add</span> Thêm mới
        </Link>
      </div>

      <div className="bg-surface-container-low rounded-3xl p-4 flex flex-wrap items-center gap-4">
        <div className="min-w-64 flex-1">
          <input
            className="w-full bg-white border border-outline-variant/15 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/15"
            placeholder="Tìm theo tiêu đề, slug hoặc tác giả..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
        </div>
        <p className="text-sm text-slate-500">{filteredPosts.length} bài viết</p>
      </div>

      <div className="bg-surface-container-lowest rounded-4xl overflow-hidden shadow-sm border border-outline-variant/10">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-surface-container-low text-[10px] font-bold text-slate-500 uppercase tracking-widest border-b border-outline-variant/20">
                <th className="px-8 py-5">Bài viết</th>
                <th className="px-8 py-5">Tác giả</th>
                <th className="px-8 py-5">Ngày đăng</th>
                <th className="px-8 py-5">Trạng thái</th>
                <th className="px-8 py-5">Slug</th>
                <th className="px-8 py-5">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/5">
              {loading ? (
                <tr>
                  <td colSpan={6} className="text-center py-10">Đang tải...</td>
                </tr>
              ) : filteredPosts.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-10">Chưa có bài viết nào.</td>
                </tr>
              ) : (
                filteredPosts.map((post) => (
                  <tr key={post.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-8 py-4">
                      <div className="flex items-center gap-3">
                        {post.thumbnailUrl ? (
                          <img
                            src={post.thumbnailUrl}
                            alt={post.title}
                            className="h-12 w-12 rounded-xl object-cover border border-slate-200"
                          />
                        ) : (
                          <div className="h-12 w-12 rounded-xl bg-slate-100 flex items-center justify-center text-slate-400">
                            <span className="material-symbols-outlined text-[18px]">article</span>
                          </div>
                        )}
                        <div>
                          <p className="font-semibold text-on-surface line-clamp-1">{post.title}</p>
                          <p className="text-xs text-slate-400">#{post.id}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-4 text-sm text-slate-500">{post.authorFullName || "Hệ thống"}</td>
                    <td className="px-8 py-4 text-sm text-slate-600">
                      {post.publishedAt 
                        ? dateFormatter.format(new Date(post.publishedAt)) 
                        : (post.createdAt ? dateFormatter.format(new Date(post.createdAt)) : "-")}
                    </td>
                    <td className="px-8 py-4 text-xs">
                      {post.status === "PUBLISHED" ? (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-green-50 text-green-600 font-medium">
                          <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
                          Xuất bản
                        </span>
                      ) : post.status === "ARCHIVED" ? (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-orange-50 text-orange-600 font-medium">
                          <span className="w-1.5 h-1.5 rounded-full bg-orange-500"></span>
                          Lưu trữ
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 text-slate-600 font-medium">
                          <span className="w-1.5 h-1.5 rounded-full bg-slate-400"></span>
                          Bản nháp
                        </span>
                      )}
                    </td>
                    <td className="px-8 py-4 text-xs font-mono text-slate-500">/{post.slug}</td>
                    <td className="px-8 py-4">
                      <div className="flex items-center gap-3">
                        <Link href={`/admin/blog/${post.id}/edit`} className="text-slate-400 hover:text-primary transition-colors">
                          <span className="material-symbols-outlined text-[18px]">edit</span>
                        </Link>
                        <button
                          onClick={() => setDeleteTarget(post)}
                          className="text-slate-400 hover:text-error transition-colors"
                          type="button"
                        >
                          <span className="material-symbols-outlined text-[18px]">delete</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <DeleteConfirmModal
        isOpen={Boolean(deleteTarget)}
        title="Xác nhận xóa bài viết"
        itemLabel={deleteTarget?.title}
        message="Bạn có chắc chắn muốn xóa bài viết này không? Hành động này không thể hoàn tác."
        onConfirm={handleDeleteConfirm}
        onClose={() => {
          if (!isDeleting) {
            setDeleteTarget(null);
          }
        }}
        isDeleting={isDeleting}
      />
    </div>
  );
}
