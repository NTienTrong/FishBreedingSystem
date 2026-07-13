"use client";

import { useEffect, useMemo, useRef, useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import dynamic from "next/dynamic";

const OrderTrackingMap = dynamic(
  () => import("@/components/customer/orders/OrderTrackingMap"),
  { ssr: false }
);

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
  ghnOrderCode?: string | null;
  orderStatus: string;
  paymentMethod?: string | null;
  paymentStatus?: string | null;
  totalAmount: number;
  createdAt: string;
  latitude?: number | null;
  longitude?: number | null;
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

const STATUS_COLORS: Record<string, string> = {
  PENDING_PAYMENT: "bg-amber-50 dark:bg-amber-950/20 text-amber-600 dark:text-amber-400 border border-amber-200/50 dark:border-amber-900/30",
  PENDING: "bg-sky-50 dark:bg-sky-950/20 text-sky-600 dark:text-sky-400 border border-sky-200/50 dark:border-sky-900/30",
  PENDING_REFUND: "bg-purple-50 dark:bg-purple-950/20 text-purple-600 dark:text-purple-400 border border-purple-200/50 dark:border-purple-900/30",
  PROCESSING: "bg-blue-50 dark:bg-blue-950/20 text-blue-600 dark:text-blue-400 border border-blue-200/50 dark:border-blue-900/30",
  DELIVERING: "bg-indigo-50 dark:bg-indigo-950/20 text-indigo-600 dark:text-indigo-400 border border-indigo-200/50 dark:border-indigo-900/30",
  COMPLETED: "bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400 border border-emerald-200/50 dark:border-emerald-900/30",
  CANCELLED: "bg-rose-50 dark:bg-rose-950/20 text-rose-600 dark:text-rose-400 border border-rose-200/50 dark:border-rose-900/30",
};

const PAYMENT_LABELS: Record<string, string> = {
  UNPAID: "Chưa thanh toán",
  PAID: "Đã thanh toán",
  FAILED: "Thất bại",
  REFUNDED: "Đã hoàn tiền",
};

function OrdersPageContent() {
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
  
  // Status filter and pagination states
  const [statusFilter, setStatusFilter] = useState<"all" | "pending" | "completed" | "cancelled">("all");
  const [currentPage, setCurrentPage] = useState(1);
  const ORDER_PAGE_SIZE = 5;
  
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

  // Subscribe to SSE per-order to receive real-time updates
  useEffect(() => {
    if (orders.length === 0) return;
    const unsubscribes: Array<() => void> = [];

    try {
      import("@/lib/sse").then(({ subscribeToSse }) => {
        orders.forEach((order) => {
          const path = `/api/stream/orders/${encodeURIComponent(order.orderCode)}`;
          const unsub = subscribeToSse(path, (ev: MessageEvent & { type?: string }) => {
            try {
              const data = JSON.parse(ev.data);
              const payload = data;
              if (!payload || !payload.orderCode) return;

              setOrders((prev) => prev.map((o) => {
                if (o.orderCode === payload.orderCode) {
                  return {
                    ...o,
                    orderStatus: payload.orderStatus ?? o.orderStatus,
                    paymentStatus: payload.paymentStatus ?? o.paymentStatus,
                    totalAmount: payload.totalAmount ?? o.totalAmount,
                  };
                }
                return o;
              }));
            } catch (e) {
              // ignore
            }
          });

          if (typeof unsub === "function") unsubscribes.push(unsub);
        });
      }).catch(() => {});
    } catch (e) {
      // ignore
    }

    return () => {
      unsubscribes.forEach((u) => u());
    };
  }, [orders]);

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

  // Sort, filter and paginate
  const sortedOrders = useMemo(() => {
    return [...orders].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }, [orders]);

  const filteredOrders = useMemo(() => {
    return sortedOrders.filter((order) => {
      if (statusFilter === "all") return true;
      if (statusFilter === "pending") return order.orderStatus === "PENDING_PAYMENT" || order.paymentStatus === "UNPAID";
      if (statusFilter === "cancelled") return order.orderStatus === "CANCELLED";
      return order.orderStatus === "COMPLETED";
    });
  }, [statusFilter, sortedOrders]);

  const totalPages = Math.max(1, Math.ceil(filteredOrders.length / ORDER_PAGE_SIZE));
  const pagedOrders = useMemo(() => {
    const start = (currentPage - 1) * ORDER_PAGE_SIZE;
    return filteredOrders.slice(start, start + ORDER_PAGE_SIZE);
  }, [filteredOrders, currentPage]);

  useEffect(() => {
    setCurrentPage(1);
  }, [statusFilter]);

  const headerSubtitle = useMemo(() => {
    if (loading) return "Đang tải dữ liệu đơn hàng...";
    if (orders.length === 0) return "Bạn chưa có đơn hàng nào.";
    return "Theo dõi tình trạng các chú cá bạn đã đặt.";
  }, [loading, orders.length]);

  return (
    <main className="px-4 sm:px-6 max-w-5xl mx-auto pb-24 pt-6">
      {/* Breadcrumbs */}
      <nav className="flex items-center gap-2 text-xs font-semibold text-on-surface-variant/70 mb-4">
        <Link href="/" className="hover:text-primary transition-colors flex items-center gap-1">
          <span className="material-symbols-outlined text-sm">home</span> Trang chủ
        </Link>
        <span className="material-symbols-outlined text-[12px] text-on-surface-variant/40">chevron_right</span>
        <span className="text-primary font-bold">Đơn hàng</span>
      </nav>

      {/* Hero Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#005B71] to-[#008ba8] p-8 md:p-10 text-white shadow-lg mb-8 border border-white/10">
        <div className="relative z-10 max-w-xl">
          <span className="inline-block rounded-full bg-white/20 px-3.5 py-1 text-xs font-bold uppercase tracking-wider mb-3 backdrop-blur-md">
            Khách hàng
          </span>
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight">Đơn hàng của tôi</h1>
          <p className="mt-2 text-white/80 text-sm md:text-base font-medium">{headerSubtitle}</p>
        </div>
        <div className="absolute right-0 bottom-0 top-0 w-1/3 opacity-15 hidden md:flex items-center justify-center">
          <span className="material-symbols-outlined text-[180px] select-none translate-y-6">package_2</span>
        </div>
      </div>

      {/* Notifications */}
      {error && (
        <div className="mb-6 rounded-2xl bg-rose-50 dark:bg-rose-950/20 text-rose-700 dark:text-rose-300 text-sm px-4 py-3 flex items-center gap-2 border border-rose-100 dark:border-rose-900/30 shadow-sm">
          <span className="material-symbols-outlined text-base">error</span>
          <span className="font-semibold">{error}</span>
        </div>
      )}

      {successMessage && (
        <div className="mb-6 rounded-2xl bg-emerald-50 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-300 text-sm px-4 py-3 flex items-center gap-2 border border-emerald-100 dark:border-emerald-900/30 shadow-sm">
          <span className="material-symbols-outlined text-base">check_circle</span>
          <span className="font-semibold">{successMessage}</span>
        </div>
      )}

      {loading ? (
        <div className="flex flex-col items-center justify-center rounded-3xl bg-surface-container-low p-16 text-center text-on-surface-variant border border-slate-100 dark:border-slate-800 shadow-inner">
          <span className="material-symbols-outlined text-3xl animate-spin text-primary mb-3">progress_activity</span>
          <p className="font-medium text-sm">Đang tải danh sách đơn hàng...</p>
        </div>
      ) : orders.length === 0 ? (
        <div className="rounded-3xl bg-surface-container-low p-16 text-center text-on-surface-variant border border-slate-100 dark:border-slate-800 shadow-inner">
          <span className="material-symbols-outlined text-4xl text-on-surface-variant/40 mb-3">inbox</span>
          <p className="font-semibold">Bạn chưa có đơn hàng nào.</p>
          <Link href="/products" className="mt-4 inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-primary text-white font-bold hover:shadow-md transition-all text-sm">
            Mua sắm ngay <span className="material-symbols-outlined text-sm">shopping_cart</span>
          </Link>
        </div>
      ) : (
        <section className="space-y-6">
          {/* Status Filters */}
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800/80 pb-4">
            <h2 className="text-base font-bold text-slate-800 dark:text-slate-200">Danh sách đơn hàng</h2>
            <div className="flex flex-wrap items-center gap-1.5">
              {[
                { id: "all", label: "Tất cả" },
                { id: "pending", label: "Chờ thanh toán" },
                { id: "completed", label: "Hoàn thành" },
                { id: "cancelled", label: "Đã hủy" },
              ].map((filter) => (
                <button
                  key={filter.id}
                  type="button"
                  className={`px-4 py-2 rounded-full text-xs font-bold transition-all ${
                    statusFilter === filter.id
                      ? "bg-primary text-white shadow-sm"
                      : "bg-surface-container-high text-on-surface-variant hover:bg-surface-container-highest"
                  }`}
                  onClick={() => setStatusFilter(filter.id as typeof statusFilter)}
                >
                  {filter.label}
                </button>
              ))}
            </div>
          </div>

          {filteredOrders.length === 0 ? (
            <div className="rounded-3xl bg-surface-container-low p-12 text-center text-on-surface-variant/70 border border-slate-100 dark:border-slate-800 shadow-inner">
              Không có đơn hàng phù hợp bộ lọc.
            </div>
          ) : (
            <div className="space-y-6">
              {pagedOrders.map((order) => (
                <div
                  key={order.id}
                  className="bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-sm border border-slate-100/80 dark:border-slate-800/80 transition-all duration-300 hover:shadow-md hover:border-slate-200/50"
                >
                  {/* Order Card Header */}
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-50 dark:border-slate-800/40 pb-4 mb-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2.5">
                        <span className="material-symbols-outlined text-primary text-lg">receipt_long</span>
                        <h3 className="text-base font-extrabold text-primary">#{order.orderCode}</h3>
                        <span className={`px-3 py-0.5 rounded-full text-xs font-bold ${STATUS_COLORS[order.orderStatus] ?? "bg-surface-container-high text-on-surface-variant"}`}>
                          {STATUS_LABELS[order.orderStatus] ?? order.orderStatus}
                        </span>
                      </div>
                      <p className="text-xs font-semibold text-on-surface-variant/70 pl-7">
                        Ngày đặt: {new Date(order.createdAt).toLocaleDateString("vi-VN")} • {new Date(order.createdAt).toLocaleTimeString("vi-VN", { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="text-base font-black text-primary">{currency.format(order.totalAmount)}</span>
                    </div>
                  </div>

                  {/* Quick summary of items */}
                  <div className="space-y-3 mb-4">
                    {order.items.slice(0, 2).map((item) => (
                      <div key={item.productId} className="flex items-center gap-3">
                        <div className="h-10 w-10 overflow-hidden rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-800 flex-shrink-0">
                          {item.imageUrl ? (
                            <img className="h-full w-full object-cover" src={item.imageUrl} alt={item.name} />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center text-[10px] text-on-surface-variant">🐟</div>
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">{item.name}</p>
                          <p className="text-[10px] text-on-surface-variant/70">Số lượng: {item.quantity} • {currency.format(item.price)}</p>
                        </div>
                      </div>
                    ))}
                    {order.items.length > 2 && (
                      <p className="text-[11px] font-semibold text-on-surface-variant/70 pl-13">
                        + và {order.items.length - 2} sản phẩm khác
                      </p>
                    )}
                  </div>

                  {/* Order Actions */}
                  <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-50 dark:border-slate-800/40">
                    <div className="flex flex-wrap gap-2">
                      {order.orderStatus === "PENDING" && order.paymentMethod === "COD" && (
                        <button
                          className="px-4 py-2 rounded-full bg-rose-50 hover:bg-rose-100 text-rose-600 font-bold text-xs transition-colors border border-rose-100"
                          type="button"
                          onClick={() => setActionOrder(order)}
                        >
                          Hủy đơn
                        </button>
                      )}
                      {order.orderStatus === "PENDING" && order.paymentMethod === "VNPAY" && order.paymentStatus === "PAID" && (
                        <button
                          className="px-4 py-2 rounded-full bg-amber-50 hover:bg-amber-100 text-amber-600 font-bold text-xs transition-colors border border-amber-100"
                          type="button"
                          onClick={() => setActionOrder(order)}
                        >
                          Yêu cầu hủy & Hoàn tiền
                        </button>
                      )}
                      {order.orderStatus === "PROCESSING" && (
                        <span className="text-xs font-semibold text-on-surface-variant/70 bg-surface-container-low px-3 py-1.5 rounded-xl border border-slate-100 dark:border-slate-800/60 flex items-center gap-1">
                          <span className="material-symbols-outlined text-sm">support_agent</span> Vui lòng gọi hotline để hủy đơn
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      {(order.orderStatus === "DELIVERING" || order.orderStatus === "COMPLETED") && (
                        <button
                          className="px-4.5 py-2 rounded-full bg-primary text-white font-bold text-xs flex items-center gap-1.5 hover:bg-primary/90 transition-all hover:scale-[1.02] shadow-sm"
                          type="button"
                          onClick={() => setExpandedOrderId(expandedOrderId === order.id ? null : order.id)}
                        >
                          <span className="material-symbols-outlined text-sm">local_shipping</span>
                          Theo dõi đơn hàng
                        </button>
                      )}
                      <button
                        className="px-4 py-2 rounded-full bg-surface-container-high text-primary font-bold text-xs hover:bg-surface-container-highest transition-colors"
                        type="button"
                        onClick={() => setExpandedOrderId(expandedOrderId === order.id ? null : order.id)}
                      >
                        {expandedOrderId === order.id ? "Thu gọn" : "Xem chi tiết"}
                      </button>
                    </div>
                  </div>

                  {/* Expanded detail drawer */}
                  {expandedOrderId === order.id && (
                    <div className="mt-5 space-y-4 pt-4 border-t border-slate-100 dark:border-slate-800">
                      <div className="flex flex-wrap gap-4 text-xs font-bold text-on-surface-variant/80 bg-slate-50 dark:bg-slate-800/30 p-3 rounded-2xl">
                        {order.paymentMethod && <span className="flex items-center gap-1"><span className="material-symbols-outlined text-sm">payments</span>Thanh toán: {order.paymentMethod}</span>}
                        {order.paymentStatus && <span className="flex items-center gap-1"><span className="material-symbols-outlined text-sm">info</span>Trạng thái: {PAYMENT_LABELS[order.paymentStatus] ?? order.paymentStatus}</span>}
                      </div>

                      <div className="space-y-2.5">
                        <p className="text-xs font-black text-slate-800 dark:text-slate-200">Chi tiết sản phẩm</p>
                        {order.items.map((item) => (
                          <div
                            key={item.productId}
                            className="flex items-center justify-between gap-4 rounded-2xl bg-slate-50/55 dark:bg-slate-800/20 p-4 border border-slate-100/50 dark:border-slate-800/40"
                          >
                            <div className="flex items-center gap-3 min-w-0">
                              <div className="h-12 w-12 overflow-hidden rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200/40 flex-shrink-0">
                                {item.imageUrl ? (
                                  <img className="h-full w-full object-cover" src={item.imageUrl} alt={item.name} />
                                ) : (
                                  <div className="flex h-full w-full items-center justify-center text-xs text-on-surface-variant">🐟</div>
                                )}
                              </div>
                              <div className="min-w-0">
                                <p className="font-bold text-xs text-primary truncate">{item.name}</p>
                                <p className="text-[10px] text-on-surface-variant/80 font-semibold">Số lượng: {item.quantity} • {currency.format(item.price)}</p>
                              </div>
                            </div>
                            <span className="font-extrabold text-xs text-primary">{currency.format(item.lineTotal)}</span>
                          </div>
                        ))}
                      </div>
                      
                      {/* Order Tracking Map for DELIVERING and COMPLETED orders */}
                      {(order.orderStatus === "DELIVERING" || order.orderStatus === "COMPLETED") && (
                        <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
                          <OrderTrackingMap
                            orderCode={order.orderCode}
                            status={order.orderStatus}
                            latitude={order.latitude}
                            longitude={order.longitude}
                          />
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}

              {/* Pagination controls */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between text-xs text-on-surface-variant/80 pt-4 bg-white/40 dark:bg-slate-900/10 px-2">
                  <span className="font-bold">
                    Trang <strong className="text-primary text-sm font-black">{currentPage}</strong> / {totalPages}
                  </span>
                  <div className="flex items-center gap-1.5">
                    <button
                      className="w-9 h-9 flex items-center justify-center rounded-xl bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-850 hover:bg-slate-50 dark:hover:bg-slate-800 text-on-surface-variant disabled:opacity-40 disabled:cursor-not-allowed shadow-sm transition-all"
                      type="button"
                      onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                      disabled={currentPage === 1}
                    >
                      <span className="material-symbols-outlined text-base">chevron_left</span>
                    </button>
                    <button
                      className="w-9 h-9 flex items-center justify-center rounded-xl bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-850 hover:bg-slate-50 dark:hover:bg-slate-800 text-on-surface-variant disabled:opacity-40 disabled:cursor-not-allowed shadow-sm transition-all"
                      type="button"
                      onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                      disabled={currentPage === totalPages}
                    >
                      <span className="material-symbols-outlined text-base">chevron_right</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </section>
      )}

      {/* Cancel Order Modal */}
      {actionOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/55 backdrop-blur-xs px-4">
          <div className="w-full max-w-md rounded-3xl bg-white dark:bg-slate-900 p-6 shadow-2xl border border-slate-100 dark:border-slate-800">
            <h3 className="text-lg font-extrabold text-primary mb-2">
              {actionOrder.paymentMethod === "VNPAY" ? "Yêu cầu hoàn tiền" : "Hủy đơn hàng"}
            </h3>
            <p className="text-xs text-on-surface-variant/80 mb-4 font-semibold">
              Vui lòng nhập lý do hủy để chúng tôi hỗ trợ xử lý nhanh hơn.
            </p>
            <textarea
              className="w-full rounded-2xl border border-slate-200/80 dark:border-slate-800 p-3.5 text-xs outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 dark:bg-slate-950 transition-all font-semibold"
              rows={3}
              placeholder="Lý do hủy đơn..."
              value={cancelReason}
              onChange={(event) => setCancelReason(event.target.value)}
            />
            <div className="mt-5 flex justify-end gap-2.5">
              <button
                className="px-5 py-2 rounded-full bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs transition-colors"
                type="button"
                onClick={closeModal}
                disabled={submitting}
              >
                Đóng
              </button>
              <button
                className="px-5 py-2 rounded-full bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-sm transition-all disabled:opacity-50"
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

export default function OrdersPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-slate-500 font-bold">Đang tải đơn hàng...</div>}>
      <OrdersPageContent />
    </Suspense>
  );
}
