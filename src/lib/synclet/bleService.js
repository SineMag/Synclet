// bleService — adapter contract for the wearable link.
// The app only talks to this file. `simulatedAdapter` runs the prototype;
// `webBluetoothAdapter` connects to your real ESP32 via Web Bluetooth
// (Chrome/Edge, HTTPS). Swap in a native BLE adapter for a packaged app later.
//
// Contract:
//   scanForDevices() -> Promise<[{ id, name, rssi? }]>
//   connectToDevice(id) -> Promise<{ connected, deviceId }>
//   disconnectDevice() -> Promise<{ connected }>
//   getDeviceStatus(device) -> Promise<device>
//   subscribeToHeartRate(getMode, onReading, initial) -> unsubscribe()
//   sendCommand(cmd) -> Promise<{ ok, echo }>
import { nextHeartRate } from './heartRateService';
import { DEVICE_ID } from './constants';

const delay = (ms) => new Promise((r) => setTimeout(r, ms));

export const simulatedAdapter = {
  kind: 'SIMULATED',
  async scanForDevices() {
    await delay(700);
    return [{ id: DEVICE_ID, name: 'Synclet-001', rssi: -52 }];
  },
  async connectToDevice(id) {
    await delay(600);
    return { connected: true, deviceId: id };
  },
  async disconnectDevice() {
    await delay(300);
    return { connected: false };
  },
  async getDeviceStatus(device) {
    return device;
  },
  subscribeToHeartRate(getMode, onReading, initial = 74) {
    let hr = initial;
    const t = setInterval(() => {
      hr = nextHeartRate(hr, getMode());
      onReading(hr);
    }, 2000);
    return () => clearInterval(t);
  },
  async sendCommand(cmd) {
    await delay(400);
    return { ok: true, echo: `ACK:${cmd}` };
  },
};

// --- Real hardware (Web Bluetooth) -----------------------------------------
// These UUIDs must match your ESP32 firmware. Heart rate and battery use the
// standard Bluetooth services, so those work with any compatible firmware.
export const HEART_RATE_SERVICE = 'heart_rate';
export const BATTERY_SERVICE = 'battery_service';
export const SYNCLET_SERVICE = '7a1e0001-5c1e-4e7a-9b1a-53796e636c74';
export const SYNCLET_EMERGENCY_CHAR = '7a1e0002-5c1e-4e7a-9b1a-53796e636c74';
export const SYNCLET_COMMAND_CHAR = '7a1e0005-5c1e-4e7a-9b1a-53796e636c74';

const bt = { device: null, hr: null, batt: null, cmd: null, emergencyCb: null };

// Subscribe to emergency-button events from real hardware (button characteristic = 1).
export function onHardwareEmergency(cb) {
  bt.emergencyCb = cb;
  return () => { bt.emergencyCb = null; };
}

const parseHeartRate = (dv) => (dv.getUint8(0) & 1 ? dv.getUint16(1, true) : dv.getUint8(1));

export const webBluetoothAvailable = () => typeof navigator !== 'undefined' && !!navigator.bluetooth;

export const webBluetoothAdapter = {
  kind: 'WEB_BLUETOOTH',

  // Web Bluetooth has no background scan — this opens the browser's device picker.
  // Your ESP32 must advertise a device name starting with "Synclet".
  async scanForDevices() {
    const device = await navigator.bluetooth.requestDevice({
      filters: [{ namePrefix: 'Synclet' }],
      optionalServices: [HEART_RATE_SERVICE, BATTERY_SERVICE, SYNCLET_SERVICE],
    });
    bt.device = device;
    return [{ id: device.id, name: device.name || 'Synclet device' }];
  },

  async connectToDevice(id) {
    const server = await bt.device.gatt.connect();
    const hrSvc = await server.getPrimaryService(HEART_RATE_SERVICE);
    bt.hr = await hrSvc.getCharacteristic('heart_rate_measurement');
    const battSvc = await server.getPrimaryService(BATTERY_SERVICE);
    bt.batt = await battSvc.getCharacteristic('battery_level');
    try { await bt.batt.startNotifications(); } catch { /* read-only battery is fine */ }
    try {
      const svc = await server.getPrimaryService(SYNCLET_SERVICE);
      const em = await svc.getCharacteristic(SYNCLET_EMERGENCY_CHAR);
      await em.startNotifications();
      em.addEventListener('characteristicvaluechanged', (e) => {
        if (e.target.value.getUint8(0) === 1) bt.emergencyCb?.();
      });
      bt.cmd = await svc.getCharacteristic(SYNCLET_COMMAND_CHAR);
    } catch {
      // Firmware without the custom service yet — heart rate + battery still work.
    }
    return { connected: true, deviceId: id };
  },

  async disconnectDevice() {
    bt.device?.gatt?.disconnect();
    return { connected: false };
  },

  async getDeviceStatus(device) {
    try {
      const v = await bt.batt.readValue();
      return { ...device, battery: v.getUint8(0) };
    } catch {
      return device;
    }
  },

  subscribeToHeartRate(_getMode, onReading) {
    if (!bt.hr) return () => {};
    const handler = (e) => onReading(parseHeartRate(e.target.value));
    bt.hr.startNotifications().then(() => bt.hr.addEventListener('characteristicvaluechanged', handler));
    return () => bt.hr?.removeEventListener('characteristicvaluechanged', handler);
  },

  async sendCommand(cmd) {
    if (!bt.cmd) return { ok: false, echo: 'no command characteristic' };
    await bt.cmd.writeValue(new TextEncoder().encode(cmd));
    return { ok: true, echo: `ACK:${cmd}` };
  },
};

export const bleService = simulatedAdapter;