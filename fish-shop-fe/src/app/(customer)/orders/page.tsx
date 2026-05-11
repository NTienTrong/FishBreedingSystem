"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";

type CustomerOrderItem = {
  productId: number;
  name: string;
  sku?: string | null;
  imageUrl?: string | null;
  quantity: number;
  price: number;
  lineTotal: number;
};

type CustomerOrder = {
  id: number;
  orderCode: string;
  orderStatus: string;
  paymentMethod?: string | null;
  paymentStatus?: string | null;
  totalAmount: number;
  createdAt: string;
  items: CustomerOrderItem[];
};

const currency = new Intl.NumberFormat("vi-VN", {
  style: "currency",
  currency: "VND",
  maximumFractionDigits: 0,
});

const STATUS_LABELS: Record<string, string> = {
  PENDING_PAYMENT: "Chờ thanh toán",
  PENDING: "Chờ xác nhận",
  PENDING_REFUND: "Chờ hoàn tiền",
  PROCESSING: "Đang xử lý",
  DELIVERING: "Đang giao",
  COMPLETED: "Hoàn thành",
  CANCELLED: "Đã hủy",
};

const PAYMENT_LABELS: Record<string, string> = {
  UNPAID: "Chưa thanh toán",
  PAID: "Đã thanh toán",
  FAILED: "Thất bại",
  REFUNDED: "Đã hoàn tiền",
};

