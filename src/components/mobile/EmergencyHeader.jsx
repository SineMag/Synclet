import React from 'react';
import { AlertTriangle, ShieldCheck } from 'lucide-react';
import { isOpen } from '@/lib/synclet/incidentService';

export default function EmergencyHeader({ incident }) {
  const open = isOpen(incident.status);
  const resolved = incident.status === 'RESOLVED';
  return (
    <div className={`px-5 pt-6 pb-5 ${open ? 'bg-critical text-destructive-foreground' : 'bg-card border-b border-border'}`}>
      <div className="flex items-center gap-2">
        {open ? <AlertTriangle className="w-6 h-6" /> : <ShieldCheck className={`w-6 h-6 ${resolved ? 'text-safe' : 'text-muted-foreground'}`} />}
        <h1 className="text-xl font-semibold tracking-tight">
          {open ? 'EMERGENCY ACTIVE' : resolved ? 'INCIDENT RESOLVED' : 'ALERT CANCELLED'}
        </h1>
      </div>
      {open && <p className="mt-3 text-sm font-medium">This alert is recorded locally; no emergency service was contacted.</p>}
      {incident.user_check_in === 'NEEDS_HELP' && <p className="mt-2 text-sm font-semibold">User requested help · this browser’s control room is updated</p>}
      {incident.user_check_in === 'SAFE' && <p className="mt-2 text-sm font-semibold">User confirmed they are okay</p>}
      <p className={`mt-1 font-mono text-xs ${open ? 'opacity-90' : 'text-muted-foreground'}`}>Incident ID: {incident.incident_code}</p>
    </div>
  );
}
