import React, { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Volume2, EyeOff, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { unlockAudio, playAlarm, audioEnabled } from '@/lib/synclet/alertSound';
import { getShowPii, setShowPii } from '@/lib/synclet/pii';
import { audit } from '@/lib/synclet/incidentService';
import useCurrentUser from '@/hooks/useCurrentUser';

function Row({ title, description, children }) {
  return (
    <div className="flex items-center justify-between gap-4 py-4 border-b border-border last:border-0">
      <div>
        <p className="text-sm font-medium">{title}</p>
        <p className="text-xs text-muted-foreground mt-0.5">{description}</p>
      </div>
      {children}
    </div>
  );
}

export default function CrSettings() {
  const { data: user } = useCurrentUser();
  const queryClient = useQueryClient();
  const [audio, setAudio] = useState(audioEnabled());
  const [showPii, setShowPiiState] = useState(getShowPii());
  const [clearing, setClearing] = useState(false);

  const enableAudio = () => { unlockAudio(); setAudio(true); setTimeout(playAlarm, 50); };
  const togglePii = () => { const value = !showPii; setShowPii(value); setShowPiiState(value); audit(value ? 'PII_UNMASKED' : 'PII_MASKED', user?.full_name || 'Officer', 'Toggled personal-data masking'); };
  const clearClosedIncidents = async () => {
    if (!window.confirm('Delete all resolved and cancelled incidents? Active incidents are kept.')) return;
    setClearing(true);
    try {
      await base44.entities.Incident.deleteMany({ status: 'RESOLVED' });
      await base44.entities.Incident.deleteMany({ status: 'CANCELLED' });
      await queryClient.invalidateQueries({ queryKey: ['cr-incidents'] });
      audit('CLOSED_INCIDENTS_CLEARED', user?.full_name || 'Officer', 'Cleared resolved and cancelled incidents');
    } finally { setClearing(false); }
  };

  return (
    <div className="p-6 max-w-2xl space-y-6">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight">Settings</h1>
        <p className="text-sm text-muted-foreground mt-1">Control room preferences and security options.</p>
      </header>
      <section className="border border-border rounded-md bg-card px-4">
        <h2 className="text-[11px] font-mono uppercase tracking-[0.14em] text-muted-foreground pt-4">Alerts</h2>
        <Row title="Audible alarm" description="Play an alert tone when a new critical incident arrives. Browsers require one click to allow audio.">
          <Button variant={audio ? 'outline' : 'default'} size="sm" onClick={enableAudio}><Volume2 className="w-4 h-4 mr-1.5" />{audio ? 'Test alarm' : 'Enable audio'}</Button>
        </Row>
      </section>
      <section className="border border-border rounded-md bg-card px-4">
        <h2 className="text-[11px] font-mono uppercase tracking-[0.14em] text-muted-foreground pt-4">Security & privacy</h2>
        <Row title="Mask personal data" description="Hide user phone numbers in incident details until explicitly revealed. Every reveal is written to the audit log.">
          <Button variant={showPii ? 'outline' : 'default'} size="sm" onClick={togglePii}><EyeOff className="w-4 h-4 mr-1.5" />{showPii ? 'Currently shown' : 'Currently masked'}</Button>
        </Row>
        <Row title="Audit trail" description="Officer actions are recorded with actor and timestamp on the Audit Logs page. Admin-only access.">
          <span className="text-xs font-mono text-safe">● ACTIVE</span>
        </Row>
      </section>
      <section className="border border-border rounded-md bg-card px-4">
        <h2 className="text-[11px] font-mono uppercase tracking-[0.14em] text-muted-foreground pt-4">Local records</h2>
        <Row title="Clear closed incidents" description="Removes resolved and cancelled incidents stored in this browser. Active incidents are untouched.">
          <Button variant="outline" size="sm" disabled={clearing} onClick={clearClosedIncidents}><Trash2 className="w-4 h-4 mr-1.5" />{clearing ? 'Clearing…' : 'Clear'}</Button>
        </Row>
      </section>
      <section className="border border-border rounded-md bg-card px-4">
        <h2 className="text-[11px] font-mono uppercase tracking-[0.14em] text-muted-foreground pt-4">Account</h2>
        <Row title={user?.full_name || 'Officer'} description={user?.email}>
          <span className="text-xs font-mono text-primary">{user?.role?.toUpperCase()}</span>
        </Row>
      </section>
    </div>
  );
}
