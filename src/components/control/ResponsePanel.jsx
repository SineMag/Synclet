import React, { useEffect, useState } from 'react';
import { Eye, Radio, PhoneCall, ArrowUpCircle, CheckCircle2, Loader2 } from 'lucide-react';
import StatusBadge from '@/components/StatusBadge';
import OfficerNotes from '@/components/control/OfficerNotes';
import { canTransition, isOpen, transitionIncident, logIncidentAction } from '@/lib/synclet/incidentService';
import { EVENTS } from '@/lib/synclet/constants';
import { fmtElapsed, fmtTime } from '@/lib/synclet/format';

export default function ResponsePanel({ incident, officerName }) {
  const [busy, setBusy] = useState(null);
  const [, tick] = useState(0);
  useEffect(() => { const timer = setInterval(() => tick((value) => value + 1), 1000); return () => clearInterval(timer); }, []);

  if (!incident) return <aside className="border-l border-border p-5 text-sm text-muted-foreground">Select an incident to respond.</aside>;
  const open = isOpen(incident.status);
  const actions = [
    { label: 'ACKNOWLEDGE', Icon: Eye, enabled: canTransition(incident.status, 'ACKNOWLEDGED'), run: () => transitionIncident(incident, 'ACKNOWLEDGED', officerName) },
    { label: 'RESPONDING', Icon: Radio, enabled: canTransition(incident.status, 'RESPONDING'), run: () => transitionIncident(incident, 'RESPONDING', officerName) },
    { label: 'CONTACT USER', Icon: PhoneCall, enabled: open, run: () => logIncidentAction(incident, EVENTS.CONTACT, `${officerName} is contacting ${incident.user_name}${incident.user_phone ? ` on ${incident.user_phone}` : ''} (recorded; no call placed)`, officerName) },
    { label: 'ESCALATE', Icon: ArrowUpCircle, enabled: open && !incident.escalated, run: () => logIncidentAction(incident, EVENTS.ESCALATED, `Escalated to shift supervisor by ${officerName}`, officerName, { escalated: true }) },
    { label: 'RESOLVE', Icon: CheckCircle2, enabled: canTransition(incident.status, 'RESOLVED'), run: () => transitionIncident(incident, 'RESOLVED', officerName) },
  ];
  const next = actions.find((action) => action.enabled && ['ACKNOWLEDGE', 'RESPONDING', 'RESOLVE'].includes(action.label));
  const act = async (action) => {
    setBusy(action.label);
    try { await action.run(); } finally { setBusy(null); }
  };

  return (
    <aside className="border-l border-border p-5 space-y-5 lg:overflow-y-auto lg:min-h-0 bg-card/40">
      <div>
        <p className="text-[11px] font-mono tracking-[0.14em] text-muted-foreground">INCIDENT STATUS</p>
        <div className="mt-2"><StatusBadge status={incident.status} large /></div>
        <p className="mt-2 font-mono text-xs text-muted-foreground">
          {open ? `Open for ${fmtElapsed(incident.triggered_at || incident.created_date)}` : `Closed ${fmtTime(incident.resolved_at)}`}
        </p>
      </div>
      <div className="space-y-2">
        <p className="text-[11px] font-mono tracking-[0.14em] text-muted-foreground">ACTIONS</p>
        {actions.map((action) => (
          <button key={action.label} disabled={!action.enabled || !!busy} onClick={() => act(action)} className={`w-full flex items-center gap-2 px-3 h-11 rounded-sm border font-mono text-xs font-semibold tracking-wider transition-colors disabled:opacity-35 disabled:cursor-not-allowed ${action === next ? 'bg-primary text-primary-foreground border-primary hover:bg-primary/90' : 'border-border hover:bg-secondary'}`}>
            {busy === action.label ? <Loader2 className="w-4 h-4 animate-spin" /> : <action.Icon className="w-4 h-4" />}
            {action.label}
          </button>
        ))}
      </div>
      {open && <OfficerNotes incident={incident} officerName={officerName} />}
      <p className="text-[11px] text-muted-foreground leading-relaxed">Actions are recorded in this browser. No police, medical, security dispatch, or phone call is initiated.</p>
    </aside>
  );
}
