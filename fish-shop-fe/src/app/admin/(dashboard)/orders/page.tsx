"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { AdminOrder } from "@/types/adminOrder";
import { approveAdminRefund, fetchAdminOrders, updateAdminOrderStatus } from "@/services/adminOrder.service";

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

const ORDER_STATUSES = Object.keys(STATUS_LABELS);

const currency = new Intl.NumberFormat("vi-VN", {
  style: "currency",
  currency: "VND",
  maximumFractionDigits: 0,
});

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState("all");
  const [paymentFilter, setPaymentFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [expandedOrderId, setExpandedOrderId] = useState<number | null>(null);
  const [refundMessage, setRefundMessage] = useState<string | null>(null);
  const didLoadRef = useRef(false);

  useEffect(() => {
    if (didLoadRef.current) {
      return;
    }
    didLoadRef.current = true;

    const loadOrders = async () => {
      try {
        setLoading(true);
        const data = await fetchAdminOrders();
        setOrders(data);
      } catch (err) {
        const message = err instanceof Error ? err.message : "Không thể tải danh sách đơn hàng.";
        setError(message);
      } finally {
        setLoading(false);
      }
    };

    loadOrders();
  }, []);

  const filteredOrders = useMemo(() => {
    const query = search.trim().toLowerCase();

    return orders.filter((order) => {
      const statusMatch = statusFilter === "all" || order.orderStatus === statusFilter;
      const paymentMatch = paymentFilter === "all" || order.paymentMethod === paymentFilter;
      const queryMatch =
        !query
        || order.orderCode.toLowerCase().includes(query)
        || (order.customerName ?? "").toLowerCase().includes(query)
        || (order.customerEmail ?? "").toLowerCase().includes(query);

      return statusMatch && paymentMatch && queryMatch;
    });
  }, [orders, statusFilter, paymentFilter, search]);

  const handleStatusUpdate = async (orderId: number, nextStatus: string) => {
    try {
      const updated = await updateAdminOrderStatus(orderId, { orderStatus: nextStatus });
      setOrders((prev) => prev.map((order) => (order.id === updated.id ? updated : order)));
    } catch (err) {
      const message = err instanceof Error ? err.message : "Không thể cập nhật trạng thái.";
      setError(message);
    }
  };

  const handleApproveRefund = async (orderId: number) => {
    try {
      setRefundMessage(null);
      const response = await approveAdminRefund(orderId);
      setRefundMessage(response.message);
      const data = await fetchAdminOrders();
      setOrders(data);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Không thể xác nhận hoàn tiền.";
      setError(message);
    }
  };

  const formatDate = (value?: string | null) => {
    if (!value) return "-";
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? "-" : date.toLocaleDateString("vi-VN");
  };

  return (
    <div className="p-8 max-w-7xl w-full mx-auto space-y-8">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="relative">
          <span className="absolute -top-6 -left-2 text-6xl font-black text-primary opacity-[0.03] select-none">ORDERS</span>
          <h1 className="text-4xl font-extrabold text-primary tracking-tight -mb-1">Danh sách Đơn hàng</h1>
          <p className="text-on-surface-variant font-medium">Theo dõi đơn hàng và trạng thái thanh toán.</p>
        </div>
        <div className="flex gap-3">
          <input
            className="px-4 py-2.5 rounded-full bg-surface-container-high text-sm font-semibold outline-none"
            placeholder="Tìm theo mã, khách hàng..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
        </div>
      </div>

      {error && (
        <div className="rounded-xl bg-error/10 text-error text-sm px-4 py-3 flex items-center gap-2">
          <span className="material-symbols-outlined text-base">error</span>
          {error}
        </div>
      )}

      {refundMessage && (
        <div className="rounded-xl bg-emerald-50 text-emerald-700 text-sm px-4 py-3 flex items-center gap-2">
          <span className="material-symbols-outlined text-base">check_circle</span>
          {refundMessage}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-5 bg-surface-container-low rounded-xl flex flex-col gap-3">
          <label className="text-[10px] font-bold uppercase tracking-widest text-primary/60">Bộ lọc trạng thái</label>
          <div className="flex flex-wrap gap-2">
            <button
              className={`px-4 py-1.5 rounded-full text-xs font-semibold ${
                statusFilter === "all" ? "bg-primary text-white" : "bg-surface-container-highest text-on-surface-variant"
              }`}
              onClick={() => setStatusFilter("all")}
              type="button"
            >
              Tất cả
            </button>
            {ORDER_STATUSES.map((status) => (
              <button
                key={status}
                className={`px-4 py-1.5 rounded-full text-xs font-semibold ${
                  statusFilter === status
                    ? status === "PENDING_REFUND"
                      ? "bg-amber-500 text-white"
                      : "bg-primary text-white"
                    : status === "PENDING_REFUND"
                      ? "bg-amber-100 text-amber-700"
                      : "bg-surface-container-highest text-on-surface-variant hover:bg-secondary-container"
                }`}
                onClick={() => setStatusFilter(status)}
                type="button"
              >
                {STATUS_LABELS[status]}
              </button>
            ))}
          </div>
        </div>

        <div className="p-5 bg-surface-container-low rounded-xl flex flex-col gap-3">
          <label className="text-[10px] font-bold uppercase tracking-widest text-primary/60">Phương thức</label>
          <select
            className="w-full bg-transparent border-none text-sm font-semibold focus:ring-0 cursor-pointer outline-none"
            value={paymentFilter}
            onChange={(event) => setPaymentFilter(event.target.value)}
          >
            <option value="all">Tất cả</option>
            <option value="VNPAY">VNPay</option>
            <option value="COD">COD</option>
          </select>
        </div>

        <div className="p-5 bg-surface-container-low rounded-xl flex flex-col gap-3">
          <label className="text-[10px] font-bold uppercase tracking-widest text-primary/60">Tổng đơn</label>
          <p className="text-2xl font-extrabold text-primary">
            {loading ? "..." : filteredOrders.length}
          </p>
          <p className="text-xs text-on-surface-variant">Đơn hàng phù hợp bộ lọc</p>
        </div>
      </div>

      <div className="bg-surface-container-lowest rounded-2xl overflow-hidden shadow-sm border border-outline-variant/10">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-surface-container-low border-b border-outline-variant/15">
              <th className="px-6 py-5 text-xs font-bold text-primary uppercase tracking-wider">Mã đơn</th>
              <th className="px-6 py-5 text-xs font-bold text-primary uppercase tracking-wider">Khách hàng</th>
              <th className="px-6 py-5 text-xs font-bold text-primary uppercase tracking-wider">Tổng tiền</th>
              <th className="px-6 py-5 text-xs font-bold text-primary uppercase tracking-wider">Thanh toán</th>
              <th className="px-6 py-5 text-xs font-bold text-primary uppercase tracking-wider">Trạng thái</th>
              <th className="px-6 py-5 text-xs font-bold text-primary uppercase tracking-wider">Ngày đặt</th>
              <th className="px-6 py-5 text-xs font-bold text-primary uppercase tracking-wider"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-outline-variant/10">
            {loading ? (
              <tr>
                <td colSpan={7} className="px-6 py-8 text-center text-on-surface-variant">
                  Đang tải dữ liệu...
                </td>
              </tr>
            ) : filteredOrders.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-6 py-8 text-center text-on-surface-variant">
                  Không có đơn hàng phù hợp.
                </td>
              </tr>
            ) : (
              filteredOrders.map((order) => (
                <tr key={order.id} className="hover:bg-surface-container-low/50 transition-colors">
                  <td className="px-6 py-4 font-mono text-sm text-primary font-bold">#{order.orderCode}</td>
                  <td className="px-6 py-4">
                    <p className="text-sm font-bold">{order.customerName || order.recipientName || "-"}</p>
                    <p className="text-[11px] text-on-surface-variant">{order.customerEmail || order.recipientPhone || "-"}</p>
                  </td>
                  <td className="px-6 py-4 text-sm font-semibold">{currency.format(order.totalAmount)}</td>
                  <td className="px-6 py-4">
                    <div className="text-xs font-medium text-on-surface-variant">
                      {order.paymentMethod || "-"}
                    </div>
                    <div className="text-[11px] text-on-surface-variant">
                      {order.paymentStatus ? PAYMENT_STATUS_LABELS[order.paymentStatus] || "-" : "-"}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                      {order.orderStatus === "PENDING_PAYMENT" ? (
                      <span className="text-xs font-semibold text-on-surface-variant">Chờ thanh toán VNPay</span>
                    ) : order.orderStatus === "PENDING_REFUND" ? (
                      <div className="flex flex-col gap-2">
                        <button
                          className="px-3 py-1.5 rounded-lg bg-amber-500 text-white text-[10px] font-bold"
                          type="button"
                          onClick={() => handleApproveRefund(order.id)}
                        >
                          Xác nhận đã hoàn tiền
                        </button>
                        <p className="text-[10px] text-on-surface-variant">
                          Chỉ dùng sau khi đã chuyển khoản hoàn tiền cho khách.
                        </p>
                      </div>
                    ) : (
                      <div className="flex flex-wrap gap-2">
                        {order.orderStatus === "PENDING" && (
                          <button
                            className="px-3 py-1.5 rounded-lg bg-primary text-white text-[10px] font-bold"
                            type="button"
                            onClick={() => handleStatusUpdate(order.id, "PROCESSING")}
                          >
                            Xác nhận
                          </button>
                        )}
                        {order.orderStatus === "PROCESSING" && (
                          <button
                            className="px-3 py-1.5 rounded-lg bg-secondary text-white text-[10px] font-bold"
                            type="button"
                            onClick={() => handleStatusUpdate(order.id, "DELIVERING")}
                          >
                            Giao hàng
                          </button>
                        )}
                        {order.orderStatus === "DELIVERING" && (
                          <button
                            className="px-3 py-1.5 rounded-lg bg-emerald-600 text-white text-[10px] font-bold"
                            type="button"
                            onClick={() => handleStatusUpdate(order.id, "COMPLETED")}
                          >
                            Hoàn thành
                          </button>
                        )}
                        {(order.orderStatus === "PENDING"
                          || order.orderStatus === "PROCESSING"
                          || order.orderStatus === "DELIVERING") && (
                          <button
                            className="px-3 py-1.5 rounded-lg bg-error text-white text-[10px] font-bold"
                            type="button"
                            onClick={() => handleStatusUpdate(order.id, "CANCELLED")}
                          >
                            Hủy
                          </button>
                        )}
                        {(order.orderStatus === "COMPLETED" || order.orderStatus === "CANCELLED") && (
                          <span className="text-xs font-semibold text-on-surface-variant">
                            {STATUS_LABELS[order.orderStatus]}
                          </span>
                        )}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 text-xs text-on-surface-variant font-medium">{formatDate(order.createdAt)}</td>
                  <td className="px-6 py-4 text-right">
                    <button
                      className="px-3 py-1.5 rounded-lg bg-surface-container-highest text-primary text-[10px] font-bold"
                      onClick={() => setExpandedOrderId(expandedOrderId === order.id ? null : order.id)}
                      type="button"
                    >
                      {expandedOrderId === order.id ? "Ẩn chi tiết" : "Xem chi tiết"}
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        {expandedOrderId && (
          <div className="px-6 py-5 border-t border-outline-variant/10 bg-surface-container-low">
            {orders
              .filter((order) => order.id === expandedOrderId)
              .map((order) => (
                <div key={order.id} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <div className="space-y-2">
                    <p className="text-xs font-bold uppercase tracking-widest text-on-surface-variant">Thông tin giao hàng</p>
                    <p className="text-sm font-semibold text-primary">{order.recipientName || "-"}</p>
                    <p className="text-xs text-on-surface-variant">{order.recipientPhone || "-"}</p>
                    <p className="text-xs text-on-surface-variant">{order.shippingAddress || "-"}</p>
                    {order.orderNote && <p className="text-xs text-on-surface-variant">Ghi chú: {order.orderNote}</p>}
                    {order.cancelReason && <p className="text-xs text-on-surface-variant">Lý do hủy: {order.cancelReason}</p>}
                  </div>
                  <div className="lg:col-span-2 space-y-3">
                    <p className="text-xs font-bold uppercase tracking-widest text-on-surface-variant">Sản phẩm</p>
                    {order.items.map((item) => (
                      <div key={item.productId} className="flex items-center justify-between text-sm">
                        <div>
                          <p className="font-semibold text-primary">{item.name}</p>
                          <p className="text-xs text-on-surface-variant">SL: {item.quantity}</p>
                        </div>
                        <span className="font-bold text-primary">{currency.format(item.lineTotal)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
          </div>
        )}
      </div>
    </div>
  );
}
