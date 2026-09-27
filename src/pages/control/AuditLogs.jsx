import React, { useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { ShieldAlert, Info } from 'lucide-react';
import { fmtDateTime } from '@/lib/synclet/format';

export default function AuditLogs() {
  const qc = useQueryClient();
  const { data: logs = [] } = useQuery({ queryKey: ['cr-audit'], queryFn: () => base44.entities.AuditLog.list('-created_date', 150) });

  // Live-updating security trail.
  useEffect(() => base44.entities.AuditLog.subscribe(() => qc.invalidateQueries({ queryKey: ['cr-audit'] })), [qc]);

  return (
    <div className="p-6 space-y-4">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight">Audit logs</h1>
        <p className="text-sm text-muted-foreground mt-1">Every security-relevant action — alerts, officer responses, exports and task changes — with who did it and when.</p>
      </header>
      <div className="border border-border rounded-md bg-card divide-y divide-border">
        {logs.length === 0 && <p className="text-sm text-muted-foreground p-6">No audit entries yet. Trigger an alert or take an officer action to populate the trail.</p>}
        {logs.map((l) => (
          <div key={l.id} className="flex items-start gap-3 px-4 py-3">
            {l.severity === 'critical'
              ? <ShieldAlert className="w-4 h-4 text-critical shrink-0 mt-0.5" />
              : <Info className="w-4 h-4 text-muted-foreground shrink-0 mt-0.5" />}
            <div className="flex-1 min-w-0">
              <p className="text-sm">
                <span className="font-mono text-xs font-semibold text-primary">{l.action}</span>
                {l.detail && <span className="text-muted-foreground"> — {l.detail}</span>}
              </p>
              <p className="text-[10px] font-mono text-muted-foreground mt-0.5">
                {l.actor}{l.target_label && ` · ${l.target_label}`}
              </p>
            </div>
            <span className="text-xs font-mono text-muted-foreground shrink-0 tabular-nums">{fmtDateTime(l.created_date)}</span>
          </div>
        ))}
      </div>
    </div>
  );
}