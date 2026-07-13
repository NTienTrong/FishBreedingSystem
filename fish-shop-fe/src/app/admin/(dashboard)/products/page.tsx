"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import DeleteConfirmModal from "@/components/common/DeleteConfirmModal";
import DetailModal from "@/components/common/DetailModal";
import ToastMessage from "@/components/common/ToastMessage";
import { ProductService } from "@/services/product.service";
import { ProductResponse } from "@/types/product";

export const dynamic = "force-dynamic";

type StatusFilter = "all" | "active" | "inactive";

const currency = new Intl.NumberFormat("vi-VN", {
  style: "currency",
  currency: "VND",
  maximumFractionDigits: 0,
});

const dateTimeFormatter = new Intl.DateTimeFormat("vi-VN", {
  dateStyle: "medium",
  timeStyle: "short",
});

export default function AdminProductsPage() {
  const router = useRouter();
  const pathname = usePathname();
  const [products, setProducts] = useState<ProductResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [deleteTarget, setDeleteTarget] = useState<ProductResponse | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [detailTarget, setDetailTarget] = useState<ProductResponse | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
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
    const params = new URLSearchParams(window.location.search);
    const message = params.get("message");
    if (!message) {
      return;
    }

    const variant = params.get("variant") === "error" ? "error" : "success";
    showToast(message, variant);
    router.replace(pathname);
  }, [pathname, router, showToast]);

  const filteredProducts = useMemo(() => {
    const sortedProducts = [...products].sort((a, b) => {
      const dateDiff = new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      return dateDiff !== 0 ? dateDiff : b.id - a.id;
    });

    return sortedProducts.filter((item) => {
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

  const PAGE_SIZE = 5;
  const totalPages = Math.max(1, Math.ceil(filteredProducts.length / PAGE_SIZE));
  const pagedProducts = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return filteredProducts.slice(start, start + PAGE_SIZE);
  }, [currentPage, filteredProducts]);

  useEffect(() => {
    setCurrentPage(1);
  }, [search, statusFilter, products.length]);

  useEffect(() => {
    setCurrentPage((prev) => Math.min(prev, totalPages));
  }, [totalPages]);

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

  const handleOpenDetail = useCallback(async (productId: number) => {
    setIsDetailOpen(true);
    setDetailLoading(true);
    try {
      const data = await ProductService.getById(productId);
      setDetailTarget(data);
    } catch (error) {
      console.error(error);
      showToast("Không thể tải chi tiết sản phẩm.", "error");
      setIsDetailOpen(false);
    } finally {
      setDetailLoading(false);
    }
  }, [showToast]);

  const handleCloseDetail = () => {
    setIsDetailOpen(false);
    setDetailTarget(null);
  };

  const renderDetailItem = (label: string, value: React.ReactNode) => (
    <div className="grid grid-cols-[160px_1fr] gap-4 border-b border-slate-100 py-3">
      <p className="text-xs uppercase tracking-wider text-slate-400">{label}</p>
      <div className="text-sm text-slate-700">{value ?? "-"}</div>
    </div>
  );

  const getSizeLabel = (product: ProductResponse) => {
    const sizeAttr = product.attributeValues?.find((attr) => {
      const name = (attr.attributeName || "").toLowerCase();
      return name.includes("size") || name.includes("kích thước") || name.includes("kich thuoc");
    });
    return sizeAttr?.attrValue || "-";
  };

  return (
    <div className="p-8 space-y-8">
      <ToastMessage show={toast.show} message={toast.message} variant={toast.variant} />

      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-headline font-extrabold text-primary">Quản lý Sản phẩm</h2>
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
                <th className="px-8 py-5">Tên cá</th>
                <th className="px-8 py-5">Hình ảnh</th>
                <th className="px-8 py-5">Danh mục</th>
                <th className="px-8 py-5">Giá nhập</th>
                <th className="px-8 py-5">Giá bán</th>
                <th className="px-8 py-5">Số lượng</th>
                <th className="px-8 py-5">Trạng thái</th>
                <th className="px-8 py-5">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/5">
              {loading ? (
                <tr>
                  <td colSpan={8} className="text-center py-10">Đang tải...</td>
                </tr>
              ) : filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center py-10">Chưa có sản phẩm nào.</td>
                </tr>
              ) : (
                pagedProducts.map((product) => {
                  const mainImage = product.images.find((item) => item.isMain) ?? product.images[0];

                  return (
                    <tr key={product.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-8 py-4">
                        <div>
                          <p className="font-semibold text-on-surface">{product.name}</p>
                          <p className="text-xs text-slate-400">/{product.slug}</p>
                        </div>
                      </td>
                      <td className="px-8 py-4">
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
                      </td>
                      <td className="px-8 py-4 text-sm text-slate-500">
                        {product.categories.length ? product.categories.map((cat) => cat.name).join(", ") : "-"}
                      </td>
                      <td className="px-8 py-4 font-semibold text-slate-600">
                        {product.costPrice ? currency.format(product.costPrice) : "-"}
                      </td>
                      <td className="px-8 py-4 font-semibold text-secondary">{currency.format(product.price)}</td>
                      <td className="px-8 py-4 text-sm text-slate-600">{product.stockQuantity ?? 0}</td>
                      <td className="px-8 py-4">
                        <span
                          className={`inline-flex items-center px-3 py-1 rounded-full text-[11px] font-semibold ${product.isActive ? "bg-emerald-100 text-emerald-700" : "bg-slate-200 text-slate-600"
                            }`}
                        >
                          {product.isActive ? "Đang kinh doanh" : "Ngừng kinh doanh"}
                        </span>
                      </td>
                      <td className="px-8 py-4">
                        <div className="flex items-center gap-3">
                          <button
                            onClick={() => handleOpenDetail(product.id)}
                            className="text-slate-400 hover:text-primary transition-colors"
                            type="button"
                            aria-label="Xem chi tiết"
                          >
                            <span className="material-symbols-outlined text-[18px]">visibility</span>
                          </button>
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

      {!loading && filteredProducts.length > 0 && (
        <div className="flex items-center justify-between text-xs text-slate-500">
          <span>
            Hiển thị <strong className="text-on-surface">{pagedProducts.length}</strong> /{" "}
            {filteredProducts.length} sản phẩm
          </span>
          {filteredProducts.length > PAGE_SIZE && (
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

      <DetailModal
        isOpen={isDetailOpen}
        onClose={handleCloseDetail}
        title="Chi tiết sản phẩm"
        subtitle={detailTarget ? `#${detailTarget.id} - ${detailTarget.name}` : undefined}
      >
        {detailLoading ? (
          <div className="flex items-center justify-center py-10 text-slate-500">
            Đang tải...
          </div>
        ) : detailTarget ? (
          <div className="space-y-6">
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <div className="flex items-center gap-4">
                {detailTarget.images?.length ? (
                  <img
                    src={(detailTarget.images.find((item) => item.isMain) ?? detailTarget.images[0]).imageUrl}
                    alt={detailTarget.name}
                    className="h-20 w-20 rounded-2xl object-cover border border-slate-200"
                  />
                ) : (
                  <div className="h-20 w-20 rounded-2xl bg-white border border-slate-200 flex items-center justify-center text-slate-400">
                    <span className="material-symbols-outlined text-[20px]">image</span>
                  </div>
                )}
                <div>
                  <p className="text-lg font-bold text-slate-900">{detailTarget.name}</p>
                  <p className="text-sm text-slate-500">/{detailTarget.slug}</p>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white">
              {renderDetailItem("ID", `#${detailTarget.id}`)}
              {renderDetailItem("SKU", detailTarget.sku || "-")}
              {renderDetailItem("Giá nhập", detailTarget.costPrice ? currency.format(detailTarget.costPrice) : "-")}
              {renderDetailItem("Giá bán", currency.format(detailTarget.price))}
              {renderDetailItem("Tồn kho", detailTarget.stockQuantity)}
              {renderDetailItem("Trạng thái", detailTarget.isActive ? "Đang kinh doanh" : "Ngừng kinh doanh")}
              {renderDetailItem("Ngày tạo", detailTarget.createdAt ? dateTimeFormatter.format(new Date(detailTarget.createdAt)) : "-")}
              {renderDetailItem("Tóm tắt", detailTarget.summary || "-")}
              {renderDetailItem("Mô tả", detailTarget.description || "-")}
              {renderDetailItem(
                "Danh mục",
                detailTarget.categories.length ? (
                  <div className="flex flex-wrap gap-2">
                    {detailTarget.categories.map((cat) => (
                      <span
                        key={cat.id}
                        className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600"
                      >
                        {cat.name}
                      </span>
                    ))}
                  </div>
                ) : (
                  "-"
                ),
              )}
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-4">
              <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">Hình ảnh</p>
              {detailTarget.images.length ? (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {detailTarget.images.map((image) => (
                    <div key={image.id} className="relative">
                      <img
                        src={image.imageUrl}
                        alt={detailTarget.name}
                        className="h-24 w-full rounded-xl object-cover border border-slate-200"
                      />
                      {image.isMain && (
                        <span className="absolute left-2 top-2 rounded-full bg-primary px-2 py-0.5 text-[10px] font-semibold text-white">
                          Chính
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-slate-500">-</p>
              )}
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-4">
              <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">Thuộc tính</p>
              {detailTarget.attributeValues.length ? (
                <div className="grid gap-2">
                  {detailTarget.attributeValues.map((item) => (
                    <div key={item.attributeId} className="flex items-center justify-between rounded-xl border border-slate-100 px-3 py-2">
                      <span className="text-sm font-semibold text-slate-700">{item.attributeName}</span>
                      <span className="text-sm text-slate-500">{item.attrValue}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-slate-500">-</p>
              )}
            </div>
          </div>
        ) : (
          <div className="text-center py-10 text-slate-500">Không có dữ liệu.</div>
        )}
      </DetailModal>

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
