import React from 'react';

const ITEMS = [
  ['ESP32 firmware', 'Flash firmware/SyncletMqtt/SyncletMqtt.ino over USB. Configure Wi-Fi in a local secrets.h file and verify the board’s GPIO pinout before wiring.'],
  ['MQTT connection', 'Both ESP32 and Synclet connect to the supplied broker and matching topics. The public broker is shared; do not publish personal or safety-case details to it.'],
  ['SOS button', 'The starter firmware starts a 15-second on-device countdown on GPIO 4. Press again to cancel. After expiry, the mobile app records a local incident and asks whether the user is okay; a help response escalates it and offers reviewable SMS drafts for saved contacts.'],
  ['Control room sharing', 'The browser control-room and mobile screens share same-origin localStorage. Cross-device sharing requires a private hosted backend.'],
  ['Sensors', 'Only values actually published by firmware are displayed. Heart rate, battery, fingerprint, microphone and motion sensors are not implemented in the starter firmware.'],
  ['Location', 'Phone GPS is included only when enabled and permitted; a fallback location is clearly labelled and should not be treated as a live position.'],
];

export default function HardwareRoadmap() {
  return (
    <section>
      <h2 className="text-[11px] font-mono uppercase tracking-[0.14em] text-muted-foreground">Hardware integration</h2>
      <div className="mt-3 grid md:grid-cols-2 gap-3">
        {ITEMS.map(([title, description]) => (
          <div key={title} className="border border-border rounded-md p-4 bg-card">
            <p className="font-semibold text-sm">{title}</p>
            <p className="text-sm text-muted-foreground mt-1 leading-relaxed">{description}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
