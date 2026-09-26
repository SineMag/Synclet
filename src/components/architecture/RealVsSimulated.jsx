import React from 'react';
import SimBadge from '@/components/mobile/SimBadge';

const ROWS = [
  ['Real-time phone ↔ control room link', true],
  ['Incident storage, status workflow & response log', true],
  ['Offline pending queue & auto-resync', true],
  ['Voice wake-word + intent classification (text)', true],
  ['Live speech recognition (browser microphone, Chrome)', true],
  ['Map, phone GPS (when enabled), audio alarm', true],
  ['Profile, contacts & settings persistence', true],
  ['Wearable heart-rate sensor readings', false],
  ['Wearable fingerprint sensor', false],
  ['Bluetooth link to ESP32 (Web Bluetooth, Chrome/Edge over HTTPS)', true],
  ['Always-on wearable microphone', false],
  ['Battery & motion values', false],
  ['Demo location (when GPS off)', false],
  ['Phone calls to contacts / officer calls', false],
];

export default function RealVsSimulated() {
  return (
    <section>
      <h2 className="text-[11px] font-mono uppercase tracking-[0.14em] text-muted-foreground">Real vs simulated</h2>
      <ul className="mt-3 border border-border rounded-md bg-card divide-y divide-border">
        {ROWS.map(([label, real]) => (
          <li key={label} className="flex items-center justify-between gap-3 px-4 py-2.5 text-sm">
            <span>{label}</span>
            <SimBadge real={real} label={real ? 'Real software' : 'Simulated'} />
          </li>
        ))}
      </ul>
    </section>
  );
}