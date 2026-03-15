import React from 'react';
import jsPDF from 'jspdf';
import { Transaction } from '../types';
import { formatCurrency, formatDate } from '../utils';

interface TransactionReceiptPrinterProps {
  transaction: Transaction;
}

export const TransactionReceiptPrinter: React.FC<TransactionReceiptPrinterProps> = ({ 
  transaction 
}) => {
  const printReceipt = async () => {
    try {
      const pdf = new jsPDF();
      
      // Store information (dummy data)
      const storeInfo = {
        name: 'Toko Sejahtera',
        address: 'Jl. Merdeka No. 123, Jakarta Pusat',
        phone: '(021) 1234-5678',
        logo: '🏪' // Using emoji as logo
      };
      
      // Set font for better receipt appearance
      pdf.setFont('helvetica');
      
      // Header - Store Information
      pdf.setFontSize(24);
      pdf.text(storeInfo.logo, 105, 20, { align: 'center' });
      
      pdf.setFontSize(18);
      pdf.text(storeInfo.name, 105, 35, { align: 'center' });
      
      pdf.setFontSize(10);
      pdf.text(storeInfo.address, 105, 45, { align: 'center' });
      pdf.text(`Telp: ${storeInfo.phone}`, 105, 52, { align: 'center' });
      
      // Separator line
      pdf.setLineWidth(0.5);
      pdf.line(20, 60, 190, 60);
      
      // Transaction Information
      pdf.setFontSize(12);
      pdf.text('STRUK TRANSAKSI', 105, 70, { align: 'center' });
      
      pdf.setFontSize(10);
      pdf.text(`Tanggal: ${formatDate(transaction.createdAt)}`, 20, 85);
      pdf.text('Kasir: Admin', 20, 92);
      pdf.text('Cabang: Jakarta Pusat', 20, 99);
      pdf.text(`ID: ${transaction.id}`, 20, 106);
      
      // Another separator
      pdf.setLineWidth(0.3);
      pdf.line(20, 115, 190, 115);
      
      // Items Section
      let yPos = 125;
      pdf.setFontSize(10);
      pdf.text('Detail Produk:', 20, yPos);
      
      yPos += 10;
      if (transaction.items && transaction.items.length > 0) {
        pdf.setFontSize(9);
        transaction.items.forEach((item, index) => {
          pdf.text(`${index + 1}. ${item.name}`, 25, yPos);
          yPos += 6;
          pdf.text(`   x${item.quantity} @ Rp ${formatCurrency(item.price)}`, 30, yPos);
          yPos += 6;
          pdf.text(`   Subtotal: Rp ${formatCurrency(item.price * item.quantity)}`, 30, yPos);
          yPos += 10;
        });
      } else {
        pdf.text('Tidak ada detail produk', 25, yPos);
        yPos += 10;
      }
      
      // Final separator
      pdf.setLineWidth(0.5);
      pdf.line(20, yPos, 190, yPos);
      
      // Summary
      yPos += 10;
      pdf.setFontSize(11);
      pdf.text(`Total: Rp ${formatCurrency(transaction.amount)}`, 150, yPos);
      
      yPos += 15;
      pdf.setFontSize(9);
      pdf.setFont('helvetica', 'italic');
      pdf.text('Terima kasih atas kunjungan Anda', 105, yPos, { align: 'center' });
      
      yPos += 7;
      pdf.text('Barang yang sudah dibeli tidak dapat dikembalikan', 105, yPos, { align: 'center' });
      
      // Save the PDF
      pdf.save(`struk-${transaction.id}.pdf`);
    } catch (error) {
      console.error('Error printing receipt:', error);
    }
  };

  return { printReceipt };
};
