"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "@/components/customer/cart/CartContext";
import LogoutConfirmModal from "@/components/common/LogoutConfirmModal";
import ToastMessage from "@/components/common/ToastMessage";

type CustomerProfile = {
  fullName?: string | null;
  phone?: string | null;
  address?: string | null;
  provider?: string | null;
  email?: string | null;
};

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
  totalAmount: number;
  createdAt: string;
  items: CustomerOrderItem[];
};

type WishlistItem = {
  productId: number;
  name: string;
  sku?: string | null;
  imageUrl?: string | null;
  price: number;
  stockQuantity: number;
};

type FishRecord = {
  productId: number;
  name: string;
  imageUrl?: string | null;
  purchasedAt: string;
  attributes: { attributeName: string; value: string }[];
  certificateUrl?: string | null;
};

type AddressItem = {
  id: number;
  label: string;
  phone: string;
  address: string;
  isDefault: boolean;
};

const tabs = [
  { id: "account", label: "Thông tin tài khoản" },
  { id: "orders", label: "Đơn hàng của tôi" },
  { id: "wishlist", label: "Danh sách yêu thích" },
  { id: "fish", label: "Hồ sơ sức khỏe cá" },
  { id: "addresses", label: "Sổ địa chỉ" },
];

const currency = new Intl.NumberFormat("vi-VN", {
  style: "currency",
  currency: "VND",
  maximumFractionDigits: 0,
});

