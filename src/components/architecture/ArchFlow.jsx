import React from 'react';
import { ArrowRight } from 'lucide-react';

const NODES = [
  ['Wearable', 'Heart rate · fingerprint · mic · button (simulated)'],
  ['Mobile app', 'Voice intent · emergency flow · offline queue'],
  ['Live backend', 'Stores incidents · pushes real-time changes'],
  ['Control room', 'Officer workflow · status back to phone'],
];

export default function ArchFlow() {
  return (
    <section>
      <h2 className="text-[11px] font-mono uppercase tracking-[0.14em] text-muted-foreground">Architecture</h2>
      <div className="mt-3 grid md:grid-cols-[1fr_auto_1fr_auto_1fr_auto_1fr] gap-3 items-center">
        {NODES.map(([t, d], idx) => (
          <React.Fragment key={t}>
            <div className="border border-border rounded-md p-4 bg-card h-full">
              <p className="font-semibold">{t}</p>
              <p className="text-xs text-muted-foreground mt-1">{d}</p>
            </div>
            {idx < NODES.length - 1 && <ArrowRight className="w-4 h-4 text-muted-foreground mx-auto rotate-90 md:rotate-0" />}
          </React.Fragment>
        ))}
      </div>
      <p className="mt-4 text-sm text-muted-foreground leading-relaxed">
        The phone writes an incident to the backend; the backend pushes it over a live subscription (WebSocket) to every open control-room screen within about a second. Officer actions update the same record, and the phone receives each change through its own subscription — neither screen changes the other directly.
      </p>
    </section>
  );
}