export default function OrdersPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [orders, setOrders] = useState<CustomerOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedOrderId, setExpandedOrderId] = useState<number | null>(null);
  const [actionOrder, setActionOrder] = useState<CustomerOrder | null>(null);
  const [cancelReason, setCancelReason] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const didLoadRef = useRef(false);

  useEffect(() => {
    if (didLoadRef.current) {
      return;
    }
    didLoadRef.current = true;

    const ensureSession = async () => {
      const sessionResponse = await fetch("/api/customer/auth/session");
      if (!sessionResponse.ok) {
        router.replace("/auth/login?returnUrl=/orders");
        return;
      }

      try {
        const response = await fetch("/api/customer/orders", { cache: "no-store" });
        if (!response.ok) {
          throw new Error("Không thể tải danh sách đơn hàng.");
        }

        const data = (await response.json()) as CustomerOrder[];
        setOrders(data);
      } catch (err) {
        const message = err instanceof Error ? err.message : "Không thể tải danh sách đơn hàng.";
        setError(message);
      } finally {
        setLoading(false);
      }
    };

    ensureSession();
  }, [router]);

  useEffect(() => {
    const code = searchParams.get("orderCode");
    if (!code || orders.length === 0) {
      return;
    }

    const matched = orders.find((order) => order.orderCode === code);
    if (matched) {
      setExpandedOrderId(matched.id);
    }
  }, [orders, searchParams]);

  const closeModal = () => {
    setActionOrder(null);
    setCancelReason("");
  };

  const handleSubmitCancel = async () => {
    if (!actionOrder) {
      return;
    }

    if (!cancelReason.trim()) {
      setError("Vui lòng nhập lý do hủy đơn.");
      return;
    }

    try {
      setSubmitting(true);
      setError(null);
      setSuccessMessage(null);

      const response = await fetch(`/api/customer/orders/${actionOrder.id}/cancel`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cancelReason: cancelReason.trim() }),
      });

      const payload = (await response.json().catch(() => ({}))) as { message?: string };
      if (!response.ok) {
        throw new Error(payload.message || "Không thể hủy đơn hàng.");
      }

      setSuccessMessage(payload.message || "Đã gửi yêu cầu.");
      closeModal();

      const ordersResponse = await fetch("/api/customer/orders", { cache: "no-store" });
      if (ordersResponse.ok) {
        const data = (await ordersResponse.json()) as CustomerOrder[];
        setOrders(data);
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : "Không thể hủy đơn hàng.";
      setError(message);
    } finally {
      setSubmitting(false);
    }
  };

  const headerSubtitle = useMemo(() => {
    if (loading) return "Đang tải dữ liệu đơn hàng...";
    if (orders.length === 0) return "Bạn chưa có đơn hàng nào.";
    return "Theo dõi tình trạng đơn hàng của bạn.";
  }, [loading, orders.length]);

  return (
    <main className="px-6 max-w-5xl mx-auto pb-20">
      <header className="mb-8">
        <nav className="flex items-center gap-2 text-sm text-on-surface-variant mb-3">
          <Link href="/" className="hover:text-primary transition-colors">Trang chủ</Link>
          <span className="material-symbols-outlined text-sm">chevron_right</span>
          <span className="text-primary font-semibold">Đơn hàng</span>
        </nav>
        <h1 className="text-3xl md:text-4xl font-black tracking-tight text-primary">Đơn hàng của tôi</h1>
        <p className="mt-2 text-on-surface-variant font-medium">{headerSubtitle}</p>
      </header>

      {error && (
        <div className="mb-6 rounded-xl bg-error/10 text-error text-sm px-4 py-3 flex items-center gap-2">
          <span className="material-symbols-outlined text-base">error</span>
          {error}
        </div>
      )}

      {successMessage && (
        <div className="mb-6 rounded-xl bg-emerald-50 text-emerald-700 text-sm px-4 py-3 flex items-center gap-2">
          <span className="material-symbols-outlined text-base">check_circle</span>
          {successMessage}
        </div>
      )}

      {loading ? (
        <div className="rounded-2xl bg-surface-container-low p-8 text-center text-on-surface-variant">
          Đang tải dữ liệu...
        </div>
      ) : orders.length === 0 ? (
        <div className="rounded-2xl bg-surface-container-low p-8 text-center text-on-surface-variant">
          Bạn chưa có đơn hàng nào.
        </div>
      ) : (
        <section className="space-y-6">
          {orders.map((order) => (
            <div key={order.id} className="bg-surface-container-low rounded-2xl p-6">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                  <h3 className="text-lg font-bold text-primary">#{order.orderCode}</h3>
                  <p className="text-sm text-on-surface-variant">
                    {new Date(order.createdAt).toLocaleDateString("vi-VN")} • {STATUS_LABELS[order.orderStatus] ?? order.orderStatus}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-lg font-black text-primary">{currency.format(order.totalAmount)}</span>
                  {order.orderStatus === "PENDING" && order.paymentMethod === "COD" && (
                    <button
                      className="px-4 py-2 rounded-full bg-error text-white font-bold"
                      type="button"
                      onClick={() => setActionOrder(order)}
                    >
                      Hủy đơn
                    </button>
                  )}
                  {order.orderStatus === "PENDING" && order.paymentMethod === "VNPAY" && order.paymentStatus === "PAID" && (
                    <button
                      className="px-4 py-2 rounded-full bg-amber-500 text-white font-bold"
                      type="button"
                      onClick={() => setActionOrder(order)}
                    >
                      Yêu cầu hủy & Hoàn tiền
                    </button>
                  )}
                  {order.orderStatus === "PROCESSING" && (
                    <span className="text-xs font-semibold text-on-surface-variant">
                      Vui lòng liên hệ hotline để hủy đơn.
                    </span>
                  )}
                  <button
                    className="px-4 py-2 rounded-full bg-surface-container-high text-primary font-bold"
                    type="button"
                    onClick={() => setExpandedOrderId(expandedOrderId === order.id ? null : order.id)}
                  >
                    {expandedOrderId === order.id ? "Thu gọn" : "Xem chi tiết"}
                  </button>
                </div>
              </div>
              {expandedOrderId === order.id && (
                <div className="mt-4 space-y-3">
                  <div className="flex flex-wrap gap-3 text-xs text-on-surface-variant">
                    {order.paymentMethod && <span>Thanh toán: {order.paymentMethod}</span>}
                    {order.paymentStatus && <span>Trạng thái: {PAYMENT_LABELS[order.paymentStatus] ?? order.paymentStatus}</span>}
                  </div>
                  {order.items.map((item) => (
                    <div key={item.productId} className="flex items-center justify-between">
                      <div>
                        <p className="font-semibold text-primary">{item.name}</p>
                        <p className="text-xs text-on-surface-variant">SL: {item.quantity}</p>
                      </div>
                      <span className="font-bold text-primary">{currency.format(item.lineTotal)}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </section>
      )}

      {actionOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
            <h3 className="text-lg font-bold text-primary mb-2">
              {actionOrder.paymentMethod === "VNPAY" ? "Yêu cầu hoàn tiền" : "Hủy đơn hàng"}
            </h3>
            <p className="text-sm text-on-surface-variant mb-4">
              Vui lòng nhập lý do để chúng tôi xử lý nhanh hơn.
            </p>
            <textarea
              className="w-full rounded-xl border border-outline-variant/30 p-3 text-sm outline-none focus:ring-2 focus:ring-primary/20"
              rows={3}
              placeholder="Lý do hủy đơn..."
              value={cancelReason}
              onChange={(event) => setCancelReason(event.target.value)}
            />
            <div className="mt-4 flex justify-end gap-3">
              <button
                className="px-4 py-2 rounded-full bg-surface-container-high text-primary font-bold"
                type="button"
                onClick={closeModal}
                disabled={submitting}
              >
                Đóng
              </button>
              <button
                className="px-4 py-2 rounded-full bg-primary text-white font-bold"
                type="button"
                onClick={handleSubmitCancel}
                disabled={submitting}
              >
                {submitting ? "Đang gửi..." : "Gửi yêu cầu"}
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
