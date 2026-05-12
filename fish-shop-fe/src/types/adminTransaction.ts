export type AdminTransaction = {
  id: number;
  orderId?: number | null;
  orderCode?: string | null;
  orderStatus?: string | null;
  paymentMethod?: string | null;
  transactionType?: string | null;
  referenceCode?: string | null;
  status?: string | null;
  amount?: number | null;
  createdAt?: string | null;
};

export type AdminTransactionSummary = {
  totalRevenue: number;
  totalOnline: number;
  totalCash: number;
};
