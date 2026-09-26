import React from 'react';

const ITEMS = [
  'Runs as a web app (installable on a phone), not a native React Native/Expo build. There is no background listening when the browser tab is closed.',
  'Uses the platform\'s hosted live backend instead of a local Node/Socket.IO server, so both screens need internet access.',
  'Live speech recognition depends on the browser (best in Chrome) and may mishear "Synclet". The wake-word matcher accepts common variants.',
  'All wearable sensors, Bluetooth, fingerprint and battery values are simulated until ESP32 hardware is connected.',
  'Calls to contacts and "Contact user" are recorded only — no real calls are placed, and no emergency services are dispatched.',
  'Heart rate is a prototype signal, not a medical measurement.',
];

export default function Limitations() {
  return (
    <section>
      <h2 className="text-[11px] font-mono uppercase tracking-[0.14em] text-muted-foreground">Known limitations</h2>
      <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
        {ITEMS.map((t) => <li key={t}>— {t}</li>)}
      </ul>
    </section>
  );
}