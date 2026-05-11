export type AdminTransaction = {
  id: number;
  orderId?: number | null;
  orderCode?: string | null;
  orderStatus?: string | null;
  paymentStatus?: string | null;
  vnpTxnRef?: string | null;
  vnpTransactionNo?: string | null;
  vnpResponseCode?: string | null;
  vnpAmount?: number | null;
  vnpBankCode?: string | null;
  vnpPayDate?: string | null;
  createdAt?: string | null;
  rawResponse?: unknown;
};
