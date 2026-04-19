
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

// Multi-Store SaaS Types
export interface Store {
  id: string;
  name: string;
  slug: string;
  description?: string;
  address?: string;
  phone?: string;
  email?: string;
  logo_url?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface User {
  id: string;
  email: string;
  password_hash?: string; // Optional since Supabase Auth handles passwords
  full_name?: string;
  phone?: string;
  is_active: boolean;
  is_owner?: boolean;
  is_subscribe?: number;
  created_at: string;
  updated_at: string;
}

export interface StoreUser {
  id: string;
  store_id: string;
  user_id: string;
  role: 'owner' | 'admin' | 'staff';
  permissions: Record<string, any>;
  created_at: string;
}

export type UserRole = 'owner' | 'admin' | 'staff';

export interface AuthContext {
  user: User | null;
  currentStore: Store | null;
  userStores: Store[];
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  registerStore: (storeData: Partial<Store>, userData: Partial<User>, password: string) => Promise<void>;
  switchStore: (storeId: string) => void;
}

// Extended Product with store_id
export interface ProductWithStore extends Product {
  store_id: string;
}

// Extended Transaction with store_id
export interface TransactionWithStore extends Transaction {
  store_id: string;
}

// Store Settings with store_id
export interface StoreSettings {
  id: string;
  store_id: string;
  name: string;
  address: string;
  phone: string;
  email: string;
  logo_url?: string;
  tax_number?: string;
  footer_text?: string;
  currency: string;
  tax_rate: number;
  low_stock_threshold: number;
  enable_notifications: boolean;
  enable_email_reports: boolean;
  report_frequency: 'daily' | 'weekly' | 'monthly';
  created_at: string;
  updated_at: string;
}
