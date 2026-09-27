import React from 'react';
import VoicePanel from '@/components/mobile/VoicePanel';
import FingerprintPanel from '@/components/mobile/FingerprintPanel';
import IncidentHistory from '@/components/mobile/IncidentHistory';

export default function Safety() {
  return (
    <div className="px-5 pt-6 pb-8 space-y-5">
      <header>
        <p className="text-[11px] font-mono uppercase tracking-[0.14em] text-muted-foreground">Safety</p>
        <h1 className="text-2xl font-semibold mt-1 tracking-tight">Voice & identity</h1>
      </header>
      <VoicePanel />
      <FingerprintPanel />
      <IncidentHistory />
    </div>
  );
}