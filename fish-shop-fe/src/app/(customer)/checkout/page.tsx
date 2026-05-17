"use client";

import { useEffect, useState, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useCart } from "@/components/customer/cart/CartContext";
import ApplyCouponInput from "@/components/customer/checkout/ApplyCouponInput";
import { CouponApplyResponse } from "@/types/coupon";
import { API_URL } from "@/app/config/api";

type CustomerProfile = {
  fullName?: string | null;
  phone?: string | null;
  address?: string | null;
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

type PaymentMethod = "COD" | "VNPAY";

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

export default function CheckoutPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { batches, removeBatches, syncServerCart, clear, hydrated, getBatchById } = useCart();
  const batchId = searchParams.get("batchId");
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [profile, setProfile] = useState<CustomerProfile>({});
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("COD");
  const [provinceId, setProvinceId] = useState<number | null>(null);
  const [province, setProvince] = useState("");
  const [districtId, setDistrictId] = useState<number | null>(null);
  const [district, setDistrict] = useState("");
  const [wardCode, setWardCode] = useState("");
  const [ward, setWard] = useState("");
  const [orderNote, setOrderNote] = useState("");
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [provinces, setProvinces] = useState<ProvinceOption[]>([]);
  const [districts, setDistricts] = useState<DistrictOption[]>([]);
  const [wards, setWards] = useState<WardOption[]>([]);
  const [shippingFee, setShippingFee] = useState<number>(45000); // Default fee
  const [loadingShippingFee, setLoadingShippingFee] = useState(false);
  const [shippingFeeError, setShippingFeeError] = useState<string | null>(null);
  const [appliedCoupon, setAppliedCoupon] = useState<CouponApplyResponse | null>(null);

  useEffect(() => {
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
  }, []);

  useEffect(() => {
    if (provinces.length > 0 && provinceId === null) {
      setProvinceId(provinces[0].id);
      setProvince(provinces[0].name);
    }
  }, [provinces, provinceId]);

  useEffect(() => {
    const loadDistricts = async () => {
      if (provinceId === null) {
        setDistricts([]);
        setDistrictId(null);
        setDistrict("");
        return;
      }

      try {
        const response = await fetch(`${API_URL}/api/public/ghn/districts?provinceId=${provinceId}`, { cache: "no-store" });
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
  }, [provinceId]);

  useEffect(() => {
    if (districts.length === 0) {
      setDistrictId(null);
      setDistrict("");
      return;
    }

    const selected = districts.find((item) => item.id === districtId);
    if (!selected) {
      setDistrictId(districts[0].id);
      setDistrict(districts[0].name);
    } else if (selected.name !== district) {
      setDistrict(selected.name);
    }
  }, [districts, districtId, district]);

  useEffect(() => {
    const loadWards = async () => {
      if (districtId === null) {
        setWards([]);
        setWardCode("");
        setWard("");
        return;
      }

      try {
        const response = await fetch(`${API_URL}/api/public/ghn/wards?districtId=${districtId}`, { cache: "no-store" });
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
  }, [districtId]);

  useEffect(() => {
    if (wards.length === 0) {
      setWardCode("");
      setWard("");
      return;
    }

    const selected = wards.find((item) => item.code === wardCode);
    if (!selected) {
      setWardCode(wards[0].code);
      setWard(wards[0].name);
    } else if (selected.name !== ward) {
      setWard(selected.name);
    }
  }, [wards, wardCode, ward]);

  // Fetch shipping fee when district changes
  useEffect(() => {
    if (districtId === null || districtId <= 0) {
      setShippingFee(45000); // Default fee
      setShippingFeeError(null);
      return;
    }

    if (!wardCode && wards.length > 0) {
      setShippingFee(45000);
      setShippingFeeError("Vui lòng chọn Phường/Xã để tính phí giao hàng.");
      return;
    }

    const fetchShippingFee = async () => {
      try {
        setLoadingShippingFee(true);
        setShippingFeeError(null);
        const wardParam = wardCode ? `&wardCode=${encodeURIComponent(wardCode)}` : "";
        const response = await fetch(`${API_URL}/api/public/ghn/shipping-fee?districtId=${districtId}${wardParam}`, {
          cache: "no-store",
        });

        if (response.ok) {
          const data = (await response.json()) as { shippingFee?: number; message?: string };
          if (data.shippingFee && data.shippingFee > 0) {
            setShippingFee(data.shippingFee);
          } else {
            setShippingFee(45000);
          }
          if (data.message) {
            setShippingFeeError(data.message);
          }
        } else {
          const payload = (await response.json().catch(() => ({}))) as { message?: string };
          setShippingFee(45000);
          setShippingFeeError(payload.message || "Không thể lấy phí vận chuyển từ GHN.");
        }
      } catch (err) {
        console.error("Failed to fetch shipping fee:", err);
        setShippingFee(45000); // Fallback to default
        setShippingFeeError("Không thể kết nối đến GHN, đang dùng phí mặc định.");
      } finally {
        setLoadingShippingFee(false);
      }
    };

    fetchShippingFee();
  }, [districtId, wardCode, wards.length]);

  useEffect(() => {
    const ensureSession = async () => {
      const sessionResponse = await fetch("/api/customer/auth/session");
      if (!sessionResponse.ok) {
        const returnUrl = batchId ? `/checkout?batchId=${batchId}` : "/checkout";
        router.replace(`/auth/login?returnUrl=${encodeURIComponent(returnUrl)}`);
        return;
      }

      try {
        const meResponse = await fetch("/api/customer/me", { cache: "no-store" });
        if (meResponse.ok) {
          const data = (await meResponse.json()) as CustomerProfile;
          setProfile({
            fullName: data.fullName ?? "",
            phone: data.phone ?? "",
            address: data.address ?? "",
          });
        }

        const addressResponse = await fetch("/api/customer/addresses", { cache: "no-store" });
        if (addressResponse.ok) {
          const data = (await addressResponse.json()) as AddressItem[];
          const defaultAddress = data.find((item) => item.isDefault) ?? data[0];
          if (defaultAddress) {
            setProfile({
              fullName: defaultAddress.receiverName,
              phone: defaultAddress.phoneNumber,
              address: defaultAddress.streetAddress,
            });
            setProvinceId(defaultAddress.provinceId);
            setProvince(defaultAddress.provinceName);
            setDistrictId(defaultAddress.districtId);
            setDistrict(defaultAddress.districtName);
            setWardCode(defaultAddress.wardCode);
            setWard(defaultAddress.wardName);
          }
        }
      } finally {
        setLoadingProfile(false);
      }
    };

    ensureSession();
  }, [router, batchId]);

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    if (!profile.fullName?.trim()) {
      errors.fullName = "Vui lòng nhập họ và tên người nhận";
    }

    if (!profile.phone?.trim()) {
      errors.phone = "Vui lòng nhập số điện thoại";
    } else if (!/^\d{10}$/.test(profile.phone.trim())) {
      errors.phone = "Số điện thoại phải đúng 10 chữ số";
    }

    if (!profile.address?.trim()) {
      errors.address = "Vui lòng nhập địa chỉ chi tiết (số nhà, tên đường)";
    }

    if (!province) {
      errors.province = "Vui lòng chọn Tỉnh/Thành phố";
    }

    if (!district) {
      errors.district = "Vui lòng chọn Quận/Huyện";
    }

    if (!ward) {
      errors.ward = "Vui lòng chọn Phường/Xã";
    }

    if (!wardCode) {
      errors.ward = "Vui lòng chọn Phường/Xã";
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
      maximumFractionDigits: 0,
    }).format(amount);

  const selectedBatches = useMemo(() => {
    if (!batchId) {
      return batches;
    }

    // Try context first
    const fromCtx = getBatchById(batchId);
    if (fromCtx) return [fromCtx];

    // Fallback: try reading localStorage directly (in case context wasn't populated)
    try {
      const raw = typeof window !== 'undefined' ? window.localStorage.getItem('cartBatches') : null;
      if (raw) {
        const parsed = JSON.parse(raw) as Array<any>;
        const found = Array.isArray(parsed) ? parsed.find((b) => b && b.id === batchId) : null;
        if (found) return [found as typeof batches[number]];
      }
    } catch {
      // ignore parse errors
    }

    return [];
  }, [batchId, batches, getBatchById]);

  // NOTE: loading UI moved lower to preserve hooks order

  const selectedItems = useMemo(
    () => selectedBatches.flatMap((batch) => batch.items),
    [selectedBatches]
  );

  const selectedTotalItems = useMemo(
    () => selectedBatches.reduce((sum, batch) => sum + batch.items.reduce((sub, item) => sub + item.quantity, 0), 0),
    [selectedBatches]
  );

  const selectedTotalPrice = useMemo(
    () => selectedBatches.reduce((sum, batch) => sum + batch.items.reduce((sub, item) => sub + item.price * item.quantity, 0), 0),
    [selectedBatches]
  );

  const discountAmountNum = appliedCoupon ? Number(appliedCoupon.discountAmount) || 0 : 0;
  const grandTotal = selectedTotalPrice - discountAmountNum + (selectedTotalItems > 0 ? shippingFee : 0);

  // Nếu giỏ hàng chưa được hydrate (đang đọc từ localStorage hoặc server),
  // hiển thị trạng thái nạp để tránh báo "Giỏ hàng đang trống" nhầm.
  if (!hydrated) {
    return (
      <main className="px-4 md:px-6 max-w-7xl mx-auto pb-20">
        <div className="mb-8 md:mb-10">
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-primary mb-2">Hoàn tất đặt hàng</h1>
          <p className="text-on-surface-variant font-body text-sm md:text-base">Đang nạp giỏ hàng...</p>
        </div>
      </main>
    );
  }

  const handleConfirmOrder = async () => {
    if (!hydrated) {
      setError("Giỏ hàng đang đồng bộ, vui lòng chờ một chút.");
      return;
    }

    if (selectedBatches.length === 0) {
      const message = batchId
        ? "Không tìm thấy lượt thêm hợp lệ để thanh toán. Vui lòng quay lại giỏ hàng."
        : "Giỏ hàng đang trống. Vui lòng thêm sản phẩm trước khi thanh toán.";
      setError(message);
      return;
    }

    if (!validateForm()) {
      setError("Vui lòng kiểm tra lại thông tin của bạn.");
      return;
    }

    if (!wardCode) {
      setError("Vui lòng chọn Phường/Xã để tính phí giao hàng.");
      return;
    }

      try {
      setSubmitting(true);
      setError(null);

        // Snapshot of current context batch ids to detect local-only batches
        const contextBatchIds = new Set(batches.map((b) => b.id));

      await syncServerCart(selectedBatches);

      // Create checkout
      // Note: Recipient info (fullName, phone, address) is stored only in Order entity,
      // NOT in User profile. User profile remains unchanged.
      const checkoutRes = await fetch("/api/customer/checkout/vnpay", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName: profile.fullName?.trim(),
          phone: profile.phone?.trim(),
          address: profile.address?.trim(),
          province,
          district,
          ward,
          provinceId,
          districtId,
          wardCode,
          paymentMethod,
          note: orderNote.trim(),
          couponCode: appliedCoupon?.code || null,
        }),
      });

      const checkoutData = (await checkoutRes.json().catch(() => ({}))) as {
        paymentUrl?: string | null;
        message?: string;
        orderCode?: string;
        vnpayConfigured?: boolean;
        errors?: Record<string, string>;
      };

      if (!checkoutRes.ok) {
        console.error("[checkout] Error response:", checkoutRes.status, checkoutData);
        const fallbackMessage = checkoutData.errors
          ? Object.values(checkoutData.errors).join(" ")
          : "Không thể tạo đơn hàng.";
        throw new Error(checkoutData.message || fallbackMessage);
      }

      const paidBatchIds = new Set(selectedBatches.map((batch) => batch.id));
      const remainingBatches = batches.filter((batch) => !paidBatchIds.has(batch.id));

      removeBatches(Array.from(paidBatchIds));

      // If some paid batches were only in localStorage (not in context), remove them from localStorage
      try {
        const raw = typeof window !== 'undefined' ? window.localStorage.getItem('cartBatches') : null;
        if (raw) {
          const parsed = JSON.parse(raw) as Array<any>;
          const updated = Array.isArray(parsed) ? parsed.filter((b) => !paidBatchIds.has(b.id)) : parsed;
          if (Array.isArray(updated) && updated.length > 0) {
            window.localStorage.setItem('cartBatches', JSON.stringify(updated));
          } else {
            window.localStorage.removeItem('cartBatches');
          }
        }
      } catch {
        // ignore localStorage errors
      }

      await syncServerCart(remainingBatches);

      if (paymentMethod === "VNPAY" && checkoutData.paymentUrl) {
        window.location.href = checkoutData.paymentUrl;
        return;
      }

      router.push(
        `/checkout/vnpay-return?status=pending&orderCode=${checkoutData.orderCode || "unknown"}&message=${encodeURIComponent(checkoutData.message || "Đơn hàng của bạn đã được tạo thành công!")}`
      );
    } catch (err) {
      const message = err instanceof Error ? err.message : "Không thể tạo đơn hàng.";
      setError(message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="px-4 md:px-6 max-w-7xl mx-auto pb-20">
      {/* Header */}
      <div className="mb-8 md:mb-10">
        <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-primary mb-2">
          Hoàn tất đặt hàng
        </h1>
        <p className="text-on-surface-variant font-body text-sm md:text-base">
          Vui lòng kiểm tra thông tin vận chuyển và chọn phương thức thanh toán.
        </p>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="mb-6 rounded-xl bg-error/10 text-error text-sm px-4 py-3 flex items-center gap-2">
          <span className="material-symbols-outlined text-base">error</span>
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
        {/* ========== LEFT COLUMN: Shipping + Payment ========== */}
        <div className="lg:col-span-7 space-y-6">
          {/* Section 1: Shipping Information */}
          <section className="bg-surface-container-lowest rounded-2xl p-6 md:p-8 shadow-[0_2px_12px_rgba(0,0,0,0.04)]">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-full bg-primary-fixed flex items-center justify-center">
                <span className="material-symbols-outlined text-on-primary-fixed text-xl">local_shipping</span>
              </div>
              <div>
                <h2 className="text-lg font-bold text-primary">Thông tin người nhận</h2>
                <p className="text-xs text-on-surface-variant">Shipper sẽ liên hệ SĐT này để giao hàng</p>
              </div>
            </div>

            <div className="space-y-5">
              {/* Full Name */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-on-surface-variant" htmlFor="checkout-name">
                  Họ và tên <span className="text-error">*</span>
                </label>
                <input
                  className={`w-full bg-surface-container-highest border-2 rounded-xl p-3.5 focus:ring-2 focus:ring-primary/20 transition-all outline-none text-sm ${
                    validationErrors.fullName ? "border-error" : "border-transparent focus:border-primary/30"
                  }`}
                  id="checkout-name"
                  placeholder="Nguyễn Văn A"
                  type="text"
                  value={profile.fullName ?? ""}
                  onChange={(e) => setProfile((prev) => ({ ...prev, fullName: e.target.value }))}
                  disabled={loadingProfile}
                />
                {validationErrors.fullName && <p className="text-error text-xs px-1">{validationErrors.fullName}</p>}
              </div>

              {/* Phone */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-on-surface-variant" htmlFor="checkout-phone">
                  Số điện thoại <span className="text-error">*</span>
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-on-surface-variant text-sm">🇻🇳 +84</span>
                  <input
                    className={`w-full bg-surface-container-highest border-2 rounded-xl p-3.5 pl-20 focus:ring-2 focus:ring-primary/20 transition-all outline-none text-sm ${
                      validationErrors.phone ? "border-error" : "border-transparent focus:border-primary/30"
                    }`}
                    id="checkout-phone"
                    placeholder="0901234567"
                    type="tel"
                    inputMode="numeric"
                    value={profile.phone ?? ""}
                    onChange={(e) => {
                      const value = e.target.value.replace(/[^\d]/g, "");
                      setProfile((prev) => ({ ...prev, phone: value.slice(0, 10) }));
                    }}
                    maxLength={10}
                    disabled={loadingProfile}
                  />
                </div>
                {validationErrors.phone && <p className="text-error text-xs px-1">{validationErrors.phone}</p>}
              </div>

              {/* Province / District / Ward */}
              <div className="space-y-3 p-4 bg-surface-container-high/50 rounded-xl">
                <p className="text-xs font-bold uppercase tracking-wider text-on-surface-variant flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-sm">location_on</span>
                  Khu vực giao hàng
                </p>
                {shippingFeeError && (
                  <div className="rounded-lg bg-amber-50 text-amber-700 text-xs px-3 py-2">
                    {shippingFeeError}
                  </div>
                )}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-on-surface-variant">Tỉnh / Thành phố</label>
                    <select
                      className="w-full bg-surface-container-highest border-0 rounded-lg p-3 focus:ring-2 focus:ring-primary/20 transition-all outline-none appearance-none text-sm cursor-pointer"
                      value={provinceId ?? ""}
                      onChange={(e) => {
                        if (!e.target.value) {
                          setProvinceId(null);
                          setProvince("");
                          setDistrictId(null);
                          setDistrict("");
                          setWardCode("");
                          setWard("");
                          return;
                        }

                        const nextId = Number(e.target.value);
                        const selected = provinces.find((item) => item.id === nextId);

                        setProvinceId(nextId);
                        setProvince(selected?.name ?? "");

                        setDistrictId(null);
                        setDistrict("");
                        setWardCode("");
                        setWard("");
                      }}
                    >
                      {provinces.map((item) => (
                        <option key={item.id} value={item.id}>{item.name}</option>
                      ))}
                    </select>
                    {validationErrors.province && <p className="text-error text-xs px-1">{validationErrors.province}</p>}
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-on-surface-variant">Quận / Huyện</label>
                    <select
                      className="w-full bg-surface-container-highest border-0 rounded-lg p-3 focus:ring-2 focus:ring-primary/20 transition-all outline-none appearance-none text-sm cursor-pointer"
                      value={districtId ?? ""}
                      onChange={(e) => {
                        const nextId = Number(e.target.value);
                        const selected = districts.find((item) => item.id === nextId);
                        setDistrictId(Number.isFinite(nextId) ? nextId : null);
                        setDistrict(selected?.name ?? "");
                      }}
                    >
                      {districts.map((item) => (
                        <option key={item.id} value={item.id}>{item.name}</option>
                      ))}
                    </select>
                    {validationErrors.district && <p className="text-error text-xs px-1">{validationErrors.district}</p>}
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-on-surface-variant">Phường / Xã</label>
                    <select
                      className="w-full bg-surface-container-highest border-0 rounded-lg p-3 focus:ring-2 focus:ring-primary/20 transition-all outline-none appearance-none text-sm cursor-pointer"
                      value={wardCode}
                      onChange={(e) => {
                        const nextCode = e.target.value;
                        const selected = wards.find((item) => item.code === nextCode);
                        setWardCode(nextCode);
                        setWard(selected?.name ?? "");
                      }}
                    >
                      {wards.map((item) => (
                        <option key={item.code} value={item.code}>{item.name}</option>
                      ))}
                    </select>
                    {validationErrors.ward && <p className="text-error text-xs px-1">{validationErrors.ward}</p>}
                  </div>
                </div>
              </div>

              {/* Address Detail */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-on-surface-variant" htmlFor="checkout-address">
                  Địa chỉ chi tiết <span className="text-error">*</span>
                </label>
                <textarea
                  className={`w-full bg-surface-container-highest border-2 rounded-xl p-3.5 focus:ring-2 focus:ring-primary/20 transition-all outline-none text-sm resize-none ${
                    validationErrors.address ? "border-error" : "border-transparent focus:border-primary/30"
                  }`}
                  id="checkout-address"
                  placeholder="Số nhà, tên đường (VD: 123 Nguyễn Huệ)"
                  rows={2}
                  value={profile.address ?? ""}
                  onChange={(e) => setProfile((prev) => ({ ...prev, address: e.target.value }))}
                  disabled={loadingProfile}
                />
                {validationErrors.address && <p className="text-error text-xs px-1">{validationErrors.address}</p>}
              </div>
            </div>
          </section>

          {/* Section 2: Payment Method */}
          <section className="bg-surface-container-lowest rounded-2xl p-6 md:p-8 shadow-[0_2px_12px_rgba(0,0,0,0.04)]">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-full bg-secondary-fixed flex items-center justify-center">
                <span className="material-symbols-outlined text-on-secondary-fixed text-xl">payments</span>
              </div>
              <h2 className="text-lg font-bold text-primary">Phương thức thanh toán</h2>
            </div>

            <div className="space-y-3">
              {/* COD */}
              <label
                className={`relative flex items-center p-4 rounded-xl cursor-pointer border-2 transition-all duration-200 ${
                  paymentMethod === "COD"
                    ? "border-primary bg-primary/5 shadow-sm"
                    : "border-transparent bg-surface-container-low hover:bg-surface-container-high"
                }`}
              >
                <input className="hidden" name="payment" type="radio" value="COD" checked={paymentMethod === "COD"} onChange={() => setPaymentMethod("COD")} />
                <div className="flex items-center justify-between w-full">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${paymentMethod === "COD" ? "bg-primary/10" : "bg-surface-container-highest"}`}>
                      <span className={`material-symbols-outlined ${paymentMethod === "COD" ? "text-primary" : "text-on-surface-variant"}`}>handshake</span>
                    </div>
                    <div>
                      <span className={`font-bold text-sm ${paymentMethod === "COD" ? "text-primary" : "text-on-surface"}`}>
                        Thanh toán khi nhận hàng (COD)
                      </span>
                      <p className="text-xs text-on-surface-variant mt-0.5">Trả tiền mặt hoặc chuyển khoản khi nhận cá</p>
                    </div>
                  </div>
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${paymentMethod === "COD" ? "border-primary bg-primary/20" : "border-outline-variant"}`}>
                    {paymentMethod === "COD" && <div className="w-2.5 h-2.5 bg-primary rounded-full" />}
                  </div>
                </div>
              </label>

              {/* VNPay */}
              <label
                className={`relative flex items-center p-4 rounded-xl cursor-pointer border-2 transition-all duration-200 ${
                  paymentMethod === "VNPAY"
                    ? "border-primary bg-primary/5 shadow-sm"
                    : "border-transparent bg-surface-container-low hover:bg-surface-container-high"
                }`}
              >
                <input className="hidden" name="payment" type="radio" value="VNPAY" checked={paymentMethod === "VNPAY"} onChange={() => setPaymentMethod("VNPAY")} />
                <div className="flex items-center justify-between w-full">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${paymentMethod === "VNPAY" ? "bg-primary/10" : "bg-surface-container-highest"}`}>
                      <span className={`material-symbols-outlined ${paymentMethod === "VNPAY" ? "text-primary" : "text-on-surface-variant"}`}>account_balance_wallet</span>
                    </div>
                    <div>
                      <span className={`font-bold text-sm ${paymentMethod === "VNPAY" ? "text-primary" : "text-on-surface"}`}>
                        Thanh toán Online (VNPay)
                      </span>
                      <p className="text-xs text-on-surface-variant mt-0.5">Thanh toán qua thẻ ATM, QR Code hoặc Ví điện tử</p>
                    </div>
                  </div>
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${paymentMethod === "VNPAY" ? "border-primary bg-primary/20" : "border-outline-variant"}`}>
                    {paymentMethod === "VNPAY" && <div className="w-2.5 h-2.5 bg-primary rounded-full" />}
                  </div>
                </div>
              </label>
            </div>

            {/* Payment Info Note */}
            <div className="mt-4 p-3 rounded-lg bg-surface-container-low flex items-start gap-2">
              <span className="material-symbols-outlined text-on-surface-variant text-base mt-0.5">info</span>
              <p className="text-xs leading-relaxed text-on-surface-variant">
                {paymentMethod === "COD"
                  ? "Chúng tôi sẽ liên hệ với bạn để xác nhận đơn hàng và thời gian giao hàng. Vui lòng chuẩn bị tiền mặt khi shipper đến."
                  : "Bạn sẽ được chuyển hướng đến cổng thanh toán bảo mật của VNPay để hoàn tất giao dịch qua thẻ ATM, QR Code hoặc Ví điện tử."}
              </p>
            </div>
          </section>

          {/* Section 4: Order Note */}
          <section className="bg-surface-container-lowest rounded-2xl p-6 md:p-8 shadow-[0_2px_12px_rgba(0,0,0,0.04)]">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-tertiary-fixed flex items-center justify-center">
                <span className="material-symbols-outlined text-on-tertiary-fixed text-xl">edit_note</span>
              </div>
              <div>
                <h2 className="text-lg font-bold text-primary">Ghi chú đơn hàng</h2>
                <p className="text-xs text-on-surface-variant">Dặn dò thêm cho shipper (tùy chọn)</p>
              </div>
            </div>
            <textarea
              id="checkout-note"
              placeholder="Ví dụ: Giao sau 5h chiều, nhà gần tiệm vàng ABC, cần đóng thêm oxy cho quãng đường xa..."
              className="w-full bg-surface-container-highest border-2 border-transparent rounded-xl p-3.5 focus:ring-2 focus:ring-primary/20 focus:border-primary/30 transition-all outline-none text-sm resize-none"
              rows={3}
              value={orderNote}
              onChange={(e) => setOrderNote(e.target.value)}
            />
          </section>
        </div>

        {/* ========== RIGHT COLUMN: Order Summary ========== */}
        <aside className="lg:col-span-5 space-y-5 lg:sticky lg:top-6">
          {/* Order Summary Card */}
          <div className="bg-primary text-on-primary rounded-2xl p-6 md:p-8 shadow-[0_20px_40px_rgba(25,28,30,0.08)] relative overflow-hidden">
            <div className="absolute -right-10 -top-10 w-40 h-40 bg-white/10 rounded-full blur-3xl" />
            <div className="absolute -left-8 -bottom-8 w-32 h-32 bg-white/5 rounded-full blur-2xl" />

            <h2 className="text-lg font-bold mb-5 flex items-center gap-2 relative">
              <span className="material-symbols-outlined">receipt_long</span>
              Tóm tắt đơn hàng ({selectedTotalItems} sản phẩm)
            </h2>

            {/* Apply Coupon Input */}
            <div className="mb-5 pb-5 border-b border-white/10 relative">
              <ApplyCouponInput
                subtotal={selectedTotalPrice}
                onApplySuccess={(coupon) => setAppliedCoupon(coupon)}
                onCancel={() => setAppliedCoupon(null)}
                isApplied={!!appliedCoupon}
                appliedCoupon={appliedCoupon}
              />
            </div>

            {/* Product List */}
            <div className="space-y-3 border-b border-white/10 pb-5 mb-5 max-h-72 overflow-y-auto relative">
              {selectedItems.length > 0 ? (
                selectedItems.map((item, index) => (
                  <div key={`${item.id}-${index}`} className="flex items-center gap-3 opacity-90">
                    <img
                      src={item.imageUrl || "/placeholder-fish.png"}
                      alt={item.name}
                      className="w-12 h-12 rounded-lg object-cover flex-shrink-0 bg-white/10"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium line-clamp-1">{item.name}</p>
                      <p className="text-xs opacity-70">
                        {formatCurrency(item.price)} × {item.quantity}
                      </p>
                    </div>
                    <span className="font-semibold whitespace-nowrap text-sm">
                      {formatCurrency(item.price * item.quantity)}
                    </span>
                  </div>
                ))
              ) : (
                <p className="text-sm opacity-70 text-center py-4">Giỏ hàng đang trống.</p>
              )}
            </div>

            {/* Price Breakdown */}
            <div className="space-y-2.5 mb-6 relative">
              <div className="flex justify-between items-center text-sm opacity-85">
                <span>Tiền hàng</span>
                <span>{formatCurrency(selectedTotalPrice)}</span>
              </div>
              {discountAmountNum > 0 && (
                <div className="flex justify-between items-center text-sm text-green-300">
                  <span className="flex items-center gap-1">
                    <span className="material-symbols-outlined text-xs">confirmation_number</span>
                    Giảm giá ({appliedCoupon?.code})
                  </span>
                  <span className="font-semibold">-{formatCurrency(discountAmountNum)}</span>
                </div>
              )}
              <div className="flex justify-between items-center text-sm opacity-85">
                <span className="flex items-center gap-1">
                  <span className="material-symbols-outlined text-xs">local_shipping</span>
                  Phí vận chuyển
                  {loadingShippingFee && <span className="material-symbols-outlined text-xs animate-spin">progress_activity</span>}
                </span>
                <span>{formatCurrency(selectedTotalItems > 0 ? shippingFee : 0)}</span>
              </div>
              <div className="flex justify-between items-center pt-3 mt-3 border-t border-white/20">
                <span className="text-base font-bold">Tổng thanh toán</span>
                <span className="text-2xl font-black text-secondary-fixed">
                  {formatCurrency(grandTotal)}
                </span>
              </div>
            </div>

            {/* Confirm Button */}
            <button
              className="w-full bg-secondary-fixed text-on-secondary-fixed hover:bg-secondary-fixed-dim transition-all py-4 rounded-full font-bold flex items-center justify-center gap-2 group disabled:opacity-60 relative shadow-lg hover:shadow-xl"
              onClick={handleConfirmOrder}
              type="button"
              disabled={submitting || loadingProfile}
            >
              {submitting ? (
                <>
                  <span className="material-symbols-outlined animate-spin text-lg">progress_activity</span>
                  Đang xử lý...
                </>
              ) : (
                <>
                  {paymentMethod === "VNPAY" ? "Thanh toán VNPay" : "Xác nhận đặt hàng"}
                  <span className="material-symbols-outlined transition-transform group-hover:translate-x-1">arrow_forward</span>
                </>
              )}
            </button>

            <p className="text-center text-[10px] mt-3 opacity-60 uppercase tracking-widest font-bold relative">
              Đảm bảo vận chuyển sinh vật an toàn 100%
            </p>
          </div>

          {/* Trust Badges */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-surface-container-low rounded-xl p-4 flex flex-col items-center text-center">
              <span className="material-symbols-outlined text-secondary text-2xl mb-2">verified</span>
              <span className="text-xs font-bold text-primary">Kiểm dịch</span>
              <span className="text-[10px] text-on-surface-variant mt-0.5">Đạt chuẩn quốc tế</span>
            </div>
            <div className="bg-surface-container-low rounded-xl p-4 flex flex-col items-center text-center">
              <span className="material-symbols-outlined text-secondary text-2xl mb-2">ac_unit</span>
              <span className="text-xs font-bold text-primary">Đóng gói oxy</span>
              <span className="text-[10px] text-on-surface-variant mt-0.5">Thùng xốp cách nhiệt</span>
            </div>
          </div>

          {/* Support */}
          <div className="bg-surface-container-low rounded-xl p-5">
            <div className="flex items-center gap-3 mb-2">
              <span className="material-symbols-outlined text-secondary">support_agent</span>
              <span className="text-sm font-bold text-primary">Hỗ trợ kỹ thuật 24/7</span>
            </div>
            <p className="text-xs text-on-surface-variant leading-relaxed">
              Mọi thắc mắc về kỹ thuật vận chuyển hoặc chăm sóc sau khi nhận cá, vui lòng liên hệ Hotline:{" "}
              <span className="font-bold text-primary">1900 88xx</span>.
            </p>
          </div>
        </aside>
      </div>
    </main>
  );
}
