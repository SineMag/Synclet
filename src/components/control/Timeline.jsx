import React from 'react';
import { EVENTS } from '@/lib/synclet/constants';
import { fmtTime } from '@/lib/synclet/format';

const DOT = {
  [EVENTS.TRIGGERED]: 'bg-critical',
  [EVENTS.ACKNOWLEDGED]: 'bg-warn',
  [EVENTS.RESPONDING]: 'bg-info',
  [EVENTS.RESOLVED]: 'bg-safe',
  [EVENTS.ESCALATED]: 'bg-critical',
};

export default function Timeline({ entries = [] }) {
  return (
    <div>
      <h3 className="text-[11px] font-mono tracking-[0.14em] text-muted-foreground">RESPONSE LOG</h3>
      <ol className="mt-3 border-l border-border ml-1.5">
        {entries.map((e, i) => (
          <li key={e.at + i} className="relative pl-5 pb-4 last:pb-0">
            <span className={`absolute -left-[5px] top-1.5 w-2.5 h-2.5 rounded-full ${DOT[e.type] || 'bg-muted-foreground'}`} />
            <div className="flex gap-3 items-baseline">
              <span className="font-mono text-xs text-muted-foreground tabular-nums">{fmtTime(e.at)}</span>
              <p className="text-sm">{e.message}</p>
            </div>
            <p className="text-[10px] font-mono text-muted-foreground mt-0.5 pl-[4.25rem]">{e.actor} · {e.type}</p>
          </li>
        ))}
      </ol>
    </div>
  );
}