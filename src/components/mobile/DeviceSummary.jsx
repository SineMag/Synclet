import React from 'react';
import { Heart, BatteryMedium, Wifi } from 'lucide-react';
import Section from '@/components/mobile/Section';
import SimBadge from '@/components/mobile/SimBadge';

function Stat({ Icon, label, value }) {
  return (
    <div className="border border-border rounded-md p-3">
      <Icon className="w-4 h-4 text-muted-foreground" />
      <p className="mt-2 text-lg font-semibold tabular-nums">{value}</p>
      <p className="text-[11px] text-muted-foreground">{label}</p>
    </div>
  );
}

export default function DeviceSummary({ device, mode, brokerConnected }) {
  const simulation = mode === 'simulation';
  const online = device.connected;
  const state = simulation ? (online ? 'SIMULATED' : 'SIMULATION OFF')
    : online ? 'ESP32 ONLINE' : brokerConnected ? 'WAITING FOR ESP32' : 'DISCONNECTED';
  const stateTone = online && !simulation ? 'text-safe' : 'text-warn';
  const shown = online ? device : {};

  return (
    <Section title="Device status" aside={simulation ? <SimBadge label="Simulated values" /> : null}>
      <div className="flex items-center justify-between mb-3">
        <span className={`flex items-center gap-2 text-sm font-semibold ${stateTone}`}>
          <span className={`w-2 h-2 rounded-full ${online && !simulation ? 'bg-safe' : 'border border-warn'}`} />
          {state}
        </span>
        <span className="font-mono text-xs text-muted-foreground">{online ? device.deviceId : '—'}</span>
      </div>
      <div className="grid grid-cols-3 gap-2">
        <Stat Icon={BatteryMedium} label="Battery" value={shown.battery != null ? `${shown.battery}%` : '—'} />
        <Stat Icon={Heart} label="Heart rate" value={shown.heartRate != null ? `${shown.heartRate} BPM` : '—'} />
        <Stat Icon={Wifi} label="Wi-Fi RSSI" value={shown.wifiRssi != null ? `${shown.wifiRssi} dBm` : '—'} />
      </div>
      <p className="mt-3 text-xs text-muted-foreground">
        {online && !simulation ? `Last device message ${new Date(device.lastSeen).toLocaleTimeString('en-GB')}.` : simulation ? 'Displayed readings are generated locally.' : 'Only fields reported by the ESP32 appear here.'}
      </p>
    </Section>
  );
}
