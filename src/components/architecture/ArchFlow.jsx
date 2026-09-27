import React from 'react';
import { ArrowRight } from 'lucide-react';

const NODES = [
  ['ESP32', 'SOS button · 15-second timer · Wi-Fi'],
  ['MQTT broker', 'Telemetry · state · commands'],
  ['Synclet app', 'Local safety workflow · incident view'],
  ['Control room', 'Incident status · officer workflow'],
];

export default function ArchFlow() {
  return (
    <section>
      <h2 className="text-[11px] font-mono uppercase tracking-[0.14em] text-muted-foreground">Connection architecture</h2>
      <div className="mt-3 grid md:grid-cols-[1fr_auto_1fr_auto_1fr_auto_1fr] gap-3 items-center">
        {NODES.map(([title, description], index) => (
          <React.Fragment key={title}>
            <div className="border border-border rounded-md p-4 bg-card h-full">
              <p className="font-semibold">{title}</p>
              <p className="text-xs text-muted-foreground mt-1">{description}</p>
            </div>
            {index < NODES.length - 1 && <ArrowRight className="w-4 h-4 text-muted-foreground mx-auto rotate-90 md:rotate-0" />}
          </React.Fragment>
        ))}
      </div>
      <p className="mt-4 text-sm text-muted-foreground leading-relaxed">
        The USB cable flashes firmware; after setup, the ESP32 and browser connect to MQTT independently. Incident records are currently kept in localStorage on this browser origin and do not sync to other devices.
      </p>
    </section>
  );
}
