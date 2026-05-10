"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import DetailModal from "@/components/common/DetailModal";
import ToastMessage from "@/components/common/ToastMessage";
import { InventoryService } from "@/services/inventory.service";
import { ProductService } from "@/services/product.service";
import { InventoryAdjustRequest, InventoryRestockRequest, StockChangeType, StockLogResponse } from "@/types/inventory";
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

type ActiveTab = "inventory" | "history";

type RestockFormState = {
  productId: string;
  quantity: string;
  costPrice: string;
  reason: string;
};

type AdjustFormState = {
  productId: string;
  newQuantity: string;
  changeType: StockChangeType;
  reason: string;
};

export default function AdminInventoryPage() {
  const [products, setProducts] = useState<ProductResponse[]>([]);
  const [logs, setLogs] = useState<StockLogResponse[]>([]);
  const [activeTab, setActiveTab] = useState<ActiveTab>("inventory");
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [loadingLogs, setLoadingLogs] = useState(true);
  const [isRestockOpen, setIsRestockOpen] = useState(false);
  const [isAdjustOpen, setIsAdjustOpen] = useState(false);
  const [restockForm, setRestockForm] = useState<RestockFormState>({
    productId: "",
    quantity: "",
    costPrice: "",
    reason: "",
  });
  const [adjustForm, setAdjustForm] = useState<AdjustFormState>({
    productId: "",
    newQuantity: "",
    changeType: "ADJUST",
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
    } catch (error) {
      console.error(error);
      showToast("Không thể tải danh sách sản phẩm.", "error");
    } finally {
      setLoadingProducts(false);
    }
  }, [showToast]);

  const fetchLogs = useCallback(async () => {
    try {
      const data = await InventoryService.getLogs(80);
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

  const totalOutOfStock = useMemo(() => products.filter((p) => p.stockQuantity <= 0).length, [products]);
  const totalLowStock = useMemo(() => products.filter((p) => p.stockQuantity > 0 && p.stockQuantity < 10).length, [products]);

  const openRestock = (product?: ProductResponse) => {
    setRestockForm({
      productId: product ? String(product.id) : products[0] ? String(products[0].id) : "",
      quantity: "",
      costPrice: "",
      reason: "",
    });
    setIsRestockOpen(true);
  };

  const openAdjust = (product?: ProductResponse) => {
    setAdjustForm({
      productId: product ? String(product.id) : products[0] ? String(products[0].id) : "",
      newQuantity: product ? String(product.stockQuantity) : "",
      changeType: "ADJUST",
      reason: "",
    });
    setIsAdjustOpen(true);
  };

  const handleRestockSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    const quantity = Number(restockForm.quantity);
    const productId = Number(restockForm.productId);

    if (!productId || Number.isNaN(quantity) || quantity <= 0) {
      showToast("Vui lòng nhập sản phẩm và số lượng hợp lệ.", "error");
      return;
    }

    const costPrice = restockForm.costPrice ? Number(restockForm.costPrice) : null;
    if (restockForm.costPrice && Number.isNaN(costPrice)) {
      showToast("Giá vốn không hợp lệ.", "error");
      return;
    }

    const payload: InventoryRestockRequest = {
      productId,
      quantity,
      costPrice,
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

  const handleAdjustSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    const newQuantity = Number(adjustForm.newQuantity);
    const productId = Number(adjustForm.productId);

    if (!productId || Number.isNaN(newQuantity) || newQuantity < 0) {
      showToast("Vui lòng nhập số lượng mới hợp lệ.", "error");
      return;
    }

    const payload: InventoryAdjustRequest = {
      productId,
      newQuantity,
      changeType: adjustForm.changeType,
      reason: adjustForm.reason.trim() ? adjustForm.reason.trim() : null,
    };

    try {
      setSubmitting(true);
      await InventoryService.adjust(payload);
      showToast("Điều chỉnh kho thành công.", "success");
      setIsAdjustOpen(false);
      fetchProducts();
      fetchLogs();
    } catch (error) {
      console.error(error);
      showToast("Điều chỉnh kho thất bại.", "error");
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
            className="px-5 py-2.5 rounded-full bg-primary text-white text-sm font-semibold shadow-lg shadow-primary/20 hover:opacity-90"
          >
            <span className="material-symbols-outlined text-sm mr-2">add</span>
            Nhập hàng
          </button>
          <button
            type="button"
            onClick={() => openAdjust()}
            className="px-5 py-2.5 rounded-full bg-surface-container-high text-primary text-sm font-semibold hover:bg-primary hover:text-white transition-colors"
          >
            <span className="material-symbols-outlined text-sm mr-2">tune</span>
            Điều chỉnh
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
        <div className="bg-surface-container-lowest rounded-3xl border border-outline-variant/10 overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-surface-container-low">
              <tr className="text-xs uppercase tracking-wider text-primary">
                <th className="px-6 py-4">Sản phẩm</th>
                <th className="px-6 py-4">SKU</th>
                <th className="px-6 py-4">Giá bán</th>
                <th className="px-6 py-4">Tồn kho</th>
                <th className="px-6 py-4"></th>
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
                products.map((product) => {
                  const stock = product.stockQuantity ?? 0;
                  const rowClass = stock <= 0 ? "bg-rose-50/70" : stock < 10 ? "bg-amber-50/70" : "";
                  const badgeClass = stock <= 0
                    ? "bg-rose-100 text-rose-700"
                    : stock < 10
                      ? "bg-amber-100 text-amber-700"
                      : "bg-emerald-100 text-emerald-700";
                  const badgeLabel = stock <= 0 ? "Hết hàng" : stock < 10 ? "Sắp hết" : "Ổn định";

                  return (
                    <tr key={product.id} className={`transition-colors ${rowClass}`}>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-4">
                          <img
                            src={getMainImage(product)}
                            alt={product.name}
                            className="h-12 w-12 rounded-xl object-cover bg-surface-container-high"
                          />
                          <div>
                            <p className="text-sm font-semibold text-primary">{product.name}</p>
                            <span className={`mt-1 inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-bold ${badgeClass}`}>
                              {badgeLabel}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-500">{product.sku || "-"}</td>
                      <td className="px-6 py-4 text-sm font-semibold text-primary">{currency.format(product.price)}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <span className="text-lg font-bold text-primary">{stock}</span>
                          <span className="text-xs text-slate-500">con</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="inline-flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => openRestock(product)}
                            className="rounded-full border border-primary/20 px-4 py-1.5 text-xs font-bold text-primary hover:bg-primary hover:text-white transition-colors"
                          >
                            Nhập hàng
                          </button>
                          <button
                            type="button"
                            onClick={() => openAdjust(product)}
                            className="rounded-full border border-slate-200 px-4 py-1.5 text-xs font-bold text-slate-600 hover:bg-slate-100"
                          >
                            Điều chỉnh
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
      ) : (
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
                logs.map((log) => {
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
      )}

      <DetailModal
        isOpen={isRestockOpen}
        title="Nhập hàng"
        subtitle="Cộng thêm số lượng vào kho và lưu lịch sử."
        onClose={() => (!submitting ? setIsRestockOpen(false) : null)}
      >
        <form className="space-y-5" onSubmit={handleRestockSubmit}>
          <div>
            <label className="text-xs font-bold uppercase tracking-widest text-slate-400">Sản phẩm</label>
            <select
              className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary/15"
              value={restockForm.productId}
              onChange={(event) => setRestockForm((prev) => ({ ...prev, productId: event.target.value }))}
              required
            >
              <option value="" disabled>
                Chọn sản phẩm
              </option>
              {products.map((product) => (
                <option key={product.id} value={product.id}>
                  {product.name}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold uppercase tracking-widest text-slate-400">Số lượng nhập</label>
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
              <label className="text-xs font-bold uppercase tracking-widest text-slate-400">Giá vốn (tuỳ chọn)</label>
              <input
                type="number"
                min={0}
                className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary/15"
                value={restockForm.costPrice}
                onChange={(event) => setRestockForm((prev) => ({ ...prev, costPrice: event.target.value }))}
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-bold uppercase tracking-widest text-slate-400">Ghi chú</label>
            <textarea
              className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary/15"
              rows={3}
              value={restockForm.reason}
              onChange={(event) => setRestockForm((prev) => ({ ...prev, reason: event.target.value }))}
              placeholder="Ví dụ: Nhập lứa cá Koi mới"
            />
          </div>

          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={() => setIsRestockOpen(false)}
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
        isOpen={isAdjustOpen}
        title="Điều chỉnh kho"
        subtitle="Cập nhật số lượng thực tế sau kiểm kê hoặc sự cố."
        onClose={() => (!submitting ? setIsAdjustOpen(false) : null)}
      >
        <form className="space-y-5" onSubmit={handleAdjustSubmit}>
          <div>
            <label className="text-xs font-bold uppercase tracking-widest text-slate-400">Sản phẩm</label>
            <select
              className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary/15"
              value={adjustForm.productId}
              onChange={(event) => setAdjustForm((prev) => ({ ...prev, productId: event.target.value }))}
              required
            >
              <option value="" disabled>
                Chọn sản phẩm
              </option>
              {products.map((product) => (
                <option key={product.id} value={product.id}>
                  {product.name}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold uppercase tracking-widest text-slate-400">Số lượng mới</label>
              <input
                type="number"
                min={0}
                className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary/15"
                value={adjustForm.newQuantity}
                onChange={(event) => setAdjustForm((prev) => ({ ...prev, newQuantity: event.target.value }))}
                required
              />
            </div>
            <div>
              <label className="text-xs font-bold uppercase tracking-widest text-slate-400">Loại biến động</label>
              <select
                className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary/15"
                value={adjustForm.changeType}
                onChange={(event) => setAdjustForm((prev) => ({ ...prev, changeType: event.target.value as StockChangeType }))}
              >
                <option value="ADJUST">Điều chỉnh</option>
                <option value="IMPORT">Nhập kho</option>
                <option value="EXPORT">Xuất kho / cá chết</option>
                <option value="RETURN">Hoàn hàng</option>
              </select>
            </div>
          </div>

          <div>
            <label className="text-xs font-bold uppercase tracking-widest text-slate-400">Ghi chú</label>
            <textarea
              className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary/15"
              rows={3}
              value={adjustForm.reason}
              onChange={(event) => setAdjustForm((prev) => ({ ...prev, reason: event.target.value }))}
              placeholder="Ví dụ: Cá hao hụt do vận chuyển"
            />
          </div>

          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={() => setIsAdjustOpen(false)}
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
              {submitting ? "Đang lưu..." : "Xác nhận"}
            </button>
          </div>
        </form>
      </DetailModal>
    </div>
  );
}
