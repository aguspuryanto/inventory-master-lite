import { supabase } from '../lib/supabase';
import { Product, Transaction, ProductVariant, TransactionItem, StoreSettings, PrinterSettings } from '../types';

export const db = {
  // Products
  async getProducts(): Promise<Product[]> {
    if (!supabase) return [];
    
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Error fetching products:', error);
      console.error('Error details:', JSON.stringify(error, null, 2));
      return [];
    }
    
    // console.log('Raw products data from Supabase:', data);
    // console.log('Products count:', data?.length || 0);
    
    return data.map(p => ({
      id: p.id,
      code: p.code,
      name: p.name,
      barcode: p.barcode || '',
      purchasePrice: Number(p.purchase_price),
      sellingPrice: Number(p.selling_price),
      stock: Number(p.stock),
      category: p.category || '',
      image_url: p.image_url || '',
      createdAt: p.created_at,
      updatedAt: p.updated_at
    }));
  },

  async addProduct(product: Product): Promise<Product> {
    if (!supabase) return product;
    
    const { data, error } = await supabase
      .from('products')
      .insert({
        id: product.id,
        code: product.code,
        name: product.name,
        barcode: product.barcode,
        purchase_price: product.purchasePrice,
        selling_price: product.sellingPrice,
        stock: product.stock,
        category: product.category,
        image_url: product.image_url || ''
      })
      .select()
      .single();
      
    if (error) throw error;
    return data;
  },

  async updateProduct(product: Product): Promise<Product> {
    if (!supabase) return product;
    
    const { data, error } = await supabase
      .from('products')
      .update({
        code: product.code,
        name: product.name,
        barcode: product.barcode,
        purchase_price: product.purchasePrice,
        selling_price: product.sellingPrice,
        stock: product.stock,
        category: product.category,
        image_url: product.image_url || ''
      })
      .eq('id', product.id)
      .select()
      .single();
      
    if (error) throw error;
    return data;
  },

  async deleteProduct(id: string): Promise<void> {
    if (!supabase) return;
    
    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', id);
      
    if (error) throw error;
  },

  // Product Variants
  async getProductVariants(productId: string): Promise<ProductVariant[]> {
    if (!supabase) return [];
    
    const { data, error } = await supabase
      .from('product_variants')
      .select('*')
      .eq('product_id', productId)
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Error fetching product variants:', error);
      return [];
    }
    
    return data.map(v => ({
      id: v.id,
      id_product: v.id_product,
      name: v.name,
      createdAt: v.created_at,
      updatedAt: v.updated_at
    }));
  },

  async addProductVariant(variant: Omit<ProductVariant, 'id' | 'createdAt' | 'updatedAt'>): Promise<ProductVariant> {
    if (!supabase) throw new Error('Supabase not configured');
    
    const { data, error } = await supabase
      .from('product_variants')
      .insert({
        id: crypto.randomUUID(),
        id_product: variant.id_product,
        name: variant.name
      })
      .select()
      .single();
      
    if (error) throw error;
    
    return {
      id: data.id,
      id_product: data.id_product,
      name: data.name,
      createdAt: data.created_at,
      updatedAt: data.updated_at
    };
  },

  async updateProductVariant(variant: ProductVariant): Promise<ProductVariant> {
    if (!supabase) throw new Error('Supabase not configured');
    
    const { data, error } = await supabase
      .from('product_variants')
      .update({
        id_product: variant.id_product,
        name: variant.name
      })
      .eq('id', variant.id)
      .select()
      .single();
      
    if (error) throw error;
    
    return {
      id: data.id,
      id_product: data.id_product,
      name: data.name,
      createdAt: data.created_at,
      updatedAt: data.updated_at
    };
  },

  async deleteProductVariant(id: string): Promise<void> {
    if (!supabase) return;
    
    const { error } = await supabase
      .from('product_variants')
      .delete()
      .eq('id', id);
      
    if (error) throw error;
  },

  // Transactions
  async getTransactions(): Promise<Transaction[]> {
    if (!supabase) return [];
    
    const { data, error } = await supabase
      .from('transactions')
      .select('*')
      .order('created_at', { ascending: false });
      
    if (error) {
      console.error('Error fetching transactions:', error);
      console.error('Error details:', JSON.stringify(error, null, 2));
      return [];
    }
    
    // console.log('Raw transactions data from Supabase:', data);
    // console.log('Transactions count:', data?.length || 0);

    // join with transaction_items
    // Fetch transaction items to join with transactions
    const { data: items, error: itemsError } = await supabase
      .from('transaction_items')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (itemsError) {
      console.error('Error fetching transaction items:', itemsError);
    }
    
    // Create a map of transaction_id to items for quick lookup
    const itemsMap = new Map<string, TransactionItem[]>();
    items?.forEach(item => {
      const transactionId = item.transaction_id;
      if (!itemsMap.has(transactionId)) {
        itemsMap.set(transactionId, []);
      }
      itemsMap.get(transactionId)?.push(item);
    });
    
    return data.map(t => ({
      id: t.id,
      type: t.type,
      mainCategory: t.main_category,
      subCategory: t.sub_category,
      amount: Number(t.amount),
      createdAt: t.created_at,
      description: t.description || '',
      items: itemsMap.get(t.id) || []
    }));
  },

  async addTransaction(tx: Transaction, items: TransactionItem[]): Promise<void> {
    if (!supabase) return;
    
    const { error } = await supabase
      .from('transactions')
      .insert({
        id: tx.id,
        type: tx.type,
        main_category: tx.mainCategory,
        sub_category: tx.subCategory,
        amount: tx.amount,
        created_at: tx.createdAt,
        description: tx.description
      });
      
    if (error) throw error;
    
    // Insert transaction items
    if (items && items.length > 0) {
      const itemsData = items.map(item => ({
        transaction_id: tx.id,
        product_id: item.productId,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
        subtotal: item.subtotal
      }));
      
      const { error: itemsError } = await supabase
        .from('transaction_items')
        .insert(itemsData);
      
      if (itemsError) throw itemsError;

      // Kurangi stok produk untuk transaksi OUT (penjualan)
      if (tx.type === 'OUT' && tx.items && tx.items.length > 0) {
        try {
          // Update stock untuk setiap item
          for (const item of tx.items) {
            const { error: stockError } = await supabase.rpc('update_product_stock', {
              p_product_id: item.productId,
              p_quantity_change: -item.quantity // Kurangi stok untuk penjualan
            });
            
            if (stockError) {
              console.error('Error updating stock for product', item.productId, ':', stockError);
            } else {
              console.log('Stock updated for product', item.productId, '- quantity:', item.quantity);
            }
          }
        } catch (stockUpdateError) {
          console.error('Failed to update stock:', stockUpdateError);
        }
      }
    }
  },
  
  // Get Store settings
  async getStoreSettings(): Promise<StoreSettings[]> {
    if (!supabase) return [];
    
    const { data, error } = await supabase
      .from('store_settings')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Error fetching store settings:', error);
      return null;
    }
    
    return data.map((item: any) => ({
      name: item.name || '',
      address: item.address || '',
      phone: item.phone || '',
      email: item.email || '',
      tax: item.tax || 0
    }));
  },
  
  // Get printer settings
  async getPrinterSettings(): Promise<PrinterSettings[]> {
    if (!supabase) return [];
    
    const { data, error: fetchError } = await supabase
      .from('printer_settings')
      .select('*')
      .order('id', { ascending: false });
    
    if (fetchError) {
      console.error('Error fetching printer settings:', fetchError);
      return [];
    }
    
    return data.map((item: any) => {
      // Try to parse device info from JSON format
      let deviceId = '';
      let deviceName = '';
      
      try {
        if (item.default_printer) {
          const deviceInfo = JSON.parse(item.default_printer);
          deviceId = deviceInfo.id || '';
          deviceName = deviceInfo.name || '';
        }
      } catch {
        // Fallback to treating as plain device name
        deviceName = item.default_printer || '';
      }
      
      return {
        deviceId,
        deviceName,
        paperSize: item.paper_size || '58mm',
        orientation: item.orientation || 'Portrait',
        autoPrint: item.auto_print_after_transaction || false
      };
    });
  },

  // Set printer settings
  async setPrinterSettings(settings: PrinterSettings): Promise<void> {
    if (!supabase) return;
    
    const { error } = await supabase
      .from('printer_settings')
      .upsert({
        default_printer: JSON.stringify({
          id: settings.deviceId,
          name: settings.deviceName
        }),
        paper_size: settings.paperSize,
        orientation: settings.orientation,
        auto_print_after_transaction: settings.autoPrint
      });
      
    if (error) throw error;
  }
};
