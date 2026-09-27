import React from 'react';

const DEPENDENCIES = [
  'ESP32 Arduino board support package',
  'PubSubClient by Nick O’Leary',
  'ArduinoJson 7 by Benoit Blanchon',
];

export default function FirmwareSketch() {
  return (
    <section>
      <h2 className="text-[11px] font-mono uppercase tracking-[0.14em] text-muted-foreground">Firmware files</h2>
      <div className="mt-3 border border-border rounded-md bg-card p-4 space-y-3 text-sm">
        <p>Open <code className="font-mono">firmware/SyncletMqtt/SyncletMqtt.ino</code> in Arduino IDE. It matches the broker address, device ID and topics used by this app.</p>
        <p>Create a private <code className="font-mono">secrets.h</code> beside the sketch from <code className="font-mono">secrets.example.h</code> and enter your Wi-Fi credentials.</p>
        <ul className="list-disc pl-5 text-muted-foreground">
          {DEPENDENCIES.map((dependency) => <li key={dependency}>{dependency}</li>)}
        </ul>
        <p className="text-xs text-warn">The public broker is for connectivity tests only; MQTT messages are visible to other users on the shared topics.</p>
      </div>
    </section>
  );
}
