import React from 'react';
import { motion } from 'framer-motion';
import { AlertOctagon } from 'lucide-react';
import StatusBadge from '@/components/StatusBadge';
import { isOpen } from '@/lib/synclet/incidentService';
import { TRIGGER_LABELS } from '@/lib/synclet/constants';
import { fmtTime } from '@/lib/synclet/format';

export default function IncidentCard({ incident, selected, onSelect }) {
  const open = isOpen(incident.status);
  return (
    <motion.button
      layout
      initial={{ opacity: 0, x: -12 }}
      animate={{ opacity: 1, x: 0 }}
      onClick={() => onSelect(incident.id)}
      className={`w-full text-left px-4 py-3 border-b border-border border-l-2 transition-colors ${selected ? 'bg-secondary border-l-primary' : open ? 'border-l-critical hover:bg-secondary/60' : 'border-l-transparent hover:bg-secondary/60'}`}
    >
      <div className="flex items-center justify-between gap-2">
        <span className={`flex items-center gap-1.5 text-[11px] font-mono font-semibold tracking-wider ${open ? 'text-critical' : 'text-muted-foreground'}`}>
          <AlertOctagon className="w-3.5 h-3.5" />
          {open ? incident.priority : 'CLOSED'}{incident.escalated && ' · ESCALATED'}
        </span>
        <StatusBadge status={incident.status} />
      </div>
      <p className="mt-2 font-mono text-sm">{incident.incident_code} · {incident.device_id}</p>
      <dl className="mt-2 grid grid-cols-2 gap-x-3 gap-y-1 text-xs">
        <div><dt className="text-muted-foreground">User</dt><dd className="truncate">{incident.user_name}</dd></div>
        <div><dt className="text-muted-foreground">Trigger</dt><dd className="truncate">{TRIGGER_LABELS[incident.trigger_type]}</dd></div>
        <div><dt className="text-muted-foreground">Heart rate</dt><dd>{incident.heart_rate != null ? `${incident.heart_rate} BPM` : '—'}</dd></div>
        <div><dt className="text-muted-foreground">Time</dt><dd className="font-mono">{fmtTime(incident.triggered_at || incident.created_date)}</dd></div>
      </dl>
    </motion.button>
  );
}