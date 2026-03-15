
export interface ProductVariant {
  id: string;
  id_product: string;  // UUID type but kept as string in TypeScript
  name: string;
  createdAt: string;
  updatedAt: string;
}

export interface Product {
  id: string;
  code: string;
  name: string;
  barcode: string;
  purchasePrice: number;
  sellingPrice: number;
  stock: number;
  category: string;
  image_url?: string;
  hasVariants?: boolean;
  createdAt: string;
  updatedAt: string;
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

export interface Receipt {
  id: string;
  date: string;
  items: TransactionItem[];
  total: number;
  paymentAmount: number;
  changeAmount: number;
}
