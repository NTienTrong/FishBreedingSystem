"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { AdminOrder } from "@/types/adminOrder";
import type { AdminTransactionSummary } from "@/types/adminTransaction";
import type { ProductResponse } from "@/types/product";
import type { UserResponse } from "@/types/user";

type DashboardData = {
  orders: AdminOrder[];
  products: ProductResponse[];
  users: UserResponse[];
  summary: AdminTransactionSummary | null;
};

type RevenuePoint = {
  label: string;
  value: number;
};

type CategoryShare = {
  name: string;
  percent: number;
  color: string;
};

type TopProduct = {
  id: number;
  name: string;
  sku?: string | null;
  categoryLabel: string;
  quantity: number;
  revenue: number;
  imageUrl: string | null;
  trendPercent: number;
};

const lowStockThreshold = 5;

const chartColors = ["#FFD166", "#8ED1FC", "#CDB4DB"];

async function fetchJson<T>(url: string): Promise<T> {
  const response = await fetch(url, {
    cache: "no-store",
    credentials: "include",
    headers: {
      "Cache-Control": "no-store",
    },
  });

  if (!response.ok) {
    const message = await response.text();
    throw new Error(message || "Không thể tải dữ liệu dashboard.");
  }

  return response.json() as Promise<T>;
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(value);
}

function formatNumber(value: number) {
  return new Intl.NumberFormat("vi-VN").format(value);
}

function getDateKey(date: Date) {
  return date.toISOString().slice(0, 10);
}

function addDays(date: Date, days: number) {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
}

function startOfDay(date: Date) {
  const next = new Date(date);
  next.setHours(0, 0, 0, 0);
  return next;
}

function calculatePercentChange(current: number, previous: number) {
  if (previous <= 0 && current <= 0) {
    return 0;
  }
  if (previous <= 0) {
    return 100;
  }
  return Math.round(((current - previous) / previous) * 100);
}

