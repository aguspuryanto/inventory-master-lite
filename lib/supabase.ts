import { createClient } from '@supabase/supabase-js';
import { Product, Transaction } from '../types';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Only create client if URL and Key are provided
export const supabase = supabaseUrl && supabaseKey 
  ? createClient(supabaseUrl, supabaseKey) 
  : null;

  export const formatRupiah = (amount: number): string => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0
  }).format(amount);
};

export const formatRupiahHuman = (amount: number): string => {
  if (amount >= 1000000000) {
    return `Rp ${(amount / 1000000000).toFixed(1).replace(/\.0$/, '')} Miliar`;
  }
  if (amount >= 1000000) {
    return `Rp ${(amount / 1000000).toFixed(1).replace(/\.0$/, '')} Juta`;
  }
  if (amount >= 1000) {
    return `Rp ${(amount / 1000).toFixed(1).replace(/\.0$/, '')} Ribu`;
  }
  return formatRupiah(amount);
};

export const getProducts = async (): Promise<{ data: Product[], error: any }> => {
    const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false });

    if (error) {
        console.error('Error fetching products:', error);
        return { data: [], error };
    }

    const mappedData = data.map((p: any) => ({
        id: String(p.id),
        code: p.code,
        name: p.name,
        barcode: p.barcode,
        purchasePrice: p.purchase_price,
        sellingPrice: p.selling_price,
        stock: p.stock,
        category: p.category,
        createdAt: p.created_at,
        updatedAt: p.updated_at,
    }));

    return { data: mappedData, error: null };
};

// transaction
export const getTransactions = async (): Promise<{ data: Transaction[], error: any }> => {
    const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .order('created_at', { ascending: false });

    if (error) {
        console.error('Error fetching transactions:', error);
        return { data: [], error };
    }

    const mappedData = data.map((t: any) => ({
        id: String(t.id),
        type: t.type,
        mainCategory: t.main_category,
        subCategory: t.sub_category,
        amount: t.amount,
        createdAt: t.created_at,
        description: t.description,
    }));

    return { data: mappedData, error: null };
};
