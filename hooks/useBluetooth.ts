import { useState, useEffect, useCallback, useRef } from 'react';
import { BluetoothDeviceInfo, BluetoothOptions, BluetoothData } from '../types/bluetooth';

// Web Bluetooth API types
declare global {
  interface Navigator {
    bluetooth?: Bluetooth;
  }
  
  interface Bluetooth {
    requestDevice(options?: any): Promise<BluetoothDevice>;
    getDevices(): Promise<BluetoothDevice[]>;
  }
}

export const useBluetooth = (options: BluetoothOptions = {}) => {
  const [device, setDevice] = useState<BluetoothDeviceInfo | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isSupported, setIsSupported] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<BluetoothData | null>(null);
  const deviceRef = useRef<BluetoothDevice | null>(null);
  const characteristicRef = useRef<any>(null);

  // Check if Web Bluetooth is supported
  useEffect(() => {
    setIsSupported('bluetooth' in navigator);
  }, []);

  // Request device
  const requestDevice = useCallback(async () => {
    if (!isSupported) {
      setError('Web Bluetooth is not supported in this browser');
      return;
    }

    try {
      setIsConnecting(true);
      setError(null);

      const deviceOptions: RequestDeviceOptions = {};
      
      if (options.acceptAllDevices) {
        deviceOptions.acceptAllDevices = true;
      }
      
      if (options.filters) {
        deviceOptions.filters = options.filters;
      }
      
      if (options.optionalServices) {
        deviceOptions.optionalServices = options.optionalServices;
      }

      const bluetoothDevice = await navigator.bluetooth?.requestDevice(deviceOptions);
      
      if (bluetoothDevice) {
        setDevice({
          id: bluetoothDevice.id,
          name: bluetoothDevice.name || 'Unknown Device',
          connected: false,
          device: bluetoothDevice
        });
        
        deviceRef.current = bluetoothDevice;
      }
    } catch (err: any) {
      setError(err.message || 'Failed to request device');
      console.error('Bluetooth request error:', err);
    } finally {
      setIsConnecting(false);
    }
  }, [isSupported, options]);

  // Connect to device
  const connect = useCallback(async () => {
    if (!device?.device) {
      setError('No device selected');
      return false;
    }

    try {
      setIsConnecting(true);
      setError(null);

      const server = await device.device.gatt?.connect();
      
      setDevice(prev => prev ? { ...prev, connected: true } : null);
      return true;
    } catch (err: any) {
      setError(err.message || 'Failed to connect to device');
      console.error('Bluetooth connection error:', err);
      return false;
    } finally {
      setIsConnecting(false);
    }
  }, [device]);

  // Disconnect from device
  const disconnect = useCallback(async () => {
    if (device?.device?.gatt?.connected) {
      try {
        device.device.gatt.disconnect();
        setDevice(prev => prev ? { ...prev, connected: false } : null);
        
        // Stop notifications if active
        if (characteristicRef.current) {
          await characteristicRef.current.stopNotifications();
          characteristicRef.current = null;
        }
      } catch (err: any) {
        setError(err.message || 'Failed to disconnect device');
        console.error('Bluetooth disconnect error:', err);
      }
    }
  }, [device]);

  // Get primary service
  const getPrimaryService = useCallback(async (serviceUUID: string) => {
    if (!device?.device?.gatt?.connected) {
      setError('Device not connected');
      return null;
    }

    try {
      const server = device.device.gatt;
      if (!server) return null;
      
      const service = await server.getPrimaryService(serviceUUID);
      return service;
    } catch (err: any) {
      setError(err.message || `Failed to get service ${serviceUUID}`);
      console.error('Get service error:', err);
      return null;
    }
  }, [device]);

  // Get characteristic
  const getCharacteristic = useCallback(async (serviceUUID: string, characteristicUUID: string) => {
    const service = await getPrimaryService(serviceUUID);
    if (!service) return null;

    try {
      const characteristic = await service.getCharacteristic(characteristicUUID);
      return characteristic;
    } catch (err: any) {
      setError(err.message || `Failed to get characteristic ${characteristicUUID}`);
      console.error('Get characteristic error:', err);
      return null;
    }
  }, [getPrimaryService]);

  // Read characteristic value
  const readCharacteristic = useCallback(async (serviceUUID: string, characteristicUUID: string) => {
    const characteristic = await getCharacteristic(serviceUUID, characteristicUUID);
    if (!characteristic) return null;

    try {
      const value = await characteristic.readValue();
      return value;
    } catch (err: any) {
      setError(err.message || 'Failed to read characteristic');
      console.error('Read characteristic error:', err);
      return null;
    }
  }, [getCharacteristic]);

  // Write characteristic value
  const writeCharacteristic = useCallback(async (serviceUUID: string, characteristicUUID: string, value: ArrayBuffer) => {
    const characteristic = await getCharacteristic(serviceUUID, characteristicUUID);
    if (!characteristic) return false;

    try {
      await characteristic.writeValue(value);
      return true;
    } catch (err: any) {
      setError(err.message || 'Failed to write characteristic');
      console.error('Write characteristic error:', err);
      return false;
    }
  }, [getCharacteristic]);

  // Start notifications
  const startNotifications = useCallback(async (
    serviceUUID: string, 
    characteristicUUID: string, 
    onValueReceived: (value: DataView) => void
  ) => {
    const characteristic = await getCharacteristic(serviceUUID, characteristicUUID);
    if (!characteristic) return false;

    try {
      await characteristic.startNotifications();
      characteristicRef.current = characteristic;
      
      characteristic.addEventListener('characteristicvaluechanged', (event: any) => {
        const value = event.target.value;
        setData({ value, timestamp: new Date() });
        onValueReceived(value);
      });
      
      return true;
    } catch (err: any) {
      setError(err.message || 'Failed to start notifications');
      console.error('Start notifications error:', err);
      return false;
    }
  }, [getCharacteristic]);

  // Stop notifications
  const stopNotifications = useCallback(async () => {
    if (characteristicRef.current) {
      try {
        await characteristicRef.current.stopNotifications();
        characteristicRef.current = null;
        return true;
      } catch (err: any) {
        setError(err.message || 'Failed to stop notifications');
        console.error('Stop notifications error:', err);
        return false;
      }
    }
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (device?.device?.gatt?.connected) {
        disconnect();
      }
    };
  }, [device, disconnect]);

  return {
    device,
    isSupported,
    isConnecting,
    error,
    data,
    requestDevice,
    connect,
    disconnect,
    getPrimaryService,
    getCharacteristic,
    readCharacteristic,
    writeCharacteristic,
    startNotifications,
    stopNotifications
  };
};
