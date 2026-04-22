"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { AttributeService } from "@/services/attribute.service";
import { AttributeResponse } from "@/types/attribute";
import DeleteConfirmModal from "@/components/common/DeleteConfirmModal";
import ToastMessage from "@/components/common/ToastMessage";

export default function AdminAttributesPage() {
  const [attributes, setAttributes] = useState<AttributeResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteTarget, setDeleteTarget] = useState<AttributeResponse | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [toast, setToast] = useState<{ show: boolean; message: string; variant: "success" | "error" }>({
    show: false,
    message: "",
    variant: "success",
  });

  useEffect(() => {
    fetchAttributes();
  }, []);

  const fetchAttributes = async () => {
    try {
      const data = await AttributeService.getAll();
      setAttributes(data);
    } catch (error) {
      console.error(error);
      showToast("Không thể tải danh sách thuộc tính.", "error");
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
          <p className="text-sm text-slate-500">Danh sách thuộc tính sản phẩm được lấy từ API thật</p>
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
                attributes.map((attribute) => (
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
