import { Product, Transaction, Store, User, StoreUser, ProductWithStore, TransactionWithStore, StoreSettings, PrinterSettings } from '../types';

const API_BASE_URL = import.meta.env.VITE_APP_API || '';

class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string = API_BASE_URL) {
    this.baseUrl = baseUrl;
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    });

    if (!response.ok) {
      throw new Error(`API Error: ${response.status} ${response.statusText}`);
    }

    return response.json();
  }

  // Products
  async getProducts(storeId: string | null): Promise<Product[]> {
    const endpoint = storeId ? `/products?storeId=${storeId}` : '/products';
    const response = await this.request<{success: boolean; data: Product[]}>(endpoint);
    return response.data;
  }

  // Transactions
  async getTransactions(storeId: string | null): Promise<Transaction[]> {
    const endpoint = storeId ? `/transactions?storeId=${storeId}` : '/transactions';
    const response = await this.request<{success: boolean; data: Transaction[]}>(endpoint);
    return response.data;
  }

  // Store
  async getStore(id: string): Promise<Store> {
    const response = await this.request<{success: boolean; data: Store}>(`/stores/${id}`);
    return response.data;
  }

  // Store Settings
  async getStoreSettings(storeId: string | null): Promise<StoreSettings | null> {
    const endpoint = storeId ? `/store-settings?storeId=${storeId}` : '/store-settings';
    try {
      const response = await this.request<{success: boolean; data: StoreSettings}>(endpoint);
      return response.data;
    } catch (error) {
      return null;
    }
  }

  // Login
  async login(email: string, password: string): Promise<{user: User; store: Store; userStores: Store[]; token: string}> {
    return this.request('/login', {
      method: 'POST',
      body: JSON.stringify({ email, password })
    });
  }

  // Health check
  async healthCheck(): Promise<{status: string; message: string; timestamp: string}> {
    return this.request('/health');
  }
}

export const api = new ApiClient();
export default api;
