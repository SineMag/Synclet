import React from 'react';
import { Heart, BatteryMedium, Mic } from 'lucide-react';
import Section from '@/components/mobile/Section';
import SimBadge from '@/components/mobile/SimBadge';

function Stat({ Icon, label, value, pulse }) {
  return (
    <div className="border border-border rounded-md p-3">
      <Icon className={`w-4 h-4 text-muted-foreground ${pulse ? 'animate-pulse text-critical' : ''}`} />
      <p className="mt-2 text-lg font-semibold tabular-nums">{value}</p>
      <p className="text-[11px] text-muted-foreground">{label}</p>
    </div>
  );
}

export default function DeviceSummary({ device }) {
  const on = device.connected;
  return (
    <Section title="Device status" aside={<SimBadge />}>
      <div className="flex items-center justify-between mb-3">
        <span className={`flex items-center gap-2 text-sm font-semibold ${on ? 'text-safe' : 'text-warn'}`}>
          <span className={`w-2 h-2 rounded-full ${on ? 'bg-safe' : 'border border-warn'}`} />
          {on ? 'CONNECTED' : 'DISCONNECTED'}
        </span>
        <span className="font-mono text-xs text-muted-foreground">{device.deviceId}</span>
      </div>
      <div className="grid grid-cols-3 gap-2">
        <Stat Icon={BatteryMedium} label="Battery" value={on ? `${device.battery}%` : '—'} />
        <Stat Icon={Heart} label="Heart rate" value={on ? `${device.heartRate}` : '—'} pulse={on} />
        <Stat Icon={Mic} label="Voice" value={on && device.voiceReady ? 'Ready' : 'Off'} />
      </div>
      <p className="mt-3 text-xs text-muted-foreground">
        {on ? 'Listening for the wake word "Synclet".' : 'Voice and sensors unavailable while disconnected.'}
      </p>
    </Section>
  );
}