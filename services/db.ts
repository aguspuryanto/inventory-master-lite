import { supabase } from '../lib/supabase';
import { Product, Transaction } from '../types';

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
    
    return data.map(t => ({
      id: t.id,
      type: t.type,
      mainCategory: t.main_category,
      subCategory: t.sub_category,
      amount: Number(t.amount),
      createdAt: t.created_at,
      description: t.description || ''
    }));
  },

  async addTransaction(tx: Transaction) {
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
  }
};
