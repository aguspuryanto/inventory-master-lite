import React from 'react';
import jsPDF from 'jspdf';
import { Transaction } from '../types';
import { formatCurrency, formatDate } from '../utils';
import { db } from '@/services/db';
import { supabase } from '../lib/supabase';

interface TransactionReceiptPrinterProps {
  transaction: Transaction;
}

export const TransactionReceiptPrinter: React.FC<TransactionReceiptPrinterProps> = ({ 
  transaction 
}) => {

  const printReceipt = async () => {
    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      const cashierName = user?.user_metadata?.name || user?.email || 'Admin Utama';
      
      const printerSettings = await db.getPrinterSettings();
      console.log('Printer settings:', printerSettings);
      
      // Check if Bluetooth is available
      if (!navigator.bluetooth) {
        alert('Bluetooth tidak didukung di browser ini. Gunakan browser yang mendukung Web Bluetooth API.');
        return;
      }

      // Use saved device if available, otherwise request new device
      let device;
      const printerSetting = printerSettings?.[0]; // Get first printer setting
      
      // Try to use cached device first (if available in sessionStorage)
      const cachedDeviceInfo = sessionStorage.getItem('cachedBluetoothDevice');
      
      if (printerSetting?.deviceId && cachedDeviceInfo) {
        try {
          const cachedDevice = JSON.parse(cachedDeviceInfo);
          const cacheAge = Date.now() - cachedDevice.timestamp;
          const maxCacheAge = 24 * 60 * 60 * 1000; // 24 hours
          
          console.log('Cache comparison:', {
            cached: { id: cachedDevice.id, name: cachedDevice.name },
            saved: { id: printerSetting.deviceId, name: printerSetting.deviceName },
            cacheAge: Math.round(cacheAge / 1000) + 's'
          });
          
          if (cacheAge > maxCacheAge) {
            console.log('Cached device info expired, clearing cache...');
            sessionStorage.removeItem('cachedBluetoothDevice');
            throw new Error('Cache expired');
          }
          
          if (cachedDevice.id === printerSetting.deviceId && cachedDevice.name === printerSetting.deviceName) {
            console.log('Device info matches, attempting connection...');
            
            // Try to connect - this will still show dialog but with better UX
            device = await navigator.bluetooth.requestDevice({
              filters: [{
                name: printerSetting.deviceName
              }],
              optionalServices: [
                '000018f0-0000-1000-8000-00805f9b34fb',
                '0000180a-0000-1000-8000-00805f9b34fb',
                '00001812-0000-1000-8000-00805f9b34fb',
                '49535343-fe7d-4ae5-8fa9-9fafd205e455',
                'generic_access',
                'device_information'
              ]
            });
            console.log('Device connected successfully');
          } else {
            console.log('Device info changed, requesting new device...');
            throw new Error('Device mismatch');
          }
        } catch (cacheError) {
          console.log('Cache connection failed:', cacheError);
          // Fall back to device selection
          device = await navigator.bluetooth.requestDevice({
            filters: [{
              name: printerSetting?.deviceName || 'RPP02N'
            }],
            optionalServices: [
              '000018f0-0000-1000-8000-00805f9b34fb',
              '0000180a-0000-1000-8000-00805f9b34fb',
              '00001812-0000-1000-8000-00805f9b34fb',
              '49535343-fe7d-4ae5-8fa9-9fafd205e455',
              'generic_access',
              'device_information'
            ]
          });
        }
      } else {
        // No saved device, request new one
        console.log('No saved device found, requesting new device...');
        device = await navigator.bluetooth.requestDevice({
          acceptAllDevices: true,
          optionalServices: [
            '000018f0-0000-1000-8000-00805f9b34fb',
            '0000180a-0000-1000-8000-00805f9b34fb',
            '00001812-0000-1000-8000-00805f9b34fb',
            '49535343-fe7d-4ae5-8fa9-9fafd205e455',
            'generic_access',
            'device_information'
          ]
        });
      }

      const deviceName = device.name || printerSetting?.deviceName || 'Unknown Device';
      console.log('Using device:', deviceName);

      // Save device information to database if different from saved settings
      if (!printerSetting || printerSetting.deviceId !== device.id || printerSetting.deviceName !== device.name) {
        console.log('Saving new device information to database...');
        await db.setPrinterSettings({
          deviceId: device.id,
          deviceName: device.name || 'Unknown Device',
          paperSize: printerSetting?.paperSize || '58mm',
          orientation: printerSetting?.orientation || 'Portrait',
          autoPrint: printerSetting?.autoPrint || false
        });
        console.log('Device information saved successfully');
      }

      // Cache device info in sessionStorage for faster reconnection
      sessionStorage.setItem('cachedBluetoothDevice', JSON.stringify({
        id: device.id,
        name: device.name || 'Unknown Device',
        timestamp: Date.now()
      }));
      console.log('Device info cached in sessionStorage');

      // Connect to the device
      const server = await device.gatt.connect();
      console.log('Connected to GATT server');
      
      // Try to find the appropriate service for thermal printers
      let service;
      let characteristic;
      
      // Common thermal printer service UUIDs to try
      const serviceUUIDs = [
        '000018f0-0000-1000-8000-00805f9b34fb',
        '0000180a-0000-1000-8000-00805f9b34fb',
        '00001812-0000-1000-8000-00805f9b34fb',
        '49535343-fe7d-4ae5-8fa9-9fafd205e455', // Common for Chinese thermal printers
        '49535343-8841-43f4-a8d4-ecbe34729bb3', // Another common UUID
      ];
      
      for (const serviceUUID of serviceUUIDs) {
        try {
          // console.log('Trying service:', serviceUUID);
          service = await server.getPrimaryService(serviceUUID);
          // console.log('Found service:', serviceUUID);
          
          // Try different characteristic UUIDs
          const characteristicUUIDs = [
            '00002af1-0000-1000-8000-00805f9b34fb',
            '49535343-8841-43f4-a8d4-ecbe34729bb3',
            '49535343-1e4d-4bd9-ba61-23c6472496bb',
            '49535343-aca3-481c-91ec-b8599a224c32',
          ];
          
          for (const charUUID of characteristicUUIDs) {
            try {
              // console.log('Trying characteristic:', charUUID);
              characteristic = await service.getCharacteristic(charUUID);
              // console.log('Found characteristic:', charUUID);
              break;
            } catch (charError) {
              // console.log('Characteristic not found:', charUUID);
            }
          }
          
          if (characteristic) break;
        } catch (serviceError) {
          console.log('Service not found:', serviceUUID);
        }
      }
      
      if (!service || !characteristic) {
        throw new Error('Tidak dapat menemukan service atau karakteristik yang sesuai untuk printer. Pastikan printer thermal Anda kompatibel.');
      }

      // Store information
      const storeSettings = await db.getStoreSettings();
      const storeInfo = storeSettings?.[0] || {
        name: 'KasirKu POS',
        address: 'Gedung Sudirman Lantai 4, Jakarta',
        phone: '(021) 12345678'
      };

      // Add printer info to receipt if available
      let receiptContent = '';
      
      // Simple text format without complex ESC/POS commands
      receiptContent += '================================\n';
      receiptContent += '      KASIRKU POS SYSTEM      \n';
      receiptContent += '================================\n';
      receiptContent += storeInfo.name + '\n';
      receiptContent += storeInfo.address + '\n';
      receiptContent += 'Telp: ' + storeInfo.phone + '\n';
      // if (deviceName && deviceName !== 'Unknown Device') {
      //   receiptContent += 'Printer: ' + deviceName + '\n';
      //   receiptContent += '================================\n';
      // }
      
      receiptContent += '================================\n';
      receiptContent += 'STRUK TRANSAKSI\n';
      receiptContent += '================================\n';
      receiptContent += 'Tanggal: ' + formatDate(transaction.createdAt) + '\n';
      receiptContent += 'Kasir: ' + cashierName + '\n';
      receiptContent += 'ID: ' + transaction.id + '\n';
      // receiptContent += '================================\n';
      // receiptContent += 'Kategori: ' + transaction.mainCategory + '\n';
      // receiptContent += 'Sub Kategori: ' + transaction.subCategory + '\n';
      // receiptContent += 'Deskripsi: ' + (transaction.description || '-') + '\n';

      // Details Item, loop through transaction.items
      if (transaction.items && transaction.items.length > 0) {
        receiptContent += '================================\n';
        receiptContent += 'DETAIL ITEM:\n';
        receiptContent += '================================\n';
        transaction.items.forEach((item, index) => {
          receiptContent += `${index + 1}. ${item.name}\n`;
          receiptContent += `   Qty: ${item.quantity} x ${formatCurrency(item.price)}\n`;
          receiptContent += `   Subtotal: ${formatCurrency(item.subtotal)}\n`;
          if (index < transaction.items!.length - 1) {
            receiptContent += '--------------------------------\n';
          }
        });
        // receiptContent += '--------------------------------\n';
      }

      receiptContent += '================================\n';
      receiptContent += 'TOTAL: Rp ' + formatCurrency(transaction.amount) + '\n';
      receiptContent += '================================\n';
      receiptContent += 'Terima kasih atas kunjungan Anda\n';
      receiptContent += 'Barang yang sudah dibeli tidak\n';
      receiptContent += 'dapat dikembalikan\n';
      receiptContent += '================================\n';
      receiptContent += '\n\n'; // Reduced spacing for paper cut

      // Convert to bytes and send to printer
      const encoder = new TextEncoder();
      
      // Add printer initialization commands
      const initCommands = new Uint8Array([
        0x1B, 0x40, // Initialize printer
        0x1B, 0x21, 0x00, // Reset text formatting
      ]);
      
      // Add line feed at the end
      const endCommands = new Uint8Array([
        0x0A, 0x0A, // Reduced line feeds
        0x1D, 0x56, 0x00, // Paper cut command (if supported)
      ]);
      
      const textData = encoder.encode(receiptContent);
      
      // Combine all commands
      const combinedData = new Uint8Array(initCommands.length + textData.length + endCommands.length);
      combinedData.set(initCommands, 0);
      combinedData.set(textData, initCommands.length);
      combinedData.set(endCommands, initCommands.length + textData.length);
      
      // console.log('Sending data to printer, size:', combinedData.length);
      // console.log('Receipt content preview:', receiptContent.substring(0, 100) + '...');
      // console.log('Raw data preview:', Array.from(combinedData.slice(0, 20)));
      
      // Send data in chunks if needed
      const chunkSize = 20; // Many Bluetooth printers have small MTU
      for (let i = 0; i < combinedData.length; i += chunkSize) {
        const chunk = combinedData.slice(i, i + chunkSize);
        // console.log(`Sending chunk ${Math.floor(i/chunkSize) + 1}/${Math.ceil(combinedData.length/chunkSize)}`);
        await characteristic.writeValue(chunk);
      }
      
      // console.log('All data sent successfully');

      console.log('Struk berhasil dicetak!');
      
      // Disconnect after printing
      await device.gatt.disconnect();
      console.log('Disconnected from device');
      
    } catch (error) {
      console.error('Error printing receipt:', error);
      console.error('Error details:', {
        name: error.name,
        message: error.message,
        stack: error.stack
      });
      
      if (error.name === 'NotFoundError') {
        alert('Tidak ada perangkat Bluetooth yang dipilih. Silakan pilih printer thermal Anda.');
      } else if (error.name === 'NetworkError') {
        alert('Gagal terhubung ke printer. Pastikan printer dalam jangkauan dan sudah menyala.');
      } else if (error.name === 'NotSupportedError') {
        alert('Browser ini tidak mendukung Web Bluetooth API. Gunakan Chrome, Edge, atau Opera.');
      } else if (error.message && error.message.includes('service atau karakteristik')) {
        alert(error.message);
      } else {
        alert('Terjadi kesalahan saat mencetak: ' + error.message + '\n\nCek console untuk detail lengkap.');
      }
    }
  };

  return { printReceipt };
};