export default function AdminDashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadDashboard = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const [summary, orders, products, users] = await Promise.all([
        fetchJson<AdminTransactionSummary>("/api/admin/transactions/summary"),
        fetchJson<AdminOrder[]>("/api/admin/orders"),
        fetchJson<ProductResponse[]>("/api/admin/products"),
        fetchJson<UserResponse[]>("/api/admin/users"),
      ]);

      setData({ summary, orders, products, users });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Không thể tải dữ liệu dashboard.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  const metrics = useMemo(() => {
    const orders = data?.orders ?? [];
    const products = data?.products ?? [];
    const users = data?.users ?? [];

    const totalRevenue = data?.summary?.totalRevenue ?? orders.reduce((sum, order) => sum + (order.totalAmount || 0), 0);
    const totalOrders = orders.length;
    const totalCustomers = users.filter((user) => user.role?.toUpperCase() === "CUSTOMER").length;
    const lowStockCount = products.filter((product) => (product.stockQuantity ?? 0) <= lowStockThreshold).length;

    const today = startOfDay(new Date());
    const currentPeriodStart = addDays(today, -29);
    const previousPeriodStart = addDays(today, -59);
    const previousPeriodEnd = addDays(today, -30);

    const currentRevenue = orders.reduce((sum, order) => {
      const createdAt = new Date(order.createdAt);
      if (createdAt >= currentPeriodStart && createdAt <= today) {
        return sum + (order.totalAmount || 0);
      }
      return sum;
    }, 0);

    const previousRevenue = orders.reduce((sum, order) => {
      const createdAt = new Date(order.createdAt);
      if (createdAt >= previousPeriodStart && createdAt <= previousPeriodEnd) {
        return sum + (order.totalAmount || 0);
      }
      return sum;
    }, 0);

    const currentOrders = orders.filter((order) => {
      const createdAt = new Date(order.createdAt);
      return createdAt >= currentPeriodStart && createdAt <= today;
    }).length;

    const previousOrders = orders.filter((order) => {
      const createdAt = new Date(order.createdAt);
      return createdAt >= previousPeriodStart && createdAt <= previousPeriodEnd;
    }).length;

    return {
      totalRevenue,
      totalOrders,
      totalCustomers,
      lowStockCount,
      revenueTrend: calculatePercentChange(currentRevenue, previousRevenue),
      orderTrend: calculatePercentChange(currentOrders, previousOrders),
    };
  }, [data]);

  const revenueSeries = useMemo<RevenuePoint[]>(() => {
    const orders = data?.orders ?? [];
    const today = startOfDay(new Date());
    const days = Array.from({ length: 7 }, (_, index) => addDays(today, index - 6));
    const revenueByDate = new Map<string, number>();

    orders.forEach((order) => {
      const createdAt = new Date(order.createdAt);
      const dayKey = getDateKey(createdAt);
      revenueByDate.set(dayKey, (revenueByDate.get(dayKey) ?? 0) + (order.totalAmount || 0));
    });

    return days.map((day) => {
      const dayKey = getDateKey(day);
      const label = day.toLocaleDateString("vi-VN", { weekday: "short" }).toUpperCase();
      return { label, value: revenueByDate.get(dayKey) ?? 0 };
    });
  }, [data]);

  const categoryShares = useMemo<CategoryShare[]>(() => {
    const products = data?.products ?? [];
    const categoryCounts = new Map<string, number>();

    products.forEach((product) => {
      if (product.categories?.length) {
        product.categories.forEach((category) => {
          categoryCounts.set(category.name, (categoryCounts.get(category.name) ?? 0) + 1);
        });
      } else {
        categoryCounts.set("Khác", (categoryCounts.get("Khác") ?? 0) + 1);
      }
    });

    const total = Array.from(categoryCounts.values()).reduce((sum, count) => sum + count, 0) || 1;
    const sorted = Array.from(categoryCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3);

    return sorted.map(([name, count], index) => ({
      name: name === "Khác" ? "Khác" : name,
      percent: Math.round((count / total) * 100),
      color: chartColors[index % chartColors.length],
    }));
  }, [data]);

  const categoryGradient = useMemo(() => {
    if (categoryShares.length === 0) {
      return "conic-gradient(#94A3B8 0% 100%)";
    }

    let start = 0;
    const segments = categoryShares.map((item) => {
      const segment = `${item.color} ${start}% ${start + item.percent}%`;
      start += item.percent;
      return segment;
    });
    return `conic-gradient(${segments.join(", ")})`;
  }, [categoryShares]);

  const topProducts = useMemo<TopProduct[]>(() => {
    const orders = data?.orders ?? [];
    const products = data?.products ?? [];
    const productMap = new Map<number, ProductResponse>();
    products.forEach((product) => productMap.set(product.id, product));

    const today = startOfDay(new Date());
    const last7Start = addDays(today, -6);
    const prev7Start = addDays(today, -13);
    const prev7End = addDays(today, -7);

    const aggregate = new Map<number, { quantity: number; revenue: number; last7: number; prev7: number }>();

    orders.forEach((order) => {
      const createdAt = new Date(order.createdAt);
      const inLast7 = createdAt >= last7Start && createdAt <= today;
      const inPrev7 = createdAt >= prev7Start && createdAt <= prev7End;

      order.items?.forEach((item) => {
        const existing = aggregate.get(item.productId) ?? { quantity: 0, revenue: 0, last7: 0, prev7: 0 };
        const lineRevenue = item.lineTotal || item.price * item.quantity || 0;

        existing.quantity += item.quantity || 0;
        existing.revenue += lineRevenue;

        if (inLast7) {
          existing.last7 += item.quantity || 0;
        }
        if (inPrev7) {
          existing.prev7 += item.quantity || 0;
        }

        aggregate.set(item.productId, existing);
      });
    });

    return Array.from(aggregate.entries())
      .map(([productId, stats]) => {
        const product = productMap.get(productId);
        const categoryLabel = product?.categories?.[0]?.name ?? "Khác";
        const imageUrl = product?.images?.find((image) => image.isMain)?.imageUrl
          ?? product?.images?.[0]?.imageUrl
          ?? "https://via.placeholder.com/80x80?text=Fish";

        return {
          id: productId,
          name: product?.name ?? `Sản phẩm #${productId}`,
          sku: product?.sku ?? null,
          categoryLabel,
          quantity: stats.quantity,
          revenue: stats.revenue,
          imageUrl,
          trendPercent: calculatePercentChange(stats.last7, stats.prev7),
        };
      })
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5);
  }, [data]);

  const maxRevenue = Math.max(...revenueSeries.map((point) => point.value), 0);

  const [showLowStockModal, setShowLowStockModal] = useState(false);

  const lowStockList = useMemo(() => {
    const products = data?.products ?? [];
    return products.filter((p) => (p.stockQuantity ?? 0) <= lowStockThreshold).map((p) => ({
      id: p.id,
      name: p.name,
      sku: p.sku || "",
      stockQuantity: p.stockQuantity ?? 0,
      category: p.categories?.[0]?.name ?? "Khác",
    }));
  }, [data]);

  function downloadCSV(rows: Record<string, any>[], filename = "report.csv") {
    if (!rows || rows.length === 0) return;
    const headers = Object.keys(rows[0]);
    const escape = (v: any) => `"${String(v ?? "").replace(/"/g, '""')}"`;
    const csv = [headers.join(","), ...rows.map((r) => headers.map((h) => escape(r[h])).join(","))].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  }

  function exportTopProducts() {
    const rows = topProducts.map((p) => ({
      "Tên sản phẩm": p.name,
      SKU: p.sku || "",
      Danh_mục: p.categoryLabel,
      Số_lượng: p.quantity,
      Doanh_thu: p.revenue,
      Xu_hướng: `${p.trendPercent > 0 ? "+" : ""}${p.trendPercent}%`,
    }));
    downloadCSV(rows, `top-products-${new Date().toISOString().slice(0,10)}.csv`);
  }

  function exportLowStock() {
    const rows = lowStockList.map((p) => ({
      "Tên sản phẩm": p.name,
      SKU: p.sku,
      Danh_mục: p.category,
      Tồn_kho: p.stockQuantity,
    }));
    downloadCSV(rows, `low-stock-${new Date().toISOString().slice(0,10)}.csv`);
  }

  if (loading) {
    return (
      <div className="p-8">
        <div className="bg-surface-container-low rounded-4xl p-8 text-center text-slate-500">
          Đang tải dữ liệu dashboard...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8">
        <div className="bg-surface-container-low rounded-4xl p-8 text-center text-error">
          {error}
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="p-8 space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-surface-container-low p-6 rounded-3xl relative overflow-hidden flex flex-col justify-between h-40">
            <div className="relative z-10">
              <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Tổng doanh thu</p>
              <h2 className="text-2xl font-headline font-extrabold text-primary mt-1">
                {formatCurrency(metrics.totalRevenue)}
              </h2>
            </div>
            <div className="flex items-center gap-2 text-secondary text-sm font-bold relative z-10">
              <span className="material-symbols-outlined text-sm">trending_up</span>
              {metrics.revenueTrend >= 0 ? "+" : ""}{metrics.revenueTrend}%
              <span className="text-slate-400 font-normal ml-1">so với 30 ngày trước</span>
            </div>
            <span className="material-symbols-outlined absolute -right-4 -bottom-4 text-8xl text-primary/5 rotate-12">monetization_on</span>
          </div>

          <div className="bg-surface-container-low p-6 rounded-3xl relative overflow-hidden flex flex-col justify-between h-40">
            <div className="relative z-10">
              <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Tổng đơn hàng</p>
              <h2 className="text-2xl font-headline font-extrabold text-primary mt-1">{formatNumber(metrics.totalOrders)}</h2>
            </div>
            <div className="flex items-center gap-2 text-secondary text-sm font-bold relative z-10">
              <span className="material-symbols-outlined text-sm">trending_up</span>
              {metrics.orderTrend >= 0 ? "+" : ""}{metrics.orderTrend}%
              <span className="text-slate-400 font-normal ml-1">so với 30 ngày trước</span>
            </div>
            <span className="material-symbols-outlined absolute -right-4 -bottom-4 text-8xl text-primary/5 rotate-12">shopping_bag</span>
          </div>

          <div className="bg-surface-container-low p-6 rounded-3xl relative overflow-hidden flex flex-col justify-between h-40">
            <div className="relative z-10">
              <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Tổng khách hàng</p>
              <h2 className="text-2xl font-headline font-extrabold text-primary mt-1">{formatNumber(metrics.totalCustomers)}</h2>
            </div>
            <p className="text-slate-400 text-sm relative z-10">Người dùng đang hoạt động</p>
            <span className="material-symbols-outlined absolute -right-4 -bottom-4 text-8xl text-primary/5 rotate-12">group</span>
          </div>

          <div className="bg-surface-container-highest p-6 rounded-3xl relative overflow-hidden flex flex-col justify-between h-40">
            <div className="relative z-10">
              <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Tồn kho thấp</p>
              <h2 className="text-2xl font-headline font-extrabold text-error mt-1">{formatNumber(metrics.lowStockCount)}</h2>
            </div>
            <button onClick={() => setShowLowStockModal(true)} className="text-primary text-sm font-bold flex items-center gap-1 hover:underline relative z-10">
              Xem chi tiết <span className="material-symbols-outlined text-sm">arrow_forward</span>
            </button>
            <span className="material-symbols-outlined absolute -right-4 -bottom-4 text-8xl text-error/5 rotate-12">warning</span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 bg-surface-container-low rounded-4xl p-8">
            <div className="flex justify-between items-end mb-8">
              <div>
                <h3 className="text-lg font-headline font-bold text-primary">Tăng trưởng doanh thu</h3>
                <p className="text-sm text-slate-500">Thống kê 7 ngày vừa qua</p>
              </div>
              <div className="flex gap-2">
                <span className="px-3 py-1 bg-white rounded-full text-[10px] font-bold text-primary shadow-sm">TUẦN NÀY</span>
              </div>
            </div>
            <div className="h-64 flex items-end justify-between gap-4 relative">
              <div className="absolute inset-0 flex flex-col justify-between py-2 border-b border-outline-variant/15 pointer-events-none">
                <div className="w-full border-t border-outline-variant/15"></div>
                <div className="w-full border-t border-outline-variant/15"></div>
                <div className="w-full border-t border-outline-variant/15"></div>
              </div>
              <div className="flex-1 h-full flex items-end justify-around z-10 px-4">
                {revenueSeries.map((point) => {
                  const height = maxRevenue > 0 ? Math.max(8, Math.round((point.value / maxRevenue) * 100)) : 8;
                  return (
                    <div
                      key={point.label}
                      className="w-2 bg-secondary/20 rounded-t-full transition-all hover:bg-secondary"
                      style={{ height: `${height}%` }}
                      title={formatCurrency(point.value)}
                    ></div>
                  );
                })}
              </div>
            </div>
            <div className="flex justify-between text-[10px] text-slate-400 font-bold mt-4 px-6">
              {revenueSeries.map((point) => (
                <span key={point.label}>{point.label}</span>
              ))}
            </div>
          </div>

          <div className="bg-primary text-white rounded-4xl p-8 flex flex-col">
            <h3 className="text-lg font-headline font-bold mb-2">Cơ cấu sản phẩm</h3>
            <p className="text-sm text-primary-container mb-8">Phân loại theo danh mục</p>
            <div className="relative flex-1 flex items-center justify-center">
              <div
                className="w-40 h-40 rounded-full flex items-center justify-center"
                style={{ background: categoryGradient }}
              >
                <div className="w-24 h-24 rounded-full bg-primary flex items-center justify-center">
                  <div className="text-center">
                    <span className="text-3xl font-extrabold leading-none">{categoryShares[0]?.percent ?? 0}%</span>
                    <p className="text-[10px] text-primary-container font-bold uppercase tracking-tighter">Hiệu suất</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="mt-8 space-y-3">
              {categoryShares.map((item) => (
                <div key={item.name} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }}></span>
                    <span className="text-xs font-medium">{item.name}</span>
                  </div>
                  <span className="text-xs font-bold">{item.percent}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="bg-surface-container-low rounded-4xl overflow-hidden">
          <div className="px-8 py-6 flex justify-between items-center border-b border-outline-variant/10">
            <h3 className="text-lg font-headline font-bold text-primary">Top 5 sản phẩm bán chạy nhất tháng</h3>
            <div className="flex items-center gap-3">
              <button onClick={exportTopProducts} className="text-xs font-bold text-primary px-4 py-2 bg-white rounded-full shadow-sm hover:shadow-md transition-all">Xuất báo cáo</button>
              <button onClick={() => exportTopProducts()} className="text-xs font-medium text-slate-500 px-3 py-1 rounded-full border border-outline-variant/10">Xuất CSV</button>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="text-[10px] font-bold text-slate-400 uppercase tracking-widest border-b border-outline-variant/10">
                  <th className="px-8 py-4">Sản phẩm</th>
                  <th className="px-8 py-4">Danh mục</th>
                  <th className="px-8 py-4">Số lượng</th>
                  <th className="px-8 py-4">Doanh thu</th>
                  <th className="px-8 py-4">Xu hướng</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/5">
                {topProducts.map((product) => {
                  const trendDirection = product.trendPercent > 0 ? "up" : product.trendPercent < 0 ? "down" : "flat";
                  const trendColor = trendDirection === "up" ? "text-secondary" : trendDirection === "down" ? "text-error" : "text-slate-400";
                  const trendIcon = trendDirection === "up" ? "trending_up" : trendDirection === "down" ? "trending_down" : "horizontal_rule";
                  return (
                    <tr key={product.id} className="group hover:bg-white transition-colors">
                      <td className="px-8 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg overflow-hidden bg-slate-200">
                            {product.imageUrl ? (
                              <img alt={product.name} className="w-full h-full object-cover" src={product.imageUrl} />
                            ) : null}
                          </div>
                          <div>
                            <p className="text-sm font-bold text-on-surface">{product.name}</p>
                            {product.sku ? (
                              <p className="text-[10px] text-slate-500">SKU: {product.sku}</p>
                            ) : null}
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-4">
                        <span className="px-3 py-1 bg-secondary-container text-on-secondary-container rounded-full text-[10px] font-bold">
                          {product.categoryLabel}
                        </span>
                      </td>
                      <td className="px-8 py-4 font-medium">{formatNumber(product.quantity)}</td>
                      <td className="px-8 py-4 font-bold text-primary">{formatCurrency(product.revenue)}</td>
                      <td className="px-8 py-4">
                        <div className={`flex items-center gap-1 ${trendColor}`}>
                          <span className="material-symbols-outlined text-sm">{trendIcon}</span>
                          <span className="text-xs font-bold">
                            {product.trendPercent > 0 ? "+" : ""}{product.trendPercent}%
                          </span>
                        </div>
                      </td>
                    </tr>
                  );
                })}
                {topProducts.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-8 py-6 text-center text-slate-500">
                      Chưa có dữ liệu bán hàng.
                    </td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {showLowStockModal ? (
        <div className="fixed inset-0 z-60 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/50" onClick={() => setShowLowStockModal(false)} />
          <div className="relative bg-white rounded-2xl w-[min(1200px,95%)] max-h-[80vh] overflow-auto p-6 z-70">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold">Sản phẩm tồn kho thấp</h3>
              <div className="flex items-center gap-2">
                <button onClick={exportLowStock} className="text-sm px-3 py-1 bg-primary text-white rounded-full">Xuất CSV</button>
                <button onClick={() => setShowLowStockModal(false)} className="text-sm px-3 py-1 border rounded-full">Đóng</button>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="text-sm font-bold text-slate-500 border-b">
                    <th className="px-4 py-3">Tên</th>
                    <th className="px-4 py-3">SKU</th>
                    <th className="px-4 py-3">Danh mục</th>
                    <th className="px-4 py-3">Tồn kho</th>
                    <th className="px-4 py-3">Hành động</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {lowStockList.length === 0 ? (
                    <tr><td colSpan={5} className="px-4 py-6 text-center text-slate-500">Không có sản phẩm dưới ngưỡng.</td></tr>
                  ) : (
                    lowStockList.map((p) => (
                      <tr key={p.id}>
                        <td className="px-4 py-3">{p.name}</td>
                        <td className="px-4 py-3">{p.sku}</td>
                        <td className="px-4 py-3">{p.category}</td>
                        <td className="px-4 py-3 font-bold text-error">{p.stockQuantity}</td>
                        <td className="px-4 py-3">
                          <a href={`/admin/products/${p.id}`} className="text-primary font-medium">Chi tiết</a>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      ) : null}

      {/* <div className="fixed bottom-8 right-8 z-50">
        <button className="bg-primary text-white w-14 h-14 rounded-full shadow-2xl flex items-center justify-center hover:scale-110 active:scale-95 transition-transform group">
          <span className="material-symbols-outlined text-3xl">add</span>
          <span className="absolute right-full mr-4 bg-white text-primary px-4 py-2 rounded-lg font-bold text-xs shadow-xl opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
            Tạo đơn hàng mới
          </span>
        </button>
      </div> */}
    </>
  );
}
