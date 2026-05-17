"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { AdminTransaction } from "@/types/adminTransaction";
import { fetchAdminTransactionSummary, fetchAdminTransactions } from "@/services/adminTransaction.service";

const currency = new Intl.NumberFormat("vi-VN", {
  style: "currency",
  currency: "VND",
  maximumFractionDigits: 0,
});

export default function AdminTransactionsPage() {
  const [transactions, setTransactions] = useState<AdminTransaction[]>([]);
  const [summary, setSummary] = useState({ totalRevenue: 0, totalOnline: 0, totalCash: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filterMethod, setFilterMethod] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const didLoadRef = useRef(false);
  const intervalRef = useRef<number | null>(null);
  const PAGE_SIZE = 5;

  // Load and poll transactions so admin view stays up-to-date when payments arrive
  useEffect(() => {
    if (didLoadRef.current) return;
    didLoadRef.current = true;

    const loadTransactions = async () => {
      try {
        setLoading(true);
        const [data, summaryData] = await Promise.all([
          fetchAdminTransactions(),
          fetchAdminTransactionSummary(),
        ]);
        setTransactions(data);
        setSummary(summaryData);
        setError(null);
        setCurrentPage(1);
      } catch (err) {
        const message = err instanceof Error ? err.message : "Không thể tải danh sách giao dịch.";
        setError(message);
      } finally {
        setLoading(false);
      }
    };

    loadTransactions();

    // Poll every 10 seconds as a fallback
    intervalRef.current = window.setInterval(loadTransactions, 10000) as unknown as number;

    // Subscribe to SSE for real-time updates
    let unsubscribe: (() => void) | null = null;

    import("@/lib/sse").then(({ subscribeToSse }) => {
      try {
        unsubscribe = subscribeToSse("/api/stream/admin", (ev: MessageEvent & { type?: string }) => {
          try {
            const data = JSON.parse(ev.data);
            const evType = ev.type || (data && data.eventName) || "message";
            if (evType === "orderCreated" || evType === "orderUpdate" || evType === "transaction") {
              loadTransactions();
            }
          } catch (e) {
            // ignore malformed events
          }
        });
      } catch (e) {
        // ignore
      }
    }).catch(() => {
      // ignore
    });

    return () => {
      if (intervalRef.current) window.clearInterval(intervalRef.current);
      if (unsubscribe) unsubscribe();
    };
  }, []);

  const refreshNow = async () => {
    try {
      setLoading(true);
      const [data, summaryData] = await Promise.all([
        fetchAdminTransactions(),
        fetchAdminTransactionSummary(),
      ]);
      setTransactions(data);
      setSummary(summaryData);
      setError(null);
      setCurrentPage(1);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Không thể tải danh sách giao dịch.";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const filteredTransactions = useMemo(() => {
    const sortedTransactions = [...transactions].sort((a, b) => {
      const dateDiff = new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      return dateDiff !== 0 ? dateDiff : b.id - a.id;
    });

    if (filterMethod === "all") {
      return sortedTransactions;
    }
    return sortedTransactions.filter((item) => item.paymentMethod === filterMethod);
  }, [transactions, filterMethod]);

  const totalPages = Math.max(1, Math.ceil(filteredTransactions.length / PAGE_SIZE));
  const pagedTransactions = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return filteredTransactions.slice(start, start + PAGE_SIZE);
  }, [currentPage, filteredTransactions]);

  useEffect(() => {
    setCurrentPage((prev) => Math.min(prev, totalPages));
  }, [totalPages]);

  const formatDateTime = (value?: string | null) => {
    if (!value) return "-";
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? "-" : date.toLocaleString("vi-VN");
  };

  return (
    <div className="p-8 space-y-8 min-h-screen">
      <section className="grid grid-cols-12 gap-6">
        <div className="col-span-12 lg:col-span-4 bg-linear-to-br from-primary to-primary-container rounded-4xl p-8 text-white relative overflow-hidden shadow-2xl shadow-primary/20">
          <div className="relative z-10">
            <p className="text-primary-fixed opacity-80 text-sm font-semibold tracking-widest uppercase mb-2">Tổng doanh thu</p>
            <h2 className="text-3xl font-extrabold tracking-tighter">
              {currency.format(summary.totalRevenue)}
            </h2>
          </div>
        </div>

        <div className="col-span-12 lg:col-span-4 bg-surface-container-low rounded-4xl p-8">
          <div className="flex items-center gap-3 mb-4">
            <span className="material-symbols-outlined p-3 bg-primary/10 text-primary rounded-2xl">account_balance</span>
            <div>
              <p className="text-sm text-slate-500 font-medium">Doanh thu VNPay</p>
              <p className="text-2xl font-extrabold text-on-surface">{currency.format(summary.totalOnline)}</p>
            </div>
          </div>
        </div>

        <div className="col-span-12 lg:col-span-4 bg-surface-container-low rounded-4xl p-8">
          <div className="flex items-center gap-3 mb-4">
            <span className="material-symbols-outlined p-3 bg-amber-100 text-amber-700 rounded-2xl">payments</span>
            <div>
              <p className="text-sm text-slate-500 font-medium">Doanh thu COD</p>
              <p className="text-2xl font-extrabold text-on-surface">{currency.format(summary.totalCash)}</p>
            </div>
          </div>
        </div>
      </section>

      {error && (
        <div className="rounded-xl bg-error/10 text-error text-sm px-4 py-3 flex items-center gap-2">
          <span className="material-symbols-outlined text-base">error</span>
          {error}
        </div>
      )}

      <section className="bg-surface-container-lowest rounded-4xl overflow-hidden">
        <div className="px-8 py-6 flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-surface-container">
          <h3 className="text-lg font-bold text-on-surface">Nhật ký giao dịch chi tiết</h3>
          <div className="flex items-center gap-3">
            <label className="text-xs font-bold uppercase tracking-widest text-on-surface-variant">Phương thức</label>
            <select
              className="bg-surface-container-highest rounded-full px-4 py-2 text-xs font-semibold"
              value={filterMethod}
              onChange={(event) => setFilterMethod(event.target.value)}
            >
              <option value="all">Tất cả</option>
              <option value="VNPAY">Chỉ xem VNPay</option>
              <option value="COD">Chỉ xem COD</option>
            </select>
            <button
              className="ml-3 bg-primary text-white text-xs px-4 py-2 rounded-full font-semibold"
              onClick={refreshNow}
            >
              Làm mới
            </button>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-surface-container-low/50 text-slate-500 text-[10px] font-bold uppercase tracking-widest">
                <th className="px-8 py-4">Mã tham chiếu</th>
                <th className="px-6 py-4">Đơn hàng</th>
                <th className="px-6 py-4">Số tiền</th>
                <th className="px-6 py-4">Phương thức</th>
                <th className="px-6 py-4">Thời gian</th>
                <th className="px-6 py-4">Trạng thái</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-container text-sm">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-8 py-6 text-center text-on-surface-variant">
                    Đang tải dữ liệu...
                  </td>
                </tr>
              ) : filteredTransactions.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-8 py-6 text-center text-on-surface-variant">
                    Chưa có giao dịch nào.
                  </td>
                </tr>
              ) : (
                pagedTransactions.map((item) => {
                  const isSuccess = item.status === "SUCCESS";
                  const isVnpay = item.paymentMethod === "VNPAY";
                  return (
                    <tr key={item.id} className="hover:bg-surface-container-low/30 transition-colors group">
                      <td className="px-8 py-5 font-mono text-xs text-primary font-bold">{item.referenceCode || "-"}</td>
                      <td className="px-6 py-5 font-semibold text-on-surface">#{item.orderCode || "-"}</td>
                      <td className="px-6 py-5 font-extrabold text-on-surface">
                        {item.amount ? currency.format(item.amount) : "-"}
                      </td>
                      <td className="px-6 py-5">
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold ${
                          isVnpay ? "bg-blue-100 text-blue-700" : "bg-amber-100 text-amber-700"
                        }`}>
                          {isVnpay ? "VNPAY" : "COD"}
                        </span>
                      </td>
                      <td className="px-6 py-5 text-slate-500 text-xs">{formatDateTime(item.createdAt)}</td>
                      <td className="px-6 py-5">
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold ${
                          isSuccess ? "bg-green-100 text-green-700" : "bg-error-container text-error"
                        }`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${isSuccess ? "bg-green-500" : "bg-error"}`}></span>
                          {isSuccess ? "THÀNH CÔNG" : "THẤT BẠI"}
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
        {!loading && filteredTransactions.length > 0 && (
          <div className="flex items-center justify-between px-8 py-4 text-xs text-slate-500 border-t border-surface-container">
            <span>
              Hiển thị <strong className="text-on-surface">{pagedTransactions.length}</strong> / {filteredTransactions.length} giao dịch
            </span>
            {filteredTransactions.length > PAGE_SIZE && (
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
      </section>
    </div>
  );
}
