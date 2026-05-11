import type { AdminTransaction } from "@/types/adminTransaction";

export async function fetchAdminTransactions(): Promise<AdminTransaction[]> {
  const response = await fetch("/api/admin/transactions", { cache: "no-store" });
  if (!response.ok) {
    throw new Error("Không thể tải danh sách giao dịch.");
  }
  return response.json() as Promise<AdminTransaction[]>;
}
