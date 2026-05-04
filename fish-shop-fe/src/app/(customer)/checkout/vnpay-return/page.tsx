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

  const icon = status === "success" ? "check_circle" : status === "pending" ? "schedule" : "error";
  const iconBg = status === "success" ? "bg-green-100 text-green-700" : status === "pending" ? "bg-amber-100 text-amber-700" : "bg-red-100 text-red-700";
  const title = status === "success" ? "Thanh toán thành công!" : status === "pending" ? "Đơn hàng đã được tạo" : "Thanh toán thất bại";

  return (
    <main className="px-6 max-w-3xl mx-auto py-20">
      <section className="bg-surface-container-lowest rounded-3xl p-8 md:p-10 shadow-[0_20px_40px_rgba(25,28,30,0.06)] border border-white/50">
        <div className="flex items-center gap-3 mb-6">
          <div className={`w-12 h-12 rounded-full flex items-center justify-center ${iconBg}`}>
            <span className="material-symbols-outlined">{icon}</span>
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-primary tracking-tight">
              {title}
            </h1>
            {orderCode ? <p className="text-sm text-on-surface-variant mt-1">Mã đơn hàng: {orderCode}</p> : null}
          </div>
        </div>

        <p className="text-on-surface-variant leading-7 mb-8">{message}</p>

        <div className="flex flex-wrap gap-3">
          <Link href="/orders" className="inline-flex items-center justify-center rounded-full bg-primary px-5 py-3 text-white font-bold">
            Xem đơn hàng
          </Link>
          <Link href="/products" className="inline-flex items-center justify-center rounded-full border border-outline-variant px-5 py-3 font-bold text-primary">
            Tiếp tục mua sắm
          </Link>
        </div>
      </section>
    </main>
  );
}