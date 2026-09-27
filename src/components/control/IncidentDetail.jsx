import React, { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import StatusBadge from '@/components/StatusBadge';
import { getShowPii, setShowPii, maskPhone } from '@/lib/synclet/pii';
import IncidentMap from '@/components/control/IncidentMap';
import Timeline from '@/components/control/Timeline';
import { TRIGGER_LABELS } from '@/lib/synclet/constants';
import { fmtTime } from '@/lib/synclet/format';
import { isOpen } from '@/lib/synclet/incidentService';

export default function IncidentDetail({ incident }) {
  const [showPii, setShowPiiState] = useState(getShowPii);
  const togglePii = () => { const value = !showPii; setShowPii(value); setShowPiiState(value); };
  const fields = [
    ['User', incident.user_name],
    ['Phone', maskPhone(incident.user_phone, showPii)],
    ['Device', incident.device_id],
    ['Trigger', TRIGGER_LABELS[incident.trigger_type]],
    ['Command', incident.voice_command ? `"${incident.voice_command}"` : '—'],
    ['Heart rate', incident.heart_rate != null ? `${incident.heart_rate} BPM` : 'Not shared'],
    ['Device status', incident.device_connected ? 'CONNECTED' : 'DISCONNECTED'],
    ['Battery', incident.battery != null ? `${incident.battery}%` : '—'],
    ['Location', incident.location_label],
    ['Time', fmtTime(incident.triggered_at || incident.created_date)],
    ['Primary contact', incident.primary_contact || '—'],
    ['User check-in', incident.user_check_in === 'SAFE' ? 'Confirmed okay' : incident.user_check_in === 'NEEDS_HELP' ? 'Needs help' : 'No response yet'],
    ['Contact SMS drafts', incident.user_check_in === 'NEEDS_HELP' ? `${(incident.contact_alerts || []).length} available · none sent` : '—'],
    ['Intent confidence', incident.intent_confidence ? `${Math.round(incident.intent_confidence * 100)}%` : '—'],
    ['Officer', incident.officer || 'Unassigned'],
  ];
  const realHeartRate = incident.heart_rate != null && incident.heart_rate_source === 'hardware';

  return (
    <section className="lg:overflow-y-auto lg:min-h-0 p-5 space-y-5 border-b lg:border-b-0 border-border">
      <header className="flex flex-wrap items-center gap-3">
        <div className="mr-auto">
          <p className="text-[11px] font-mono tracking-[0.14em] text-muted-foreground">INCIDENT</p>
          <h1 className="font-mono text-2xl font-semibold">#{incident.incident_code}</h1>
        </div>
        {isOpen(incident.status) && <span className="font-mono text-xs font-bold tracking-wider text-critical border border-critical/50 px-2 py-1 rounded-sm">● {incident.priority}{incident.escalated && ' · ESCALATED'}</span>}
        <StatusBadge status={incident.status} large />
        <button type="button" onClick={togglePii} className="flex items-center gap-1.5 text-[10px] font-mono border border-border px-2 py-1.5 rounded-sm text-muted-foreground hover:text-foreground">
          {showPii ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
          {showPii ? 'HIDE PII' : 'SHOW PII'}
        </button>
      </header>
      <dl className="grid grid-cols-2 md:grid-cols-3 border-t border-l border-border">
        {fields.map(([label, value]) => (
          <div key={label} className="border-r border-b border-border px-3 py-2.5">
            <dt className="text-[10px] font-mono tracking-[0.14em] text-muted-foreground uppercase">{label}</dt>
            <dd className="text-sm mt-0.5 break-words">{value}</dd>
          </div>
        ))}
      </dl>
      {incident.heart_rate != null && <p className="text-[11px] text-muted-foreground">Heart rate {realHeartRate ? 'was reported by hardware' : 'was not verified as a hardware reading'}; it is not a medical assessment.</p>}
      <IncidentMap incident={incident} />
      <Timeline entries={incident.timeline} />
    </section>
  );
}
