import React, { useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { fmtDateTime } from '@/lib/synclet/format';
import { EVENTS } from '@/lib/synclet/constants';

const DOT = {
  [EVENTS.TRIGGERED]: 'bg-critical',
  [EVENTS.ACKNOWLEDGED]: 'bg-warn',
  [EVENTS.RESPONDING]: 'bg-info',
  [EVENTS.RESOLVED]: 'bg-safe',
  [EVENTS.ESCALATED]: 'bg-critical',
  [EVENTS.CONTACT]: 'bg-info',
  [EVENTS.SYNCED]: 'bg-warn',
};

export default function Notifications() {
  const qc = useQueryClient();
  const { data: incidents = [] } = useQuery({ queryKey: ['cr-incidents'], queryFn: () => base44.entities.Incident.list('-created_date', 100) });
  useEffect(() => base44.entities.Incident.subscribe(() => qc.invalidateQueries({ queryKey: ['cr-incidents'] })), [qc]);

  const events = incidents
    .flatMap((i) => (i.timeline || []).map((e) => ({ ...e, code: i.incident_code })))
    .sort((a, b) => new Date(b.at) - new Date(a.at))
    .slice(0, 60);

  return (
    <div className="p-6 space-y-4 max-w-3xl">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight">Notifications</h1>
        <p className="text-sm text-muted-foreground mt-1">Live feed of every event across all incidents, newest first.</p>
      </header>
      <div className="border border-border rounded-md bg-card divide-y divide-border">
        {events.length === 0 && <p className="text-sm text-muted-foreground p-6">No events yet — trigger an alert from the mobile app.</p>}
        {events.map((e, idx) => (
          <div key={e.at + idx} className="flex items-start gap-3 px-4 py-3">
            <span className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${DOT[e.type] || 'bg-muted-foreground'}`} />
            <div className="flex-1 min-w-0">
              <p className="text-sm">{e.message}</p>
              <p className="text-[10px] font-mono text-muted-foreground mt-0.5">{e.code} · {e.actor}</p>
            </div>
            <span className="text-xs font-mono text-muted-foreground shrink-0 tabular-nums">{fmtDateTime(e.at)}</span>
          </div>
        ))}
      </div>
    </div>
  );
}