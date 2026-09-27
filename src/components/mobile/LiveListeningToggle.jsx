import React from 'react';
import { Switch } from '@/components/ui/switch';
import SimBadge from '@/components/mobile/SimBadge';

export default function LiveListeningToggle({ listening }) {
  const { supported, active, setActive, heard, error } = listening;
  return (
    <div className="border border-border rounded-md p-3">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-sm font-medium">Live listening</p>
          <p className="text-xs text-muted-foreground">Continuous recognition on this phone's microphone.</p>
        </div>
        <Switch checked={active} disabled={!supported} onCheckedChange={setActive} aria-label="Live listening" />
      </div>
      <div className="mt-2 flex items-center gap-2">
        <SimBadge real label="Real · browser speech" />
        {active && <span className="text-[11px] text-safe font-mono">● LISTENING FOR "SYNCLET"</span>}
      </div>
      {!supported && <p className="mt-2 text-xs text-muted-foreground">Not supported in this browser — use desktop Chrome or Edge, or enter text below.</p>}
      {active && heard && <p className="mt-2 text-xs text-muted-foreground">Hearing: "{heard}"</p>}
      {error && <p className="mt-2 text-xs text-critical">{error}</p>}
    </div>
  );
}