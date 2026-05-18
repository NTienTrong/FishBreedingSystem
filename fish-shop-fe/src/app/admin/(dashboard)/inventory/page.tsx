"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import DetailModal from "@/components/common/DetailModal";
import ToastMessage from "@/components/common/ToastMessage";
import { InventoryService } from "@/services/inventory.service";
import { ProductService } from "@/services/product.service";
import { InventoryExportRequest, InventoryRestockRequest, StockChangeType, StockLogResponse } from "@/types/inventory";
import { ProductResponse } from "@/types/product";

const currency = new Intl.NumberFormat("vi-VN", {
  style: "currency",
  currency: "VND",
  maximumFractionDigits: 0,
});

const dateTimeFormatter = new Intl.DateTimeFormat("vi-VN", {
  dateStyle: "medium",
  timeStyle: "short",
});

type RestockFormState = {
  productId: string;
  quantity: string;
  reason: string;
};

type ExportFormState = {
  productId: string;
  quantity: string;
  reason: string;
};

type ActiveTab = "inventory" | "history";

export default function AdminInventoryPage() {
  const [products, setProducts] = useState<ProductResponse[]>([]);
  const [logs, setLogs] = useState<StockLogResponse[]>([]);
  const [activeTab, setActiveTab] = useState<ActiveTab>("inventory");
  const [inventoryPage, setInventoryPage] = useState(1);
  const [historyPage, setHistoryPage] = useState(1);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [loadingLogs, setLoadingLogs] = useState(true);
  const [isRestockOpen, setIsRestockOpen] = useState(false);
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [restockLockedId, setRestockLockedId] = useState<number | null>(null);
  const [exportLockedId, setExportLockedId] = useState<number | null>(null);
  const [restockForm, setRestockForm] = useState<RestockFormState>({
    productId: "",
    quantity: "",
    reason: "",
  });
  const [exportForm, setExportForm] = useState<ExportFormState>({
    productId: "",
    quantity: "",
    reason: "",
  });
  const [submitting, setSubmitting] = useState(false);
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
      setInventoryPage(1);
    } catch (error) {
      console.error(error);
      showToast("Không thể tải danh sách sản phẩm.", "error");
    } finally {
      setLoadingProducts(false);
    }
  }, [showToast]);

  const fetchLogs = useCallback(async () => {
    try {
      const data = await InventoryService.getLogs(100);
      setLogs(data);
    } catch (error) {
      console.error(error);
      showToast("Không thể tải lịch sử kho.", "error");
    } finally {
      setLoadingLogs(false);
    }
  }, [showToast]);

  useEffect(() => {
    fetchProducts();
    fetchLogs();
  }, [fetchLogs, fetchProducts]);

  const PAGE_SIZE = 5;

  const sortedProducts = useMemo(
    () =>
      [...products].sort((a, b) => {
        const dateDiff = new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        return dateDiff !== 0 ? dateDiff : b.id - a.id;
      }),
    [products],
  );

  const sortedLogs = useMemo(
    () =>
      [...logs].sort((a, b) => {
        const dateDiff = new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        return dateDiff !== 0 ? dateDiff : b.id - a.id;
      }),
    [logs],
  );

  const inventoryTotalPages = Math.max(1, Math.ceil(sortedProducts.length / PAGE_SIZE));
  const historyTotalPages = Math.max(1, Math.ceil(sortedLogs.length / PAGE_SIZE));

  const pagedProducts = useMemo(() => {
    const start = (inventoryPage - 1) * PAGE_SIZE;
    return sortedProducts.slice(start, start + PAGE_SIZE);
  }, [inventoryPage, sortedProducts]);

  const pagedLogs = useMemo(() => {
    const start = (historyPage - 1) * PAGE_SIZE;
    return sortedLogs.slice(start, start + PAGE_SIZE);
  }, [historyPage, sortedLogs]);

  useEffect(() => {
    setInventoryPage((prev) => Math.min(prev, inventoryTotalPages));
  }, [inventoryTotalPages]);

  useEffect(() => {
    setHistoryPage((prev) => Math.min(prev, historyTotalPages));
  }, [historyTotalPages]);

  const totalOutOfStock = useMemo(() => products.filter((p) => (p.stockQuantity ?? 0) <= 0).length, [products]);
  const totalLowStock = useMemo(() => products.filter((p) => (p.stockQuantity ?? 0) > 0 && (p.stockQuantity ?? 0) < 5).length, [products]);

  const lastRestockedByProduct = useMemo(() => {
    const map = new Map<number, string>();
    sortedLogs.forEach((log) => {
      if (log.changeType !== "IMPORT") {
        return;
      }
      if (!map.has(log.productId)) {
        map.set(log.productId, log.createdAt);
      }
    });
    return map;
  }, [sortedLogs]);

  const openRestock = (product?: ProductResponse) => {
    setRestockForm({
      productId: product ? String(product.id) : products[0] ? String(products[0].id) : "",
      quantity: "",
      reason: "",
    });
    setRestockLockedId(product ? product.id : null);
    setIsRestockOpen(true);
  };

  const openExport = (product?: ProductResponse) => {
    setExportForm({
      productId: product ? String(product.id) : products[0] ? String(products[0].id) : "",
      quantity: "",
      reason: "",
    });
    setExportLockedId(product ? product.id : null);
    setIsExportOpen(true);
  };

  const handleRestockSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    const quantity = Number(restockForm.quantity);
    const productId = Number(restockForm.productId);

    if (!productId || Number.isNaN(quantity) || quantity <= 0) {
      showToast("Vui lòng nhập sản phẩm và số lượng hợp lệ.", "error");
      return;
    }

    const payload: InventoryRestockRequest = {
      productId,
      quantity,
      reason: restockForm.reason.trim() ? restockForm.reason.trim() : null,
    };

    try {
      setSubmitting(true);
      await InventoryService.restock(payload);
      showToast("Nhập kho thành công.", "success");
      setIsRestockOpen(false);
      fetchProducts();
      fetchLogs();
    } catch (error) {
      console.error(error);
      showToast("Nhập kho thất bại.", "error");
    } finally {
      setSubmitting(false);
    }
  };

  const handleExportSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    const quantity = Number(exportForm.quantity);
    const productId = Number(exportForm.productId);

    if (!productId || Number.isNaN(quantity) || quantity <= 0) {
      showToast("Vui lòng nhập sản phẩm và số lượng hợp lệ.", "error");
      return;
    }

    const payload: InventoryExportRequest = {
      productId,
      quantity,
      reason: exportForm.reason.trim() ? exportForm.reason.trim() : null,
    };

    try {
      setSubmitting(true);
      await InventoryService.exportStock(payload);
      showToast("Xuất kho thành công.", "success");
      setIsExportOpen(false);
      fetchProducts();
      fetchLogs();
    } catch (error) {
      console.error(error);
      showToast("Xuất kho thất bại.", "error");
    } finally {
      setSubmitting(false);
    }
  };

  const getMainImage = (product: ProductResponse) => {
    return (
      product.images.find((image) => image.isMain)?.imageUrl ||
      product.images[0]?.imageUrl ||
      "https://via.placeholder.com/160x160?text=No+Image"
    );
  };

  const renderChangeType = (type: StockChangeType) => {
    switch (type) {
      case "IMPORT":
        return { label: "Nhập kho", className: "bg-emerald-100 text-emerald-700" };
      case "EXPORT":
        return { label: "Xuất kho", className: "bg-rose-100 text-rose-700" };
      case "RETURN":
        return { label: "Hoàn hàng", className: "bg-blue-100 text-blue-700" };
      default:
        return { label: "Điều chỉnh", className: "bg-amber-100 text-amber-700" };
    }
  };

  return (
    <div className="p-8 max-w-7xl w-full mx-auto space-y-8">
      <ToastMessage show={toast.show} message={toast.message} variant={toast.variant} />

      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-3xl font-extrabold text-primary tracking-tight">Quản lý kho</h1>
          <p className="text-on-surface-variant font-medium">Theo dõi tồn kho, nhập hàng và kiểm kê nhanh.</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            onClick={() => openRestock()}
            className="bg-primary hover:bg-black text-white px-6 py-3 rounded-full text-sm font-bold flex items-center gap-2 transition-colors"
          >
            <span className="material-symbols-outlined text-sm">inventory_2</span> Nhập hàng
          </button>
          <button
            type="button"
            onClick={() => openExport()}
            className="border border-rose-200 text-rose-700 px-6 py-3 rounded-full text-sm font-bold flex items-center gap-2 hover:bg-rose-50 transition-colors"
          >
            <span className="material-symbols-outlined text-sm">local_shipping</span> Xuất hàng
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-5 rounded-2xl bg-surface-container-low border border-outline-variant/10">
          <p className="text-xs uppercase tracking-[0.3em] text-slate-400 font-bold">Tổng sản phẩm</p>
          <p className="mt-2 text-3xl font-black text-primary">{products.length}</p>
        </div>
        <div className="p-5 rounded-2xl bg-amber-50 border border-amber-100">
          <p className="text-xs uppercase tracking-[0.3em] text-amber-700 font-bold">Sắp hết</p>
          <p className="mt-2 text-3xl font-black text-amber-700">{totalLowStock}</p>
        </div>
        <div className="p-5 rounded-2xl bg-rose-50 border border-rose-100">
          <p className="text-xs uppercase tracking-[0.3em] text-rose-700 font-bold">Hết hàng</p>
          <p className="mt-2 text-3xl font-black text-rose-700">{totalOutOfStock}</p>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={() => setActiveTab("inventory")}
          className={`px-4 py-2 rounded-full text-sm font-semibold transition-all ${
            activeTab === "inventory" ? "bg-primary text-white" : "bg-surface-container-low text-primary"
          }`}
        >
          Tồn kho
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("history")}
          className={`px-4 py-2 rounded-full text-sm font-semibold transition-all ${
            activeTab === "history" ? "bg-primary text-white" : "bg-surface-container-low text-primary"
          }`}
        >
          Lịch sử biến động
        </button>
      </div>

      {activeTab === "inventory" ? (
        <>
          <div className="bg-surface-container-lowest rounded-3xl border border-outline-variant/10 overflow-hidden">
            <table className="w-full text-left">
              <thead className="bg-surface-container-low">
                <tr className="text-xs uppercase tracking-wider text-primary">
                  <th className="px-6 py-4">Tên cá</th>
                  <th className="px-6 py-4">Mã SKU</th>
                  <th className="px-6 py-4">Số lượng tồn kho</th>
                  <th className="px-6 py-4">Lần nhập gần nhất</th>
                  <th className="px-6 py-4">Hành động</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/10">
                {loadingProducts ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-10 text-center text-slate-500">
                      Đang tải dữ liệu...
                    </td>
                  </tr>
                ) : products.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-10 text-center text-slate-500">
                      Chưa có sản phẩm nào.
                    </td>
                  </tr>
                ) : (
                  pagedProducts.map((product) => {
                    const stock = product.stockQuantity ?? 0;
                    const rowClass = stock < 5 ? "bg-amber-50/70" : "";
                    const lastRestockedAt = lastRestockedByProduct.get(product.id);

                    return (
                      <tr key={product.id} className={`transition-colors ${rowClass}`}>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <img
                              src={getMainImage(product)}
                              alt={product.name}
                              className="h-10 w-10 rounded-xl object-cover bg-surface-container-high"
                            />
                            <div>
                              <p className="text-sm font-semibold text-primary">{product.name}</p>
                              <p className="text-xs text-slate-500">/{product.slug}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-slate-500">{product.sku || "-"}</td>
                        <td className="px-6 py-4">
                          <span className={`text-sm font-bold ${stock < 5 ? "text-amber-700" : "text-primary"}`}>{stock}</span>
                        </td>
                        <td className="px-6 py-4 text-sm text-slate-500">
                          {lastRestockedAt ? dateTimeFormatter.format(new Date(lastRestockedAt)) : "-"}
                        </td>
                        <td className="px-6 py-4">
                          <button
                            type="button"
                            onClick={() => openRestock(product)}
                            className="rounded-full border border-primary/20 px-4 py-1.5 text-xs font-bold text-primary hover:bg-primary hover:text-white transition-colors"
                          >
                            Nhập hàng
                          </button>
                          <button
                            type="button"
                            onClick={() => openExport(product)}
                            className="ml-2 rounded-full border border-rose-200 px-4 py-1.5 text-xs font-bold text-rose-700 hover:bg-rose-100 transition-colors"
                          >
                            Xuất kho
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
          {!loadingProducts && sortedProducts.length > 0 && (
            <div className="flex items-center justify-between px-6 py-4 text-xs text-slate-500 border-t border-outline-variant/10">
              <span>
                Hiển thị <strong className="text-on-surface">{pagedProducts.length}</strong> / {sortedProducts.length} sản phẩm
              </span>
              {sortedProducts.length > PAGE_SIZE && (
                <div className="flex items-center gap-2">
                  <button
                    className="w-8 h-8 flex items-center justify-center rounded-lg border border-outline-variant/30 text-on-surface-variant disabled:opacity-40"
                    onClick={() => setInventoryPage((prev) => Math.max(1, prev - 1))}
                    disabled={inventoryPage === 1}
                    type="button"
                  >
                    <span className="material-symbols-outlined text-sm">chevron_left</span>
                  </button>
                  <span className="text-xs font-semibold">Trang {inventoryPage} / {inventoryTotalPages}</span>
                  <button
                    className="w-8 h-8 flex items-center justify-center rounded-lg border border-outline-variant/30 text-on-surface-variant disabled:opacity-40"
                    onClick={() => setInventoryPage((prev) => Math.min(inventoryTotalPages, prev + 1))}
                    disabled={inventoryPage === inventoryTotalPages}
                    type="button"
                  >
                    <span className="material-symbols-outlined text-sm">chevron_right</span>
                  </button>
                </div>
              )}
            </div>
          )}
        </>
      ) : (
        <>
          <div className="bg-surface-container-lowest rounded-3xl border border-outline-variant/10 overflow-hidden">
            <table className="w-full text-left">
              <thead className="bg-surface-container-low">
                <tr className="text-xs uppercase tracking-wider text-primary">
                  <th className="px-6 py-4">Thời gian</th>
                  <th className="px-6 py-4">Sản phẩm</th>
                  <th className="px-6 py-4">Loại</th>
                  <th className="px-6 py-4">Số lượng</th>
                  <th className="px-6 py-4">Ghi chú</th>
                  <th className="px-6 py-4">Giá vốn</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/10">
                {loadingLogs ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-10 text-center text-slate-500">
                      Đang tải dữ liệu...
                    </td>
                  </tr>
                ) : logs.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-10 text-center text-slate-500">
                      Chưa có lịch sử biến động.
                    </td>
                  </tr>
                ) : (
                  pagedLogs.map((log) => {
                    const typeInfo = renderChangeType(log.changeType);
                    const quantityClass = log.quantityChanged >= 0 ? "text-emerald-700" : "text-rose-700";
                    return (
                      <tr key={log.id}>
                        <td className="px-6 py-4 text-sm text-slate-500">
                          {dateTimeFormatter.format(new Date(log.createdAt))}
                        </td>
                        <td className="px-6 py-4 text-sm font-semibold text-primary">{log.productName}</td>
                        <td className="px-6 py-4">
                          <span className={`rounded-full px-3 py-1 text-[11px] font-bold ${typeInfo.className}`}>
                            {typeInfo.label}
                          </span>
                        </td>
                        <td className={`px-6 py-4 text-sm font-bold ${quantityClass}`}>
                          {log.quantityChanged > 0 ? "+" : ""}{log.quantityChanged}
                        </td>
                        <td className="px-6 py-4 text-sm text-slate-500">{log.reason || "-"}</td>
                        <td className="px-6 py-4 text-sm text-slate-500">
                          {log.costPrice ? currency.format(log.costPrice) : "-"}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
          {!loadingLogs && sortedLogs.length > 0 && (
            <div className="flex items-center justify-between px-6 py-4 text-xs text-slate-500 border-t border-outline-variant/10">
              <span>
                Hiển thị <strong className="text-on-surface">{pagedLogs.length}</strong> / {sortedLogs.length} bản ghi
              </span>
              {sortedLogs.length > PAGE_SIZE && (
                <div className="flex items-center gap-2">
                  <button
                    className="w-8 h-8 flex items-center justify-center rounded-lg border border-outline-variant/30 text-on-surface-variant disabled:opacity-40"
                    onClick={() => setHistoryPage((prev) => Math.max(1, prev - 1))}
                    disabled={historyPage === 1}
                    type="button"
                  >
                    <span className="material-symbols-outlined text-sm">chevron_left</span>
                  </button>
                  <span className="text-xs font-semibold">Trang {historyPage} / {historyTotalPages}</span>
                  <button
                    className="w-8 h-8 flex items-center justify-center rounded-lg border border-outline-variant/30 text-on-surface-variant disabled:opacity-40"
                    onClick={() => setHistoryPage((prev) => Math.min(historyTotalPages, prev + 1))}
                    disabled={historyPage === historyTotalPages}
                    type="button"
                  >
                    <span className="material-symbols-outlined text-sm">chevron_right</span>
                  </button>
                </div>
              )}
            </div>
          )}
        </>
      )}

      <DetailModal
        isOpen={isRestockOpen}
        title="Nhập hàng"
        subtitle="Cộng thêm số lượng vào kho và lưu lịch sử."
        onClose={() => (!submitting ? (setIsRestockOpen(false), setRestockLockedId(null)) : null)}
      >
        <form className="space-y-5" onSubmit={handleRestockSubmit}>
          <div>
            <label className="text-xs font-bold uppercase tracking-widest text-slate-400">Sản phẩm</label>
            <select
              className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary/15"
              value={restockForm.productId}
              onChange={(event) => setRestockForm((prev) => ({ ...prev, productId: event.target.value }))}
              required
              disabled={restockLockedId !== null}
            >
              <option value="" disabled>
                Chọn sản phẩm
              </option>
              {(restockLockedId !== null
                ? products.filter((p) => p.id === restockLockedId)
                : products
              ).map((product) => (
                <option key={product.id} value={product.id}>
                  {product.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-xs font-bold uppercase tracking-widest text-slate-400">Số lượng muốn cộng thêm</label>
            <input
              type="number"
              min={1}
              className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary/15"
              value={restockForm.quantity}
              onChange={(event) => setRestockForm((prev) => ({ ...prev, quantity: event.target.value }))}
              required
            />
          </div>

          <div>
            <label className="text-xs font-bold uppercase tracking-widest text-slate-400">Lý do nhập kho</label>
            <textarea
              className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary/15"
              rows={3}
              value={restockForm.reason}
              onChange={(event) => setRestockForm((prev) => ({ ...prev, reason: event.target.value }))}
              placeholder="Ví dụ: Nhập lứa cá mới"
            />
          </div>

          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={() => {
                setIsRestockOpen(false);
                setRestockLockedId(null);
              }}
              className="rounded-full border border-slate-200 px-5 py-2 text-sm font-semibold text-slate-600"
              disabled={submitting}
            >
              Hủy
            </button>
            <button
              type="submit"
              className="rounded-full bg-primary px-5 py-2 text-sm font-semibold text-white"
              disabled={submitting}
            >
              {submitting ? "Đang lưu..." : "Xác nhận nhập"}
            </button>
          </div>
        </form>
      </DetailModal>

      <DetailModal
        isOpen={isExportOpen}
        title="Xuất kho"
        subtitle="Trừ số lượng tồn kho khi xuất bán hoặc hao hụt."
        onClose={() => (!submitting ? (setIsExportOpen(false), setExportLockedId(null)) : null)}
      >
        <form className="space-y-5" onSubmit={handleExportSubmit}>
          <div>
            <label className="text-xs font-bold uppercase tracking-widest text-slate-400">Sản phẩm</label>
            <select
              className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary/15"
              value={exportForm.productId}
              onChange={(event) => setExportForm((prev) => ({ ...prev, productId: event.target.value }))}
              required
              disabled={exportLockedId !== null}
            >
              <option value="" disabled>
                Chọn sản phẩm
              </option>
              {(exportLockedId !== null
                ? products.filter((p) => p.id === exportLockedId)
                : products
              ).map((product) => (
                <option key={product.id} value={product.id}>
                  {product.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-xs font-bold uppercase tracking-widest text-slate-400">Số lượng muốn trừ</label>
            <input
              type="number"
              min={1}
              className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary/15"
              value={exportForm.quantity}
              onChange={(event) => setExportForm((prev) => ({ ...prev, quantity: event.target.value }))}
              required
            />
          </div>

          <div>
            <label className="text-xs font-bold uppercase tracking-widest text-slate-400">Lý do xuất kho</label>
            <textarea
              className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary/15"
              rows={3}
              value={exportForm.reason}
              onChange={(event) => setExportForm((prev) => ({ ...prev, reason: event.target.value }))}
              placeholder="Ví dụ: Xuất bán hoặc hao hụt"
            />
          </div>

          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={() => {
                setIsExportOpen(false);
                setExportLockedId(null);
              }}
              className="rounded-full border border-slate-200 px-5 py-2 text-sm font-semibold text-slate-600"
              disabled={submitting}
            >
              Hủy
            </button>
            <button
              type="submit"
              className="rounded-full bg-rose-600 px-5 py-2 text-sm font-semibold text-white"
              disabled={submitting}
            >
              {submitting ? "Đang lưu..." : "Xác nhận xuất"}
            </button>
          </div>
        </form>
      </DetailModal>

    </div>
  );
}
