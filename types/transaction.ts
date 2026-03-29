export interface TransactionItem {
  product_id: string;
  name: string;
  price: number;
  quantity: number;
  subtotal: number;
}

export type TransactionType = 'IN' | 'OUT';

export interface Transaction {
  id: string;
  type: TransactionType;
  mainCategory: string;
  subCategory: string;
  amount: number;
  createdAt: string;
  description: string;
  items?: TransactionItem[];
}

export interface MonthlyStats {
  month: string;
  incoming: number;
  outgoing: number;
}
