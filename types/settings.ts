export interface PrinterSettings {
  deviceId?: string;
  deviceName?: string;
  paperSize: '58mm' | '80mm';
  orientation: 'Portrait' | 'Landscape';
  autoPrint: boolean;
}

export interface StoreSettings {
  name: string;
  address: string;
  phone: string;
  email: string;
  tax: number;
}
