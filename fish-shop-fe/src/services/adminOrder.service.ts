import type { AdminOrder } from "@/types/adminOrder";

export async function fetchAdminOrders(): Promise<AdminOrder[]> {
  const response = await fetch("/api/admin/orders", { cache: "no-store" });
  if (!response.ok) {
    throw new Error("Không thể tải danh sách đơn hàng.");
  }
  return response.json() as Promise<AdminOrder[]>;
}

export async function updateAdminOrderStatus(orderId: number, payload: { orderStatus?: string }) {
  const response = await fetch(`/api/admin/orders/${orderId}/status`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const message = await response.text();
    throw new Error(message || "Không thể cập nhật trạng thái đơn hàng.");
  }

  return response.json() as Promise<AdminOrder>;
}

export async function approveAdminRefund(orderId: number) {
  const response = await fetch(`/api/admin/orders/${orderId}/refund-approve`, {
    method: "PATCH",
  });

  if (!response.ok) {
    const message = await response.text();
    throw new Error(message || "Không thể xác nhận hoàn tiền.");
  }

  return response.json() as Promise<{ message: string }>;
}
