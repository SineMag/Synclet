import React from 'react';
import { AlertOctagon, Eye, Radio, CheckCircle2, XCircle } from 'lucide-react';

const META = {
  ACTIVE: { cls: 'bg-critical/15 text-critical border-critical/40', Icon: AlertOctagon },
  ACKNOWLEDGED: { cls: 'bg-warn/15 text-warn border-warn/40', Icon: Eye },
  RESPONDING: { cls: 'bg-info/15 text-info border-info/40', Icon: Radio },
  RESOLVED: { cls: 'bg-safe/15 text-safe border-safe/40', Icon: CheckCircle2 },
  CANCELLED: { cls: 'bg-muted text-muted-foreground border-border', Icon: XCircle },
};

export default function StatusBadge({ status, large = false }) {
  const { cls, Icon } = META[status] || META.CANCELLED;
  return (
    <span className={`inline-flex items-center gap-1.5 border rounded-sm font-mono font-semibold tracking-wider ${cls} ${large ? 'px-3 py-1.5 text-sm' : 'px-1.5 py-0.5 text-[10px]'}`}>
      <Icon className={large ? 'w-4 h-4' : 'w-3 h-3'} />
      {status}
    </span>
  );
}