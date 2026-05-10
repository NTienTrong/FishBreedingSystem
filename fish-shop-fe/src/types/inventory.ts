export type StockChangeType = "IMPORT" | "EXPORT" | "ADJUST" | "RETURN";

export interface StockLogResponse {
  id: number;
  productId: number;
  productName: string;
  changeType: StockChangeType;
  quantityChanged: number;
  reason: string | null;
  costPrice: number | null;
  createdAt: string;
}

export interface InventoryRestockRequest {
  productId: number;
  quantity: number;
  costPrice?: number | null;
  reason?: string | null;
}

export interface InventoryAdjustRequest {
  productId: number;
  newQuantity: number;
  changeType?: StockChangeType | null;
  reason?: string | null;
}
