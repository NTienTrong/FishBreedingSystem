"use client";

import Link from "next/link";
import { useCart } from "@/components/customer/cart/CartContext";

const currency = new Intl.NumberFormat("vi-VN", {
  style: "currency",
  currency: "VND",
  maximumFractionDigits: 0,
});

export default function CartPageClient() {
  const { batches, totalBatches, totalPrice, removeBatch } = useCart();

  if (batches.length === 0) {
    return (
      <main className="px-6 max-w-7xl mx-auto pb-20">
        <section className="mb-12">
          <h1 className="font-display font-black text-5xl md:text-6xl text-primary tracking-tighter mb-4">
            Giỏ hàng của bạn
          </h1>
          <p className="text-on-surface-variant max-w-xl text-lg">
            Giỏ hàng đang trống. Hãy chọn thêm sản phẩm yêu thích nhé.
          </p>
        </section>
        <Link href="/products" className="inline-flex items-center gap-2 text-secondary font-bold hover:gap-4 transition-all">
          <span className="material-symbols-outlined">arrow_back</span>
          Tiếp tục mua sắm
        </Link>
      </main>
    );
  }

  const shippingFee = totalPrice > 0 ? 150000 : 0;
  const total = totalPrice + shippingFee;

  return (
    <main className="px-6 max-w-7xl mx-auto pb-20">
      <section className="mb-12">
        <h1 className="font-display font-black text-5xl md:text-6xl text-primary tracking-tighter mb-4">
          Giỏ hàng của bạn
        </h1>
        <p className="text-on-surface-variant max-w-xl text-lg">
          Bạn đang có {totalBatches} lượt thêm trong giỏ hàng.
        </p>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
        <div className="lg:col-span-8 space-y-6">
          {batches.map((batch, index) => {
            const batchTotalItems = batch.items.reduce((sum, item) => sum + item.quantity, 0);
            const batchTotalPrice = batch.items.reduce((sum, item) => sum + item.price * item.quantity, 0);

            return (
              <div key={batch.id} className="bg-surface-container-low rounded-2xl p-6 space-y-4">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                  <div>
                    <h3 className="font-display font-black text-2xl text-primary tracking-tight">
                      Lượt thêm #{index + 1}
                    </h3>
                    <p className="text-sm text-on-surface-variant font-medium">
                      {batchTotalItems} sản phẩm · {currency.format(batchTotalPrice)}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-3">
                    <Link
                      href={`/checkout?batchId=${batch.id}`}
                      className="inline-flex items-center gap-2 rounded-full bg-primary text-white px-5 py-2 text-sm font-bold hover:bg-primary-container transition-colors"
                    >
                      Thanh toán lượt này
                      <span className="material-symbols-outlined text-base">payments</span>
                    </Link>
                    <button
                      className="inline-flex items-center gap-2 rounded-full bg-surface-container-highest text-primary px-5 py-2 text-sm font-bold hover:bg-surface-container-high transition-colors"
                      type="button"
                      onClick={() => removeBatch(batch.id)}
                    >
                      Xóa lượt này
                      <span className="material-symbols-outlined text-base">delete</span>
                    </button>
                  </div>
                </div>

                <div className="space-y-4">
                  {batch.items.map((item) => (
                    <div key={`${batch.id}-${item.id}`} className="bg-surface-container-highest rounded-xl p-4">
                      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
                        <div className="col-span-1 md:col-span-7 flex gap-4 items-center">
                          <div className="w-20 h-20 rounded-lg overflow-hidden flex-shrink-0 bg-surface-container-high">
                            <img
                              className="w-full h-full object-cover"
                              src={item.imageUrl}
                              alt={item.name}
                            />
                          </div>
                          <div>
                            <h4 className="font-display font-bold text-lg text-primary mb-1">{item.name}</h4>
                            <p className="text-sm text-on-surface-variant font-medium">Mã: {item.sku || "Đang cập nhật"}</p>
                          </div>
                        </div>
                        <div className="col-span-1 md:col-span-2 text-center">
                          <span className="text-on-surface font-semibold">{currency.format(item.price)}</span>
                        </div>
                        <div className="col-span-1 md:col-span-1 text-center">
                          <span className="text-on-surface-variant font-semibold">x{item.quantity}</span>
                        </div>
                        <div className="col-span-1 md:col-span-2 text-right">
                          <span className="text-primary font-extrabold text-lg">
                            {currency.format(item.price * item.quantity)}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}

          <div className="flex flex-col md:flex-row gap-6 justify-between items-center pt-6">
            <Link href="/products" className="flex items-center gap-2 text-secondary font-bold hover:gap-4 transition-all">
              <span className="material-symbols-outlined">arrow_back</span>
              Tiếp tục mua sắm
            </Link>
            <div className="flex gap-4 w-full md:w-auto">
              <div className="relative flex-grow">
                <input
                  className="w-full md:w-64 bg-surface-container-highest border-none rounded-full px-6 py-3 text-sm focus:ring-2 focus:ring-primary/20 placeholder:text-on-surface-variant/50"
                  placeholder="Mã giảm giá"
                  type="text"
                />
              </div>
              <button className="bg-secondary-container text-on-secondary-container px-8 py-3 rounded-full font-bold text-sm hover:brightness-95 transition-all">
                Áp dụng
              </button>
            </div>
          </div>
        </div>

        <div className="lg:col-span-4">
          <div className="bg-white/70 backdrop-blur-2xl rounded-3xl p-8 sticky top-32 shadow-[0_20px_40px_rgba(25,28,30,0.06)] border border-white/50">
            <h2 className="font-display font-black text-2xl text-primary mb-8 tracking-tight">Chi tiết thanh toán</h2>

            <div className="space-y-4 mb-8">
              <div className="flex justify-between items-center text-on-surface-variant">
                <span className="font-medium">Tạm tính</span>
                <span className="font-bold">{currency.format(totalPrice)}</span>
              </div>
              <div className="flex justify-between items-center text-on-surface-variant">
                <span className="font-medium">Phí vận chuyển thủy sinh</span>
                <span className="font-bold">{currency.format(shippingFee)}</span>
              </div>
              <div className="flex justify-between items-center text-secondary">
                <span className="font-medium">Giảm giá mã voucher</span>
                <span className="font-bold">- 0 ₫</span>
              </div>
            </div>

            <div className="h-px bg-outline-variant/15 mb-6"></div>

            <div className="flex justify-between items-end mb-10">
              <div>
                <p className="text-xs uppercase font-black tracking-widest text-on-surface-variant mb-1">
                  Tổng cộng
                </p>
                <p className="text-3xl font-black text-primary tracking-tighter">{currency.format(total)}</p>
              </div>
              <span className="material-symbols-outlined text-secondary opacity-50">verified_user</span>
            </div>

            <Link
              href="/checkout"
              className="w-full py-5 rounded-full bg-gradient-to-br from-primary to-primary-container text-white font-display font-bold text-lg shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-3"
            >
              Tiến hành thanh toán
              <span className="material-symbols-outlined">payments</span>
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
