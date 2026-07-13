"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState, Suspense } from "react";
import { signOut } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import dynamic from "next/dynamic";

const OrderTrackingMap = dynamic(
  () => import("@/components/customer/orders/OrderTrackingMap"),
  { ssr: false }
);
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

  const ORDER_PAGE_SIZE = 5;
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
    <main className="px-4 sm:px-6 max-w-7xl mx-auto pb-24 pt-6">
      <ToastMessage show={toast.show} message={toast.message} variant={toast.variant} />
      
      {/* Breadcrumbs */}
      <nav className="flex items-center gap-2 text-xs font-semibold text-on-surface-variant/70 mb-4">
        <Link href="/" className="hover:text-primary transition-colors flex items-center gap-1">
          <span className="material-symbols-outlined text-sm">home</span> Trang chủ
        </Link>
        <span className="material-symbols-outlined text-[12px] text-on-surface-variant/40">chevron_right</span>
        <span className="text-primary font-bold">Tài khoản của tôi</span>
      </nav>

      {/* Hero Header Card */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#005B71] to-[#008ba8] p-8 md:p-10 text-white shadow-lg mb-8 border border-white/10 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-4.5 relative z-10">
          <div className="h-16 w-16 rounded-2xl bg-white/15 backdrop-blur-md border border-white/20 flex items-center justify-center text-3xl font-black text-white shadow-inner select-none">
            {profile.fullName ? profile.fullName.charAt(0).toUpperCase() : "U"}
          </div>
          <div>
            <span className="inline-block rounded-full bg-white/20 px-3 py-0.5 text-[10px] font-bold uppercase tracking-wider mb-1.5 backdrop-blur-md">
              {isGoogleAccount ? "Tài khoản Google" : "Tài khoản Local"}
            </span>
            <h1 className="text-2xl md:text-3xl font-black tracking-tight">{profile.fullName || "Khách hàng"}</h1>
            <p className="text-white/70 text-xs md:text-sm font-medium">{profile.email || "Đang tải email..."}</p>
          </div>
        </div>
        <button
          className="group inline-flex items-center gap-2 rounded-full bg-rose-600 hover:bg-rose-700 active:scale-95 px-5 py-2.5 text-xs font-bold text-white shadow-md transition-all border border-white/10 self-start md:self-auto disabled:opacity-50 relative z-10"
          type="button"
          onClick={openLogoutModal}
          disabled={isLoggingOut}
        >
          <span className="material-symbols-outlined text-sm transition-transform group-hover:rotate-12">logout</span>
          {isLoggingOut ? "Đang đăng xuất..." : "Đăng xuất"}
        </button>
        <div className="absolute right-0 bottom-0 top-0 w-1/3 opacity-10 hidden md:flex items-center justify-center">
          <span className="material-symbols-outlined text-[160px] select-none translate-y-6">manage_accounts</span>
        </div>
      </div>

      {/* Dashboard Layout Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Left Column - Sidebar Navigation */}
        <div className="lg:col-span-1 space-y-4">
          {/* Desktop Tab Menu */}
          <div className="hidden lg:flex flex-col gap-1.5 p-3.5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-sm">
            {tabs.map((tab) => {
              let icon = "account_circle";
              if (tab.id === "orders") icon = "local_shipping";
              else if (tab.id === "addresses") icon = "home_pin";
              else if (tab.id === "fish") icon = "history_edu";
              return (
                <button
                  key={tab.id}
                  className={`flex items-center gap-3 px-4 py-3 rounded-2xl text-xs font-bold transition-all w-full text-left ${
                    activeTab === tab.id
                      ? "bg-primary text-white shadow-sm"
                      : "text-on-surface-variant/80 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-primary"
                  }`}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                >
                  <span className="material-symbols-outlined text-lg">{icon}</span>
                  {tab.label}
                </button>
              );
            })}
          </div>

          {/* Mobile Tab Pills (Scrollable) */}
          <div className="lg:hidden flex overflow-x-auto gap-2 pb-2 scrollbar-none">
            {tabs.map((tab) => {
              let icon = "account_circle";
              if (tab.id === "orders") icon = "local_shipping";
              else if (tab.id === "addresses") icon = "home_pin";
              else if (tab.id === "fish") icon = "history_edu";
              return (
                <button
                  key={tab.id}
                  className={`flex items-center gap-2 px-4.5 py-2.5 rounded-full text-xs font-bold whitespace-nowrap transition-all flex-shrink-0 ${
                    activeTab === tab.id
                      ? "bg-primary text-white shadow-sm"
                      : "bg-surface-container-high text-on-surface-variant hover:bg-surface-container-highest"
                  }`}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                >
                  <span className="material-symbols-outlined text-sm">{icon}</span>
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Right Column - Active tab panel Content */}
        <div className="lg:col-span-3">
          {activeTab === "account" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Personal Information card */}
              <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-100 dark:border-slate-800 shadow-sm space-y-5">
                <h2 className="text-base font-extrabold text-primary flex items-center gap-2 border-b border-slate-50 dark:border-slate-800/40 pb-3">
                  <span className="material-symbols-outlined text-lg">badge</span> Thông tin cá nhân
                </h2>
                {error && <div className="rounded-2xl bg-rose-50 dark:bg-rose-950/20 text-rose-700 dark:text-rose-300 text-xs px-4 py-2 border border-rose-100 dark:border-rose-900/30">{error}</div>}
                
                <div className="space-y-4">
                  <div>
                    <label className="text-[11px] font-bold uppercase tracking-wider text-on-surface-variant/80 pl-1">Họ và tên</label>
                    <input
                      className="w-full mt-1.5 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200/60 dark:border-slate-800 focus:border-primary focus:ring-2 focus:ring-primary/10 p-3.5 text-xs font-semibold outline-none transition-all"
                      value={profile.fullName ?? ""}
                      onChange={(event) => setProfile((prev) => ({ ...prev, fullName: event.target.value }))}
                      disabled={loadingProfile}
                      placeholder="Nhập họ và tên"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-bold uppercase tracking-wider text-on-surface-variant/80 pl-1">Số điện thoại</label>
                    <input
                      className="w-full mt-1.5 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200/60 dark:border-slate-800 focus:border-primary focus:ring-2 focus:ring-primary/10 p-3.5 text-xs font-semibold outline-none transition-all"
                      value={profile.phone ?? ""}
                      onChange={(event) => setProfile((prev) => ({ ...prev, phone: event.target.value }))}
                      disabled={loadingProfile}
                      placeholder="Nhập số điện thoại"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-bold uppercase tracking-wider text-on-surface-variant/80 pl-1">Địa chỉ mặc định</label>
                    <textarea
                      className="w-full mt-1.5 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200/60 dark:border-slate-800 focus:border-primary focus:ring-2 focus:ring-primary/10 p-3.5 text-xs font-semibold outline-none transition-all"
                      rows={3}
                      value={profile.address ?? ""}
                      onChange={(event) => setProfile((prev) => ({ ...prev, address: event.target.value }))}
                      disabled={loadingProfile}
                      placeholder="Nhập địa chỉ nhà riêng"
                    />
                  </div>
                  <button
                    className="w-full sm:w-auto px-6 py-3.5 rounded-full bg-primary hover:bg-primary/90 text-white font-bold text-xs shadow-sm transition-all hover:scale-[1.02]"
                    type="button"
                    onClick={handleUpdateProfile}
                    disabled={savingProfile}
                  >
                    {savingProfile ? "Đang lưu..." : "Lưu thay đổi"}
                  </button>
                </div>
              </div>

              {/* Login and security card */}
              <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-100 dark:border-slate-800 shadow-sm space-y-6">
                <div className="space-y-4">
                  <h2 className="text-base font-extrabold text-primary flex items-center gap-2 border-b border-slate-50 dark:border-slate-800/40 pb-3">
                    <span className="material-symbols-outlined text-lg">security</span> Tài khoản & Bảo mật
                  </h2>
                  <div>
                    <label className="text-[11px] font-bold uppercase tracking-wider text-on-surface-variant/80 pl-1">Địa chỉ Email</label>
                    <input className="w-full mt-1.5 rounded-2xl bg-slate-50/70 dark:bg-slate-950/70 border border-slate-200/40 dark:border-slate-850 p-3.5 text-xs font-semibold text-on-surface-variant/80 cursor-not-allowed outline-none" value={profile.email ?? ""} readOnly />
                  </div>
                  <div>
                    <label className="text-[11px] font-bold uppercase tracking-wider text-on-surface-variant/80 pl-1">Phương thức đăng nhập</label>
                    <div className="mt-1.5 flex items-center gap-2 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200/60 dark:border-slate-800 p-3.5">
                      <span className="material-symbols-outlined text-base text-primary">verified</span>
                      <span className="text-xs font-bold uppercase tracking-wider">{isGoogleAccount ? "Google" : "LOCAL"}</span>
                    </div>
                  </div>
                </div>

                {isLocalAccount && (
                  <div className="space-y-4 pt-3 border-t border-slate-50 dark:border-slate-800/40">
                    <h3 className="text-sm font-extrabold text-primary">Đổi mật khẩu</h3>
                    {passwordError && <div className="rounded-2xl bg-rose-50 dark:bg-rose-950/20 text-rose-700 dark:text-rose-300 text-xs px-4 py-2 border border-rose-100 dark:border-rose-900/30">{passwordError}</div>}
                    {passwordMessage && <div className="rounded-2xl bg-emerald-50 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-300 text-xs px-4 py-2 border border-emerald-100 dark:border-emerald-900/30">{passwordMessage}</div>}
                    <div className="space-y-3">
                      <input
                        className="w-full rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200/60 dark:border-slate-800 focus:border-primary focus:ring-2 focus:ring-primary/10 p-3.5 text-xs font-semibold outline-none transition-all"
                        type="password"
                        placeholder="Mật khẩu hiện tại"
                        value={currentPassword}
                        onChange={(event) => setCurrentPassword(event.target.value)}
                      />
                      <input
                        className="w-full rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200/60 dark:border-slate-800 focus:border-primary focus:ring-2 focus:ring-primary/10 p-3.5 text-xs font-semibold outline-none transition-all"
                        type="password"
                        placeholder="Mật khẩu mới"
                        value={newPassword}
                        onChange={(event) => setNewPassword(event.target.value)}
                      />
                      <input
                        className="w-full rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200/60 dark:border-slate-800 focus:border-primary focus:ring-2 focus:ring-primary/10 p-3.5 text-xs font-semibold outline-none transition-all"
                        type="password"
                        placeholder="Xác nhận mật khẩu mới"
                        value={confirmPassword}
                        onChange={(event) => setConfirmPassword(event.target.value)}
                      />
                      <button
                        className="w-full px-6 py-3.5 rounded-full bg-slate-800 hover:bg-slate-750 text-white font-bold text-xs shadow-sm transition-all"
                        type="button"
                        onClick={handleChangePassword}
                      >
                        Cập nhật mật khẩu
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === "orders" && (
            <div className="space-y-6">
              {/* Header Filter Panel */}
              <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800/80 pb-4">
                <div>
                  <h2 className="text-base font-extrabold text-slate-800 dark:text-slate-200">Đơn hàng của tôi</h2>
                  <p className="text-xs text-on-surface-variant/75 mt-0.5">Mỗi trang hiển thị 5 đơn hàng gần nhất.</p>
                </div>
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
                        orderStatusFilter === filter.id
                          ? "bg-primary text-white shadow-sm"
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
                <div className="rounded-3xl bg-surface-container-low p-12 text-center text-on-surface-variant/70 border border-slate-100 dark:border-slate-800 shadow-inner font-semibold text-xs">
                  Không có đơn hàng phù hợp bộ lọc.
                </div>
              ) : (
                <div className="space-y-5">
                  {pagedOrders.map((order) => (
                    <div
                      key={order.id}
                      className="bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-sm border border-slate-100/80 dark:border-slate-800/80 transition-all duration-300 hover:shadow-md"
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

                      {/* Summary of Items */}
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
                            <span className="text-xs font-semibold text-on-surface-variant/70 bg-slate-50 dark:bg-slate-800 px-3 py-1.5 rounded-xl border border-slate-100 dark:border-slate-800/60 flex items-center gap-1">
                              <span className="material-symbols-outlined text-sm">support_agent</span> Vui lòng gọi hotline để hủy
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
                          <button
                            className="px-4 py-2 rounded-full bg-slate-800 text-white font-bold text-xs hover:bg-slate-750 transition-colors"
                            type="button"
                            onClick={() => handleReorder(order)}
                          >
                            Mua lại
                          </button>
                        </div>
                      </div>

                      {/* Detail block */}
                      {expandedOrderId === order.id && (
                        <div className="mt-5 space-y-4 pt-4 border-t border-slate-100 dark:border-slate-800">
                          <div className="flex flex-wrap gap-4 text-xs font-bold text-on-surface-variant/85 bg-slate-50 dark:bg-slate-800/30 p-3 rounded-2xl">
                            {order.paymentMethod && <span className="flex items-center gap-1"><span className="material-symbols-outlined text-sm">payments</span>Thanh toán: {order.paymentMethod}</span>}
                            {order.paymentStatus && <span className="flex items-center gap-1"><span className="material-symbols-outlined text-sm">info</span>Trạng thái: {PAYMENT_LABELS[order.paymentStatus] ?? order.paymentStatus}</span>}
                          </div>

                          <div className="space-y-2.5">
                            <p className="text-xs font-black text-slate-800 dark:text-slate-200">Chi tiết sản phẩm</p>
                            {order.items.map((item) => (
                              <div
                                key={item.productId}
                                className="flex items-center justify-between gap-4 rounded-2xl bg-slate-50/50 dark:bg-slate-800/20 p-4 border border-slate-100/50 dark:border-slate-800/40"
                              >
                                <div className="flex items-center gap-3 min-w-0">
                                  <div className="h-12 w-12 overflow-hidden rounded-xl bg-slate-100 dark:bg-slate-850 border border-slate-200/40 flex-shrink-0">
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

                  {/* Pagination */}
                  {totalOrderPages > 1 && (
                    <div className="flex items-center justify-between text-xs text-on-surface-variant/80 pt-2 bg-white/40 dark:bg-slate-900/10 px-2">
                      <span className="font-bold">
                        Trang <strong className="text-primary text-sm font-black">{orderPage}</strong> / {totalOrderPages}
                      </span>
                      <div className="flex items-center gap-1.5">
                        <button
                          className="w-9 h-9 flex items-center justify-center rounded-xl bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-850 hover:bg-slate-50 dark:hover:bg-slate-800 text-on-surface-variant disabled:opacity-40 disabled:cursor-not-allowed shadow-sm transition-all"
                          type="button"
                          onClick={() => setOrderPage((prev) => Math.max(1, prev - 1))}
                          disabled={orderPage === 1}
                        >
                          <span className="material-symbols-outlined text-base">chevron_left</span>
                        </button>
                        <button
                          className="w-9 h-9 flex items-center justify-center rounded-xl bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-850 hover:bg-slate-50 dark:hover:bg-slate-800 text-on-surface-variant disabled:opacity-40 disabled:cursor-not-allowed shadow-sm transition-all"
                          type="button"
                          onClick={() => setOrderPage((prev) => Math.min(totalOrderPages, prev + 1))}
                          disabled={orderPage === totalOrderPages}
                        >
                          <span className="material-symbols-outlined text-base">chevron_right</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {activeTab === "fish" && (
            <div className="space-y-6">
              <h2 className="text-base font-extrabold text-slate-800 dark:text-slate-200 border-b border-slate-100 dark:border-slate-800/80 pb-3 mb-1">
                Lịch sử chăm sóc cá
              </h2>
              {fishRecords.length === 0 ? (
                <div className="rounded-3xl bg-surface-container-low p-12 text-center text-on-surface-variant/70 border border-slate-100 dark:border-slate-800 shadow-inner text-xs font-semibold">
                  Chưa có hồ sơ sức khỏe cá.
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {fishRecords.map((record) => (
                    <div key={`${record.productId}-${record.purchasedAt}`} className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-100 dark:border-slate-800 shadow-sm flex flex-col justify-between">
                      <div>
                        <div className="flex gap-4 items-start border-b border-slate-50 dark:border-slate-850 pb-3 mb-3">
                          <img className="w-16 h-16 rounded-2xl object-cover border border-slate-100/80 dark:border-slate-800 flex-shrink-0" src={record.imageUrl || ""} alt={record.name} />
                          <div>
                            <h3 className="font-extrabold text-xs text-primary leading-tight">{record.name}</h3>
                            <p className="text-[10px] text-on-surface-variant/80 mt-1 font-semibold flex items-center gap-1">
                              <span className="material-symbols-outlined text-xs">calendar_month</span> Mua ngày: {new Date(record.purchasedAt).toLocaleDateString("vi-VN")}
                            </p>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <h4 className="text-[11px] font-bold uppercase tracking-wider text-on-surface-variant">Lịch sử tiêm chủng & Thông tin</h4>
                          {record.attributes.length === 0 ? (
                            <p className="text-xs text-on-surface-variant font-medium">Chưa cập nhật thông tin chăm sóc.</p>
                          ) : (
                            <div className="grid grid-cols-2 gap-2 text-xs">
                              {record.attributes.map((attr) => (
                                <div key={`${record.productId}-${attr.attributeName}`} className="bg-slate-50 dark:bg-slate-950 p-2 rounded-xl border border-slate-100/50 dark:border-slate-800/40">
                                  <span className="block text-[9px] font-bold text-on-surface-variant/70 uppercase truncate">{attr.attributeName}</span>
                                  <span className="font-extrabold text-[11px] text-primary block mt-0.5 truncate">{attr.value}</span>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>

                      {record.certificateUrl ? (
                        <a
                          className="mt-4 w-full py-2.5 rounded-xl border border-primary/45 hover:bg-primary/5 dark:hover:bg-primary/10 text-primary text-center font-bold text-xs transition-colors flex items-center justify-center gap-1.5"
                          href={record.certificateUrl}
                        >
                          <span className="material-symbols-outlined text-base">download_certificate</span>
                          Tải giấy chứng nhận cá
                        </a>
                      ) : null}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === "addresses" && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Address List */}
              <div className="space-y-4">
                <h2 className="text-base font-extrabold text-slate-800 dark:text-slate-200 border-b border-slate-100 dark:border-slate-800/80 pb-3 mb-1">
                  Sổ địa chỉ của tôi
                </h2>
                {addresses.length === 0 ? (
                  <div className="rounded-3xl bg-surface-container-low p-12 text-center text-on-surface-variant/70 border border-slate-100 dark:border-slate-800 shadow-inner font-semibold text-xs">
                    Chưa có địa chỉ nào được thiết lập.
                  </div>
                ) : (
                  addresses.map((addr) => (
                    <div
                      key={addr.id}
                      className="rounded-3xl bg-white dark:bg-slate-900 p-5 border border-slate-100 dark:border-slate-800 shadow-sm space-y-3 transition-all hover:shadow-md"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="material-symbols-outlined text-primary text-base">person</span>
                          <h3 className="font-extrabold text-xs text-primary">{addr.receiverName}</h3>
                        </div>
                        {addr.isDefault && (
                          <span className="text-[9px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 border border-emerald-200/50">
                            Mặc định
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-on-surface-variant/80 font-semibold flex items-center gap-1.5"><span className="material-symbols-outlined text-xs">phone_iphone</span> {addr.phoneNumber}</p>
                      <p className="text-xs text-on-surface-variant/80 font-semibold flex items-start gap-1.5"><span className="material-symbols-outlined text-xs mt-0.5">location_on</span> {formatAddress(addr)}</p>
                      <div className="flex gap-2 pt-2 border-t border-slate-50 dark:border-slate-850">
                        <button
                          className="px-3.5 py-1.5 rounded-full bg-slate-50 hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-[11px] font-bold border border-slate-200/30"
                          type="button"
                          onClick={() => handleEditAddress(addr)}
                        >
                          Sửa
                        </button>
                        <button
                          className="px-3.5 py-1.5 rounded-full bg-primary text-white text-[11px] font-bold disabled:opacity-60"
                          type="button"
                          onClick={() => handleSetDefaultAddress(addr.id)}
                          disabled={addr.isDefault}
                        >
                          Thiết lập mặc định
                        </button>
                        <button
                          className="px-3.5 py-1.5 rounded-full bg-rose-50 hover:bg-rose-100 text-rose-600 text-[11px] font-bold border border-rose-100"
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

              {/* Form to edit or create addresses */}
              <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-100 dark:border-slate-800 shadow-sm space-y-4">
                <h3 className="text-base font-extrabold text-primary border-b border-slate-50 dark:border-slate-850 pb-3">
                  {editingAddressId ? "Cập nhật địa chỉ" : "Thêm địa chỉ mới"}
                </h3>
                
                <div className="space-y-4">
                  <div>
                    <label className="text-[11px] font-bold uppercase tracking-wider text-on-surface-variant pl-1">Họ tên người nhận</label>
                    <input
                      className="w-full mt-1 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200/60 dark:border-slate-800 focus:border-primary focus:ring-2 focus:ring-primary/10 p-3.5 text-xs font-semibold outline-none transition-all"
                      placeholder="Họ và tên người nhận"
                      value={addressForm.receiverName}
                      onChange={(event) => setAddressForm((prev) => ({ ...prev, receiverName: event.target.value }))}
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-bold uppercase tracking-wider text-on-surface-variant pl-1">Số điện thoại</label>
                    <input
                      className="w-full mt-1 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200/60 dark:border-slate-800 focus:border-primary focus:ring-2 focus:ring-primary/10 p-3.5 text-xs font-semibold outline-none transition-all"
                      placeholder="Số điện thoại người nhận"
                      value={addressForm.phoneNumber}
                      onChange={(event) => {
                        const value = event.target.value.replace(/[^\d]/g, "");
                        setAddressForm((prev) => ({ ...prev, phoneNumber: value.slice(0, 10) }));
                      }}
                    />
                  </div>
                  
                  <div className="space-y-3">
                    <div>
                      <label className="text-[11px] font-bold uppercase tracking-wider text-on-surface-variant pl-1">Tỉnh / Thành phố</label>
                      <select
                        className="w-full mt-1 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200/60 dark:border-slate-800 p-3.5 text-xs font-semibold outline-none"
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
                        <option value="">Chọn Tỉnh / Thành</option>
                        {provinces.map((item) => (
                          <option key={item.id} value={item.id}>{item.name}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="text-[11px] font-bold uppercase tracking-wider text-on-surface-variant pl-1">Quận / Huyện</label>
                      <select
                        className="w-full mt-1 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200/60 dark:border-slate-800 p-3.5 text-xs font-semibold outline-none disabled:opacity-50"
                        value={addressForm.districtId ?? ""}
                        disabled={!addressForm.provinceId}
                        onChange={(event) => {
                          const nextId = Number(event.target.value);
                          const selected = districts.find((item) => item.id === nextId);
                          setAddressForm((prev) => ({
                            ...prev,
                            districtId: Number.isFinite(nextId) ? nextId : null,
                            districtName: selected?.name ?? "",
                            wardCode: "",
                            wardName: "",
                          }));
                        }}
                      >
                        <option value="">Chọn Quận / Huyện</option>
                        {districts.map((item) => (
                          <option key={item.id} value={item.id}>{item.name}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="text-[11px] font-bold uppercase tracking-wider text-on-surface-variant pl-1">Phường / Xã</label>
                      <select
                        className="w-full mt-1 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200/60 dark:border-slate-800 p-3.5 text-xs font-semibold outline-none disabled:opacity-50"
                        value={addressForm.wardCode}
                        disabled={!addressForm.districtId}
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
                        <option value="">Chọn Phường / Xã</option>
                        {wards.map((item) => (
                          <option key={item.code} value={item.code}>{item.name}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                  
                  <div>
                    <label className="text-[11px] font-bold uppercase tracking-wider text-on-surface-variant pl-1">Địa chỉ chi tiết</label>
                    <textarea
                      className="w-full mt-1 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200/60 dark:border-slate-800 focus:border-primary focus:ring-2 focus:ring-primary/10 p-3.5 text-xs font-semibold outline-none transition-all"
                      placeholder="Số nhà, ngõ ngách, tên đường..."
                      rows={3}
                      value={addressForm.streetAddress}
                      onChange={(event) => setAddressForm((prev) => ({ ...prev, streetAddress: event.target.value }))}
                    />
                  </div>
                  
                  <label className="flex items-center gap-2.5 text-xs font-bold text-on-surface-variant/80 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      className="h-4 w-4 rounded-sm border-slate-300 text-primary focus:ring-primary"
                      checked={addressForm.isDefault}
                      onChange={(event) => setAddressForm((prev) => ({ ...prev, isDefault: event.target.checked }))}
                    />
                    Đặt làm địa chỉ mặc định
                  </label>
                  
                  <div className="flex flex-wrap gap-2.5 pt-2">
                    <button
                      className="px-6 py-3 rounded-full bg-primary hover:bg-primary/95 text-white font-bold text-xs shadow-sm hover:scale-[1.02] transition-all"
                      type="button"
                      onClick={handleSaveAddress}
                    >
                      {editingAddressId ? "Cập nhật" : "Lưu địa chỉ"}
                    </button>
                    {editingAddressId && (
                      <button
                        className="px-6 py-3 rounded-full bg-slate-50 hover:bg-slate-100 dark:bg-slate-850 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs border border-slate-250/20"
                        type="button"
                        onClick={resetAddressForm}
                      >
                        Hủy
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

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
              className="w-full rounded-2xl border border-slate-200/80 dark:border-slate-850 p-3.5 text-xs outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 dark:bg-slate-950 transition-all font-semibold"
              rows={3}
              placeholder="Lý do hủy đơn..."
              value={cancelReason}
              onChange={(event) => setCancelReason(event.target.value)}
            />
            <div className="mt-5 flex justify-end gap-2.5">
              <button
                className="px-5 py-2.5 rounded-full bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs transition-colors"
                type="button"
                onClick={closeCancelModal}
                disabled={cancelSubmitting}
              >
                Đóng
              </button>
              <button
                className="px-5 py-2.5 rounded-full bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-sm transition-all disabled:opacity-50"
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

      {/* Delete Address Confirmation Modal */}
      {deleteAddressTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/55 backdrop-blur-xs px-4">
          <div className="w-full max-w-md rounded-3xl bg-white dark:bg-slate-900 p-6 shadow-2xl border border-slate-100 dark:border-slate-800">
            <h3 className="text-lg font-extrabold text-primary mb-2">Xác nhận xóa địa chỉ</h3>
            <p className="text-xs text-on-surface-variant/80 mb-4 font-semibold">
              Bạn có chắc muốn xóa địa chỉ của {deleteAddressTarget.receiverName}?
            </p>
            <div className="rounded-2xl bg-slate-50 dark:bg-slate-950 p-3.5 text-xs font-semibold text-on-surface-variant/80 border border-slate-100 dark:border-slate-850">
              {formatAddress(deleteAddressTarget)}
            </div>
            <div className="mt-5 flex justify-end gap-2.5">
              <button
                className="px-5 py-2.5 rounded-full bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs transition-colors"
                type="button"
                onClick={() => setDeleteAddressTarget(null)}
              >
                Hủy
              </button>
              <button
                className="px-5 py-2.5 rounded-full bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-sm transition-all"
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