export default function ProfilePage() {
  const router = useRouter();
  const { addItem } = useCart();
  const [activeTab, setActiveTab] = useState("account");
  const [profile, setProfile] = useState<CustomerProfile>({});
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [savingProfile, setSavingProfile] = useState(false);
  const [orders, setOrders] = useState<CustomerOrder[]>([]);
  const [wishlist, setWishlist] = useState<WishlistItem[]>([]);
  const [fishRecords, setFishRecords] = useState<FishRecord[]>([]);
  const [addresses, setAddresses] = useState<AddressItem[]>([]);
  const [expandedOrderId, setExpandedOrderId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [passwordMessage, setPasswordMessage] = useState<string | null>(null);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [toast, setToast] = useState<{ show: boolean; message: string; variant: "success" | "error" }>({
    show: false,
    message: "",
    variant: "success",
  });
  const [addressForm, setAddressForm] = useState({
    label: "Nhà",
    phone: "",
    address: "",
    isDefault: false,
  });

  const isLocalAccount = profile.provider?.toUpperCase() === "LOCAL";
  const isGoogleAccount = profile.provider?.toUpperCase() === "GOOGLE";

  const showToast = useCallback((message: string, variant: "success" | "error") => {
    setToast({ show: true, message, variant });
    window.setTimeout(() => {
      setToast((prev) => ({ ...prev, show: false }));
    }, 2500);
  }, []);

  useEffect(() => {
    const ensureSession = async () => {
      const sessionResponse = await fetch("/api/customer/auth/session");
      if (!sessionResponse.ok) {
        router.replace("/auth/login?returnUrl=/profile");
        return;
      }

      const meResponse = await fetch("/api/customer/me", { cache: "no-store" });
      if (meResponse.ok) {
        const data = (await meResponse.json()) as CustomerProfile;
        setProfile({
          fullName: data.fullName ?? "",
          phone: data.phone ?? "",
          address: data.address ?? "",
          provider: data.provider ?? null,
          email: data.email ?? null,
        });
      }
      setLoadingProfile(false);
    };

    ensureSession();
  }, [router]);

  const loadOrders = async () => {
    const response = await fetch("/api/customer/orders", { cache: "no-store" });
    if (response.ok) {
      const data = (await response.json()) as CustomerOrder[];
      setOrders(data);
    }
  };

  const loadWishlist = async () => {
    const response = await fetch("/api/customer/wishlist", { cache: "no-store" });
    if (response.ok) {
      const data = (await response.json()) as WishlistItem[];
      setWishlist(data);
    }
  };

  const loadFishRecords = async () => {
    const response = await fetch("/api/customer/fish-records", { cache: "no-store" });
    if (response.ok) {
      const data = (await response.json()) as FishRecord[];
      setFishRecords(data);
    }
  };

  const loadAddresses = async () => {
    const response = await fetch("/api/customer/addresses", { cache: "no-store" });
    if (response.ok) {
      const data = (await response.json()) as AddressItem[];
      setAddresses(data);
    }
  };

  useEffect(() => {
    if (activeTab === "orders") {
      loadOrders();
    }
    if (activeTab === "wishlist") {
      loadWishlist();
    }
    if (activeTab === "fish") {
      loadFishRecords();
    }
    if (activeTab === "addresses") {
      loadAddresses();
    }
  }, [activeTab]);

  const handleUpdateProfile = async () => {
    if (!profile.fullName?.trim() || !profile.phone?.trim() || !profile.address?.trim()) {
      setError("Vui lòng nhập đầy đủ họ tên, số điện thoại và địa chỉ.");
      return;
    }

    try {
      setSavingProfile(true);
      setError(null);
      const response = await fetch("/api/customer/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName: profile.fullName?.trim(),
          phone: profile.phone?.trim(),
          address: profile.address?.trim(),
        }),
      });

      if (!response.ok) {
        const message = await response.text();
        throw new Error(message || "Không thể cập nhật thông tin.");
      }

      showToast("Cập nhật hồ sơ thành công.", "success");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Không thể cập nhật thông tin.";
      setError(message);
    } finally {
      setSavingProfile(false);
    }
  };

  const handleChangePassword = async () => {
    if (!currentPassword || !newPassword) {
      setPasswordError("Vui lòng nhập đầy đủ mật khẩu hiện tại và mật khẩu mới.");
      return;
    }
    if (newPassword.length < 6) {
      setPasswordError("Mật khẩu mới phải có ít nhất 6 ký tự.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError("Mật khẩu xác nhận không khớp.");
      return;
    }

    try {
      setPasswordError(null);
      setPasswordMessage(null);
      const response = await fetch("/api/customer/password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword, newPassword }),
      });

      if (!response.ok) {
        const message = await response.text();
        throw new Error(message || "Không thể đổi mật khẩu.");
      }

      setPasswordMessage("Đổi mật khẩu thành công.");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Không thể đổi mật khẩu.";
      setPasswordError(message);
    }
  };

  const handleLogout = async () => {
    setIsLogoutModalOpen(false);
    setIsLoggingOut(true);
    try {
      await fetch("/api/customer/auth/session", { method: "DELETE" });
    } finally {
      setIsLoggingOut(false);
      window.dispatchEvent(new Event("customer-session-updated"));
      router.push("/");
      router.refresh();
    }
  };

  const openLogoutModal = () => {
    if (!isLoggingOut) {
      setIsLogoutModalOpen(true);
    }
  };

  const closeLogoutModal = () => {
    if (!isLoggingOut) {
      setIsLogoutModalOpen(false);
    }
  };

  const handleReorder = (order: CustomerOrder) => {
    order.items.forEach((item) => {
      addItem(
        {
          id: item.productId,
          name: item.name,
          sku: item.sku,
          price: item.price,
          imageUrl: item.imageUrl || "",
        },
        item.quantity
      );
    });
  };

  const handleRemoveWishlist = async (productId: number) => {
    await fetch(`/api/customer/wishlist/${productId}`, { method: "DELETE" });
    setWishlist((prev) => prev.filter((item) => item.productId !== productId));
  };

  const handleAddWishlistToCart = (item: WishlistItem) => {
    addItem(
      { id: item.productId, name: item.name, sku: item.sku, price: item.price, imageUrl: item.imageUrl || "" },
      1
    );
  };

  const handleAddAddress = async () => {
    if (!addressForm.label.trim() || !addressForm.phone.trim() || !addressForm.address.trim()) {
      setError("Vui lòng nhập đầy đủ thông tin địa chỉ.");
      return;
    }

    const response = await fetch("/api/customer/addresses", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(addressForm),
    });

    if (response.ok) {
      const data = (await response.json()) as AddressItem;
      setAddresses((prev) => [data, ...prev.filter((addr) => addr.id !== data.id)]);
      setAddressForm({ label: "Nhà", phone: "", address: "", isDefault: false });
    }
  };

  const handleSetDefaultAddress = async (id: number) => {
    const response = await fetch(`/api/customer/addresses/${id}/default`, { method: "PUT" });
    if (response.ok) {
      setAddresses((prev) =>
        prev.map((addr) => ({ ...addr, isDefault: addr.id === id }))
      );
    }
  };

  const handleDeleteAddress = async (id: number) => {
    const response = await fetch(`/api/customer/addresses/${id}`, { method: "DELETE" });
    if (response.ok) {
      setAddresses((prev) => prev.filter((addr) => addr.id !== id));
    }
  };

  const headerSubtitle = useMemo(() => {
    if (activeTab === "orders") return "Theo dõi tình trạng các chú cá bạn đã đặt.";
    if (activeTab === "wishlist") return "Những chú cá bạn đang yêu thích.";
    if (activeTab === "fish") return "Theo dõi hồ sơ sức khỏe cá đã mua.";
    if (activeTab === "addresses") return "Quản lý nhiều địa chỉ giao hàng.";
    return "Cập nhật thông tin tài khoản và bảo mật.";
  }, [activeTab]);

  return (
    <main className="px-6 max-w-7xl mx-auto pb-20">
      <ToastMessage show={toast.show} message={toast.message} variant={toast.variant} />
      <header className="mb-10">
        <nav className="flex items-center gap-2 text-label-md text-on-surface-variant mb-4">
          <Link href="/" className="hover:text-primary transition-colors">Trang chủ</Link>
          <span className="material-symbols-outlined text-sm">chevron_right</span>
          <span className="text-primary font-semibold">Tài khoản của tôi</span>
        </nav>
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-4xl md:text-5xl font-black tracking-tighter text-primary">Hồ sơ khách hàng</h1>
            <p className="mt-2 text-on-surface-variant font-medium">{headerSubtitle}</p>
          </div>
          <button
            className="group inline-flex items-center gap-2 rounded-full border border-rose-200 bg-white/80 px-5 py-2 text-sm font-semibold text-rose-600 shadow-sm transition-all hover:border-rose-300 hover:bg-rose-50 hover:shadow-md disabled:cursor-not-allowed disabled:opacity-60"
            type="button"
            onClick={openLogoutModal}
            disabled={isLoggingOut}
          >
            <span className="material-symbols-outlined text-[18px] transition-transform group-hover:scale-105">logout</span>
            {isLoggingOut ? "Đang đăng xuất..." : "Đăng xuất"}
          </button>
        </div>
        {isGoogleAccount && (
          <div className="mt-4 inline-flex items-center gap-2 rounded-full bg-surface-container-low px-4 py-2 text-xs font-semibold text-on-surface-variant">
            <span className="material-symbols-outlined text-sm">verified</span>
            Bạn đang đăng nhập bằng tài khoản Google.
          </div>
        )}
      </header>

      <div className="flex flex-wrap gap-3 mb-8">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            className={`px-4 py-2 rounded-full text-sm font-bold transition-colors ${
              activeTab === tab.id
                ? "bg-primary text-white"
                : "bg-surface-container-high text-on-surface-variant hover:bg-surface-container-highest"
            }`}
            type="button"
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === "account" && (
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-surface-container-lowest rounded-2xl p-6 shadow-sm">
            <h2 className="text-xl font-bold text-primary mb-6">Thông tin cá nhân</h2>
            {error && <div className="mb-4 rounded-lg bg-error/10 text-error text-sm px-4 py-2">{error}</div>}
            <div className="space-y-4">
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-on-surface-variant">Họ và tên</label>
                <input
                  className="w-full mt-2 rounded-lg bg-surface-container-highest border-0 p-3"
                  value={profile.fullName ?? ""}
                  onChange={(event) => setProfile((prev) => ({ ...prev, fullName: event.target.value }))}
                  disabled={loadingProfile}
                />
              </div>
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-on-surface-variant">Số điện thoại</label>
                <input
                  className="w-full mt-2 rounded-lg bg-surface-container-highest border-0 p-3"
                  value={profile.phone ?? ""}
                  onChange={(event) => setProfile((prev) => ({ ...prev, phone: event.target.value }))}
                  disabled={loadingProfile}
                />
              </div>
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-on-surface-variant">Địa chỉ mặc định</label>
                <textarea
                  className="w-full mt-2 rounded-lg bg-surface-container-highest border-0 p-3"
                  rows={4}
                  value={profile.address ?? ""}
                  onChange={(event) => setProfile((prev) => ({ ...prev, address: event.target.value }))}
                  disabled={loadingProfile}
                />
              </div>
              <button
                className="px-6 py-3 rounded-full bg-primary text-white font-bold hover:bg-primary-container transition-colors"
                type="button"
                onClick={handleUpdateProfile}
                disabled={savingProfile}
              >
                {savingProfile ? "Đang lưu..." : "Lưu thay đổi"}
              </button>
            </div>
          </div>

          <div className="bg-surface-container-lowest rounded-2xl p-6 shadow-sm space-y-6">
            <div>
              <h2 className="text-xl font-bold text-primary mb-4">Thông tin đăng nhập</h2>
              <div className="space-y-3">
                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-on-surface-variant">Email</label>
                  <input className="w-full mt-2 rounded-lg bg-surface-container-highest border-0 p-3" value={profile.email ?? ""} readOnly />
                </div>
                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-on-surface-variant">Phương thức đăng nhập</label>
                  <div className="mt-2 flex items-center gap-2 rounded-lg bg-surface-container-highest p-3">
                    <span className="material-symbols-outlined text-lg">verified</span>
                    <span className="text-sm font-semibold">
                      {isGoogleAccount ? "Google" : "LOCAL"}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {isLocalAccount && (
              <div>
                <h3 className="text-lg font-bold text-primary mb-3">Đổi mật khẩu</h3>
                {passwordError && <div className="mb-3 rounded-lg bg-error/10 text-error text-sm px-4 py-2">{passwordError}</div>}
                {passwordMessage && <div className="mb-3 rounded-lg bg-emerald-50 text-emerald-700 text-sm px-4 py-2">{passwordMessage}</div>}
                <div className="space-y-3">
                  <input
                    className="w-full rounded-lg bg-surface-container-highest border-0 p-3"
                    type="password"
                    placeholder="Mật khẩu hiện tại"
                    value={currentPassword}
                    onChange={(event) => setCurrentPassword(event.target.value)}
                  />
                  <input
                    className="w-full rounded-lg bg-surface-container-highest border-0 p-3"
                    type="password"
                    placeholder="Mật khẩu mới"
                    value={newPassword}
                    onChange={(event) => setNewPassword(event.target.value)}
                  />
                  <input
                    className="w-full rounded-lg bg-surface-container-highest border-0 p-3"
                    type="password"
                    placeholder="Xác nhận mật khẩu mới"
                    value={confirmPassword}
                    onChange={(event) => setConfirmPassword(event.target.value)}
                  />
                  <button
                    className="px-6 py-3 rounded-full bg-secondary text-on-secondary font-bold hover:bg-secondary-container transition-colors"
                    type="button"
                    onClick={handleChangePassword}
                  >
                    Cập nhật mật khẩu
                  </button>
                </div>
              </div>
            )}
          </div>
        </section>
      )}

      {activeTab === "orders" && (
        <section className="space-y-6">
          {orders.length === 0 ? (
            <div className="rounded-2xl bg-surface-container-low p-8 text-center text-on-surface-variant">
              Bạn chưa có đơn hàng nào.
            </div>
          ) : (
            orders.map((order) => (
              <div key={order.id} className="bg-surface-container-low rounded-2xl p-6">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div>
                    <h3 className="text-lg font-bold text-primary">#{order.orderCode}</h3>
                    <p className="text-sm text-on-surface-variant">
                      {new Date(order.createdAt).toLocaleDateString("vi-VN")} • {order.orderStatus}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-lg font-black text-primary">{currency.format(order.totalAmount)}</span>
                    <button
                      className="px-4 py-2 rounded-full bg-surface-container-high text-primary font-bold"
                      type="button"
                      onClick={() => setExpandedOrderId(expandedOrderId === order.id ? null : order.id)}
                    >
                      Xem chi tiết
                    </button>
                    <button
                      className="px-4 py-2 rounded-full bg-primary text-white font-bold"
                      type="button"
                      onClick={() => handleReorder(order)}
                    >
                      Mua lại
                    </button>
                  </div>
                </div>
                {expandedOrderId === order.id && (
                  <div className="mt-4 space-y-3">
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
            ))
          )}
        </section>
      )}

      {activeTab === "wishlist" && (
        <section>
          {wishlist.length === 0 ? (
            <div className="rounded-2xl bg-surface-container-low p-8 text-center text-on-surface-variant">
              Chưa có sản phẩm trong wishlist.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {wishlist.map((item) => (
                <div key={item.productId} className="rounded-2xl bg-surface-container-low p-5 space-y-4">
                  <img className="w-full h-40 object-cover rounded-xl" src={item.imageUrl || ""} alt={item.name} />
                  <div>
                    <h3 className="font-bold text-primary">{item.name}</h3>
                    <p className="text-sm text-on-surface-variant">{currency.format(item.price)}</p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      className="flex-1 px-3 py-2 rounded-full bg-primary text-white font-bold"
                      type="button"
                      onClick={() => handleAddWishlistToCart(item)}
                    >
                      Thêm vào giỏ
                    </button>
                    <button
                      className="px-3 py-2 rounded-full bg-surface-container-high text-primary font-bold"
                      type="button"
                      onClick={() => handleRemoveWishlist(item.productId)}
                    >
                      Xóa
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      )}

      {activeTab === "fish" && (
        <section>
          {fishRecords.length === 0 ? (
            <div className="rounded-2xl bg-surface-container-low p-8 text-center text-on-surface-variant">
              Chưa có hồ sơ sức khỏe cá.
            </div>
          ) : (
            <div className="space-y-6">
              {fishRecords.map((record) => (
                <div key={`${record.productId}-${record.purchasedAt}`} className="rounded-2xl bg-surface-container-low p-6">
                  <div className="flex gap-4 items-center">
                    <img className="w-24 h-24 rounded-xl object-cover" src={record.imageUrl || ""} alt={record.name} />
                    <div>
                      <h3 className="font-bold text-primary">{record.name}</h3>
                      <p className="text-sm text-on-surface-variant">
                        Mua ngày: {new Date(record.purchasedAt).toLocaleDateString("vi-VN")}
                      </p>
                    </div>
                  </div>
                  <div className="mt-4">
                    <h4 className="text-sm font-bold text-on-surface-variant mb-2">Lịch sử & chăm sóc</h4>
                    {record.attributes.length === 0 ? (
                      <p className="text-sm text-on-surface-variant">Chưa có thông tin vaccine.</p>
                    ) : (
                      <ul className="space-y-1 text-sm">
                        {record.attributes.map((attr) => (
                          <li key={`${record.productId}-${attr.attributeName}`} className="flex justify-between">
                            <span className="text-on-surface-variant">{attr.attributeName}</span>
                            <span className="font-semibold text-primary">{attr.value}</span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                  {record.certificateUrl ? (
                    <a className="inline-flex mt-4 text-sm font-bold text-primary" href={record.certificateUrl}>
                      Tải giấy chứng nhận
                    </a>
                  ) : null}
                </div>
              ))}
            </div>
          )}
        </section>
      )}

      {activeTab === "addresses" && (
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="space-y-4">
            {addresses.length === 0 ? (
              <div className="rounded-2xl bg-surface-container-low p-6 text-on-surface-variant">
                Chưa có địa chỉ nào.
              </div>
            ) : (
              addresses.map((addr) => (
                <div key={addr.id} className="rounded-2xl bg-surface-container-low p-5 space-y-2">
                  <div className="flex items-center justify-between">
                    <h3 className="font-bold text-primary">{addr.label}</h3>
                    {addr.isDefault && (
                      <span className="text-xs font-bold px-2 py-1 rounded-full bg-secondary-container text-on-secondary-container">
                        Mặc định
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-on-surface-variant">{addr.phone}</p>
                  <p className="text-sm text-on-surface-variant">{addr.address}</p>
                  <div className="flex gap-2 pt-2">
                    <button
                      className="px-3 py-1.5 rounded-full bg-primary text-white text-sm font-bold"
                      type="button"
                      onClick={() => handleSetDefaultAddress(addr.id)}
                    >
                      Đặt mặc định
                    </button>
                    <button
                      className="px-3 py-1.5 rounded-full bg-surface-container-high text-primary text-sm font-bold"
                      type="button"
                      onClick={() => handleDeleteAddress(addr.id)}
                    >
                      Xóa
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
          <div className="bg-surface-container-lowest rounded-2xl p-6">
            <h3 className="text-xl font-bold text-primary mb-4">Thêm địa chỉ mới</h3>
            <div className="space-y-3">
              <input
                className="w-full rounded-lg bg-surface-container-highest border-0 p-3"
                placeholder="Nhãn (Nhà, Công ty...)"
                value={addressForm.label}
                onChange={(event) => setAddressForm((prev) => ({ ...prev, label: event.target.value }))}
              />
              <input
                className="w-full rounded-lg bg-surface-container-highest border-0 p-3"
                placeholder="Số điện thoại"
                value={addressForm.phone}
                onChange={(event) => setAddressForm((prev) => ({ ...prev, phone: event.target.value }))}
              />
              <textarea
                className="w-full rounded-lg bg-surface-container-highest border-0 p-3"
                placeholder="Địa chỉ chi tiết"
                rows={4}
                value={addressForm.address}
                onChange={(event) => setAddressForm((prev) => ({ ...prev, address: event.target.value }))}
              />
              <label className="flex items-center gap-2 text-sm text-on-surface-variant">
                <input
                  type="checkbox"
                  checked={addressForm.isDefault}
                  onChange={(event) => setAddressForm((prev) => ({ ...prev, isDefault: event.target.checked }))}
                />
                Đặt làm địa chỉ mặc định
              </label>
              <button
                className="px-6 py-3 rounded-full bg-primary text-white font-bold"
                type="button"
                onClick={handleAddAddress}
              >
                Lưu địa chỉ
              </button>
            </div>
          </div>
        </section>
      )}

      <LogoutConfirmModal
        isOpen={isLogoutModalOpen}
        isSubmitting={isLoggingOut}
        onClose={closeLogoutModal}
        onConfirm={handleLogout}
        title="Xác nhận đăng xuất"
        description="Bạn sắp đăng xuất khỏi tài khoản khách hàng. Tiếp tục chứ?"
        hint="Mẹo: Bạn có thể quay về trang chủ và đăng xuất sau nếu muốn tiếp tục mua sắm."
        confirmLabel="Đăng xuất"
        cancelLabel="Ở lại"
      />
    </main>
  );
}
