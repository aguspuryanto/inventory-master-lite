import { Product, ProductVariant } from '../types';

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

  // Export products to CSV file
  static exportToCSV(products: Product[]): void {
    try {
      if (products.length === 0) {
        throw new Error('Tidak ada produk untuk diekspor');
      }

      const headers = ['Kode', 'Nama', 'Barcode', 'Harga Beli', 'Harga Jual', 'Stok', 'Kategori', 'Varian', 'Varian Detail', 'Gambar'];
      const csvContent = [
        headers.join(','),
        ...products.map(p => [
          p.code,
          `"${p.name}"`,
          p.barcode || '',
          p.purchasePrice,
          p.sellingPrice,
          p.stock,
          `"${p.category}"`,
          `"${p.hasVariants ? 'Ya' : 'Tidak'}"`,
          `"${p.hasVariants ? 'Lihat varian terpisah' : '-'}"`,
          p.image_url || ''
        ].join(','))
      ].join('\n');

      const dataBlob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      
      const link = document.createElement('a');
      link.href = URL.createObjectURL(dataBlob);
      link.download = `products_${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(link.href);
    } catch (error) {
      console.error('Error exporting to CSV:', error);
      throw new Error('Gagal mengekspor data ke file CSV');
    }
  }

  // Import products from CSV file
  static importFromCSV(file: File): Promise<{ products: Product[], variants: ProductVariant[] }> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = (e) => {
        try {
          const content = e.target?.result as string;
          const lines = content.split('\n').filter(line => line.trim());
          
          if (lines.length < 2) {
            throw new Error('File CSV harus memiliki header dan minimal satu baris data');
          }

          // Skip header line
          const dataLines = lines.slice(1);
          const products: Product[] = [];
          const variants: ProductVariant[] = [];

          for (const line of dataLines) {
            const values = this.parseCSVLine(line);
            // console.log('CSV values:', values);
            // [
            //     "SPS-001",
            //     "SANCHIO Shampo 250ml (Botol Pump)",
            //     "",
            //     "21000",
            //     "25000",
            //     "100",
            //     "Pet Shampo",
            //     "Khusus Anti Kutu, Khusus Anti Jamur, Khusus Brigh Shine & Pelebat Bulu)",
            //     ""
            // ]
            
            if (values.length >= 8) {
              const product: Product = {
                id: crypto.randomUUID(),
                code: values[0]?.trim() || '',
                name: values[1]?.replace(/"/g, '').trim() || '',
                barcode: values[2]?.trim() || '',
                purchasePrice: parseFloat(values[3]) || 0,
                sellingPrice: parseFloat(values[4]) || 0,
                stock: parseInt(values[5]) || 0,
                category: values[6]?.replace(/"/g, '').trim() || '',
                hasVariants: !!values[7]?.replace(/"/g, '').trim(),
                image_url: values[9]?.replace(/"/g, '').trim() || '',
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
              };

              if (product.code && product.name) {
                products.push(product);
                // console.log('Product:', product);

                // If product has variants, create variant entries
                if (product.hasVariants && values[7]) {
                  const variantNames = values[7]?.replace(/"/g, '').trim();
                  if (variantNames) {
                    const nameArray = variantNames.split(',').map(v => v.trim());
                    nameArray.forEach(variantName => {
                      if (variantName) {
                        variants.push({
                          id: crypto.randomUUID(),
                          id_product: product.id,
                          name: variantName,
                          createdAt: new Date().toISOString(),
                          updatedAt: new Date().toISOString()
                        });
                      }
                    });
                  }
                }
                // console.log('Variants:', variants);
              }
            }
          }

          if (products.length === 0) {
            throw new Error('Tidak ada produk valid dalam file CSV');
          }

          resolve({ products, variants });
        } catch (error) {
          reject(new Error('Format file CSV tidak valid: ' + (error as Error).message));
        }
      };
      
      reader.onerror = () => reject(new Error('Gagal membaca file CSV'));
      reader.readAsText(file);
    });
  }

  // Helper method to parse CSV line considering quoted commas
  private static parseCSVLine(line: string): string[] {
    const result: string[] = [];
    let current = '';
    let inQuotes = false;
    
    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      
      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === ',' && !inQuotes) {
        result.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }
    
    result.push(current.trim());
    return result;
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
