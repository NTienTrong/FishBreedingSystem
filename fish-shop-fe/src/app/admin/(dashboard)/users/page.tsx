"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import DeleteConfirmModal from "@/components/common/DeleteConfirmModal";
import ToastMessage from "@/components/common/ToastMessage";
import { UserService } from "@/services/user.service";
import { UserResponse } from "@/types/user";

const dateFormatter = new Intl.DateTimeFormat("vi-VN", {
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
});

type StatusFilter = "all" | "active" | "inactive";

export default function AdminUsersPage() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [users, setUsers] = useState<UserResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [deleteTarget, setDeleteTarget] = useState<UserResponse | null>(null);
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

  const fetchUsers = useCallback(async () => {
    try {
      const data = await UserService.getAll();
      setUsers(data);
    } catch (error) {
      console.error(error);
      showToast("Không thể tải danh sách người dùng.", "error");
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  useEffect(() => {
    const message = searchParams.get("message");
    if (!message) {
      return;
    }

    const variant = searchParams.get("variant") === "error" ? "error" : "success";
    showToast(message, variant);
    router.replace(pathname);
  }, [pathname, router, searchParams, showToast]);

  const filteredUsers = useMemo(() => {
    const keyword = search.trim().toLowerCase();

    return users.filter((item) => {
      const matchSearch =
        keyword.length === 0 ||
        item.username.toLowerCase().includes(keyword) ||
        item.fullName.toLowerCase().includes(keyword) ||
        item.email.toLowerCase().includes(keyword);

      const matchStatus =
        statusFilter === "all" ||
        (statusFilter === "active" && item.isActive) ||
        (statusFilter === "inactive" && !item.isActive);

      return matchSearch && matchStatus;
    });
  }, [search, statusFilter, users]);

  const totalAdmins = useMemo(() => {
    return users.filter((item) => item.role?.toUpperCase() === "ADMIN").length;
  }, [users]);

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) {
      return;
    }

    try {
      setIsDeleting(true);
      await UserService.delete(deleteTarget.id);
      await fetchUsers();
      showToast("Xóa người dùng thành công.", "success");
      setDeleteTarget(null);
    } catch (error) {
      console.error(error);
      showToast("Xóa người dùng thất bại.", "error");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="p-8 space-y-8">
      <ToastMessage show={toast.show} message={toast.message} variant={toast.variant} />

      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-headline font-extrabold text-primary">Quản lý Người dùng</h2>
        </div>
        <Link
          href="/admin/users/add"
          className="bg-primary hover:bg-black text-white px-6 py-3 rounded-full text-sm font-bold flex items-center gap-2 transition-colors"
        >
          <span className="material-symbols-outlined text-sm">add</span> Thêm mới
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-surface-container-low p-5 rounded-2xl">
          <p className="text-xs text-slate-500 uppercase tracking-wider">Tổng người dùng</p>
          <p className="text-2xl font-extrabold text-primary mt-1">{users.length}</p>
        </div>
        <div className="bg-surface-container-low p-5 rounded-2xl">
          <p className="text-xs text-slate-500 uppercase tracking-wider">Quản trị viên</p>
          <p className="text-2xl font-extrabold text-primary mt-1">{totalAdmins}</p>
        </div>
        <div className="bg-surface-container-low p-5 rounded-2xl">
          <p className="text-xs text-slate-500 uppercase tracking-wider">Đang hoạt động</p>
          <p className="text-2xl font-extrabold text-primary mt-1">{users.filter((u) => u.isActive).length}</p>
        </div>
      </div>

      <div className="bg-surface-container-low rounded-3xl p-4 flex flex-wrap items-center gap-4">
        <div className="min-w-64 flex-1">
          <input
            className="w-full bg-white border border-outline-variant/15 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/15"
            placeholder="Tìm theo username, họ tên, email..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
        </div>
        <select
          className="bg-white border border-outline-variant/15 rounded-xl px-4 py-2.5 text-sm outline-none"
          value={statusFilter}
          onChange={(event) => setStatusFilter(event.target.value as StatusFilter)}
        >
          <option value="all">Tất cả trạng thái</option>
          <option value="active">Đang hoạt động</option>
          <option value="inactive">Đã khóa</option>
        </select>
        <p className="text-sm text-slate-500">{filteredUsers.length} người dùng</p>
      </div>

      <div className="bg-surface-container-lowest rounded-4xl overflow-hidden shadow-sm border border-outline-variant/10">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-surface-container-low text-[10px] font-bold text-slate-500 uppercase tracking-widest border-b border-outline-variant/20">
                <th className="px-8 py-5">Người dùng</th>
                <th className="px-8 py-5">Liên hệ</th>
                <th className="px-8 py-5">Vai trò</th>
                <th className="px-8 py-5">Trạng thái</th>
                <th className="px-8 py-5">Ngày tạo</th>
                <th className="px-8 py-5">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/5">
              {loading ? (
                <tr>
                  <td colSpan={6} className="text-center py-10">Đang tải...</td>
                </tr>
              ) : filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-10">Chưa có người dùng nào.</td>
                </tr>
              ) : (
                filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-8 py-4">
                      <p className="font-semibold text-on-surface">{user.fullName}</p>
                      <p className="text-xs text-slate-400">@{user.username}</p>
                    </td>
                    <td className="px-8 py-4 text-sm text-slate-500">
                      <p>{user.email}</p>
                      <p>{user.phone || "-"}</p>
                    </td>
                    <td className="px-8 py-4">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-[11px] font-semibold ${user.role?.toUpperCase() === "ADMIN" ? "bg-blue-100 text-blue-700" : "bg-slate-200 text-slate-700"}`}>
                        {user.role?.toUpperCase() === "ADMIN" ? "ADMIN" : "CUSTOMER"}
                      </span>
                    </td>
                    <td className="px-8 py-4">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-[11px] font-semibold ${user.isActive ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700"}`}>
                        {user.isActive ? "Đang hoạt động" : "Đã khóa"}
                      </span>
                    </td>
                    <td className="px-8 py-4 text-sm text-slate-500">
                      {user.createdAt ? dateFormatter.format(new Date(user.createdAt)) : "-"}
                    </td>
                    <td className="px-8 py-4">
                      <div className="flex items-center gap-3">
                        <Link href={`/admin/users/${user.id}/edit`} className="text-slate-400 hover:text-primary transition-colors">
                          <span className="material-symbols-outlined text-[18px]">edit</span>
                        </Link>
                        <button
                          onClick={() => setDeleteTarget(user)}
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
        title="Xác nhận xóa người dùng"
        itemLabel={deleteTarget?.fullName}
        message="Bạn có chắc chắn muốn xóa người dùng này không? Hành động này không thể hoàn tác."
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
