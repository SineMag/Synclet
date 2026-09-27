import React from 'react';
import useCurrentUser from '@/hooks/useCurrentUser';
import { useDevice } from '@/components/mobile/DeviceProvider';
import Section, { Row } from '@/components/mobile/Section';
import SimBadge from '@/components/mobile/SimBadge';
import SignalSimulator from '@/components/mobile/SignalSimulator';
import DeviceTests from '@/components/mobile/DeviceTests';
import { getSettings } from '@/lib/synclet/constants';

export default function Device() {
  const { data: user } = useCurrentUser();
  const { device, hwMode } = useDevice();
  const on = device.connected;
  const sensor = (ready) => (on && ready ? 'Connected' : 'Unavailable');

  return (
    <div className="px-5 pt-6 pb-8 space-y-5">
      <header className="flex items-start justify-between">
        <div>
          <p className="text-[11px] font-mono uppercase tracking-[0.14em] text-muted-foreground">Device</p>
          <h1 className="text-2xl font-semibold mt-1 tracking-tight">Synclet-001</h1>
          <p className={`mt-1 text-sm font-medium ${on ? 'text-safe' : 'text-warn'}`}>{on ? '● Connected' : '○ Disconnected'}</p>
        </div>
        <SimBadge />
      </header>
      <Section title="Hardware">
        <Row label="Battery" value={`${device.battery}%`} />
        <Row label="Firmware" value={device.firmware} />
        <Row label="Bluetooth" value={on ? (hwMode === 'real' ? 'Connected · real device' : 'Connected (simulated)') : 'Off'} />
        <Row label="Heart rate sensor" value={sensor(true)} />
        <Row label="Fingerprint sensor" value={sensor(device.fingerprintReady)} />
        <Row label="Voice" value={on && device.voiceReady ? 'Ready' : 'Unavailable'} />
        <Row label="Wake word" value='"Synclet"' />
        <Row label="Last seen" value={new Date(device.lastSeen).toLocaleTimeString('en-GB')} />
      </Section>
      {getSettings(user).demoMode && <SignalSimulator />}
      <DeviceTests />
    </div>
  );
}