import React from 'react';

const ITEMS = [
  'Profiles, contacts, incidents, tasks and audit history are stored in this browser’s localStorage. They do not sync to another phone, laptop, browser profile or private window.',
  'localStorage is not encrypted. Use test identities and locations, not real survivor information.',
  'The application does not dispatch police, medical or security services, place phone calls, guarantee delivery, or run in the background after its tab closes.',
  'The ESP32 connects to HiveMQ over Wi-Fi. The browser connects to HiveMQ over secure MQTT WebSockets; USB is used to flash firmware, not to carry MQTT messages.',
  'The configured public MQTT broker is shared, unauthenticated and unsuitable for private or emergency information. Use a private authenticated broker before any real deployment.',
  'The current firmware reports Wi-Fi signal, uptime and LED state. No heart-rate, battery, fingerprint, microphone or motion sensor is connected by this firmware.',
  'The starter firmware assumes a common ESP32 DevKit: onboard LED GPIO 2 and momentary SOS button GPIO 4. Check the board pinout before wiring; GPIO assignments may differ.',
  'The web app must be open and subscribed for a hardware SOS event to create a local incident. MQTT and a public broker do not provide guaranteed emergency delivery.',
];

export default function Limitations() {
  return (
    <section>
      <h2 className="text-[11px] font-mono uppercase tracking-[0.14em] text-muted-foreground">Important deployment notes</h2>
      <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
        {ITEMS.map((item) => <li key={item}>— {item}</li>)}
      </ul>
    </section>
  );
}
