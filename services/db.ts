import { supabase } from '../lib/supabase';
import { Product, Transaction, Store, User, StoreUser, ProductWithStore, TransactionWithStore, StoreSettings, PrinterSettings } from '../types';

export const db = {
  // Store Management
  async getStores(userId: string): Promise<Store[]> {
    if (!supabase) return [];
    
    const { data, error } = await supabase
      .from('store_users')
      .select(`
        stores (*)
      `)
      .eq('user_id', userId);
    
    if (error) {
      console.error('Error fetching stores:', error);
      return [];
    }
    
    return data.map((item: any) => item.stores);
  },

  async createStore(storeData: Partial<Store>): Promise<Store> {
    if (!supabase) throw new Error('No supabase connection');
    
    const { data, error } = await supabase
      .from('stores')
      .insert(storeData)
      .select()
      .single();
      
    if (error) throw error;
    return data;
  },

  async createUser(userData: Partial<User>): Promise<User> {
    if (!supabase) throw new Error('No supabase connection');
    
    // Add password_hash field if not provided (Supabase Auth handles passwords)
    const userDataWithPassword = {
      ...userData,
      password_hash: userData.password_hash || 'supabase_auth_managed'
    };
    
    const { data, error } = await supabase
      .from('users')
      .insert(userDataWithPassword)
      .select()
      .single();
      
    if (error) throw error;
    return data;
  },

  async createStoreUser(storeUser: Partial<StoreUser>): Promise<StoreUser> {
    if (!supabase) throw new Error('No supabase connection');
    
    const { data, error } = await supabase
      .from('store_users')
      .insert(storeUser)
      .select()
      .single();
      
    if (error) throw error;
    return data;
  },

  // Products
  async getProducts(storeId: string): Promise<Product[]> {
    if (!supabase) return [];
    
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('store_id', storeId)
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Error fetching products:', error);
      return [];
    }
    
    return data.map(p => ({
      id: p.id,
      code: p.code,
      name: p.name,
      barcode: p.barcode || '',
      purchasePrice: Number(p.purchase_price),
      sellingPrice: Number(p.selling_price),
      stock: Number(p.stock),
      category: p.category || ''
    }));
  },

  async addProduct(product: Product, storeId: string) {
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
        store_id: storeId
      })
      .select()
      .single();
      
    if (error) throw error;
    return data;
  },

  async updateProduct(product: Product, storeId: string) {
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
        category: product.category
      })
      .eq('id', product.id)
      .eq('store_id', storeId)
      .select()
      .single();
      
    if (error) throw error;
    return data;
  },

  async deleteProduct(id: string, storeId: string) {
    if (!supabase) return;
    
    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', id)
      .eq('store_id', storeId);
      
    if (error) throw error;
  },

  // Transactions
  async getTransactions(storeId: string): Promise<Transaction[]> {
    if (!supabase) return [];
    
    const { data, error } = await supabase
      .from('transactions')
      .select(`
        *,
        transaction_items (*)
      `)
      .eq('store_id', storeId)
      .order('created_at', { ascending: false });
      
    if (error) {
      console.error('Error fetching transactions:', error);
      return [];
    }
    
    return data.map(t => ({
      id: t.id,
      type: t.type as 'IN' | 'OUT',
      main_category: t.main_category,
      sub_category: t.sub_category,
      amount: Number(t.amount),
      description: t.description,
      discount: t.discount,
      discount_amount: t.discount_amount,
      created_at: t.created_at,
      items: t.transaction_items.map((i: any) => ({
        productId: i.product_id,
        name: i.name,
        price: Number(i.price),
        quantity: Number(i.quantity),
        subtotal: Number(i.subtotal)
      }))
    }));
  },

  async addTransaction(tx: Transaction, storeId: string) {
    if (!supabase) return;
    
    // 1. Insert Transaction
    // id, type, main_category, sub_category, amount, description, created_at
    // tambah kolom, discount, discount_amount, store_id
    const { error: txError } = await supabase
      .from('transactions')
      .insert({
        id: tx.id,
        type: tx.type,
        main_category: 'Penjualan',
        sub_category: 'POS',
        amount: tx.amount,
        description: tx.description,
        discount: tx.discount,
        discount_amount: tx.discount_amount,
        store_id: storeId,
        created_at: tx.created_at
      });
      
    if (txError) throw txError;

    // 2. Insert Items
    if (tx.items && tx.items.length > 0) {
      const itemsToInsert = tx.items.map(item => ({
        transaction_id: tx.id,
        product_id: item.productId,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
        subtotal: item.subtotal
      }));
      
      const { error: itemsError } = await supabase
        .from('transaction_items')
        .insert(itemsToInsert);
        
      if (itemsError) throw itemsError;

      // 3. Update Stock (Simple client-side loop for demo, ideally use DB trigger or RPC)
      for (const item of tx.items) {
        // Get current stock
        const { data: product } = await supabase
          .from('products')
          .select('stock')
          .eq('id', item.productId)
          .single();
          
        if (product) {
          const newStock = tx.type === 'OUT' 
            ? Math.max(0, product.stock - item.quantity)
            : product.stock + item.quantity;
            
          await supabase
            .from('products')
            .update({ stock: newStock })
            .eq('id', item.productId);
        }
      }
    }
  },

  // store settings
  async getStoreSettings(storeId: string): Promise<StoreSettings | null> {
    if (!supabase) return null;
    
    const { data, error } = await supabase
      .from('store_settings')
      .select('*')
      .eq('store_id', storeId)
      .maybeSingle();
      
    if (error) {
      console.error('Error fetching settings:', error);
      return null;
    }
    
    return data;
  },

  async updateStoreSettings(settings: Partial<StoreSettings>, storeId: string): Promise<StoreSettings> {
    if (!supabase) throw new Error('No supabase connection');
    
    const { data, error } = await supabase
      .from('store_settings')
      .upsert({
        ...settings,
        store_id: storeId,
        updated_at: new Date().toISOString()
      })
      .select()
      .single();
      
    if (error) throw error;
    return data;
  },

  // Authentication helpers
  async getUserByEmail(email: string): Promise<User | null> {
    if (!supabase) return null;
    
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .single();
      
    if (error) return null;
    return data;
  },

  async getUserStores(userId: string): Promise<Store[]> {
    console.log('Fetching user stores for user:', userId);
    if (!supabase) return [];
    
    const { data, error } = await supabase
      .from('store_users')
      .select(`
        stores (*)
      `)
      .eq('user_id', userId);
      
    if (error) {
      console.error('Error fetching user stores:', error);
      return [];
    }
    
    return data.map((item: any) => item.stores);
  },

  // Printer Settings
  async getPrinterSettings(storeId?: string): Promise<PrinterSettings | null> {
    if (!supabase) return null;
    
    let query = supabase.from('printer_settings').select('*');
    
    if (storeId) {
      query = query.eq('store_id', storeId);
    }
    
    const { data, error } = await query.maybeSingle();
      
    if (error) {
      console.error('Error fetching printer settings:', error);
      return null;
    }
    
    return data;
  },

  async setPrinterSettings(settings: PrinterSettings, storeId?: string): Promise<PrinterSettings> {
    if (!supabase) throw new Error('No supabase connection');
    
    const settingsData = {
      ...settings,
      store_id: storeId || settings.store_id,
      updated_at: new Date().toISOString()
    };
    
    const { data, error } = await supabase
      .from('printer_settings')
      .upsert(settingsData)
      .select()
      .single();
      
    if (error) throw error;
    return data;
  }
};
