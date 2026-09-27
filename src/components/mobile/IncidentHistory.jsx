import React from 'react';
import Section from '@/components/mobile/Section';
import StatusBadge from '@/components/StatusBadge';
import useCurrentUser from '@/hooks/useCurrentUser';
import useMyIncidents from '@/hooks/useMyIncidents';
import usePendingQueue from '@/hooks/usePendingQueue';
import { TRIGGER_LABELS } from '@/lib/synclet/constants';
import { fmtDateTime } from '@/lib/synclet/format';

export default function IncidentHistory() {
  const { data: user } = useCurrentUser();
  const { data: incidents = [], isLoading } = useMyIncidents(user);
  const pending = usePendingQueue();

  return (
    <Section title="Emergency history">
      {pending > 0 && <p className="text-xs text-warn mb-2">{pending} queued on this phone, awaiting delivery.</p>}
      {isLoading && <p className="text-sm text-muted-foreground">Loading…</p>}
      {!isLoading && incidents.length === 0 && <p className="text-sm text-muted-foreground">No alerts yet.</p>}
      <ul>
        {incidents.map((i) => (
          <li key={i.id} className="flex items-center justify-between py-2.5 border-b border-border last:border-0">
            <div>
              <p className="font-mono text-sm">{i.incident_code}</p>
              <p className="text-xs text-muted-foreground">{TRIGGER_LABELS[i.trigger_type]} · {fmtDateTime(i.created_date)}</p>
            </div>
            <StatusBadge status={i.status} />
          </li>
        ))}
      </ul>
    </Section>
  );
}