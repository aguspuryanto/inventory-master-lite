
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

export interface PrinterSettings {
  deviceId?: string;
  deviceName?: string;
  paperSize: '58mm' | '80mm';
  orientation: 'Portrait' | 'Landscape';
  autoPrint: boolean;
}

export interface StoreSettings {
  name: string;
  address: string;
  phone: string;
  email: string;
  tax: number;
}

export interface UserProfile {
  name: string;
  email: string;
  role: string;
  avatar: string;
}

export interface Staff {
  id: string;
  name: string;
  email: string;
  role: string;
  phone: string;
  status: 'active' | 'inactive';
}

export interface PaymentMethod {
  id: string;
  name: string;
  type: 'cash' | 'card' | 'ewallet' | 'bank_transfer';
  isActive: boolean;
}