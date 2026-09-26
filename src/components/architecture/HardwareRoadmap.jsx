import React from 'react';

const ITEMS = [
  ['Bluetooth (BLE)', 'The app talks only to a device-link adapter (scan, connect, disconnect, status, heart-rate subscription, commands). A real adapter using Web Bluetooth or a native BLE module will replace the simulator and connect to the ESP32 GATT services below, with no UI changes.'],
  ['Heart rate', 'MAX30102 over I²C on the ESP32 → standard Heart Rate Service (0x180D) notifications. Readings are combined with motion and voice rather than treated as proof of danger.'],
  ['Fingerprint', 'An R503/AS608 sensor over UART. Matching runs on the sensor, and only "match / no match + template ID" is sent over BLE. The biometric service calls (authenticate, register, availability) stay the same.'],
  ['Wake word & voice', 'An on-device wake-word engine (e.g. an ESP-SR / microWakeWord model trained on "Synclet") wakes the mic, then speech-to-text on the phone and the existing intent classifier run. An optional language-model layer can map free phrasing to the same intents later.'],
  ['Emergency button & battery', 'A GPIO interrupt with debounce sends an EMERGENCY command characteristic, and battery level uses the Battery Service (0x180F).'],
  ['Location', 'The phone supplies GPS (already supported when "Use phone location" is on); the wearable does not need its own GPS.'],
];

export default function HardwareRoadmap() {
  return (
    <section>
      <h2 className="text-[11px] font-mono uppercase tracking-[0.14em] text-muted-foreground">Hardware integration plan</h2>
      <div className="mt-3 grid md:grid-cols-2 gap-3">
        {ITEMS.map(([t, d]) => (
          <div key={t} className="border border-border rounded-md p-4 bg-card">
            <p className="font-semibold text-sm">{t}</p>
            <p className="text-sm text-muted-foreground mt-1 leading-relaxed">{d}</p>
          </div>
        ))}
      </div>
    </section>
  );
}