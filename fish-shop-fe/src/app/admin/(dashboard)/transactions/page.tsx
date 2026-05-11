"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { AdminTransaction } from "@/types/adminTransaction";
import { fetchAdminTransactions } from "@/services/adminTransaction.service";

const currency = new Intl.NumberFormat("vi-VN", {
  style: "currency",
  currency: "VND",
  maximumFractionDigits: 0,
});

export default function AdminTransactionsPage() {
  const [transactions, setTransactions] = useState<AdminTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selected, setSelected] = useState<AdminTransaction | null>(null);
  const didLoadRef = useRef(false);

  useEffect(() => {
    if (didLoadRef.current) {
      return;
    }
    didLoadRef.current = true;

    const loadTransactions = async () => {
      try {
        setLoading(true);
        const data = await fetchAdminTransactions();
        setTransactions(data);
      } catch (err) {
        const message = err instanceof Error ? err.message : "Không thể tải danh sách giao dịch.";
        setError(message);
      } finally {
        setLoading(false);
      }
    };

    loadTransactions();
  }, []);

  const summary = useMemo(() => {
    const success = transactions.filter((item) => item.vnpResponseCode === "00");
    const totalAmount = success.reduce((sum, item) => sum + (item.vnpAmount || 0), 0);

    return {
      totalAmount,
      totalSuccess: success.length,
      totalCount: transactions.length,
    };
  }, [transactions]);

  const formatDateTime = (value?: string | null) => {
    if (!value) return "-";
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? "-" : date.toLocaleString("vi-VN");
  };

  return (
    <div className="p-8 space-y-8 min-h-screen">
      <section className="grid grid-cols-12 gap-6">
        <div className="col-span-12 lg:col-span-8 bg-gradient-to-br from-primary to-primary-container rounded-[2rem] p-8 text-white relative overflow-hidden shadow-2xl shadow-primary/20">
          <div className="relative z-10">
            <p className="text-primary-fixed opacity-80 text-sm font-semibold tracking-widest uppercase mb-2">Tổng quan doanh thu</p>
            <h2 className="text-4xl font-extrabold tracking-tighter mb-6">
              {currency.format(summary.totalAmount)}
            </h2>
            <div className="flex gap-12">
              <div>
                <p className="text-xs text-primary-fixed opacity-70 mb-1">Giao dịch thành công</p>
                <p className="text-xl font-bold">{summary.totalSuccess}</p>
              </div>
              <div>
                <p className="text-xs text-primary-fixed opacity-70 mb-1">Tổng giao dịch</p>
                <p className="text-xl font-bold">{summary.totalCount}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="col-span-12 lg:col-span-4 bg-surface-container-low rounded-[2rem] p-8 flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-start mb-4">
              <span className="material-symbols-outlined p-3 bg-secondary-container text-on-secondary-container rounded-2xl">account_balance</span>
              <span className="text-[10px] font-bold py-1 px-2 bg-primary/10 text-primary rounded-full uppercase tracking-tighter">Hôm nay</span>
            </div>
            <p className="text-sm text-slate-500 font-medium">Doanh thu VNPay</p>
            <p className="text-2xl font-extrabold text-on-surface mt-1">{currency.format(summary.totalAmount)}</p>
          </div>
          <div className="mt-4 pt-4 border-t border-slate-200">
            <div className="flex items-center gap-2 text-xs font-semibold text-secondary">
              <span className="material-symbols-outlined text-sm">check_circle</span>
              <span>Đang đồng bộ dữ liệu giao dịch</span>
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

      <section className="bg-surface-container-lowest rounded-[2rem] overflow-hidden">
        <div className="px-8 py-6 flex justify-between items-center border-b border-surface-container">
          <h3 className="text-lg font-bold text-on-surface">Nhật ký giao dịch chi tiết</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-surface-container-low/50 text-slate-500 text-[10px] font-bold uppercase tracking-widest">
                <th className="px-8 py-4">VNP Reference</th>
                <th className="px-6 py-4">Order ID</th>
                <th className="px-6 py-4">Số tiền</th>
                <th className="px-6 py-4">Ngân hàng</th>
                <th className="px-6 py-4">Thời gian</th>
                <th className="px-6 py-4">Trạng thái</th>
                <th className="px-8 py-4 text-right">Hành động</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-container text-sm">
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-8 py-6 text-center text-on-surface-variant">
                    Đang tải dữ liệu...
                  </td>
                </tr>
              ) : transactions.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-8 py-6 text-center text-on-surface-variant">
                    Chưa có giao dịch nào.
                  </td>
                </tr>
              ) : (
                transactions.map((item) => {
                  const isSuccess = item.vnpResponseCode === "00";
                  return (
                    <tr key={item.id} className="hover:bg-surface-container-low/30 transition-colors group">
                      <td className="px-8 py-5 font-mono text-xs text-primary font-bold">{item.vnpTxnRef || "-"}</td>
                      <td className="px-6 py-5 font-semibold text-on-surface">#{item.orderCode || "-"}</td>
                      <td className="px-6 py-5 font-extrabold text-on-surface">
                        {item.vnpAmount ? currency.format(item.vnpAmount) : "-"}
                      </td>
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 bg-slate-100 rounded flex items-center justify-center text-[10px] font-bold text-slate-400">
                            {item.vnpBankCode || "--"}
                          </div>
                          <span className="text-xs font-medium">{item.vnpBankCode || "Không rõ"}</span>
                        </div>
                      </td>
                      <td className="px-6 py-5 text-slate-500 text-xs">{formatDateTime(item.vnpPayDate || item.createdAt)}</td>
                      <td className="px-6 py-5">
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold ${
                          isSuccess ? "bg-green-100 text-green-700" : "bg-error-container text-error"
                        }`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${isSuccess ? "bg-green-500" : "bg-error"}`}></span>
                          {item.vnpResponseCode || "--"} - {isSuccess ? "THÀNH CÔNG" : "THẤT BẠI"}
                        </span>
                      </td>
                      <td className="px-8 py-5 text-right">
                        <button
                          className="px-3 py-1.5 rounded-lg bg-surface-container-highest text-primary text-[10px] font-bold opacity-0 group-hover:opacity-100 transition-all hover:bg-primary hover:text-white"
                          onClick={() => setSelected(item)}
                          type="button"
                        >
                          VIEW RAW JSON
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </section>

      {selected && (
        <section className="bg-surface-container-lowest rounded-[2rem] p-6 border border-outline-variant/10">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-lg font-bold text-primary">Raw JSON: {selected.vnpTxnRef}</h4>
            <button
              className="px-3 py-1.5 rounded-lg bg-surface-container-high text-xs font-bold"
              onClick={() => setSelected(null)}
              type="button"
            >
              Đóng
            </button>
          </div>
          <pre className="text-xs text-on-surface-variant overflow-x-auto bg-surface-container-highest p-4 rounded-xl">
{JSON.stringify(selected.rawResponse ?? {}, null, 2)}
          </pre>
        </section>
      )}
    </div>
  );
}
