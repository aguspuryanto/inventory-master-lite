// Web Bluetooth API TypeScript declarations
declare global {
  interface Navigator {
    bluetooth?: Bluetooth;
  }

  interface Bluetooth {
    requestDevice(options: RequestDeviceOptions): Promise<BluetoothDevice>;
    getAvailability(): Promise<boolean>;
  }

  interface RequestDeviceOptions {
    acceptAllDevices?: boolean;
    filters?: BluetoothLEScanFilter[];
    optionalServices?: BluetoothServiceUUID[];
  }

  interface BluetoothLEScanFilter {
    services?: BluetoothServiceUUID[];
    name?: string;
    namePrefix?: string;
  }

  type BluetoothServiceUUID = string | number;

  interface BluetoothDevice extends EventTarget {
    readonly id: string;
    readonly name?: string;
    readonly gatt?: BluetoothRemoteGATTServer;
    forget(): Promise<void>;
  }

  interface BluetoothRemoteGATTServer {
    readonly connected: boolean;
    readonly device: BluetoothDevice;
    connect(): Promise<BluetoothRemoteGATTServer>;
    disconnect(): void;
    getPrimaryService(service: BluetoothServiceUUID): Promise<BluetoothRemoteGATTService>;
  }

  interface BluetoothRemoteGATTService extends EventTarget {
    readonly uuid: string;
    readonly isPrimary: boolean;
    readonly device: BluetoothDevice;
    getCharacteristic(characteristic: BluetoothCharacteristicUUID): Promise<BluetoothRemoteGATTCharacteristic>;
  }

  type BluetoothCharacteristicUUID = string | number;

  interface BluetoothRemoteGATTCharacteristic extends EventTarget {
    readonly uuid: string;
    readonly service: BluetoothRemoteGATTService;
    readonly value?: DataView;
    readValue(): Promise<DataView>;
    writeValue(data: BufferSource): Promise<void>;
    startNotifications(): Promise<void>;
    stopNotifications(): Promise<void>;
  }
}

export {};
