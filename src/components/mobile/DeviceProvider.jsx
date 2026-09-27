import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import { simulatedAdapter } from '@/lib/synclet/bleService';
import { loadDevice, saveDevice, drainBattery } from '@/lib/synclet/deviceService';
import {
  connectMqtt,
  disconnectMqtt,
  MQTT_DEVICE_ID,
  MQTT_TOPICS,
  publishMqttCommand,
  subscribeMqttMessages,
  subscribeMqttState,
} from '@/lib/synclet/mqttService';

const DeviceContext = createContext(null);
export const useDevice = () => useContext(DeviceContext);
const HW_KEY = 'synclet.hwMode';
const TELEMETRY_TIMEOUT = 18000;
const EMPTY_HARDWARE = {
  deviceId: MQTT_DEVICE_ID,
  firmware: 'Awaiting device telemetry',
  source: 'unavailable',
  connected: false,
  battery: null,
  heartRate: null,
  hrMode: 'NORMAL',
  motion: null,
  fingerprintReady: false,
  voiceReady: false,
  lastSeen: null,
  wifiRssi: null,
  led: null,
  sosCountdownStartedAt: null,
  hwEmergencyAt: null,
  hwSosCancelledAt: null,
  hwEmergencyIncidentId: null,
  hwEmergencyError: '',
};

function initialMode() {
  const saved = localStorage.getItem(HW_KEY);
  return saved === 'sim' || saved === 'simulation' ? 'simulation' : 'mqtt';
}

