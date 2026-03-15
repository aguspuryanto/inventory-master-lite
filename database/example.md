```typescript
import { createClient } from "@supabase/supabase-js";
import { Transaction, Pinjaman, Angsuran } from '../types';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_DEFAULT_KEY;

export const supabase = createClient(supabaseUrl, supabaseKey);

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

export const getTransactions = async (): Promise<{ data: Transaction[], error: any }> => {
    const { data, error } = await supabase
        .from('transaksi')
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

export const createTransaction = async (transaction: Transaction) => {
    const { data, error } = await supabase
        .from('transaksi')
        .insert({
            type: transaction.type,
            main_category: transaction.mainCategory,
            sub_category: transaction.subCategory,
            amount: transaction.amount,
            created_at: transaction.createdAt,
            description: transaction.description,
        })
        .select()
        .single();

    if (error) {
        console.error('Error creating transaction:', error);
        throw error;
    }

    return data;
};

export const removeTransaction = async (id: string) => {
    const { error } = await supabase
        .from('transaksi')
        .delete()
        .eq('id', id);

    if (error) {
        console.error('Error deleting transaction:', error);
        throw error;
    }
};

// PINJAMAN FUNCTIONS
export const getPinjaman = async (): Promise<{ data: Pinjaman[], error: any }> => {
    console.log('Fetching pinjaman from Supabase...');
    
    const { data: pinjamanData, error: pinjamanError } = await supabase
        .from('pinjaman')
        .select('*')
        .order('created_at', { ascending: false });

    if (pinjamanError) {
        console.error('Error fetching pinjaman:', pinjamanError);
        return { data: [], error: pinjamanError };
    }

    // Check if table exists or has data
    if (!pinjamanData) {
        console.log('Pinjaman data is null - table might not exist');
        return { data: [], error: null };
    }

    // Get angsuran for each pinjaman
    const pinjamanWithAngsuran = await Promise.all(
        pinjamanData.map(async (pinjaman: any) => {
            // console.log('Fetching angsuran for pinjaman ID:', pinjaman.id);
            
            const { data: angsuranData, error: angsuranError } = await supabase
                .from('angsuran')
                .select('*')
                .eq('pinjaman_id', pinjaman.id)
                .order('bulan', { ascending: true });

            const mappedAngsuran = angsuranData?.map((a: any) => ({
                id: String(a.id),
                bulan: a.bulan,
                jumlah: a.jumlah,
                bunga: a.bunga,
                pokok: a.pokok,
                sisaPinjaman: a.sisa_pinjaman,
                jatuhTempo: a.jatuh_tempo,
                status: a.status,
                tanggalBayar: a.tanggal_bayar,
                buktiBayar: a.bukti_bayar
            })) || [];

            return {
                id: String(pinjaman.id),
                jumlahPinjaman: pinjaman.jumlah_pinjaman,
                bungaTahunan: pinjaman.bunga_tahunan,
                tenorBulan: pinjaman.tenor_bulan,
                tanggalPinjaman: pinjaman.tanggal_pinjaman,
                angsuran: mappedAngsuran
            };
        })
    );

    // console.log('Final pinjaman with angsuran:', pinjamanWithAngsuran);
    return { data: pinjamanWithAngsuran, error: null };
};

export const createPinjaman = async (pinjaman: Pinjaman): Promise<{ data: any, error: any }> => {
    // Insert pinjaman
    const { data: pinjamanData, error: pinjamanError } = await supabase
        .from('pinjaman')
        .insert({
            jumlah_pinjaman: pinjaman.jumlahPinjaman,
            bunga_tahunan: pinjaman.bungaTahunan,
            tenor_bulan: pinjaman.tenorBulan,
            tanggal_pinjaman: pinjaman.tanggalPinjaman
        })
        .select()
        .single();

    if (pinjamanError) {
        console.error('Error creating pinjaman:', pinjamanError);
        return { data: null, error: pinjamanError };
    }

    // Insert angsuran
    const angsuranInserts = pinjaman.angsuran.map(a => ({
        pinjaman_id: pinjamanData.id,
        bulan: a.bulan,
        jumlah: a.jumlah,
        bunga: a.bunga,
        pokok: a.pokok,
        sisa_pinjaman: a.sisaPinjaman,
        jatuh_tempo: a.jatuhTempo,
        status: a.status
    }));

    const { error: angsuranError } = await supabase
        .from('angsuran')
        .insert(angsuranInserts);

    if (angsuranError) {
        console.error('Error creating angsuran:', angsuranError);
        return { data: null, error: angsuranError };
    }

    return { data: pinjamanData, error: null };
};

export const updateAngsuranStatus = async (
    angsuranId: string, 
    status: 'terbayar' | 'belum_terbayar',
    paymentData?: {
        tanggalBayar?: string;
        buktiBayar?: string | null;
    }
): Promise<{ error: any }> => {
    const updateData: any = { status };
    
    // Add payment data if marking as paid
    if (status === 'terbayar' && paymentData) {
        updateData.tanggal_bayar = paymentData.tanggalBayar;
        updateData.bukti_bayar = paymentData.buktiBayar;
    }
    
    const { error } = await supabase
        .from('angsuran')
        .update(updateData)
        .eq('id', angsuranId);

    if (error) {
        console.error('Error updating angsuran status:', error);
        return { error };
    }

    return { error: null };
};

export const deletePinjaman = async (pinjamanId: string): Promise<{ error: any }> => {
    const { error } = await supabase
        .from('pinjaman')
        .delete()
        .eq('id', pinjamanId);

    if (error) {
        console.error('Error deleting pinjaman:', error);
        return { error };
    }

    return { error: null };
};
```
https://mobisoftinfotech.com/resources/blog/app-development/supabase-react-typescript-tutorial

Step 1: Set Up Your Supabase Project
Step 2: Create Tables (Database)
Step 3: Set Up Your Frontend with Vite
Step 4: Add User Authentication
Step 5: Create and Fetch Posts
Step 6: Add Real-Time Updates and Upload Images with Supabase Storage
Step 7: Create Followers Page
Step 8: Add styling for all the pages
Step 9: Secure the Table by RLS
Step 10: Start the App
Final Thoughts