import { supabase } from '../lib/supabase';
import { Product, Transaction, ProductVariant, TransactionItem } from '../types';

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
      category: p.category || '',
      image_url: p.image_url || '',
      createdAt: p.created_at,
      updatedAt: p.updated_at
    }));
  },

  async addProduct(product: Product) {
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

  async updateProduct(product: Product) {
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

  async deleteProduct(id: string) {
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
      return [];
    }

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

  async addTransaction(tx: Transaction, items: TransactionItem[]) {
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
    }
  },

  // store_settings
  async getStoreSettings() {
    if (!supabase) return null;
    
    const { data, error } = await supabase
      .from('store_settings')
      .select('*')
      .single();
      
    if (error) {
      console.error('Error fetching store settings:', error);
      return null;
    }
    
    return { ...data };
  },
  
  async updateStoreSettings(settings: any) {
    if (!supabase) return;
    
    // First get the current settings to get the ID
    const { data: currentData } = await supabase
      .from('store_settings')
      .select('id')
      .single();
    
    if (!currentData) {
      // If no record exists, insert a new one
      const { error } = await supabase
        .from('store_settings')
        .insert({ ...settings, id: crypto.randomUUID() });
      
      if (error) throw error;
    } else {
      // Update existing record
      const { error } = await supabase
        .from('store_settings')
        .update(settings)
        .eq('id', currentData.id);
        
      if (error) throw error;
    }
  },

  // Profil Pengguna
  async getUserProfile() {
    if (!supabase) return null;
    
    const { data, error } = await supabase
      .from('user_profiles')
      .select('*')
      .single();
      
    if (error) {
      console.error('Error fetching user profile:', error);
      return null;
    }
    
    return { ...data };
  },
  
  async updateUserProfile(profile: any) {
    if (!supabase) return;
    
    // Use upsert to handle both insert and update cases
    const { data, error } = await supabase
      .from('user_profiles')
      .upsert(profile, { onConflict: 'id' })
      .select()
      .single();
      
    if (error) {
      console.error('Error updating user profile:', error);
      throw error;
    }
    
    return data;
  },

  // Metode Pembayaran
  async getPaymentMethods() {
    if (!supabase) return [];
    
    const { data, error } = await supabase
      .from('payment_methods')
      .select('*')
      .order('created_at', { ascending: false });
      
    if (error) {
      console.error('Error fetching payment methods:', error);
      return [];
    }
    
    // replace is_active become isActive
    return data.map((method) => ({
      ...method,
      isActive: method.is_active
    })) || [];
  },
  
  async updatePaymentMethod(method: any) {
    if (!supabase) return;
    
    // Use update with proper method structure
    const { data, error } = await supabase
      .from("payment_methods")
      .update({ is_active: method.is_active })
      .eq("id", method.id)
      .select()
      .single();
      
    if (error) {
      console.error('Error updating payment method:', error);
      throw error;
    }
    
    return data;
  },
};
