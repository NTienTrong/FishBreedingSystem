export type AdminOrderItem = {
  productId: number;
  name: string;
  sku?: string | null;
  quantity: number;
  price: number;
  lineTotal: number;
};

export type AdminOrder = {
  id: number;
  orderCode: string;
  orderStatus: string;
  paymentStatus: string | null;
  paymentMethod: string | null;
  totalAmount: number;
  shippingFee: number;
  createdAt: string;
  recipientName?: string | null;
  recipientPhone?: string | null;
  shippingAddress?: string | null;
  orderNote?: string | null;
  cancelReason?: string | null;
  customerId?: number | null;
  customerName?: string | null;
  customerEmail?: string | null;
  customerPhone?: string | null;
  items: AdminOrderItem[];
};
