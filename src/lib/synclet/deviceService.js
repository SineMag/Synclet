// Persists interface settings only. A previous connection is never trusted after reload.
import { DEVICE_ID } from './constants';

const KEY = 'synclet.device';

export const DEFAULT_DEVICE = {
  deviceId: DEVICE_ID,
  firmware: 'Awaiting device telemetry',
  connected: false,
  battery: null,
  heartRate: null,
  hrMode: 'NORMAL',
  motion: null,
  fingerprintReady: false,
  voiceReady: false,
  lastSeen: null,
};

export const loadDevice = () => {
  try {
    const stored = JSON.parse(localStorage.getItem(KEY) || '{}');
    return { ...DEFAULT_DEVICE, ...stored, connected: false, lastSeen: null };
  } catch {
    return { ...DEFAULT_DEVICE };
  }
};

export const saveDevice = (device) => localStorage.setItem(KEY, JSON.stringify(device));

export const drainBattery = (device) =>
  Math.random() < 0.01 ? { ...device, battery: Math.max(5, (device.battery || 87) - 1) } : device;
