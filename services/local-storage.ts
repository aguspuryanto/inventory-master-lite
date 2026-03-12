import { Product } from '../types';

export class LocalStorageService {
  private static readonly PRODUCTS_KEY = 'kasirku_products';
  private static readonly LAST_SYNC_KEY = 'kasirku_last_sync';

  // Save products to localStorage
  static saveProducts(products: Product[]): void {
    try {
      localStorage.setItem(this.PRODUCTS_KEY, JSON.stringify(products));
      localStorage.setItem(this.LAST_SYNC_KEY, new Date().toISOString());
    } catch (error) {
      console.error('Error saving products to localStorage:', error);
      throw new Error('Gagal menyimpan data ke lokal storage');
    }
  }

  // Load products from localStorage
  static loadProducts(): Product[] {
    try {
      const stored = localStorage.getItem(this.PRODUCTS_KEY);
      if (!stored) return [];
      
      const products = JSON.parse(stored);
      // Validate and transform data if needed
      return Array.isArray(products) ? products : [];
    } catch (error) {
      console.error('Error loading products from localStorage:', error);
      return [];
    }
  }

  // Get last sync timestamp
  static getLastSync(): string | null {
    return localStorage.getItem(this.LAST_SYNC_KEY);
  }

  // Export products to JSON file
  static exportToJSON(products: Product[]): void {
    try {
      const dataStr = JSON.stringify(products, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      
      const link = document.createElement('a');
      link.href = URL.createObjectURL(dataBlob);
      link.download = `products_${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(link.href);
    } catch (error) {
      console.error('Error exporting to JSON:', error);
      throw new Error('Gagal mengekspor data ke file JSON');
    }
  }

  // Import products from JSON file
  static importFromJSON(file: File): Promise<Product[]> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = (e) => {
        try {
          const content = e.target?.result as string;
          const products = JSON.parse(content);
          
          if (!Array.isArray(products)) {
            throw new Error('File harus berisi array produk');
          }
          
          // Validate product structure
          const validProducts = products.filter(p => 
            p.id && p.code && p.name && typeof p.stock === 'number'
          );
          
          if (validProducts.length === 0) {
            throw new Error('Tidak ada produk valid dalam file');
          }
          
          resolve(validProducts);
        } catch (error) {
          reject(new Error('Format file JSON tidak valid'));
        }
      };
      
      reader.onerror = () => reject(new Error('Gagal membaca file'));
      reader.readAsText(file);
    });
  }

  // Clear all local data
  static clearData(): void {
    localStorage.removeItem(this.PRODUCTS_KEY);
    localStorage.removeItem(this.LAST_SYNC_KEY);
  }

  // Check if local data exists
  static hasData(): boolean {
    return localStorage.getItem(this.PRODUCTS_KEY) !== null;
  }
}
