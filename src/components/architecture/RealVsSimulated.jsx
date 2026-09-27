import React from 'react';
import SimBadge from '@/components/mobile/SimBadge';

const ROWS = [
  ['Incident storage', 'This browser'],
  ['MQTT broker connection', 'Ready to configure'],
  ['ESP32 firmware', 'Provided · needs flashing'],
  ['Board Wi-Fi and signal strength', 'Reported by firmware'],
  ['Onboard LED command', 'GPIO 2 · board-dependent'],
  ['SOS button and countdown', 'GPIO 4 · board-dependent'],
  ['Heart-rate / battery sensor data', 'Not connected'],
  ['Calls or emergency dispatch', 'Not provided'],
];

export default function RealVsSimulated() {
  return (
    <section>
      <h2 className="text-[11px] font-mono uppercase tracking-[0.14em] text-muted-foreground">Connection status</h2>
      <ul className="mt-3 border border-border rounded-md bg-card divide-y divide-border">
        {ROWS.map(([label, status]) => (
          <li key={label} className="flex items-center justify-between gap-3 px-4 py-2.5 text-sm">
            <span>{label}</span>
            <SimBadge real={status === 'Reported by firmware'} label={status} />
          </li>
        ))}
      </ul>
    </section>
  );
}
