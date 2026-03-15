import React from 'react';
import jsPDF from 'jspdf';
import { Transaction } from '../types';
import { formatCurrency, formatDate } from '../utils';

interface TransactionPDFExportProps {
  transactions: Transaction[];
  filtered: Transaction[];
}

export const TransactionPDFExport: React.FC<TransactionPDFExportProps> = ({ 
  transactions, 
  filtered 
}) => {
  const exportToPDF = async () => {
    try {
      const pdf = new jsPDF();
      
      // Add title
      pdf.setFontSize(20);
      pdf.text('Laporan Riwayat Transaksi', 20, 20);
      
      // Add date
      pdf.setFontSize(12);
      pdf.text(`Tanggal: ${formatDate(new Date())}`, 20, 30);
      
      // Add summary
      const totalIn = transactions.filter(t => t.type === 'IN').reduce((acc, t) => acc + t.amount, 0);
      const totalOut = transactions.filter(t => t.type === 'OUT').reduce((acc, t) => acc + t.amount, 0);
      
      pdf.setFontSize(14);
      pdf.text('Ringkasan:', 20, 45);
      pdf.setFontSize(12);
      pdf.text(`Total Transaksi: ${transactions.length}`, 30, 55);
      pdf.text(`Total Pembelian: Rp ${formatCurrency(totalIn)}`, 30, 65);
      pdf.text(`Total Penjualan: Rp ${formatCurrency(totalOut)}`, 30, 75);
      
      // Add transactions table
      pdf.setFontSize(14);
      pdf.text('Detail Transaksi:', 20, 90);
      
      let yPosition = 100;
      pdf.setFontSize(10);
      
      // Table headers
      pdf.text('ID', 20, yPosition);
      pdf.text('Tanggal', 50, yPosition);
      pdf.text('Tipe', 80, yPosition);
      pdf.text('Deskripsi', 100, yPosition);
      pdf.text('Jumlah', 160, yPosition);
      
      yPosition += 10;
      
      // Table data
      filtered.forEach(transaction => {
        if (yPosition > 270) {
          pdf.addPage();
          yPosition = 20;
        }
        
        pdf.text(transaction.id.substring(0, 8) + '...', 20, yPosition);
        pdf.text(formatDate(transaction.createdAt), 50, yPosition);
        pdf.text(transaction.type === 'IN' ? 'Masuk' : 'Keluar', 80, yPosition);
        pdf.text(transaction.description.substring(0, 20), 100, yPosition);
        pdf.text(`Rp ${formatCurrency(transaction.amount)}`, 160, yPosition);
        
        yPosition += 10;
      });
      
      // Save the PDF
      pdf.save(`laporan-transaksi-${new Date().toISOString().split('T')[0]}.pdf`);
    } catch (error) {
      console.error('Error generating PDF:', error);
    }
  };

  return { exportToPDF };
};
