"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState, Suspense } from "react";
import { signOut } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { useCart } from "@/components/customer/cart/CartContext";
import LogoutConfirmModal from "@/components/common/LogoutConfirmModal";
import ToastMessage from "@/components/common/ToastMessage";
import { API_URL } from "@/app/config/api";

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
  paymentMethod?: string | null;
  paymentStatus?: string | null;
  totalAmount: number;
  createdAt: string;
  items: CustomerOrderItem[];
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
  receiverName: string;
  phoneNumber: string;
  provinceId: number;
  districtId: number;
  wardCode: string;
  provinceName: string;
  districtName: string;
  wardName: string;
  streetAddress: string;
  isDefault: boolean;
};

type ProvinceOption = {
  id: number;
  name: string;
};

type DistrictOption = {
  id: number;
  name: string;
  provinceId: number;
};

type WardOption = {
  code: string;
  name: string;
  districtId: number;
};

const tabs = [
  { id: "account", label: "Thông tin tài khoản" },
  { id: "orders", label: "Đơn hàng của tôi" },
  { id: "fish", label: "Hồ sơ sức khỏe cá" },
  { id: "addresses", label: "Sổ địa chỉ" },
];

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

const PAYMENT_METHOD_LABELS: Record<string, string> = {
  COD: "Thanh toán khi nhận hàng",
  VNPAY: "Thanh toán VNPay",
};

function ProfilePageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { addItem } = useCart();
  const [activeTab, setActiveTab] = useState("account");
  const [profile, setProfile] = useState<CustomerProfile>({});
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [savingProfile, setSavingProfile] = useState(false);
  const [orders, setOrders] = useState<CustomerOrder[]>([]);
  const [fishRecords, setFishRecords] = useState<FishRecord[]>([]);
  const [addresses, setAddresses] = useState<AddressItem[]>([]);
  const [provinces, setProvinces] = useState<ProvinceOption[]>([]);
  const [districts, setDistricts] = useState<DistrictOption[]>([]);
  const [wards, setWards] = useState<WardOption[]>([]);
  const [expandedOrderId, setExpandedOrderId] = useState<number | null>(null);
  const [actionOrder, setActionOrder] = useState<CustomerOrder | null>(null);
  const [cancelReason, setCancelReason] = useState("");
  const [cancelSubmitting, setCancelSubmitting] = useState(false);
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
  const [editingAddressId, setEditingAddressId] = useState<number | null>(null);
  const [deleteAddressTarget, setDeleteAddressTarget] = useState<AddressItem | null>(null);
  const [orderStatusFilter, setOrderStatusFilter] = useState<"all" | "pending" | "cancelled" | "completed">("all");
  const [orderPage, setOrderPage] = useState(1);
  const [addressForm, setAddressForm] = useState({
    receiverName: "",
    phoneNumber: "",
    provinceId: null as number | null,
    districtId: null as number | null,
    wardCode: "",
    provinceName: "",
    districtName: "",
    wardName: "",
    streetAddress: "",
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

  useEffect(() => {
    const tab = searchParams.get("tab");
    if (tab && tabs.some((item) => item.id === tab)) {
      setActiveTab(tab);
    }
  }, [searchParams]);

  const loadOrders = async () => {
    const response = await fetch("/api/customer/orders", { cache: "no-store" });
    if (response.ok) {
      const data = (await response.json()) as CustomerOrder[];
      setOrders(data);
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

  const formatAddress = (addr: AddressItem) =>
    [addr.streetAddress, addr.wardName, addr.districtName, addr.provinceName]
      .filter(Boolean)
      .join(", ");

  const resetAddressForm = useCallback(() => {
    setEditingAddressId(null);
    setAddressForm({
      receiverName: "",
      phoneNumber: "",
      provinceId: null,
      districtId: null,
      wardCode: "",
      provinceName: "",
      districtName: "",
      wardName: "",
      streetAddress: "",
      isDefault: false,
    });
  }, []);

  useEffect(() => {
    if (activeTab !== "addresses") {
      return;
    }

    const loadProvinces = async () => {
      try {
        const response = await fetch(`${API_URL}/api/public/ghn/provinces`, { cache: "no-store" });
        if (!response.ok) {
          return;
        }

        const data = (await response.json()) as Array<{
          provinceId?: number;
          provinceName?: string;
          ProvinceID?: number;
          ProvinceName?: string;
        }>;
        const mapped = data
          .map((item) => ({
            id: item.provinceId ?? item.ProvinceID,
            name: item.provinceName ?? item.ProvinceName,
          }))
          .filter((item): item is ProvinceOption => Number.isFinite(item.id) && Boolean(item.name));
        setProvinces(mapped);
      } catch {
        setProvinces([]);
      }
    };

    loadProvinces();
  }, [activeTab]);

  useEffect(() => {
    if (activeTab !== "addresses") {
      return;
    }

    if (provinces.length > 0 && addressForm.provinceId === null) {
      setAddressForm((prev) => ({
        ...prev,
        provinceId: provinces[0].id,
        provinceName: provinces[0].name,
      }));
    }
  }, [activeTab, provinces, addressForm.provinceId]);

  useEffect(() => {
    if (activeTab !== "addresses") {
      return;
    }

    const loadDistricts = async () => {
      if (addressForm.provinceId === null) {
        setDistricts([]);
        setAddressForm((prev) => ({
          ...prev,
          districtId: null,
          districtName: "",
          wardCode: "",
          wardName: "",
        }));
        return;
      }

      try {
        const response = await fetch(`${API_URL}/api/public/ghn/districts?provinceId=${addressForm.provinceId}`, {
          cache: "no-store",
        });
        if (!response.ok) {
          return;
        }

        const data = (await response.json()) as Array<{
          districtId?: number;
          districtName?: string;
          provinceId?: number;
          DistrictID?: number;
          DistrictName?: string;
          ProvinceID?: number;
        }>;
        const mapped = data
          .map((item) => ({
            id: item.districtId ?? item.DistrictID,
            name: item.districtName ?? item.DistrictName,
            provinceId: item.provinceId ?? item.ProvinceID,
          }))
          .filter(
            (item): item is DistrictOption =>
              Number.isFinite(item.id) && Number.isFinite(item.provinceId) && Boolean(item.name)
          );
        setDistricts(mapped);
      } catch {
        setDistricts([]);
      }
    };

    loadDistricts();
  }, [activeTab, addressForm.provinceId]);

  useEffect(() => {
    if (activeTab !== "addresses") {
      return;
    }

    if (districts.length === 0) {
      setAddressForm((prev) => ({
        ...prev,
        districtId: null,
        districtName: "",
        wardCode: "",
        wardName: "",
      }));
      return;
    }

    const selected = districts.find((item) => item.id === addressForm.districtId);
    if (!selected) {
      setAddressForm((prev) => ({
        ...prev,
        districtId: districts[0].id,
        districtName: districts[0].name,
      }));
    } else if (selected.name !== addressForm.districtName) {
      setAddressForm((prev) => ({
        ...prev,
        districtName: selected.name,
      }));
    }
  }, [activeTab, districts, addressForm.districtId, addressForm.districtName]);

  useEffect(() => {
    if (activeTab !== "addresses") {
      return;
    }

    const loadWards = async () => {
      if (addressForm.districtId === null) {
        setWards([]);
        setAddressForm((prev) => ({
          ...prev,
          wardCode: "",
          wardName: "",
        }));
        return;
      }

      try {
        const response = await fetch(`${API_URL}/api/public/ghn/wards?districtId=${addressForm.districtId}`, {
          cache: "no-store",
        });
        if (!response.ok) {
          return;
        }

        const data = (await response.json()) as Array<{
          wardCode?: string;
          wardName?: string;
          districtId?: number;
          WardCode?: string;
          WardName?: string;
          DistrictID?: number;
        }>;
        const mapped = data
          .map((item) => ({
            code: item.wardCode ?? item.WardCode,
            name: item.wardName ?? item.WardName,
            districtId: item.districtId ?? item.DistrictID,
          }))
          .filter(
            (item): item is WardOption =>
              Boolean(item.code) && Boolean(item.name) && Number.isFinite(item.districtId)
          );
        setWards(mapped);
      } catch {
        setWards([]);
      }
    };

    loadWards();
  }, [activeTab, addressForm.districtId]);

  useEffect(() => {
    if (activeTab !== "addresses") {
      return;
    }

    if (wards.length === 0) {
      setAddressForm((prev) => ({
        ...prev,
        wardCode: "",
        wardName: "",
      }));
      return;
    }

    const selected = wards.find((item) => item.code === addressForm.wardCode);
    if (!selected) {
      setAddressForm((prev) => ({
        ...prev,
        wardCode: wards[0].code,
        wardName: wards[0].name,
      }));
    } else if (selected.name !== addressForm.wardName) {
      setAddressForm((prev) => ({
        ...prev,
        wardName: selected.name,
      }));
    }
  }, [activeTab, wards, addressForm.wardCode, addressForm.wardName]);

  const closeCancelModal = () => {
    setActionOrder(null);
    setCancelReason("");
  };

  const handleSubmitCancel = async () => {
    if (!actionOrder) {
      return;
    }

    if (!cancelReason.trim()) {
      showToast("Vui lòng nhập lý do hủy đơn.", "error");
      return;
    }

    try {
      setCancelSubmitting(true);
      const response = await fetch(`/api/customer/orders/${actionOrder.id}/cancel`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cancelReason: cancelReason.trim() }),
      });

      const payload = (await response.json().catch(() => ({}))) as { message?: string };
      if (!response.ok) {
        throw new Error(payload.message || "Không thể hủy đơn hàng.");
      }

      showToast(payload.message || "Đã gửi yêu cầu.", "success");
      closeCancelModal();
      await loadOrders();
    } catch (err) {
      const message = err instanceof Error ? err.message : "Không thể hủy đơn hàng.";
      showToast(message, "error");
    } finally {
      setCancelSubmitting(false);
    }
  };

  useEffect(() => {
    if (activeTab === "orders") {
      loadOrders();
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
        const rawMessage = await response.text();
        let message = rawMessage;

        try {
          const parsed = JSON.parse(rawMessage) as { message?: string };
          message = parsed?.message ?? rawMessage;
        } catch {
          // Keep raw message when response is not JSON.
        }

        if (rawMessage.includes("Current password is incorrect") || message === "Current password is incorrect") {
          message = "Mật khẩu hiện tại không đúng.";
        }

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
      await signOut({ redirect: false });
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

  const handleSaveAddress = async () => {
    if (!addressForm.receiverName.trim() || !addressForm.phoneNumber.trim() || !addressForm.streetAddress.trim()) {
      showToast("Vui lòng nhập đầy đủ thông tin địa chỉ.", "error");
      return;
    }

    if (!addressForm.provinceId || !addressForm.districtId || !addressForm.wardCode) {
      showToast("Vui lòng chọn đầy đủ Tỉnh/Thành, Quận/Huyện, Phường/Xã.", "error");
      return;
    }

    const payload = {
      receiverName: addressForm.receiverName.trim(),
      phoneNumber: addressForm.phoneNumber.trim(),
      provinceId: addressForm.provinceId,
      districtId: addressForm.districtId,
      wardCode: addressForm.wardCode,
      provinceName: addressForm.provinceName,
      districtName: addressForm.districtName,
      wardName: addressForm.wardName,
      streetAddress: addressForm.streetAddress.trim(),
      isDefault: addressForm.isDefault,
    };

    const response = await fetch(
      editingAddressId ? `/api/customer/addresses/${editingAddressId}` : "/api/customer/addresses",
      {
        method: editingAddressId ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      }
    );

    if (!response.ok) {
      const message = await response.text();
      showToast(message || "Không thể lưu địa chỉ.", "error");
      return;
    }

    const data = (await response.json()) as AddressItem;
    setAddresses((prev) => [data, ...prev.filter((addr) => addr.id !== data.id)]);
    resetAddressForm();
    showToast(editingAddressId ? "Đã cập nhật địa chỉ." : "Đã thêm địa chỉ mới.", "success");
  };

  const handleEditAddress = (address: AddressItem) => {
    setEditingAddressId(address.id);
    setAddressForm({
      receiverName: address.receiverName,
      phoneNumber: address.phoneNumber,
      provinceId: address.provinceId,
      districtId: address.districtId,
      wardCode: address.wardCode,
      provinceName: address.provinceName,
      districtName: address.districtName,
      wardName: address.wardName,
      streetAddress: address.streetAddress,
      isDefault: Boolean(address.isDefault),
    });
  };

  const handleSetDefaultAddress = async (id: number) => {
    const response = await fetch(`/api/customer/addresses/${id}/default`, { method: "PATCH" });
    if (!response.ok) {
      const message = await response.text();
      showToast(message || "Không thể đặt địa chỉ mặc định.", "error");
      return;
    }

    setAddresses((prev) => prev.map((addr) => ({ ...addr, isDefault: addr.id === id })));
    showToast("Đã cập nhật địa chỉ mặc định.", "success");
  };

  const handleDeleteAddress = async (id: number) => {
    const response = await fetch(`/api/customer/addresses/${id}`, { method: "DELETE" });
    if (!response.ok) {
      const message = await response.text();
      showToast(message || "Không thể xóa địa chỉ.", "error");
      return;
    }

    setAddresses((prev) => prev.filter((addr) => addr.id !== id));
    showToast("Đã xóa địa chỉ.", "success");
  };

  const handleConfirmDeleteAddress = async () => {
    if (!deleteAddressTarget) {
      return;
    }

    await handleDeleteAddress(deleteAddressTarget.id);
    setDeleteAddressTarget(null);
  };

  const headerSubtitle = useMemo(() => {
    if (activeTab === "orders") return "Theo dõi tình trạng các chú cá bạn đã đặt.";
    if (activeTab === "fish") return "Theo dõi hồ sơ sức khỏe cá đã mua.";
    if (activeTab === "addresses") return "Quản lý nhiều địa chỉ giao hàng.";
    return "Cập nhật thông tin tài khoản và bảo mật.";
  }, [activeTab]);

  const sortedOrders = useMemo(() => {
    return [...orders].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }, [orders]);

  const filteredOrders = useMemo(() => {
    return sortedOrders.filter((order) => {
      if (orderStatusFilter === "all") {
        return true;
      }

      if (orderStatusFilter === "pending") {
        return order.orderStatus === "PENDING_PAYMENT" || order.paymentStatus === "UNPAID";
      }

      if (orderStatusFilter === "cancelled") {
        return order.orderStatus === "CANCELLED";
      }

      return order.orderStatus === "COMPLETED";
    });
  }, [orderStatusFilter, sortedOrders]);

  const ORDER_PAGE_SIZE = 10;
  const totalOrderPages = Math.max(1, Math.ceil(filteredOrders.length / ORDER_PAGE_SIZE));
  const pagedOrders = useMemo(() => {
    const start = (orderPage - 1) * ORDER_PAGE_SIZE;
    return filteredOrders.slice(start, start + ORDER_PAGE_SIZE);
  }, [filteredOrders, orderPage]);

  useEffect(() => {
    if (activeTab === "orders") {
      setOrderPage(1);
    }
  }, [activeTab, orderStatusFilter]);

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
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-bold text-primary">Danh sách đơn hàng</h2>
              <p className="text-sm text-on-surface-variant">Mỗi trang hiển thị 10 đơn hàng gần nhất.</p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              {[
                { id: "all", label: "Tất cả" },
                { id: "pending", label: "Chờ thanh toán" },
                { id: "completed", label: "Hoàn thành" },
                { id: "cancelled", label: "Đã hủy" },
              ].map((filter) => (
                <button
                  key={filter.id}
                  type="button"
                  className={`px-4 py-2 rounded-full text-xs font-bold transition-colors ${
                    orderStatusFilter === filter.id
                      ? "bg-primary text-white"
                      : "bg-surface-container-high text-on-surface-variant hover:bg-surface-container-highest"
                  }`}
                  onClick={() => setOrderStatusFilter(filter.id as typeof orderStatusFilter)}
                >
                  {filter.label}
                </button>
              ))}
            </div>
          </div>

          {filteredOrders.length === 0 ? (
            <div className="rounded-2xl bg-surface-container-low p-8 text-center text-on-surface-variant">
              {orders.length === 0 ? "Bạn chưa có đơn hàng nào." : "Không có đơn hàng phù hợp bộ lọc."}
            </div>
          ) : (
            <div className="space-y-4">
              {pagedOrders.map((order) => (
              <div key={order.id} className="bg-surface-container-low rounded-2xl p-6 shadow-sm">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
                  <div className="space-y-2">
                    <div className="flex items-center gap-3">
                      <h3 className="text-lg font-bold text-primary">#{order.orderCode}</h3>
                      <span className="px-3 py-1 rounded-full text-xs font-semibold bg-surface-container-high text-on-surface-variant">
                        {STATUS_LABELS[order.orderStatus] ?? order.orderStatus}
                      </span>
                    </div>
                    <p className="text-sm text-on-surface-variant">
                      {new Date(order.createdAt).toLocaleDateString("vi-VN")}
                    </p>
                    <div className="flex flex-wrap gap-3 text-xs text-on-surface-variant">
                      {order.paymentMethod && (
                        <span>Thanh toán: {PAYMENT_METHOD_LABELS[order.paymentMethod] ?? order.paymentMethod}</span>
                      )}
                      {order.paymentStatus && (
                        <span>Trạng thái: {PAYMENT_LABELS[order.paymentStatus] ?? order.paymentStatus}</span>
                      )}
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center gap-3">
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
                  <div className="mt-5 space-y-3">
                    {order.items.map((item) => (
                      <div
                        key={item.productId}
                        className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 rounded-xl bg-white/80 p-4"
                      >
                        <div className="flex items-center gap-4">
                          <div className="h-16 w-16 overflow-hidden rounded-xl bg-surface-container-high">
                            {item.imageUrl ? (
                              <img className="h-full w-full object-cover" src={item.imageUrl} alt={item.name} />
                            ) : (
                              <div className="flex h-full w-full items-center justify-center text-xs text-on-surface-variant">
                                No image
                              </div>
                            )}
                          </div>
                          <div>
                            <p className="font-semibold text-primary">{item.name}</p>
                            <p className="text-xs text-on-surface-variant">Số lượng: {item.quantity}</p>
                          </div>
                        </div>
                        <span className="font-bold text-primary">{currency.format(item.lineTotal)}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              ))}
              {totalOrderPages > 1 && (
                <div className="flex items-center justify-between text-xs text-on-surface-variant pt-2">
                  <span>
                    Trang <strong className="text-primary">{orderPage}</strong> / {totalOrderPages}
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      className="w-8 h-8 flex items-center justify-center rounded-lg border border-outline-variant/30 text-on-surface-variant disabled:opacity-40"
                      type="button"
                      onClick={() => setOrderPage((prev) => Math.max(1, prev - 1))}
                      disabled={orderPage === 1}
                    >
                      <span className="material-symbols-outlined text-sm">chevron_left</span>
                    </button>
                    <button
                      className="w-8 h-8 flex items-center justify-center rounded-lg border border-outline-variant/30 text-on-surface-variant disabled:opacity-40"
                      type="button"
                      onClick={() => setOrderPage((prev) => Math.min(totalOrderPages, prev + 1))}
                      disabled={orderPage === totalOrderPages}
                    >
                      <span className="material-symbols-outlined text-sm">chevron_right</span>
                    </button>
                  </div>
                </div>
              )}
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
                    <h3 className="font-bold text-primary">{addr.receiverName}</h3>
                    {addr.isDefault && (
                      <span className="text-xs font-bold px-2 py-1 rounded-full bg-secondary-container text-on-secondary-container">
                        Mặc định
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-on-surface-variant">{addr.phoneNumber}</p>
                  <p className="text-sm text-on-surface-variant">{formatAddress(addr)}</p>
                  <div className="flex gap-2 pt-2">
                    <button
                      className="px-3 py-1.5 rounded-full bg-surface-container-high text-primary text-sm font-bold"
                      type="button"
                      onClick={() => handleEditAddress(addr)}
                    >
                      Sửa
                    </button>
                    <button
                      className="px-3 py-1.5 rounded-full bg-primary text-white text-sm font-bold disabled:opacity-60"
                      type="button"
                      onClick={() => handleSetDefaultAddress(addr.id)}
                      disabled={addr.isDefault}
                    >
                      Thiết lập mặc định
                    </button>
                    <button
                      className="px-3 py-1.5 rounded-full bg-surface-container-high text-primary text-sm font-bold"
                      type="button"
                      onClick={() => setDeleteAddressTarget(addr)}
                    >
                      Xóa
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
          <div className="bg-surface-container-lowest rounded-2xl p-6">
            <h3 className="text-xl font-bold text-primary mb-4">
              {editingAddressId ? "Cập nhật địa chỉ" : "Thêm địa chỉ mới"}
            </h3>
            <div className="space-y-3">
              <input
                className="w-full rounded-lg bg-surface-container-highest border-0 p-3"
                placeholder="Họ và tên người nhận"
                value={addressForm.receiverName}
                onChange={(event) => setAddressForm((prev) => ({ ...prev, receiverName: event.target.value }))}
              />
              <input
                className="w-full rounded-lg bg-surface-container-highest border-0 p-3"
                placeholder="Số điện thoại"
                value={addressForm.phoneNumber}
                onChange={(event) => {
                  const value = event.target.value.replace(/[^\d]/g, "");
                  setAddressForm((prev) => ({ ...prev, phoneNumber: value.slice(0, 10) }));
                }}
              />
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-on-surface-variant">Tỉnh / Thành phố</label>
                  <select
                    className="w-full rounded-lg bg-surface-container-highest border-0 p-3"
                    value={addressForm.provinceId ?? ""}
                    onChange={(event) => {
                      const nextId = Number(event.target.value);
                      const selected = provinces.find((item) => item.id === nextId);
                      setAddressForm((prev) => ({
                        ...prev,
                        provinceId: Number.isFinite(nextId) ? nextId : null,
                        provinceName: selected?.name ?? "",
                        districtId: null,
                        districtName: "",
                        wardCode: "",
                        wardName: "",
                      }));
                    }}
                  >
                    {provinces.map((item) => (
                      <option key={item.id} value={item.id}>{item.name}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-on-surface-variant">Quận / Huyện</label>
                  <select
                    className="w-full rounded-lg bg-surface-container-highest border-0 p-3"
                    value={addressForm.districtId ?? ""}
                    onChange={(event) => {
                      const nextId = Number(event.target.value);
                      const selected = districts.find((item) => item.id === nextId);
                      setAddressForm((prev) => ({
                        ...prev,
                        districtId: Number.isFinite(nextId) ? nextId : null,
                        districtName: selected?.name ?? "",
                      }));
                    }}
                  >
                    {districts.map((item) => (
                      <option key={item.id} value={item.id}>{item.name}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-on-surface-variant">Phường / Xã</label>
                  <select
                    className="w-full rounded-lg bg-surface-container-highest border-0 p-3"
                    value={addressForm.wardCode}
                    onChange={(event) => {
                      const nextCode = event.target.value;
                      const selected = wards.find((item) => item.code === nextCode);
                      setAddressForm((prev) => ({
                        ...prev,
                        wardCode: nextCode,
                        wardName: selected?.name ?? "",
                      }));
                    }}
                  >
                    {wards.map((item) => (
                      <option key={item.code} value={item.code}>{item.name}</option>
                    ))}
                  </select>
                </div>
              </div>
              <textarea
                className="w-full rounded-lg bg-surface-container-highest border-0 p-3"
                placeholder="Số nhà, tên đường"
                rows={4}
                value={addressForm.streetAddress}
                onChange={(event) => setAddressForm((prev) => ({ ...prev, streetAddress: event.target.value }))}
              />
              <label className="flex items-center gap-2 text-sm text-on-surface-variant">
                <input
                  type="checkbox"
                  checked={addressForm.isDefault}
                  onChange={(event) => setAddressForm((prev) => ({ ...prev, isDefault: event.target.checked }))}
                />
                Đặt làm địa chỉ mặc định
              </label>
              <div className="flex flex-wrap gap-3">
                <button
                  className="px-6 py-3 rounded-full bg-primary text-white font-bold"
                  type="button"
                  onClick={handleSaveAddress}
                >
                  {editingAddressId ? "Cập nhật" : "Lưu địa chỉ"}
                </button>
                {editingAddressId && (
                  <button
                    className="px-6 py-3 rounded-full bg-surface-container-high text-primary font-bold"
                    type="button"
                    onClick={resetAddressForm}
                  >
                    Hủy
                  </button>
                )}
              </div>
            </div>
          </div>
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
                onClick={closeCancelModal}
                disabled={cancelSubmitting}
              >
                Đóng
              </button>
              <button
                className="px-4 py-2 rounded-full bg-primary text-white font-bold"
                type="button"
                onClick={handleSubmitCancel}
                disabled={cancelSubmitting}
              >
                {cancelSubmitting ? "Đang gửi..." : "Gửi yêu cầu"}
              </button>
            </div>
          </div>
        </div>
      )}

      {deleteAddressTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
            <h3 className="text-lg font-bold text-primary mb-2">Xác nhận xóa địa chỉ</h3>
            <p className="text-sm text-on-surface-variant mb-4">
              Bạn có chắc muốn xóa địa chỉ của {deleteAddressTarget.receiverName}?
            </p>
            <div className="rounded-xl bg-surface-container-low p-3 text-xs text-on-surface-variant">
              {formatAddress(deleteAddressTarget)}
            </div>
            <div className="mt-5 flex justify-end gap-3">
              <button
                className="px-4 py-2 rounded-full bg-surface-container-high text-primary font-bold"
                type="button"
                onClick={() => setDeleteAddressTarget(null)}
              >
                Hủy
              </button>
              <button
                className="px-4 py-2 rounded-full bg-error text-white font-bold"
                type="button"
                onClick={handleConfirmDeleteAddress}
              >
                Xóa địa chỉ
              </button>
            </div>
          </div>
        </div>
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

export default function ProfilePage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-slate-500">Đang tải hồ sơ...</div>}>
      <ProfilePageContent />
    </Suspense>
  );
}
