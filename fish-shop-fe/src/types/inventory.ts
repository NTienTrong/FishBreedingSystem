export type StockChangeType = "IMPORT" | "EXPORT" | "ADJUST" | "RETURN";

export interface StockLogResponse {
  id: number;
  productId: number;
  productName: string;
  changeType: StockChangeType;
  quantityChanged: number;
  reason: string | null;
  partnerName: string | null;
  partnerPhone: string | null;
  partnerAddress: string | null;
  costPrice: number | null;
  createdAt: string;
}

export interface InventoryRestockRequest {
  productId: number;
  quantity: number;
  costPrice?: number | null;
  supplierName?: string | null;
  phone?: string | null;
  address?: string | null;
  reason?: string | null;
}

export interface InventoryExportRequest {
  productId: number;
  quantity: number;
  recipientName?: string | null;
  phone?: string | null;
  address?: string | null;
  reason?: string | null;
}

export interface InventoryAdjustRequest {
  productId: number;
  newQuantity: number;
  changeType?: StockChangeType | null;
  reason?: string | null;
}
