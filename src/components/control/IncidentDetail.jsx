import React, { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import StatusBadge from '@/components/StatusBadge';
import { getShowPii, setShowPii, maskPhone } from '@/lib/synclet/pii';
import IncidentMap from '@/components/control/IncidentMap';
import Timeline from '@/components/control/Timeline';
import { TRIGGER_LABELS } from '@/lib/synclet/constants';
import { fmtTime } from '@/lib/synclet/format';
import { isOpen } from '@/lib/synclet/incidentService';

export default function IncidentDetail({ incident: i }) {
  const [showPii, setShowPiiState] = useState(getShowPii);
  const togglePii = () => { const v = !showPii; setShowPii(v); setShowPiiState(v); };
  const fields = [
    ['User', i.user_name],
    ['Phone', maskPhone(i.user_phone, showPii)],
    ['Device', i.device_id],
    ['Trigger', TRIGGER_LABELS[i.trigger_type]],
    ['Command', i.voice_command ? `"${i.voice_command}"` : '—'],
    ['Heart rate', i.heart_rate != null ? `${i.heart_rate} BPM` : 'Not shared'],
    ['Device status', i.device_connected ? 'CONNECTED' : 'DISCONNECTED'],
    ['Battery', i.battery != null ? `${i.battery}%` : '—'],
    ['Location', i.location_label],
    ['Time', fmtTime(i.triggered_at || i.created_date)],
    ['Primary contact', i.primary_contact || '—'],
    ['Intent confidence', i.intent_confidence ? `${Math.round(i.intent_confidence * 100)}%` : '—'],
    ['Officer', i.officer || 'Unassigned'],
  ];
  return (
    <section className="lg:overflow-y-auto lg:min-h-0 p-5 space-y-5 border-b lg:border-b-0 border-border">
      <header className="flex flex-wrap items-center gap-3">
        <div className="mr-auto">
          <p className="text-[11px] font-mono tracking-[0.14em] text-muted-foreground">INCIDENT</p>
          <h1 className="font-mono text-2xl font-semibold">#{i.incident_code}</h1>
        </div>
        {isOpen(i.status) && <span className="font-mono text-xs font-bold tracking-wider text-critical border border-critical/50 px-2 py-1 rounded-sm">● {i.priority}{i.escalated && ' · ESCALATED'}</span>}
        <StatusBadge status={i.status} large />
        <button onClick={togglePii} className="flex items-center gap-1.5 text-[10px] font-mono border border-border px-2 py-1.5 rounded-sm text-muted-foreground hover:text-foreground">
          {showPii ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
          {showPii ? 'HIDE PII' : 'SHOW PII'}
        </button>
      </header>
      <dl className="grid grid-cols-2 md:grid-cols-3 border-t border-l border-border">
        {fields.map(([k, v]) => (
          <div key={k} className="border-r border-b border-border px-3 py-2.5">
            <dt className="text-[10px] font-mono tracking-[0.14em] text-muted-foreground uppercase">{k}</dt>
            <dd className="text-sm mt-0.5 break-words">{v}</dd>
          </div>
        ))}
      </dl>
      <p className="text-[11px] text-muted-foreground">Heart rate is a prototype signal from a simulated sensor — not a medical assessment.</p>
      <IncidentMap incident={i} />
      <Timeline entries={i.timeline} />
    </section>
  );
}