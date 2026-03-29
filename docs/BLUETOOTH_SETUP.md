# Bluetooth Printer Integration Guide

## Overview

Implementasi Bluetooth printer untuk KasirKu POS menggunakan Web Bluetooth API. Ini memungkinkan pencetakan struk langsung ke printer Bluetooth tanpa memerlukan driver atau kabel.

## Komponen yang Tersedia

### 1. `useBluetooth` Hook
Custom hook untuk mengelola koneksi Bluetooth device.

**Fitur:**
- Device discovery dan pairing
- Connection management
- GATT service operations
- Read/write characteristics
- Real-time data notifications
- Error handling

### 2. `BluetoothConnector` Component
Komponen UI untuk mengelola koneksi Bluetooth device.

**Fitur:**
- Visual connection status
- Device selection
- Connection controls
- Error display
- Real-time data monitoring

### 3. `BluetoothPrinter` Component
Komponen khusus untuk printer Bluetooth dengan queue management.

**Fitur:**
- Print job queue
- Status tracking
- Test print functionality
- Auto-retry mechanism
- Job history

### 4. `BluetoothPrintButton` Component
Tombol integrasi untuk POS dengan preview struk.

**Fitur:**
- Quick print button
- Receipt preview
- Modal interface
- Success/error notifications

## Persyaratan Browser

### Browser yang Didukung:
- ✅ Chrome (versi terbaru)
- ✅ Edge (versi terbaru)
- ✅ Opera (versi terbaru)

### Persyaratan:
- **HTTPS**: Web Bluetooth API hanya berfungsi di secure context (HTTPS)
- **User Gesture**: Memerlukan interaksi user (klik tombol)
- **Permissions**: User harus memberikan izin Bluetooth

## Cara Penggunaan

### 1. Basic Integration

```tsx
import { BluetoothPrintButton } from '../components/BluetoothPrintButton';

// Di POS component
<BluetoothPrintButton 
  receipt={receipt}
  onPrintComplete={(success) => {
    if (success) {
      console.log('Print successful');
    }
  }}
/>
```

### 2. Advanced Integration dengan Custom Service

```tsx
import { useBluetooth } from '../hooks/useBluetooth';

const {
  device,
  isSupported,
  isConnecting,
  requestDevice,
  connect,
  writeCharacteristic
} = useBluetooth({
  filters: [
    { services: ['custom_service_uuid'] }
  ],
  optionalServices: ['custom_service_uuid']
});

const printCustom = async (data: string) => {
  const encoder = new TextEncoder();
  const buffer = encoder.encode(data);
  
  await writeCharacteristic('custom_service_uuid', 'custom_char_uuid', buffer);
};
```

## Konfigurasi Printer Service

### UUID Services yang Umum:

**Generic Printer:**
```javascript
filters: [
  { services: ['0x1234'] }
],
optionalServices: ['0x1234']
```

**Custom Printer:**
```javascript
filters: [
  { services: ['4953534d-4744-4d45-4d53'] }
],
optionalServices: ['4953534d-4744-4d45-4d53']
```

**Thermal Printer:**
```javascript
filters: [
  { services: ['000018f0-0000-1000-8000-00805f9b34fb'] }
],
optionalServices: ['000018f0-0000-1000-8000-00805f9b34fb']
```

## Format Data Printer

### ESC/POS Commands:
```javascript
const ESC = '\x1B';
const initializePrinter = ESC + '@';
const cutPaper = ESC + 'd' + '\x02';

const printText = (text) => {
  const commands = [
    initializePrinter,
    text,
    cutPaper
  ].join('');
  
  return commands;
};
```

### Receipt Format:
```javascript
const formatReceipt = (receipt) => {
  return `
${ESC}@${ESC}!${ESC}a${ESC}a
KASIRKU - STRUK PENJUALAN
===================================

No: ${receipt.id}
Tanggal: ${new Date().toLocaleString()}

