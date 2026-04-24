"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import DeleteConfirmModal from "@/components/common/DeleteConfirmModal";
import ToastMessage from "@/components/common/ToastMessage";
import { ProductService } from "@/services/product.service";
import { ProductResponse } from "@/types/product";

type StatusFilter = "all" | "active" | "inactive";

const currency = new Intl.NumberFormat("vi-VN", {
  style: "currency",
  currency: "VND",
  maximumFractionDigits: 0,
});

export default function AdminProductsPage() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [products, setProducts] = useState<ProductResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [deleteTarget, setDeleteTarget] = useState<ProductResponse | null>(null);
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

  const fetchProducts = useCallback(async () => {
    try {
      const data = await ProductService.getAll();
      setProducts(data);
    } catch (error) {
      console.error(error);
      showToast("Không thể tải danh sách sản phẩm.", "error");
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  useEffect(() => {
    const message = searchParams.get("message");
    if (!message) {
      return;
    }

    const variant = searchParams.get("variant") === "error" ? "error" : "success";
    showToast(message, variant);
    router.replace(pathname);
  }, [pathname, router, searchParams, showToast]);

  const filteredProducts = useMemo(() => {
    return products.filter((item) => {
      const keyword = search.trim().toLowerCase();
      const matchSearch =
        keyword.length === 0 ||
        item.name.toLowerCase().includes(keyword) ||
        (item.sku ?? "").toLowerCase().includes(keyword) ||
        item.slug.toLowerCase().includes(keyword);

      const matchStatus =
        statusFilter === "all" ||
        (statusFilter === "active" && item.isActive) ||
        (statusFilter === "inactive" && !item.isActive);

      return matchSearch && matchStatus;
    });
  }, [products, search, statusFilter]);

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) {
      return;
    }

    try {
      setIsDeleting(true);
      await ProductService.delete(deleteTarget.id);
      await fetchProducts();
      showToast("Xóa sản phẩm thành công.", "success");
      setDeleteTarget(null);
    } catch (error) {
      console.error(error);
      showToast("Xóa sản phẩm thất bại.", "error");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="p-8 space-y-8">
      <ToastMessage show={toast.show} message={toast.message} variant={toast.variant} />

      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-headline font-extrabold text-primary">Quản lý Sản phẩm</h2>
          <p className="text-sm text-slate-500">Danh sách sản phẩm lấy trực tiếp từ API backend</p>
        </div>
        <Link
          href="/admin/products/add"
          className="bg-primary hover:bg-black text-white px-6 py-3 rounded-full text-sm font-bold flex items-center gap-2 transition-colors"
        >
          <span className="material-symbols-outlined text-sm">add</span> Thêm mới
        </Link>
      </div>

      <div className="bg-surface-container-low rounded-3xl p-4 flex flex-wrap items-center gap-4">
        <div className="min-w-64 flex-1">
          <input
            className="w-full bg-white border border-outline-variant/15 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/15"
            placeholder="Tìm theo tên, SKU hoặc slug..."
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
          <option value="active">Đang kinh doanh</option>
          <option value="inactive">Ngừng kinh doanh</option>
        </select>
        <p className="text-sm text-slate-500">{filteredProducts.length} sản phẩm</p>
      </div>

      <div className="bg-surface-container-lowest rounded-4xl overflow-hidden shadow-sm border border-outline-variant/10">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-surface-container-low text-[10px] font-bold text-slate-500 uppercase tracking-widest border-b border-outline-variant/20">
                <th className="px-8 py-5">Sản phẩm</th>
                <th className="px-8 py-5">Danh mục</th>
                <th className="px-8 py-5">SKU</th>
                <th className="px-8 py-5">Giá</th>
                <th className="px-8 py-5">Kho</th>
                <th className="px-8 py-5">Trạng thái</th>
                <th className="px-8 py-5">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/5">
              {loading ? (
                <tr>
                  <td colSpan={7} className="text-center py-10">Đang tải...</td>
                </tr>
              ) : filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-10">Chưa có sản phẩm nào.</td>
                </tr>
              ) : (
                filteredProducts.map((product) => {
                  const mainImage = product.images.find((item) => item.isMain) ?? product.images[0];

                  return (
                    <tr key={product.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-8 py-4">
                        <div className="flex items-center gap-3">
                          {mainImage ? (
                            <img
                              src={mainImage.imageUrl}
                              alt={product.name}
                              className="h-12 w-12 rounded-xl object-cover border border-slate-200"
                            />
                          ) : (
                            <div className="h-12 w-12 rounded-xl bg-slate-100 flex items-center justify-center text-slate-400">
                              <span className="material-symbols-outlined text-[18px]">image</span>
                            </div>
                          )}
                          <div>
                            <p className="font-semibold text-on-surface">{product.name}</p>
                            <p className="text-xs text-slate-400">/{product.slug}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-4 text-sm text-slate-500">
                        {product.categories.length ? product.categories.map((cat) => cat.name).join(", ") : "-"}
                      </td>
                      <td className="px-8 py-4 font-mono text-xs text-slate-500">{product.sku || "-"}</td>
                      <td className="px-8 py-4 font-semibold text-secondary">{currency.format(product.price)}</td>
                      <td className="px-8 py-4 text-sm text-slate-600">{product.stockQuantity}</td>
                      <td className="px-8 py-4">
                        <span
                          className={`inline-flex items-center px-3 py-1 rounded-full text-[11px] font-semibold ${
                            product.isActive ? "bg-emerald-100 text-emerald-700" : "bg-slate-200 text-slate-600"
                          }`}
                        >
                          {product.isActive ? "Đang bán" : "Ngừng bán"}
                        </span>
                      </td>
                      <td className="px-8 py-4">
                        <div className="flex items-center gap-3">
                          <Link
                            href={`/admin/products/${product.id}/edit`}
                            className="text-slate-400 hover:text-primary transition-colors"
                          >
                            <span className="material-symbols-outlined text-[18px]">edit</span>
                          </Link>
                          <button
                            onClick={() => setDeleteTarget(product)}
                            className="text-slate-400 hover:text-error transition-colors"
                            type="button"
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
      </div>

      <DeleteConfirmModal
        isOpen={Boolean(deleteTarget)}
        title="Xác nhận xóa sản phẩm"
        itemLabel={deleteTarget?.name}
        message="Bạn có chắc chắn muốn xóa sản phẩm này không? Hành động này không thể hoàn tác."
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