export default function DeviceProvider({ children }) {
  const [device, setDevice] = useState(() => ({ ...loadDevice(), ...EMPTY_HARDWARE }));
  const [busy, setBusy] = useState(false);
  const [hwMode, setHwModeState] = useState(initialMode);
  const [mqttState, setMqttState] = useState({ brokerConnected: false, error: '' });
  const modeRef = useRef(device.hrMode);
  const lastTelemetryAt = useRef(0);
  modeRef.current = device.hrMode;

  useEffect(() => {
    saveDevice({ ...device, connected: false, battery: null, heartRate: null, lastSeen: null, hwEmergencyAt: null, hwEmergencyIncidentId: null, hwEmergencyError: '' });
  }, [device]);

  useEffect(() => {
    const unsubscribe = subscribeMqttState(setMqttState);
    return () => {
      unsubscribe();
      disconnectMqtt();
    };
  }, []);

  useEffect(() => subscribeMqttMessages(({ topic, payload }) => {
    if (hwMode !== 'mqtt') return;
    if (topic === MQTT_TOPICS.status) {
      if (payload.trim() === 'offline') {
        lastTelemetryAt.current = 0;
        setDevice((current) => ({
          ...EMPTY_HARDWARE,
          connected: false,
          hwEmergencyAt: current.hwEmergencyAt,
          hwEmergencyIncidentId: current.hwEmergencyIncidentId,
          hwEmergencyError: current.hwEmergencyError,
        }));
      }
      return;
    }
    if (topic !== MQTT_TOPICS.telemetry) return;

    let message;
    try { message = JSON.parse(payload); } catch { return; }
    if (message.device !== MQTT_DEVICE_ID) return;

    const now = Date.now();
    lastTelemetryAt.current = now;
    setDevice((current) => ({
      ...EMPTY_HARDWARE,
      ...current,
      deviceId: message.device,
      firmware: message.firmware || 'Synclet MQTT',
      source: 'hardware',
      connected: true,
      battery: Number.isFinite(message.battery_percent) ? message.battery_percent : null,
      heartRate: Number.isFinite(message.heart_rate_bpm) ? message.heart_rate_bpm : null,
      wifiRssi: Number.isFinite(message.wifi_rssi) ? message.wifi_rssi : null,
      led: message.led || current.led,
      lastSeen: now,
      sosCountdownStartedAt: message.event === 'sos_countdown_started'
        ? now
        : ['sos_cancelled', 'sos_committed'].includes(message.event) || message.sos_countdown_active === false
          ? null
          : message.sos_countdown_active === true
            && Number.isFinite(message.sos_seconds_remaining)
            && !current.sosCountdownStartedAt
            ? now - (15000 - message.sos_seconds_remaining * 1000)
            : current.sosCountdownStartedAt,
      hwEmergencyAt: message.event === 'sos_countdown_started' ? null : message.event === 'sos_committed' ? now : current.hwEmergencyAt,
      hwSosCancelledAt: message.event === 'sos_countdown_started' ? null : message.event === 'sos_cancelled' ? now : current.hwSosCancelledAt,
      hwEmergencyIncidentId: message.event === 'sos_countdown_started' ? null : current.hwEmergencyIncidentId,
      hwEmergencyError: message.event === 'sos_countdown_started' ? '' : current.hwEmergencyError,
    }));
  }), [hwMode]);

  useEffect(() => {
    if (hwMode !== 'mqtt') return undefined;
    const timer = setInterval(() => {
      if (lastTelemetryAt.current && Date.now() - lastTelemetryAt.current > TELEMETRY_TIMEOUT) {
        lastTelemetryAt.current = 0;
        setDevice((current) => ({ ...current, connected: false, battery: null, heartRate: null, wifiRssi: null }));
      }
    }, 3000);
    return () => clearInterval(timer);
  }, [hwMode]);

  useEffect(() => {
    if (hwMode !== 'simulation' || !device.connected) return undefined;
    return simulatedAdapter.subscribeToHeartRate(
      () => modeRef.current,
      (heartRate) => setDevice((current) => drainBattery({ ...current, heartRate, lastSeen: Date.now() })),
      device.heartRate || 74,
    );
  }, [device.connected, hwMode]);

  const update = (patch) => setDevice((current) => ({ ...current, ...patch }));

  const setHwMode = async (mode) => {
    await disconnectMqtt();
    lastTelemetryAt.current = 0;
    const nextMode = mode === 'sim' || mode === 'simulation' ? 'simulation' : 'mqtt';
    localStorage.setItem(HW_KEY, nextMode);
    setHwModeState(nextMode);
    setMqttState({ brokerConnected: false, error: '' });
    setDevice({ ...EMPTY_HARDWARE, ...(nextMode === 'simulation' ? { ...loadDevice(), connected: false, deviceId: MQTT_DEVICE_ID, lastSeen: null } : {}) });
  };

  const connect = async () => {
    setBusy(true);
    setMqttState({ brokerConnected: false, error: '' });
    try {
      if (hwMode === 'simulation') {
        await simulatedAdapter.connectToDevice(MQTT_DEVICE_ID);
        setDevice((current) => ({
          ...current,
          connected: true,
          firmware: 'Interface simulation',
          source: 'simulation',
          battery: 87,
          heartRate: 74,
          motion: 'STILL',
          fingerprintReady: true,
          voiceReady: true,
          lastSeen: Date.now(),
        }));
        return;
      }
      await connectMqtt();
    } catch (error) {
      setMqttState((current) => ({ ...current, error: error.message || 'Could not connect to MQTT.' }));
      throw error;
    } finally {
      setBusy(false);
    }
  };

  const disconnect = async () => {
    setBusy(true);
    try {
      if (hwMode === 'simulation') await simulatedAdapter.disconnectDevice();
      else await disconnectMqtt();
      lastTelemetryAt.current = 0;
      setDevice({
        ...EMPTY_HARDWARE,
        hwEmergencyAt: device.hwEmergencyAt,
        hwEmergencyIncidentId: device.hwEmergencyIncidentId,
        hwEmergencyError: device.hwEmergencyError,
      });
    } finally {
      setBusy(false);
    }
  };

  const sendCommand = publishMqttCommand;

  return (
    <DeviceContext.Provider value={{ device, update, connect, disconnect, busy, hwMode, setHwMode, mqttState, sendCommand }}>
      {children}
    </DeviceContext.Provider>
  );
}
