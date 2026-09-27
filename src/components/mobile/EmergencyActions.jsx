import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import useEmergency from '@/hooks/useEmergency';
import { canTransition, isOpen } from '@/lib/synclet/incidentService';

export default function EmergencyActions({ incident, onDismiss }) {
  const { cancel } = useEmergency();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const onCancel = async () => {
    setBusy(true);
    setError('');
    const r = await cancel(incident);
    if (!r.ok) setError(r.reason);
    setBusy(false);
  };

  return (
    <div className="shrink-0 p-5 border-t border-border space-y-2">
      {error && <p className="text-xs text-critical">{error}</p>}
      {canTransition(incident.status, 'CANCELLED') && (
        <Button variant="outline" className="w-full h-12" disabled={busy} onClick={onCancel}>
          {busy ? 'Cancelling…' : "I'm safe — cancel alert"}
        </Button>
      )}
      {incident.status === 'RESPONDING' && (
        <p className="text-xs text-center text-muted-foreground">A response is in progress. Stay where it is safe if you can.</p>
      )}
      {!isOpen(incident.status) && (
        <Button className="w-full h-12" onClick={onDismiss}>Return to safe mode</Button>
      )}
    </div>
  );
}