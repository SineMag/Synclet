import React from 'react';
import { ShieldCheck, ShieldOff } from 'lucide-react';

export default function SafetyStatus({ connected, mode }) {
  const simulation = mode === 'simulation';
  const title = simulation ? 'INTERFACE SIMULATION' : connected ? 'ESP32 ONLINE' : 'WAITING FOR ESP32';
  const description = simulation
    ? 'Synthetic readings are for interface checks; the ESP32 is not connected.'
    : connected
      ? 'Receiving live device telemetry. Connection does not guarantee emergency response.'
      : 'Connect to MQTT and bring the ESP32 online to receive its telemetry.';
  const Icon = connected && !simulation ? ShieldCheck : ShieldOff;
  const toneClasses = connected && !simulation
    ? { card: 'border-safe/30 bg-safe/5', icon: 'bg-safe/10 text-safe', title: 'text-safe' }
    : { card: 'border-warn/30 bg-warn/5', icon: 'bg-warn/10 text-warn', title: 'text-warn' };

  return (
    <div className={`border rounded-md p-5 flex items-center gap-4 ${toneClasses.card}`}>
      <div className={`w-12 h-12 rounded-full flex items-center justify-center ${toneClasses.icon}`}>
        <Icon className="w-6 h-6" />
      </div>
      <div>
        <p className={`font-mono text-sm font-semibold tracking-[0.2em] ${toneClasses.title}`}>{title}</p>
        <p className="text-sm text-muted-foreground mt-0.5">{description}</p>
      </div>
    </div>
  );
}
