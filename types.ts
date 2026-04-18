
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
  type: TransactionType;
  main_category: string;
  sub_category: string;
  amount: number;
  description: string;
  created_at: string;
  items: TransactionItem[];
  discount: number;
  discount_amount: number;
}

export interface MonthlyStats {
  month: string;
  incoming: number;
  outgoing: number;
}
