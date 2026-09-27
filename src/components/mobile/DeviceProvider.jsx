import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import { simulatedAdapter, webBluetoothAdapter, onHardwareEmergency } from '@/lib/synclet/bleService';
import { loadDevice, saveDevice, drainBattery } from '@/lib/synclet/deviceService';

const DeviceContext = createContext(null);
export const useDevice = () => useContext(DeviceContext);

const HW_KEY = 'synclet.hwMode';

export default function DeviceProvider({ children }) {
  const [device, setDevice] = useState(loadDevice);
  const [busy, setBusy] = useState(false);
  const [hwMode, setHwModeState] = useState(() => localStorage.getItem(HW_KEY) || 'sim');
  const modeRef = useRef(device.hrMode);
  modeRef.current = device.hrMode;

  const adapter = hwMode === 'real' ? webBluetoothAdapter : simulatedAdapter;

  useEffect(() => saveDevice(device), [device]);

  // Forward real-hardware emergency-button notifications into device state.
  useEffect(() => onHardwareEmergency(() => update({ hwEmergencyAt: Date.now() })), []);

  // Heart-rate stream: simulated timer, or real BLE notifications in 'real' mode.
  useEffect(() => {
    if (!device.connected) return;
    return adapter.subscribeToHeartRate(
      () => modeRef.current,
      (heartRate) => setDevice((d) => drainBattery({ ...d, heartRate, lastSeen: Date.now() })),
      device.heartRate
    );
  }, [device.connected, adapter]);

  const update = (patch) => setDevice((d) => ({ ...d, ...patch }));

  const setHwMode = (kind) => {
    localStorage.setItem(HW_KEY, kind);
    setHwModeState(kind);
    update({ connected: false });
  };

  const connect = async () => {
    setBusy(true);
    try {
      const [found] = await adapter.scanForDevices();
      await adapter.connectToDevice(found.id);
      const fresh = await adapter.getDeviceStatus({ ...device, connected: true });
      update({ ...fresh, connected: true, lastSeen: Date.now() });
    } finally {
      setBusy(false);
    }
  };

  const disconnect = async () => {
    setBusy(true);
    await adapter.disconnectDevice();
    update({ connected: false });
    setBusy(false);
  };

  return (
    <DeviceContext.Provider value={{ device, update, connect, disconnect, busy, hwMode, setHwMode }}>
      {children}
    </DeviceContext.Provider>
  );
}