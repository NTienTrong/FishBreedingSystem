"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { AttributeService } from "@/services/attribute.service";
import { AttributeResponse } from "@/types/attribute";
import DeleteConfirmModal from "@/components/common/DeleteConfirmModal";
import ToastMessage from "@/components/common/ToastMessage";

export const dynamic = "force-dynamic";

export default function AdminAttributesPage() {
  const router = useRouter();
  const pathname = usePathname();
  const [attributes, setAttributes] = useState<AttributeResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteTarget, setDeleteTarget] = useState<AttributeResponse | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
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

  const fetchAttributes = useCallback(async () => {
    try {
      const data = await AttributeService.getAll();
      setAttributes(data);
    } catch (error) {
      console.error(error);
      showToast("Không thể tải danh sách thuộc tính.", "error");
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    fetchAttributes();
  }, [fetchAttributes]);

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

  const sortedAttributes = useMemo(
    () => [...attributes].sort((a, b) => b.id - a.id),
    [attributes]
  );

  const PAGE_SIZE = 5;
  const totalPages = Math.max(1, Math.ceil(sortedAttributes.length / PAGE_SIZE));
  const pagedAttributes = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return sortedAttributes.slice(start, start + PAGE_SIZE);
  }, [currentPage, sortedAttributes]);

  useEffect(() => {
    setCurrentPage(1);
  }, [attributes.length]);

  useEffect(() => {
    setCurrentPage((prev) => Math.min(prev, totalPages));
  }, [totalPages]);

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) {
      return;
    }

    try {
      setIsDeleting(true);
      await AttributeService.delete(deleteTarget.id);
      await fetchAttributes();
      showToast("Xóa thuộc tính thành công.", "success");
      setDeleteTarget(null);
    } catch (error) {
      console.error(error);
      showToast("Lỗi khi xóa thuộc tính.", "error");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="p-8 space-y-8">
      <ToastMessage show={toast.show} message={toast.message} variant={toast.variant} />

      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-headline font-extrabold text-primary">Quản lý Thuộc tính</h2>
        </div>
        <Link
          href="/admin/attributes/add"
          className="bg-primary hover:bg-black text-white px-6 py-3 rounded-full text-sm font-bold flex items-center gap-2 transition-colors"
        >
          <span className="material-symbols-outlined text-sm">add</span> Thêm mới
        </Link>
      </div>

      <div className="bg-surface-container-lowest rounded-4xl overflow-hidden shadow-sm border border-outline-variant/10">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-surface-container-low text-[10px] font-bold text-slate-500 uppercase tracking-widest border-b border-outline-variant/20">
                <th className="px-8 py-5">ID</th>
                <th className="px-8 py-5">Tên thuộc tính</th>
                <th className="px-8 py-5">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/5">
              {loading ? (
                <tr>
                  <td colSpan={3} className="text-center py-10">Đang tải...</td>
                </tr>
              ) : attributes.length === 0 ? (
                <tr>
                  <td colSpan={3} className="text-center py-10">Chưa có thuộc tính nào.</td>
                </tr>
              ) : (
                pagedAttributes.map((attribute) => (
                  <tr key={attribute.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-8 py-4 font-mono text-xs font-bold text-slate-400">#{attribute.id}</td>
                    <td className="px-8 py-4 font-bold text-on-surface">{attribute.name}</td>
                    <td className="px-8 py-4">
                      <div className="flex items-center gap-3">
                        <Link
                          href={`/admin/attributes/${attribute.id}/edit`}
                          className="text-slate-400 hover:text-primary transition-colors"
                        >
                          <span className="material-symbols-outlined text-[18px]">edit</span>
                        </Link>
                        <button
                          onClick={() => setDeleteTarget(attribute)}
                          className="text-slate-400 hover:text-error transition-colors"
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

      {!loading && attributes.length > 0 && (
        <div className="flex items-center justify-between text-xs text-slate-500">
          <span>
            Hiển thị <strong className="text-on-surface">{pagedAttributes.length}</strong> /{" "}
            {attributes.length} thuộc tính
          </span>
          {attributes.length > PAGE_SIZE && (
            <div className="flex items-center gap-2">
              <button
                className="w-8 h-8 flex items-center justify-center rounded-lg border border-outline-variant/30 text-on-surface-variant disabled:opacity-40"
                onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                type="button"
              >
                <span className="material-symbols-outlined text-sm">chevron_left</span>
              </button>
              <span className="text-xs font-semibold">Trang {currentPage} / {totalPages}</span>
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

      <DeleteConfirmModal
        isOpen={Boolean(deleteTarget)}
        title="Xác nhận xóa thuộc tính"
        itemLabel={deleteTarget?.name}
        message="Bạn có chắc chắn muốn xóa thuộc tính này không? Hành động này không thể hoàn tác."
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
