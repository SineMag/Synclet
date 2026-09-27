import React from 'react';

const STEPS = [
  'Connect the ESP32 by USB and flash firmware/SyncletMqtt/SyncletMqtt.ino from Arduino IDE.',
  'Copy secrets.example.h to secrets.h and enter your 2.4 GHz Wi-Fi name and password. Keep secrets.h private.',
  'Start the app at http://localhost:5173 in desktop Chrome or Edge, then open Device → ESP32 over MQTT.',
  'Connect to MQTT and wait for a fresh ESP32 telemetry packet before treating the device as online.',
  'Use Ping ESP32 and the LED controls to verify commands and responses travel through the broker.',
  'Press the wired SOS button once to start the 15-second countdown. Press it again to cancel; after expiry, answer the mobile check-in with “Yes, I’m okay” or “No, I need help.”',
  'A safe response closes the alert when no control-room response is underway. A help response escalates it and opens optional SMS drafts for saved contacts; the user must send each message manually.',
  'Keep the mobile and control-room pages in tabs on this browser profile; incident records remain local to this origin.',
];

export default function DemoSteps() {
  return (
    <section>
      <h2 className="text-[11px] font-mono uppercase tracking-[0.14em] text-muted-foreground">Hardware setup</h2>
      <ol className="mt-3 space-y-2">
        {STEPS.map((step, index) => (
          <li key={step} className="flex gap-3 text-sm">
            <span className="font-mono text-xs text-muted-foreground w-5 pt-0.5">{String(index + 1).padStart(2, '0')}</span>
            <span>{step}</span>
          </li>
        ))}
      </ol>
    </section>
  );
}
