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
      
      // Page setup
      const pageWidth = pdf.internal.pageSize.getWidth();
      const margin = 20;
      const contentWidth = pageWidth - (margin * 2);
      
      // Add title
      pdf.setFontSize(18);
      pdf.setFont('helvetica', 'bold');
      pdf.text('Laporan Riwayat Transaksi', margin, 20);
      
      // Add date
      pdf.setFontSize(12);
      pdf.setFont('helvetica', 'normal');
      pdf.text(`Tanggal: ${formatDate(new Date())}`, margin, 35);
      
      // Add summary
      const totalIn = transactions.filter(t => t.type === 'IN').reduce((acc, t) => acc + t.amount, 0);
      const totalOut = transactions.filter(t => t.type === 'OUT').reduce((acc, t) => acc + t.amount, 0);
      
      pdf.setFontSize(14);
      pdf.setFont('helvetica', 'bold');
      pdf.text('Ringkasan:', margin, 50);
      
      pdf.setFontSize(11);
      pdf.setFont('helvetica', 'normal');
      pdf.text(`Total Transaksi: ${transactions.length}`, margin + 10, 60);
      pdf.text(`Total Pembelian: Rp ${formatCurrency(totalIn)}`, margin + 10, 70);
      pdf.text(`Total Penjualan: Rp ${formatCurrency(totalOut)}`, margin + 10, 80);
      
      // Add transactions table
      pdf.setFontSize(14);
      pdf.setFont('helvetica', 'bold');
      pdf.text('Detail Transaksi:', margin, 100);
      
      let yPosition = 115;
      
      // Table headers
      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'bold');
      const colWidths = {
        id: 25,
        date: 35,
        type: 25,
        desc: 60,
        amount: 35
      };
      
      pdf.text('Tanggal & ID', margin, yPosition);
      pdf.text('Tipe', margin + colWidths.id, yPosition);
      pdf.text('Rincian', margin + colWidths.id + colWidths.date, yPosition);
      pdf.text('Total', margin + colWidths.id + colWidths.date + colWidths.type, yPosition);
      
      yPosition += 8;
      
      // Draw header line
      pdf.line(margin, yPosition, margin + contentWidth, yPosition);
      yPosition += 5;
      
      // Table data
      pdf.setFont('helvetica', 'normal');
      filtered.forEach(transaction => {
        // Check if we need a new page
        if (yPosition > 250) {
          pdf.addPage();
          yPosition = 20;
          
          // Redraw headers on new page
          pdf.setFont('helvetica', 'bold');
          pdf.text('Tanggal & ID', margin, yPosition);
          pdf.text('Tipe', margin + colWidths.id, yPosition);
          pdf.text('Rincian', margin + colWidths.id + colWidths.date, yPosition);
          pdf.text('Total', margin + colWidths.id + colWidths.date + colWidths.type, yPosition);
          
          yPosition += 8;
          pdf.line(margin, yPosition, margin + contentWidth, yPosition);
          yPosition += 5;
          pdf.setFont('helvetica', 'normal');
        }
        
        // Transaction row
        pdf.setFontSize(9);
        pdf.text(formatDate(transaction.createdAt), margin, yPosition);
        pdf.text(transaction.type === 'IN' ? 'Pembelian' : 'Penjualan', margin + colWidths.id, yPosition);
        
        // Description with category
        const descText = transaction.description || '-';
        const categoryText = transaction.subCategory || '';
        const fullDesc = descText + (categoryText ? ` (${categoryText})` : '');
        const truncatedDesc = fullDesc.length > 25 ? fullDesc.substring(0, 25) + '...' : fullDesc;
        pdf.text(truncatedDesc, margin + colWidths.id + colWidths.date, yPosition);
        
        pdf.text(`Rp ${formatCurrency(transaction.amount)}`, margin + colWidths.id + colWidths.date + colWidths.type, yPosition);
        
        yPosition += 7;
        
        // Add items if available
        if (transaction.items && transaction.items.length > 0) {
          pdf.setFontSize(8);
          pdf.text('  Detail Produk:', margin + 10, yPosition);
          yPosition += 5;
          
          transaction.items.forEach((item, index) => {
            if (yPosition > 260) {
              pdf.addPage();
              yPosition = 20;
            }
            
            const itemText = `${item.name} x${item.quantity} • Rp ${formatCurrency(item.price)}`;
            const itemTotal = `Rp ${formatCurrency(item.subtotal)}`;
            
            pdf.text(`    ${itemText}`, margin + 15, yPosition);
            pdf.text(itemTotal, margin + colWidths.id + colWidths.date + colWidths.type + 20, yPosition);
            
            yPosition += 5;
          });
          
          yPosition += 3;
          pdf.line(margin, yPosition, margin + contentWidth, yPosition);
          yPosition += 5;
        }
        
        // Draw separator line
        pdf.line(margin, yPosition, margin + contentWidth, yPosition);
        yPosition += 5;
      });
      
      // Save PDF
      pdf.save(`laporan-transaksi-${new Date().toISOString().split('T')[0]}.pdf`);
    } catch (error) {
      console.error('Error generating PDF:', error);
    }
  };

  return { exportToPDF };
};
