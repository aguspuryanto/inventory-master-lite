export interface BluetoothDeviceInfo {
  id: string;
  name: string | null;
  connected: boolean;
  device?: any; // Web Bluetooth Device object
}

export interface BluetoothOptions {
  acceptAllDevices?: boolean;
  filters?: any[];
  optionalServices?: string[];
  serviceUUID?: string;
  characteristicUUID?: string;
}

export interface BluetoothData {
  value: DataView;
  timestamp: Date;
}