-----------------------------------
${receipt.items.map(item => 
  `${item.name.padEnd(20, '.')} ${item.quantity} x ${formatCurrency(item.price)}`
).join('\n')}

--------------------------------===
Total: ${formatCurrency(receipt.total)}
Tunai: ${formatCurrency(receipt.paymentAmount)}
Kembali: ${formatCurrency(receipt.changeAmount)}

${ESC}d${ESC}02
  `.trim();
};
```

## Troubleshooting

### Common Issues:

1. **Device Not Found**
   - Pastikan printer dalam mode pairing
   - Periksa UUID service yang benar
   - Restart browser

2. **Connection Failed**
   - Pastikan tidak ada device yang terhubung
   - Coba refresh halaman
   - Clear browser cache

3. **Print Not Working**
   - Periksa format data printer
   - Pastikan printer dalam mode siap
   - Coba test print terlebih dahulu

4. **Permission Denied**
   - User harus klik tombol connect
   - Pastikan menggunakan HTTPS
   - Check browser permissions

### Debug Mode:

```javascript
// Enable debug logging
const debugLog = (message, data) => {
  console.log(`[Bluetooth Debug] ${message}`, data);
};

// Monitor connection
debugLog('Device connected', device);
debugLog('Data sent', data);
debugLog('Response received', response);
```

## Security Considerations

### Best Practices:
1. **Validation**: Selalu validasi data sebelum dikirim
2. **Error Handling**: Implement proper error handling
3. **User Feedback**: Berikan feedback visual yang jelas
4. **Timeout**: Implement timeout untuk operasi Bluetooth
5. **Cleanup**: Pastikan cleanup saat component unmount

### Data Protection:
- Encrypt sensitive data jika perlu
- Implement rate limiting
- Log semua operasi untuk audit
- Validasi input user

## Performance Optimization

### Tips:
1. **Connection Pooling**: Reuse koneksi yang ada
2. **Batch Operations**: Kelompokkan print jobs
3. **Lazy Loading**: Load component hanya saat needed
4. **Memory Management**: Cleanup references dengan benar
5. **Debouncing**: Debounce user actions

## Testing

### Manual Testing:
1. Buka Chrome Developer Tools
2. Buka tab Application > Bluetooth
3. Test device pairing
4. Monitor console logs
5. Verifikasi data transmission

### Automated Testing:
```javascript
// Mock Bluetooth untuk testing
const mockBluetoothDevice = {
  name: 'Test Printer',
  id: 'test-device-id',
  gatt: {
    connect: () => Promise.resolve(),
    getPrimaryService: () => Promise.resolve(mockService),
    disconnect: () => Promise.resolve()
  }
};
```

## Deployment Notes

### Production:
1. Gunakan HTTPS certificate yang valid
2. Test di berbagai browser
3. Implement fallback untuk browser tidak support
4. Monitor error rates
5. Setup analytics untuk tracking

### Browser Compatibility:
- Chrome 56+ (recommended)
- Edge 79+
- Opera 43+
- Safari: Tidak support
- Firefox: Experimental support

## Contoh Implementasi Lengkap

Lihat file-file berikut untuk implementasi lengkap:
- `hooks/useBluetooth.ts` - Custom hook
- `components/BluetoothConnector.tsx` - Connection UI
- `components/BluetoothPrinter.tsx` - Printer management
- `components/BluetoothPrintButton.tsx` - POS integration

## Support

### Resources:
- [Web Bluetooth API Documentation](https://developer.mozilla.org/en-US/docs/Web/API/Web_Bluetooth_API)
- [Bluetooth GATT Specification](https://www.bluetooth.com/specifications/gatt/)
- [ESC/POS Command Reference](https://www.escpos.net/EscPosReference)

### Community:
- GitHub Issues untuk bug reports
- Stack Overflow untuk pertanyaan
- Discord untuk diskusi real-time
