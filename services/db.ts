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
        category: product.category
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
        category: product.category
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
      .select(`
        *,
        transaction_items (*)
      `)
      .order('date', { ascending: false });
      
    if (error) {
      console.error('Error fetching transactions:', error);
      return [];
    }
    
    return data.map(t => ({
      id: t.id,
      date: t.date,
      type: t.type as 'IN' | 'OUT',
      total: Number(t.total),
      paymentAmount: t.payment_amount ? Number(t.payment_amount) : undefined,
      changeAmount: t.change_amount ? Number(t.change_amount) : undefined,
      note: t.note,
      items: t.transaction_items.map((i: any) => ({
        productId: i.product_id,
        name: i.name,
        price: Number(i.price),
        quantity: Number(i.quantity),
        subtotal: Number(i.subtotal)
      }))
    }));
  },

  async addTransaction(tx: Transaction) {
    if (!supabase) return;
    
    // 1. Insert Transaction
    const { error: txError } = await supabase
      .from('transactions')
      .insert({
        id: tx.id,
        date: tx.date,
        type: tx.type,
        total: tx.total,
        payment_amount: tx.paymentAmount,
        change_amount: tx.changeAmount,
        note: tx.note
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
  }
};
