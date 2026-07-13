import Link from "next/link";

type VnpayReturnPageProps = {
  searchParams?: Promise<{
    status?: string;
    orderCode?: string;
    message?: string;
  }>;
};

export default async function VnpayReturnPage({ searchParams }: VnpayReturnPageProps) {
  const params = await searchParams;
  const status = params?.status === "success" ? "success" : params?.status === "pending" ? "pending" : "failed";
  const orderCode = params?.orderCode || "";
  const message = params?.message || (status === "success" ? "Thanh toán thành công." : status === "pending" ? "Đơn hàng đang chờ xác nhận." : "Thanh toán thất bại.");

  // Styling maps based on status
  const config = {
    success: {
      icon: "check_circle",
      colorClass: "text-emerald-500",
      bgClass: "bg-emerald-50 dark:bg-emerald-950/30",
      borderClass: "border-emerald-200 dark:border-emerald-800/50",
      glowClass: "shadow-emerald-500/10",
      title: "Thanh toán thành công!",
      badgeLabel: "Đã thanh toán",
      badgeClass: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/50 dark:text-emerald-300",
    },
    pending: {
      icon: "schedule",
      colorClass: "text-amber-500",
      bgClass: "bg-amber-50 dark:bg-amber-950/30",
      borderClass: "border-amber-200 dark:border-amber-800/50",
      glowClass: "shadow-amber-500/10",
      title: "Đơn hàng đang chờ xử lý",
      badgeLabel: "Đang chờ xác nhận",
      badgeClass: "bg-amber-100 text-amber-800 dark:bg-amber-900/50 dark:text-amber-300",
    },
    failed: {
      icon: "cancel",
      colorClass: "text-rose-500",
      bgClass: "bg-rose-50 dark:bg-rose-950/30",
      borderClass: "border-rose-200 dark:border-rose-800/50",
      glowClass: "shadow-rose-500/10",
      title: "Thanh toán thất bại",
      badgeLabel: "Lỗi thanh toán",
      badgeClass: "bg-rose-100 text-rose-800 dark:bg-rose-900/50 dark:text-rose-300",
    }
  }[status];

  const currentDateTime = new Intl.DateTimeFormat("vi-VN", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date());

  return (
    <main className="flex-1 flex items-center justify-center px-4 py-16 md:py-24 bg-gradient-to-b from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900 min-h-[75vh]">
      <section className={`w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl p-8 md:p-10 shadow-2xl border ${config.borderClass} ${config.glowClass} text-center space-y-8 transition-all`}>

        {/* Animated Glow Icon */}
        <div className="flex flex-col items-center justify-center">
          <div className={`w-20 h-20 rounded-full flex items-center justify-center ${config.bgClass} relative`}>
            {/* Pulsing outer circle */}
            <span className={`absolute inset-0 rounded-full ${config.bgClass} animate-ping opacity-75`} />
            <span className={`material-symbols-outlined text-5xl relative z-10 ${config.colorClass}`} style={{ fontVariationSettings: "'FILL' 1" }}>
              {config.icon}
            </span>
          </div>
        </div>

        {/* Heading & Status Message */}
        <div className="space-y-3">
          <h1 className="text-2xl md:text-3xl font-black text-slate-800 dark:text-white tracking-tight">
            {config.title}
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 max-w-sm mx-auto leading-relaxed">
            {message}
          </p>
        </div>

        {/* Structured Order Information Card */}
        <div className="border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/20 rounded-2xl p-5 text-left text-sm space-y-4">
          <div className="flex justify-between items-center pb-3 border-b border-slate-100 dark:border-slate-800">
            <span className="text-slate-400 font-medium">Mã đơn hàng</span>
            <span className="font-bold text-slate-800 dark:text-slate-200 font-mono text-base">{orderCode || "N/A"}</span>
          </div>
          <div className="flex justify-between items-center pb-3 border-b border-slate-100 dark:border-slate-800">
            <span className="text-slate-400 font-medium">Trạng thái</span>
            <span className={`px-3 py-1 rounded-full text-xs font-bold ${config.badgeClass}`}>
              {config.badgeLabel}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-slate-400 font-medium">Thời gian giao dịch</span>
            <span className="font-semibold text-slate-700 dark:text-slate-300">{currentDateTime}</span>
          </div>
        </div>

        {/* Navigation Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 pt-4">
          <Link
            href="/profile?tab=orders"
            className="flex-1 inline-flex items-center justify-center rounded-full bg-[#005B71] hover:bg-[#004253] text-white py-3 px-6 text-sm font-bold shadow-lg shadow-teal-900/10 hover:shadow-teal-900/20 transition-all duration-200 scale-95 active:scale-100"
          >
            Xem đơn hàng
          </Link>
          <Link
            href="/products"
            className="flex-1 inline-flex items-center justify-center rounded-full border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 py-3 px-6 text-sm font-bold transition-all duration-200 scale-95 active:scale-100"
          >
            Tiếp tục mua sắm
          </Link>
        </div>

      </section>
    </main>
  );
}