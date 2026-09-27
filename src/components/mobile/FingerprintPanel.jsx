import React, { useState } from 'react';
import { Fingerprint } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Section from '@/components/mobile/Section';
import SimBadge from '@/components/mobile/SimBadge';
import { useDevice } from '@/components/mobile/DeviceProvider';
import useCurrentUser from '@/hooks/useCurrentUser';
import { biometricService } from '@/lib/synclet/biometricService';
import { getSettings } from '@/lib/synclet/constants';

const TONE = { idle: 'text-muted-foreground', busy: 'text-foreground', ok: 'text-safe', fail: 'text-critical' };

export default function FingerprintPanel() {
  const { device } = useDevice();
  const { data: user } = useCurrentUser();
  const available = device.connected && device.fingerprintReady && getSettings(user).biometric.fingerprintEnabled;
  const [state, setState] = useState({ phase: 'idle', text: 'Place a finger on the wearable to verify identity.' });

  const run = async (kind) => {
    setState({ phase: 'busy', text: kind === 'scan' ? 'Reading sensor…' : 'Enrolling — hold finger still…' });
    const r = kind === 'scan' ? await biometricService.authenticateUser({ available }) : await biometricService.registerFingerprint({ available });
    if (!r.ok) return setState({ phase: 'fail', text: r.reason });
    setState({ phase: 'ok', text: kind === 'scan' ? 'Fingerprint detected. Identity verified.' : `Fingerprint enrolled (${r.templateId}).` });
  };

  return (
    <Section title="Fingerprint sensor" aside={<SimBadge label="Simulated hardware" />}>
      <div className="flex items-center gap-4">
        <div className={`w-14 h-14 border rounded-md flex items-center justify-center ${state.phase === 'busy' ? 'animate-pulse border-primary' : 'border-border'}`}>
          <Fingerprint className={`w-8 h-8 ${TONE[state.phase]}`} strokeWidth={1.5} />
        </div>
        <div className="flex-1">
          <p className={`text-xs font-mono font-semibold tracking-wider ${available ? 'text-safe' : 'text-warn'}`}>{available ? '● READY' : '○ UNAVAILABLE'}</p>
          <p className={`text-sm mt-1 ${TONE[state.phase]}`}>{state.text}</p>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-2 mt-4">
        <Button disabled={state.phase === 'busy'} onClick={() => run('scan')}>Scan fingerprint</Button>
        <Button variant="outline" disabled={state.phase === 'busy'} onClick={() => run('enroll')}>Re-enrol</Button>
      </div>
    </Section>
  );
}