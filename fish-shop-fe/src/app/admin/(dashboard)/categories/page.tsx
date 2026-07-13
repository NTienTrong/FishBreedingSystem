"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { CategoryService } from "@/services/category.service";
import { CategoryResponse } from "@/types/category";
import DeleteConfirmModal from "@/components/common/DeleteConfirmModal";
import ToastMessage from "@/components/common/ToastMessage";
import DetailModal from "@/components/common/DetailModal";
import Image from "next/image";

export const dynamic = "force-dynamic";

export default function CategoryListPage() {
  const router = useRouter();
  const pathname = usePathname();

  const [categories, setCategories] = useState<CategoryResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteTarget, setDeleteTarget] = useState<CategoryResponse | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [detailTarget, setDetailTarget] = useState<CategoryResponse | null>(null);
  const [isDetailLoading, setIsDetailLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const [toast, setToast] = useState<{
    show: boolean;
    message: string;
    variant: "success" | "error";
  }>({ show: false, message: "", variant: "success" });

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const message = params.get("message");
    if (!message) return;
    const variant = params.get("variant") === "error" ? "error" : "success";
    setToast({ show: true, message, variant });
    setTimeout(() => setToast((prev) => ({ ...prev, show: false })), 2500);
    router.replace(pathname);
  }, [pathname, router]);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const data = await CategoryService.getAll();
      setCategories(data);
    } catch (error) {
      console.error(error);
      showToast("Không thể tải danh sách danh mục.", "error");
    } finally {
      setLoading(false);
    }
  };

  const showToast = (message: string, variant: "success" | "error") => {
    setToast({ show: true, message, variant });
    setTimeout(() => setToast((prev) => ({ ...prev, show: false })), 2500);
  };

  const openDeleteModal = (cat: CategoryResponse) => setDeleteTarget(cat);
  const closeDeleteModal = () => {
    if (!isDeleting) setDeleteTarget(null);
  };

  const openDetailModal = async (id: number) => {
    try {
      setIsDetailLoading(true);
      const data = await CategoryService.getById(id);
      setDetailTarget(data);
    } catch (error) {
      console.error(error);
      showToast("Không thể tải thông tin danh mục.", "error");
    } finally {
      setIsDetailLoading(false);
    }
  };

  const closeDetailModal = () => {
    if (!isDetailLoading) setDetailTarget(null);
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    try {
      setIsDeleting(true);
      await CategoryService.delete(deleteTarget.id);
      await fetchCategories();
      showToast("Xóa danh mục thành công.", "success");
      setDeleteTarget(null);
    } catch (error) {
      console.error(error);
      showToast("Lỗi khi xóa danh mục.", "error");
    } finally {
      setIsDeleting(false);
    }
  };

  const rows = useMemo(() => {
    const q = search.trim().toLowerCase();
    const filtered = q
      ? categories.filter(
        (c) =>
          c.name.toLowerCase().includes(q) ||
          c.slug.toLowerCase().includes(q),
      )
      : categories;

    return filtered.sort((a, b) => b.id - a.id).map((c) => ({ cat: c }));
  }, [search, categories]);

  const PAGE_SIZE = 5;
  const totalPages = Math.max(1, Math.ceil(rows.length / PAGE_SIZE));
  const pagedRows = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return rows.slice(start, start + PAGE_SIZE);
  }, [currentPage, rows]);

  useEffect(() => {
    setCurrentPage(1);
  }, [search, categories.length]);

  useEffect(() => {
    setCurrentPage((prev) => Math.min(prev, totalPages));
  }, [totalPages]);

  const activeCount = categories.filter((c) => c.isActive).length;
  const inactiveCount = categories.length - activeCount;

  return (
    <div className="p-8 space-y-8">
      <ToastMessage show={toast.show} message={toast.message} variant={toast.variant} />

      {/* ── Header ── */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-headline font-extrabold text-primary">
            Quản lý Danh mục
          </h2>
        </div>
        <Link
          href="/admin/categories/add"
          className="bg-primary hover:bg-black text-white px-6 py-3 rounded-full text-sm font-bold flex items-center gap-2 transition-colors"
        >
          <span className="material-symbols-outlined text-sm">add</span>
          Thêm mới
        </Link>
      </div>

      {/* ── Stats ── */}
      <div className="grid grid-cols-3 gap-4">
        {[
          {
            icon: "category",
            color: "text-primary",
            bg: "bg-primary/10",
            value: categories.length,
            label: "Tổng danh mục",
          },
          {
            icon: "check_circle",
            color: "text-secondary",
            bg: "bg-secondary/10",
            value: activeCount,
            label: "Đang hiển thị",
          },
          {
            icon: "visibility_off",
            color: "text-slate-500",
            bg: "bg-slate-200",
            value: inactiveCount,
            label: "Đã ẩn",
          },
        ].map((s) => (
          <div
            key={s.label}
            className="bg-surface-container-lowest rounded-2xl p-5 shadow-sm border border-outline-variant/10 flex items-center gap-4"
          >
            <div className={`w-10 h-10 rounded-full ${s.bg} flex items-center justify-center`}>
              <span className={`material-symbols-outlined text-[20px] ${s.color}`}>{s.icon}</span>
            </div>
            <div>
              <p className="text-2xl font-extrabold text-on-surface">{s.value}</p>
              <p className="text-xs text-slate-500 uppercase tracking-widest">{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* ── Toolbar ── */}
      <div className="flex items-center justify-between gap-4">
        {/* Search */}
        <div className="relative max-w-sm w-full">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-[18px]">
            search
          </span>
          <input
            type="text"
            placeholder="Tìm theo tên hoặc slug..."
            className="w-full bg-surface-container-lowest border border-outline-variant/20 rounded-full px-10 py-2.5 text-sm text-on-surface outline-none focus:ring-2 focus:ring-primary/20 transition-all"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          {search && (
            <button
              onClick={() => setSearch("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              <span className="material-symbols-outlined text-[16px]">close</span>
            </button>
          )}
        </div>

      </div>

      {/* ── Table ── */}
      <div className="bg-surface-container-lowest rounded-4xl overflow-hidden shadow-sm border border-outline-variant/10">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-surface-container-low text-[10px] font-bold text-slate-500 uppercase tracking-widest border-b border-outline-variant/20">
                <th className="px-8 py-5">Hình ảnh</th>
                <th className="px-8 py-5">Tên danh mục</th>
                <th className="px-8 py-5">Slug</th>
                <th className="px-8 py-5">Trạng thái</th>
                <th className="px-8 py-5 text-center">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/5">
              {loading ? (
                <tr>
                  <td colSpan={5} className="text-center py-16">
                    <div className="flex flex-col items-center gap-3 text-slate-400">
                      <span className="material-symbols-outlined text-4xl animate-spin">
                        autorenew
                      </span>
                      <span className="text-sm">Đang tải...</span>
                    </div>
                  </td>
                </tr>
              ) : rows.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-16">
                    <div className="flex flex-col items-center gap-3 text-slate-400">
                      <span className="material-symbols-outlined text-4xl">search_off</span>
                      <span className="text-sm">
                        {search ? "Không tìm thấy danh mục phù hợp." : "Chưa có danh mục nào."}
                      </span>
                    </div>
                  </td>
                </tr>
              ) : (
                pagedRows.map(({ cat }) => {
                  return (
                    <tr
                      key={cat.id}
                      className="transition-colors group hover:bg-slate-50"
                    >
                      {/* Image */}
                      <td className="px-8 py-4">
                        {cat.imageUrl ? (
                          <div className="flex items-center gap-2">
                            <div className="relative w-10 h-10 rounded-lg overflow-hidden bg-gray-100">
                              <img
                                src={cat.imageUrl}
                                alt={cat.name}
                                className="h-12 w-12 rounded-xl object-cover border border-slate-200"
                              />
                            </div>
                          </div>
                        ) : (
                          <span className="text-xs text-slate-400">Không có ảnh</span>
                        )}
                        {/* </td>
                        <td className="px-8 py-4">
                        {cat.imageUrl ? (
                          <img
                            src={cat.imageUrl}
                            alt={cat.name}
                            className="h-12 w-12 rounded-xl object-cover border border-slate-200"
                          />
                        ) : (
                          <div className="h-12 w-12 rounded-xl bg-slate-100 flex items-center justify-center text-slate-400">
                            <span className="material-symbols-outlined text-[18px]">image</span>
                          </div>
                        )} */}
                      </td>
                      {/* Tên */}
                      <td className="px-8 py-4">
                        <span className="font-bold text-on-surface">{cat.name}</span>
                      </td>

                      {/* Slug */}
                      <td className="px-8 py-4">
                        <span className="px-3 py-1 bg-secondary/10 text-secondary rounded-full text-[10px] font-mono font-medium">
                          {cat.slug}
                        </span>
                      </td>

                      {/* Trạng thái */}
                      <td className="px-8 py-4 text-sm text-slate-500">
                        {cat.isActive ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-600">
                            <span className="material-symbols-outlined text-[12px]">check_circle</span>
                            Hoạt động
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-500">
                            <span className="material-symbols-outlined text-[12px]">visibility_off</span>
                            Đã ẩn
                          </span>
                        )}
                      </td>

                      {/* Thao tác */}
                      <td className="px-8 py-4">
                        <div className="flex items-center justify-center gap-3">
                          <button
                            onClick={() => openDetailModal(cat.id)}
                            className="text-slate-400 hover:text-primary transition-colors p-1 rounded-lg hover:bg-primary/10"
                            title="Xem chi tiết"
                          >
                            <span className="material-symbols-outlined text-[18px]">visibility</span>
                          </button>
                          <Link
                            href={`/admin/categories/${cat.id}/edit`}
                            className="text-slate-400 hover:text-primary transition-colors p-1 rounded-lg hover:bg-primary/10"
                            title="Chỉnh sửa"
                          >
                            <span className="material-symbols-outlined text-[18px]">edit</span>
                          </Link>
                          <button
                            onClick={() => openDeleteModal(cat)}
                            className="text-slate-400 hover:text-error transition-colors p-1 rounded-lg hover:bg-error/10"
                            title="Xóa"
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

        {/* Footer */}
        {!loading && rows.length > 0 && (
          <div className="px-8 py-3 border-t border-outline-variant/10 text-xs text-slate-400 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span>
                Hiển thị <strong className="text-on-surface">{pagedRows.length}</strong> /{" "}
                {rows.length} danh mục
              </span>
              {search && (
                <span className="text-primary italic">
                  (đang lọc: &quot;{search}&quot;)
                </span>
              )}
            </div>
            {rows.length > PAGE_SIZE && (
              <div className="flex items-center gap-2">
                <button
                  className="w-8 h-8 flex items-center justify-center rounded-lg border border-outline-variant/30 text-on-surface-variant disabled:opacity-40"
                  onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                  type="button"
                >
                  <span className="material-symbols-outlined text-sm">chevron_left</span>
                </button>
                <span className="text-xs font-semibold text-slate-500">
                  Trang {currentPage} / {totalPages}
                </span>
                <button
                  className="w-8 h-8 flex items-center justify-center rounded-lg border border-outline-variant/30 text-on-surface-variant disabled:opacity-40"
                  onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                  type="button"
                >
                  <span className="material-symbols-outlined text-sm">chevron_right</span>
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      <DeleteConfirmModal
        isOpen={Boolean(deleteTarget)}
        title="Xác nhận xóa danh mục"
        itemLabel={deleteTarget?.name}
        message="Bạn có chắc chắn muốn xóa danh mục này không? Thao tác này không thể hoàn tác."
        onConfirm={handleDeleteConfirm}
        onClose={closeDeleteModal}
        isDeleting={isDeleting}
      />

      <DetailModal
        isOpen={Boolean(detailTarget)}
        title={detailTarget ? detailTarget.name : "Đang tải..."}
        subtitle={detailTarget ? `#${detailTarget.id}` : undefined}
        onClose={closeDetailModal}
      >
        {detailTarget ? (
          <div className="grid grid-cols-2 gap-6">
            <div>
              {detailTarget.imageUrl ? (
                <div className="w-full h-48 rounded-lg overflow-hidden bg-gray-100 mb-4 relative">
                  <Image src={detailTarget.imageUrl} alt={detailTarget.name} fill className="object-cover" />
                </div>
              ) : (
                <div className="w-full h-48 rounded-lg bg-slate-100 mb-4 flex items-center justify-center text-slate-400">Chưa có ảnh</div>
              )}

              <p className="text-sm text-slate-500">Slug</p>
              <div className="inline-block mt-1 mb-3 px-3 py-1 bg-secondary/10 text-secondary rounded-full text-[12px] font-mono">{detailTarget.slug}</div>

              <p className="text-sm text-slate-500">Trạng thái</p>
              <div className="mt-2">
                {detailTarget.isActive ? (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-600">
                    <span className="material-symbols-outlined text-[12px]">check_circle</span>
                    Hoạt động
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-500">
                    <span className="material-symbols-outlined text-[12px]">visibility_off</span>
                    Đã ẩn
                  </span>
                )}
              </div>
            </div>

            <div>
              <p className="text-sm text-slate-500">Mô tả</p>
              <div className="mt-2 text-sm text-slate-700 whitespace-pre-wrap">{detailTarget.description || "Không có mô tả."}</div>

              <p className="text-sm text-slate-500 mt-4">Thứ tự sắp xếp</p>
              <div className="mt-2 text-sm text-slate-700">{detailTarget.sortOrder ?? "Không thiết lập"}</div>
            </div>
          </div>
        ) : (
          <div className="text-center py-8 text-slate-500">Đang tải...</div>
        )}
      </DetailModal>
    </div>
  );
}
