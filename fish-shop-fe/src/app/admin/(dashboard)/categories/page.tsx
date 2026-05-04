"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { CategoryService } from "@/services/category.service";
import { CategoryResponse } from "@/types/category";
import DeleteConfirmModal from "@/components/common/DeleteConfirmModal";
import ToastMessage from "@/components/common/ToastMessage";
import Image from "next/image";

export const dynamic = "force-dynamic";

export default function CategoryListPage() {
  const router = useRouter();
  const pathname = usePathname();

  const [categories, setCategories] = useState<CategoryResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteTarget, setDeleteTarget] = useState<CategoryResponse | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  /** Set chứa id các danh mục gốc đang được mở (expanded) */
  const [expanded, setExpanded] = useState<Set<number>>(new Set());

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
      // Mặc định mở tất cả danh mục gốc có con
      const rootIds = new Set(
        data
          .filter((c) => c.parentId === null)
          .filter((root) => data.some((c) => c.parentId === root.id))
          .map((r) => r.id),
      );
      setExpanded(rootIds);
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

  const toggleExpand = (id: number) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  // ── Tính toán dữ liệu cây ────────────────────────────────────────────────

  const rootCategories = useMemo(
    () =>
      categories
        .filter((c) => c.parentId === null)
        .sort((a, b) => b.id - a.id),
    [categories],
  );

  const childrenOf = useMemo(() => {
    const map: Record<number, CategoryResponse[]> = {};
    for (const cat of categories) {
      if (cat.parentId !== null) {
        if (!map[cat.parentId]) map[cat.parentId] = [];
        map[cat.parentId].push(cat);
      }
    }
    // sort children newest first
    for (const key of Object.keys(map)) {
      map[Number(key)].sort((a, b) => b.id - a.id);
    }
    return map;
  }, [categories]);

  /** Flatten cây thành mảng rows theo thứ tự: cha → con (khi cha đang open) */
  const rows = useMemo(() => {
    if (search.trim()) {
      // Khi search: hiện phẳng, lọc theo query
      const q = search.toLowerCase();
      return categories
        .filter(
          (c) =>
            c.name.toLowerCase().includes(q) ||
            c.slug.toLowerCase().includes(q) ||
            (c.parentName ?? "").toLowerCase().includes(q),
        )
        .sort((a, b) => {
          if (a.parentId === null && b.parentId !== null) return -1;
          if (a.parentId !== null && b.parentId === null) return 1;
          return b.id - a.id;
        })
        .map((c) => ({ cat: c, depth: 0 })); // depth=0 vì đang tìm kiếm
    }

    // Khi không search: dạng cây collapsible
    const result: { cat: CategoryResponse; depth: number }[] = [];
    for (const root of rootCategories) {
      result.push({ cat: root, depth: 0 });
      if (expanded.has(root.id)) {
        for (const child of childrenOf[root.id] ?? []) {
          result.push({ cat: child, depth: 1 });
        }
      }
    }
    return result;
  }, [search, categories, rootCategories, childrenOf, expanded]);

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

  const rootCount = categories.filter((c) => c.parentId === null).length;
  const childCount = categories.filter((c) => c.parentId !== null).length;

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
            icon: "folder_open",
            color: "text-secondary",
            bg: "bg-secondary/10",
            value: rootCount,
            label: "Danh mục gốc",
          },
          {
            icon: "subdirectory_arrow_right",
            color: "text-violet-500",
            bg: "bg-violet-500/10",
            value: childCount,
            label: "Danh mục con",
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
            placeholder="Tìm theo tên, slug, danh mục cha..."
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

        {/* Expand/Collapse all (chỉ hiện khi không search) */}
        {!search && rootCategories.some((r) => childrenOf[r.id]?.length) && (
          <div className="flex gap-2">
            <button
              onClick={() =>
                setExpanded(
                  new Set(
                    rootCategories
                      .filter((r) => childrenOf[r.id]?.length)
                      .map((r) => r.id),
                  ),
                )
              }
              className="text-xs text-slate-500 hover:text-primary flex items-center gap-1 px-3 py-1.5 rounded-full border border-outline-variant/20 hover:border-primary/30 transition-colors"
            >
              <span className="material-symbols-outlined text-[14px]">unfold_more</span>
              Mở tất cả
            </button>
            <button
              onClick={() => setExpanded(new Set())}
              className="text-xs text-slate-500 hover:text-primary flex items-center gap-1 px-3 py-1.5 rounded-full border border-outline-variant/20 hover:border-primary/30 transition-colors"
            >
              <span className="material-symbols-outlined text-[14px]">unfold_less</span>
              Đóng tất cả
            </button>
          </div>
        )}
      </div>

      {/* ── Table ── */}
      <div className="bg-surface-container-lowest rounded-4xl overflow-hidden shadow-sm border border-outline-variant/10">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-surface-container-low text-[10px] font-bold text-slate-500 uppercase tracking-widest border-b border-outline-variant/20">
                <th className="px-8 py-5">ID</th>
                <th className="px-8 py-5">Tên danh mục</th>
                <th className="px-8 py-5">Hình ảnh</th>
                <th className="px-8 py-5">Slug</th>
                <th className="px-8 py-5">Danh mục cha</th>
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
                pagedRows.map(({ cat, depth }) => {
                  const hasChildren = !!(childrenOf[cat.id]?.length);
                  const isOpen = expanded.has(cat.id);
                  const isRoot = cat.parentId === null;
                  const isSearching = !!search.trim();

                  return (
                    <tr
                      key={cat.id}
                      className={`transition-colors group ${depth === 1
                        ? "bg-slate-50/60 hover:bg-slate-50"
                        : "hover:bg-slate-50"
                        }`}
                    >
                      {/* ID */}
                      <td className="px-8 py-4 font-mono text-xs font-bold text-slate-400">
                        #{cat.id}
                      </td>

                      {/* Tên — indent + toggle */}
                      <td className="px-8 py-4">
                        <div
                          className="flex items-center gap-1"
                          style={{ paddingLeft: depth === 1 ? "1.5rem" : 0 }}
                        >
                          {/* Nút mở/đóng (chỉ cho root có con, không search) */}
                          {isRoot && hasChildren && !isSearching ? (
                            <button
                              onClick={() => toggleExpand(cat.id)}
                              className="p-0.5 rounded hover:bg-primary/10 text-slate-400 hover:text-primary transition-colors flex-shrink-0"
                              title={isOpen ? "Thu gọn" : "Mở rộng"}
                            >
                              <span
                                className="material-symbols-outlined text-[18px] transition-transform duration-200"
                                style={{ transform: isOpen ? "rotate(90deg)" : "rotate(0deg)" }}
                              >
                                chevron_right
                              </span>
                            </button>
                          ) : (
                            /* Spacer để căn chỉnh */
                            <span className="w-6 flex-shrink-0 flex items-center justify-center">
                              {depth === 1 && (
                                <span className="material-symbols-outlined text-[13px] text-slate-300">
                                  subdirectory_arrow_right
                                </span>
                              )}
                              {isRoot && !hasChildren && !isSearching && (
                                <span className="material-symbols-outlined text-[14px] text-primary/50">
                                  folder
                                </span>
                              )}
                            </span>
                          )}

                          {/* Icon folder */}
                          {isRoot && hasChildren && (
                            <span
                              className={`material-symbols-outlined text-[15px] transition-colors ${isOpen ? "text-primary" : "text-primary/60"
                                }`}
                            >
                              {isOpen ? "folder_open" : "folder"}
                            </span>
                          )}

                          <span
                            className={`font-bold ${depth === 1
                              ? "text-slate-600 text-sm"
                              : "text-on-surface"
                              }`}
                          >
                            {cat.name}
                          </span>

                          {hasChildren && !isSearching && (
                            <span className="ml-1 text-[10px] font-bold text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded-full">
                              {childrenOf[cat.id].length}
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Image */}
                      <td className="px-8 py-4">
                        {cat.imageUrl ? (
                          <div className="flex items-center gap-2">
                            <div className="relative w-10 h-10 rounded-lg overflow-hidden bg-gray-100">
                              <Image
                                src={cat.imageUrl}
                                alt={cat.name}
                                fill
                                className="object-cover"
                              />
                            </div>
                          </div>
                        ) : (
                          <span className="text-xs text-slate-400">Không có ảnh</span>
                        )}
                      </td>

                      {/* Slug */}
                      <td className="px-8 py-4">
                        <span className="px-3 py-1 bg-secondary/10 text-secondary rounded-full text-[10px] font-mono font-medium">
                          {cat.slug}
                        </span>
                      </td>

                      {/* Danh mục cha */}
                      <td className="px-8 py-4 text-sm text-slate-500">
                        {cat.parentName ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-slate-100 rounded-full text-xs font-medium text-slate-600">
                            <span className="material-symbols-outlined text-[11px]">folder</span>
                            {cat.parentName}
                          </span>
                        ) : (
                          <span className="text-xs text-slate-300 italic">Danh mục gốc</span>
                        )}
                      </td>

                      {/* Thao tác */}
                      <td className="px-8 py-4">
                        <div className="flex items-center justify-center gap-3">
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
        message="Bạn có chắc chắn muốn xóa danh mục này không? Các danh mục con và sản phẩm thuộc danh mục này có thể bị ảnh hưởng."
        onConfirm={handleDeleteConfirm}
        onClose={closeDeleteModal}
        isDeleting={isDeleting}
      />
    </div>
  );
}
