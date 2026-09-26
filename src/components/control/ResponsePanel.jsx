import React, { useEffect, useState } from 'react';
import { Eye, Radio, PhoneCall, ArrowUpCircle, CheckCircle2, Loader2 } from 'lucide-react';
import StatusBadge from '@/components/StatusBadge';
import OfficerNotes from '@/components/control/OfficerNotes';
import { canTransition, isOpen, transitionIncident, logIncidentAction } from '@/lib/synclet/incidentService';
import { EVENTS } from '@/lib/synclet/constants';
import { fmtElapsed, fmtTime } from '@/lib/synclet/format';

export default function ResponsePanel({ incident: i, officerName }) {
  const [busy, setBusy] = useState(null);
  const [, tick] = useState(0);
  useEffect(() => { const t = setInterval(() => tick((n) => n + 1), 1000); return () => clearInterval(t); }, []);

  if (!i) return <aside className="border-l border-border p-5 text-sm text-muted-foreground">Select an incident to respond.</aside>;
  const open = isOpen(i.status);
  const actions = [
    { label: 'ACKNOWLEDGE', Icon: Eye, enabled: canTransition(i.status, 'ACKNOWLEDGED'), run: () => transitionIncident(i, 'ACKNOWLEDGED', officerName) },
    { label: 'RESPONDING', Icon: Radio, enabled: canTransition(i.status, 'RESPONDING'), run: () => transitionIncident(i, 'RESPONDING', officerName) },
    { label: 'CONTACT USER', Icon: PhoneCall, enabled: open, run: () => logIncidentAction(i, EVENTS.CONTACT, `${officerName} is contacting ${i.user_name}${i.user_phone ? ` on ${i.user_phone}` : ''} (simulated call)`, officerName) },
    { label: 'ESCALATE', Icon: ArrowUpCircle, enabled: open && !i.escalated, run: () => logIncidentAction(i, EVENTS.ESCALATED, `Escalated to shift supervisor by ${officerName}`, officerName, { escalated: true }) },
    { label: 'RESOLVE', Icon: CheckCircle2, enabled: canTransition(i.status, 'RESOLVED'), run: () => transitionIncident(i, 'RESOLVED', officerName) },
  ];
  const next = actions.find((a) => a.enabled && ['ACKNOWLEDGE', 'RESPONDING', 'RESOLVE'].includes(a.label));
  const act = async (a) => { setBusy(a.label); await a.run(); setBusy(null); };

  return (
    <aside className="border-l border-border p-5 space-y-5 lg:overflow-y-auto lg:min-h-0 bg-card/40">
      <div>
        <p className="text-[11px] font-mono tracking-[0.14em] text-muted-foreground">INCIDENT STATUS</p>
        <div className="mt-2"><StatusBadge status={i.status} large /></div>
        <p className="mt-2 font-mono text-xs text-muted-foreground">
          {open ? `Open for ${fmtElapsed(i.triggered_at || i.created_date)}` : `Closed ${fmtTime(i.resolved_at)}`}
        </p>
      </div>
      <div className="space-y-2">
        <p className="text-[11px] font-mono tracking-[0.14em] text-muted-foreground">ACTIONS</p>
        {actions.map((a) => (
          <button
            key={a.label}
            disabled={!a.enabled || !!busy}
            onClick={() => act(a)}
            className={`w-full flex items-center gap-2 px-3 h-11 rounded-sm border font-mono text-xs font-semibold tracking-wider transition-colors disabled:opacity-35 disabled:cursor-not-allowed ${a === next ? 'bg-primary text-primary-foreground border-primary hover:bg-primary/90' : 'border-border hover:bg-secondary'}`}
          >
            {busy === a.label ? <Loader2 className="w-4 h-4 animate-spin" /> : <a.Icon className="w-4 h-4" />}
            {a.label}
          </button>
        ))}
      </div>
      {open && <OfficerNotes incident={i} officerName={officerName} />}
      <p className="text-[11px] text-muted-foreground leading-relaxed">Synclet does not dispatch police, medical or security services. Actions record the control-room workflow and update the user in real time.</p>
    </aside>
  );
}