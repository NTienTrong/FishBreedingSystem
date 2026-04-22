"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { CategoryService } from "@/services/category.service";
import { CategoryResponse } from "@/types/category";
import DeleteConfirmModal from "@/components/common/DeleteConfirmModal";
import ToastMessage from "@/components/common/ToastMessage";

export default function CategoryListPage() {
  const [categories, setCategories] = useState<CategoryResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteTarget, setDeleteTarget] = useState<CategoryResponse | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [toast, setToast] = useState<{ show: boolean; message: string; variant: "success" | "error" }>({
    show: false,
    message: "",
    variant: "success",
  });

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const data = await CategoryService.getAll();
      setCategories(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const showToast = (message: string, variant: "success" | "error") => {
    setToast({ show: true, message, variant });
    setTimeout(() => {
      setToast((prev) => ({ ...prev, show: false }));
    }, 2500);
  };

  const openDeleteModal = (category: CategoryResponse) => {
    setDeleteTarget(category);
  };

  const closeDeleteModal = () => {
    if (!isDeleting) {
      setDeleteTarget(null);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) {
      return;
    }

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

  return (
    <div className="p-8 space-y-8">
      <ToastMessage show={toast.show} message={toast.message} variant={toast.variant} />

      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-headline font-extrabold text-primary">Quản lý Danh mục</h2>
          <p className="text-sm text-slate-500">Danh sách các danh mục phân loại sản phẩm</p>
        </div>
        <Link 
          href="/admin/categories/add"
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
                <th className="px-8 py-5">Tên danh mục</th>
                <th className="px-8 py-5">Slug</th>
                <th className="px-8 py-5">Danh mục cha</th>
                <th className="px-8 py-5">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/5">
              {loading ? (
                <tr><td colSpan={5} className="text-center py-10">Đang tải...</td></tr>
              ) : categories.length === 0 ? (
                <tr><td colSpan={5} className="text-center py-10">Chưa có danh mục nào.</td></tr>
              ) : (
                categories.map((cat) => (
                  <tr key={cat.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-8 py-4 font-mono text-xs font-bold text-slate-400">#{cat.id}</td>
                    <td className="px-8 py-4 font-bold text-on-surface">{cat.name}</td>
                    <td className="px-8 py-4">
                      <span className="px-3 py-1 bg-secondary/10 text-secondary rounded-full text-[10px] font-mono font-medium">
                        {cat.slug}
                      </span>
                    </td>
                    <td className="px-8 py-4 text-sm text-slate-500">
                      {cat.parentName ? (
                        <span className="flex items-center gap-1">
                          <span className="material-symbols-outlined text-[10px]">subdirectory_arrow_right</span>
                          {cat.parentName}
                        </span>
                      ) : (
                        <span className="text-slate-300">-</span>
                      )}
                    </td>
                    <td className="px-8 py-4">
                      <div className="flex items-center gap-3">
                        <Link href={`/admin/categories/${cat.id}/edit`} className="text-slate-400 hover:text-primary transition-colors">
                          <span className="material-symbols-outlined text-[18px]">edit</span>
                        </Link>
                        <button onClick={() => openDeleteModal(cat)} className="text-slate-400 hover:text-error transition-colors">
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
        title="Xác nhận xóa danh mục"
        itemLabel={deleteTarget?.name}
        message="Bạn có chắc chắn muốn xóa danh mục này không? Dữ liệu liên quan có thể bị ảnh hưởng."
        onConfirm={handleDeleteConfirm}
        onClose={closeDeleteModal}
        isDeleting={isDeleting}
      />
    </div>
  );
}
