// DeviceService — persists the SIMULATED wearable state on this phone (local storage).
import { DEVICE_ID } from './constants';

const KEY = 'synclet.device';

export const DEFAULT_DEVICE = {
  deviceId: DEVICE_ID,
  firmware: 'Prototype 1.0',
  connected: true,
  battery: 87,
  heartRate: 74,
  hrMode: 'NORMAL',
  motion: 'STILL',
  fingerprintReady: true,
  voiceReady: true,
  lastSeen: Date.now(),
};

export const loadDevice = () => ({ ...DEFAULT_DEVICE, ...JSON.parse(localStorage.getItem(KEY) || '{}') });

export const saveDevice = (device) => localStorage.setItem(KEY, JSON.stringify(device));

// Battery drains slowly while connected.
export const drainBattery = (device) =>
  Math.random() < 0.01 ? { ...device, battery: Math.max(5, device.battery - 1) } : device;