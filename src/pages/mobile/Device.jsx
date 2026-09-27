import React from 'react';
import { useDevice } from '@/components/mobile/DeviceProvider';
import Section, { Row } from '@/components/mobile/Section';
import SimBadge from '@/components/mobile/SimBadge';
import SignalSimulator from '@/components/mobile/SignalSimulator';
import DeviceTests from '@/components/mobile/DeviceTests';
import useCurrentUser from '@/hooks/useCurrentUser';
import { getSettings } from '@/lib/synclet/constants';

export default function Device() {
  const { data: user } = useCurrentUser();
  const { device, hwMode, mqttState } = useDevice();
  const simulation = hwMode === 'simulation';
  const connected = device.connected;

  return (
    <div className="px-5 pt-6 pb-8 space-y-5">
      <header className="flex items-start justify-between">
        <div>
          <p className="text-[11px] font-mono uppercase tracking-[0.14em] text-muted-foreground">Device</p>
          <h1 className="text-2xl font-semibold mt-1 tracking-tight">{device.deviceId}</h1>
          <p className={`mt-1 text-sm font-medium ${connected && !simulation ? 'text-safe' : 'text-warn'}`}>
            {simulation ? 'Interface simulation' : connected ? 'ESP32 telemetry received' : mqttState.brokerConnected ? 'Broker connected · waiting for ESP32' : 'ESP32 disconnected'}
          </p>
        </div>
        {simulation && <SimBadge label="Simulated values" />}
      </header>
      <Section title="Hardware">
        <Row label="Firmware" value={connected ? device.firmware : 'Awaiting telemetry'} />
        <Row label="Connection" value={simulation ? 'Interface simulation' : connected ? 'MQTT · ESP32 online' : mqttState.brokerConnected ? 'MQTT · device offline' : 'MQTT disconnected'} />
        <Row label="Wi-Fi signal" value={device.wifiRssi != null ? `${device.wifiRssi} dBm` : 'Not reported'} />
        <Row label="Battery" value={device.battery != null ? `${device.battery}%` : 'Not reported'} />
        <Row label="Heart-rate sensor" value={device.heartRate != null ? `${device.heartRate} BPM` : 'Not connected'} />
        <Row label="GPIO 2 output" value={device.led || 'Not reported'} />
        <Row label="Last message" value={device.lastSeen ? new Date(device.lastSeen).toLocaleTimeString('en-GB') : 'None received'} />
      </Section>
      {getSettings(user).showSignalControls && <SignalSimulator />}
      <DeviceTests />
    </div>
  );
}
