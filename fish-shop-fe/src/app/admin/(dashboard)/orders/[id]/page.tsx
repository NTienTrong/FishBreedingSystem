"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { approveAdminRefund, fetchAdminOrderById, updateAdminOrderStatus } from "@/services/adminOrder.service";
import type { AdminOrder } from "@/types/adminOrder";

const STATUS_LABELS: Record<string, string> = {
  PENDING_PAYMENT: "Chờ thanh toán",
  PENDING: "Chờ xác nhận",
  PENDING_REFUND: "Yêu cầu hoàn tiền",
  PROCESSING: "Đang xử lý",
  DELIVERING: "Đang giao",
  COMPLETED: "Hoàn thành",
  CANCELLED: "Đã hủy",
};

const PAYMENT_STATUS_LABELS: Record<string, string> = {
  UNPAID: "Chưa thanh toán",
  PAID: "Đã thanh toán",
  FAILED: "Thất bại",
  REFUNDED: "Đã hoàn tiền",
};

const PAYMENT_METHOD_LABELS: Record<string, string> = {
  VNPAY: "VNPay",
  COD: "COD",
};

const currency = new Intl.NumberFormat("vi-VN", {
  style: "currency",
  currency: "VND",
  maximumFractionDigits: 0,
});

const dateTimeFormatter = new Intl.DateTimeFormat("vi-VN", {
  dateStyle: "medium",
  timeStyle: "short",
});

const formatDateTime = (value?: string | null) => {
  if (!value) return "-";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "-" : dateTimeFormatter.format(date);
};

const statusOptions = Object.keys(STATUS_LABELS);

