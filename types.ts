
export interface Product {
  id: string;
  code: string;
  name: string;
  barcode: string;
  purchasePrice: number;
  sellingPrice: number;
  stock: number;
  category: string;
}

export interface TransactionItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  subtotal: number;
}

export type TransactionType = 'IN' | 'OUT';

export interface Transaction {
  id: string;
  date: string;
  type: TransactionType;
  items: TransactionItem[];
  total: number;
  paymentAmount?: number;
  changeAmount?: number;
  note?: string;
}

export interface MonthlyStats {
  month: string;
  incoming: number;
  outgoing: number;
}
