import React, { useState } from 'react';
import { motion } from 'framer-motion';
import useMyIncidents from '@/hooks/useMyIncidents';
import useStatusToasts from '@/hooks/useStatusToasts';
import EmergencyHeader from '@/components/mobile/EmergencyHeader';
import EmergencyActions from '@/components/mobile/EmergencyActions';
import StatusStepper from '@/components/mobile/StatusStepper';
import { Row } from '@/components/mobile/Section';
import { getSettings, MOBILE_MESSAGES, TRIGGER_LABELS } from '@/lib/synclet/constants';
import { isOpen } from '@/lib/synclet/incidentService';
import { fmtTime } from '@/lib/synclet/format';

const KEY = 'synclet.dismissed';

export default function EmergencyOverlay({ user }) {
  const { data: incidents = [] } = useMyIncidents(user);
  const [dismissed, setDismissed] = useState(() => JSON.parse(localStorage.getItem(KEY) || '[]'));
  const latest = incidents[0];
  useStatusToasts(latest, getSettings(user).notifications.statusUpdates);

  if (!latest || dismissed.includes(latest.id)) return null;
  const open = isOpen(latest.status);
  if (!open && Date.now() - new Date(latest.updated_date).getTime() > 30 * 60 * 1000) return null;

  const dismiss = () => {
    const next = [...dismissed, latest.id].slice(-50);
    localStorage.setItem(KEY, JSON.stringify(next));
    setDismissed(next);
  };
  const recent = (latest.timeline || []).slice(-4).reverse();

  return (
    <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} className="absolute inset-0 z-30 bg-background flex flex-col">
      <EmergencyHeader incident={latest} />
      <div className="flex-1 overflow-y-auto p-5 space-y-6">
        {latest.status !== 'CANCELLED' && <StatusStepper status={latest.status} />}
        <p className="text-lg font-medium leading-snug">{MOBILE_MESSAGES[latest.status]}</p>
        {latest.user_check_in === 'NEEDS_HELP' && (
          <p className="rounded-md border border-critical/30 bg-critical/5 p-3 text-sm font-medium text-critical">
            You asked for help. This is recorded in this browser’s control room; emergency-contact SMS drafts are not sent automatically.
          </p>
        )}
        {latest.user_check_in === 'SAFE' && (
          <p className="rounded-md border border-safe/30 bg-safe/5 p-3 text-sm font-medium text-safe">
            You confirmed that you are okay. The control room has been updated.
          </p>
        )}
        <div>
          <Row label="Trigger" value={TRIGGER_LABELS[latest.trigger_type]} />
          <Row label="Heart rate" value={latest.heart_rate != null ? `${latest.heart_rate} BPM` : 'Not shared'} />
          <Row label="Location" value={latest.location_label} />
          {latest.officer && <Row label="Officer" value={latest.officer} />}
        </div>
        <div>
          <h2 className="text-[11px] font-mono uppercase tracking-[0.14em] text-muted-foreground mb-2">Live updates</h2>
          <ul className="space-y-2">
            {recent.map((e) => (
              <li key={e.at + e.type} className="flex gap-3 text-sm">
                <span className="font-mono text-xs text-muted-foreground pt-0.5">{fmtTime(e.at)}</span>
                <span>{e.message}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
      <EmergencyActions incident={latest} onDismiss={dismiss} />
    </motion.div>
  );
}