export default function AdminOrderDetailsPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const orderId = Number(params.id);

  const [order, setOrder] = useState<AdminOrder | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [orderStatus, setOrderStatus] = useState<string>("");

  useEffect(() => {
    const loadOrder = async () => {
      if (!Number.isFinite(orderId)) {
        setError("Mã đơn hàng không hợp lệ.");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const data = await fetchAdminOrderById(orderId);
        setOrder(data);
        setOrderStatus(data.orderStatus);
      } catch (err) {
        const nextMessage = err instanceof Error ? err.message : "Không thể tải chi tiết đơn hàng.";
        setError(nextMessage);
      } finally {
        setLoading(false);
      }
    };

    loadOrder();
  }, [orderId]);

  const summaryItems = useMemo(() => {
    if (!order) {
      return [];
    }

    const subtotal = order.items.reduce((sum, item) => sum + Number(item.lineTotal || 0), 0);
    return [
      { label: "Tạm tính", value: currency.format(subtotal) },
      { label: "Phí vận chuyển", value: currency.format(Number(order.shippingFee || 0)) },
      { label: "Tổng cộng", value: currency.format(Number(order.totalAmount || 0)), highlight: true },
    ];
  }, [order]);

  const handleSaveStatus = async () => {
    if (!order) return;

    try {
      setSaving(true);
      const updated = await updateAdminOrderStatus(order.id, { orderStatus });
      setOrder(updated);
      setMessage("Cập nhật trạng thái đơn hàng thành công.");
    } catch (err) {
      const nextMessage = err instanceof Error ? err.message : "Không thể cập nhật trạng thái.";
      setError(nextMessage);
    } finally {
      setSaving(false);
    }
  };

  const handleApproveRefund = async () => {
    if (!order) return;

    try {
      setSaving(true);
      const response = await approveAdminRefund(order.id);
      setMessage(response.message);
      const refreshed = await fetchAdminOrderById(order.id);
      setOrder(refreshed);
      setOrderStatus(refreshed.orderStatus);
    } catch (err) {
      const nextMessage = err instanceof Error ? err.message : "Không thể xác nhận hoàn tiền.";
      setError(nextMessage);
    } finally {
      setSaving(false);
    }
  };

  const renderField = (label: string, value: React.ReactNode) => (
    <div>
      <p className="text-[10px] uppercase tracking-widest text-slate-400 font-bold mb-1">{label}</p>
      <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700">{value ?? "-"}</div>
    </div>
  );

  if (loading) {
    return <div className="p-8 text-slate-500">Đang tải chi tiết đơn hàng...</div>;
  }

  if (error && !order) {
    return (
      <div className="p-8 space-y-4">
        <div className="rounded-xl bg-error/10 text-error text-sm px-4 py-3 flex items-center gap-2">
          <span className="material-symbols-outlined text-base">error</span>
          {error}
        </div>
        <Link href="/admin/orders" className="inline-flex rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-white">
          Quay lại danh sách
        </Link>
      </div>
    );
  }

  if (!order) {
    return null;
  }

  const isRefundable = order.orderStatus === "PENDING_REFUND";
  const canEditStatus = !(order.orderStatus === "COMPLETED" || order.orderStatus === "CANCELLED");

  return (
    <div className="p-8 min-h-screen pb-24">
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-8">
        <div>
          <div className="flex items-center gap-3 text-sm text-slate-500 mb-2">
            <Link href="/admin/orders" className="hover:text-primary transition-colors">Đơn hàng</Link>
            <span>/</span>
            <span>#{order.orderCode}</span>
          </div>
          <h1 className="text-3xl font-extrabold text-primary tracking-tight">Chi tiết đơn hàng #{order.orderCode}</h1>
          <p className="text-on-surface-variant font-medium">Biểu mẫu chi tiết cho phép xem và cập nhật nhanh trạng thái đơn hàng.</p>
        </div>

        <div className="flex flex-wrap gap-3">
          <Link href="/admin/orders" className="px-6 py-2.5 rounded-full border border-outline-variant text-primary font-bold text-sm hover:bg-surface-container-low transition-colors">
            Hủy
          </Link>
          {/* <button
            type="button"
            onClick={handleSaveStatus}
            disabled={saving}
            className="px-8 py-2.5 rounded-full bg-linear-to-br from-primary to-primary-container text-white font-bold text-sm shadow-lg shadow-primary/20 hover:scale-[1.02] transition-transform disabled:opacity-70 disabled:hover:scale-100"
          >
            {saving ? "Đang lưu..." : "Lưu trạng thái"}
          </button> */}
        </div>
      </div>

      {error && (
        <div className="mb-6 rounded-xl bg-error/10 text-error text-sm px-4 py-3 flex items-center gap-2">
          <span className="material-symbols-outlined text-base">error</span>
          {error}
        </div>
      )}

      {message && (
        <div className="mb-6 rounded-xl bg-emerald-50 text-emerald-700 text-sm px-4 py-3 flex items-center gap-2">
          <span className="material-symbols-outlined text-base">check_circle</span>
          {message}
        </div>
      )}

      <div className="grid grid-cols-12 gap-6">
        <div className="col-span-12 lg:col-span-8 space-y-6">
          <section className="bg-surface-container-lowest rounded-3xl border border-outline-variant/10 p-8 shadow-sm">
            <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6">
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-slate-400 font-bold mb-2">Tổng quan</p>
                <h2 className="text-2xl font-extrabold text-on-surface">#{order.orderCode}</h2>
                <p className="mt-2 text-sm text-on-surface-variant">Tạo lúc {formatDateTime(order.createdAt)}</p>
              </div>

              <div className="flex flex-wrap gap-2">
                <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-700">{STATUS_LABELS[order.orderStatus] || order.orderStatus}</span>
                <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-bold text-blue-700">{PAYMENT_METHOD_LABELS[order.paymentMethod || ""] || order.paymentMethod || "-"}</span>
                <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-700">{PAYMENT_STATUS_LABELS[order.paymentStatus || ""] || order.paymentStatus || "-"}</span>
              </div>
            </div>

            <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
              {renderField("Khách hàng", order.customerName || order.recipientName || "-")}
              {renderField("Số điện thoại", order.customerPhone || order.recipientPhone || "-")}
              {renderField("Email", order.customerEmail || "-")}
              <div className="md:col-span-2">{renderField("Địa chỉ giao hàng", order.shippingAddress || "-")}</div>
              {renderField("Ghi chú", order.orderNote || "-")}
            </div>
          </section>

          <section className="bg-surface-container-lowest rounded-3xl border border-outline-variant/10 p-8 shadow-sm">
            <div className="flex items-center justify-between gap-4 mb-6">
              <div>
                <h3 className="text-xl font-bold text-on-surface">Cập nhật đơn hàng</h3>
                <p className="text-sm text-on-surface-variant">Chọn trạng thái rồi lưu để áp dụng thay đổi.</p>
              </div>
              <span className="material-symbols-outlined text-primary text-3xl">edit_note</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-primary uppercase tracking-widest mb-2">Trạng thái</label>
                <select
                  className="w-full bg-surface-container-highest border-none rounded-2xl px-4 py-3 text-on-surface focus:ring-2 focus:ring-primary/20 outline-none disabled:opacity-60"
                  value={orderStatus}
                  onChange={(event) => setOrderStatus(event.target.value)}
                  disabled={!canEditStatus}
                >
                  {statusOptions.map((status) => (
                    <option key={status} value={status}>
                      {STATUS_LABELS[status]}
                    </option>
                  ))}
                </select>
                {!canEditStatus && (
                  <p className="mt-2 text-[12px] text-on-surface-variant">Trạng thái đơn này không được phép chỉnh sửa.</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold text-primary uppercase tracking-widest mb-2">Phương thức thanh toán</label>
                <div className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700">
                  {PAYMENT_METHOD_LABELS[order.paymentMethod || ""] || order.paymentMethod || "-"}
                </div>
              </div>
            </div>

            {isRefundable && (
              <div className="mt-4 rounded-2xl border border-amber-200 bg-amber-50 p-4">
                <p className="text-sm font-semibold text-amber-800 mb-3">Đơn này đang chờ xác nhận hoàn tiền.</p>
                <button
                  type="button"
                  onClick={handleApproveRefund}
                  disabled={saving}
                  className="rounded-full bg-amber-500 px-5 py-2.5 text-sm font-semibold text-white hover:opacity-90 disabled:opacity-70"
                >
                  Xác nhận đã hoàn tiền
                </button>
              </div>
            )}

            <div className="mt-6 flex justify-end">
              <button
                type="button"
                onClick={handleSaveStatus}
                disabled={saving || !canEditStatus}
                className="px-8 py-2.5 rounded-full bg-linear-to-br from-primary to-primary-container text-white font-bold text-sm shadow-lg shadow-primary/20 hover:scale-[1.02] transition-transform disabled:opacity-70 disabled:hover:scale-100"
              >
                {saving ? "Đang lưu..." : "Lưu trạng thái"}
              </button>
            </div>

          </section>

          <section className="bg-surface-container-lowest rounded-3xl border border-outline-variant/10 p-8 shadow-sm">
            <div className="flex items-center justify-between gap-4 mb-6">
              <div>
                <h3 className="text-xl font-bold text-on-surface">Sản phẩm trong đơn</h3>
                <p className="text-sm text-on-surface-variant">Danh sách mặt hàng và giá trị từng dòng.</p>
              </div>
              <span className="material-symbols-outlined text-primary text-3xl">inventory_2</span>
            </div>

            <div className="overflow-x-auto rounded-2xl border border-slate-200">
              <table className="w-full text-left">
                <thead className="bg-surface-container-low">
                  <tr className="text-[10px] uppercase tracking-widest text-primary">
                    <th className="px-5 py-4">Sản phẩm</th>
                    <th className="px-5 py-4">SKU</th>
                    <th className="px-5 py-4">Số lượng</th>
                    <th className="px-5 py-4">Đơn giá</th>
                    <th className="px-5 py-4">Thành tiền</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white">
                  {order.items.map((item) => (
                    <tr key={`${item.productId}-${item.name}`}>
                      <td className="px-5 py-4">
                        <div className="font-semibold text-on-surface">{item.name}</div>
                        <div className="text-xs text-slate-400">ID sản phẩm #{item.productId}</div>
                      </td>
                      <td className="px-5 py-4 text-sm text-slate-600">{item.sku || "-"}</td>
                      <td className="px-5 py-4 text-sm font-semibold text-on-surface">{item.quantity}</td>
                      <td className="px-5 py-4 text-sm font-semibold text-on-surface">{currency.format(Number(item.price || 0))}</td>
                      <td className="px-5 py-4 text-sm font-bold text-primary">{currency.format(Number(item.lineTotal || 0))}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </div>

        <div className="col-span-12 lg:col-span-4 space-y-6">
          <section className="bg-primary rounded-3xl p-6 text-white shadow-2xl shadow-primary/20">
            <p className="text-xs uppercase tracking-[0.35em] text-primary-fixed/80 font-bold mb-2">Tổng đơn</p>
            <div className="text-4xl font-extrabold tracking-tight">{currency.format(Number(order.totalAmount || 0))}</div>
            <p className="mt-2 text-sm text-primary-fixed/80">Bao gồm phí vận chuyển và các dòng sản phẩm.</p>
          </section>

          <section className="bg-surface-container-lowest rounded-3xl border border-outline-variant/10 p-6 shadow-sm space-y-4">
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined text-primary">receipt_long</span>
              <h3 className="text-lg font-bold text-on-surface">Tóm tắt thanh toán</h3>
            </div>
            {summaryItems.map((item) => (
              <div key={item.label} className={`flex items-center justify-between rounded-2xl px-4 py-3 ${item.highlight ? "bg-surface-container-low" : "bg-slate-50"}`}>
                <span className="text-sm text-on-surface-variant">{item.label}</span>
                <span className={`font-semibold ${item.highlight ? "text-primary text-lg" : "text-on-surface"}`}>{item.value}</span>
              </div>
            ))}
          </section>

          <section className="bg-surface-container-lowest rounded-3xl border border-outline-variant/10 p-6 shadow-sm space-y-4">
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined text-primary">info</span>
              <h3 className="text-lg font-bold text-on-surface">Thông tin khác</h3>
            </div>
            {renderField("Mã đơn", `#${order.orderCode}`)}
            {renderField("Trạng thái hiện tại", STATUS_LABELS[order.orderStatus] || order.orderStatus)}
            {renderField("Ngày tạo", formatDateTime(order.createdAt))}
            {renderField("Lý do hủy", order.cancelReason || "-")}
          </section>
        </div>
      </div>
    </div>
  );
}