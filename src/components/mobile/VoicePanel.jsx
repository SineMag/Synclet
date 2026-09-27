import React, { useState } from 'react';
import Section from '@/components/mobile/Section';
import SimBadge from '@/components/mobile/SimBadge';
import VoiceResult from '@/components/mobile/VoiceResult';
import VoiceSimulatorInput from '@/components/mobile/VoiceSimulatorInput';
import LiveListeningToggle from '@/components/mobile/LiveListeningToggle';
import { useDevice } from '@/components/mobile/DeviceProvider';
import useCurrentUser from '@/hooks/useCurrentUser';
import useEmergency from '@/hooks/useEmergency';
import useMyIncidents from '@/hooks/useMyIncidents';
import useLiveListening from '@/hooks/useLiveListening';
import { interpret } from '@/lib/synclet/voiceService';
import { canTransition } from '@/lib/synclet/incidentService';
import { getSettings } from '@/lib/synclet/constants';

export default function VoicePanel() {
  const { data: user } = useCurrentUser();
  const { device } = useDevice();
  const { trigger, cancel, sending, primaryContact } = useEmergency();
  const { data: incidents = [] } = useMyIncidents(user);
  const [result, setResult] = useState(null);
  const contactName = primaryContact?.name || 'your primary contact';

  const act = async (r) => {
    if (!device.connected || !device.voiceReady) return [false, 'Voice module unavailable — device disconnected.'];
    if (!getSettings(user).voice.wakeWordEnabled) return [false, 'Wake word is turned off in Settings.'];
    if (!r.wakeWordDetected) return [false, 'Ignored — wake word "Synclet" not detected.'];
    if (r.intent === 'EMERGENCY') {
      const s = await trigger({ triggerType: 'VOICE', voiceCommand: r.rawText, confidence: r.confidence });
      const base = s.queued ? 'Alert saved on phone — will send on reconnect' : 'Emergency alert sent to security control room';
      return [true, r.contact ? `${base}. Simulated call to ${contactName} (no real call placed).` : base];
    }
    if (r.intent === 'CONTACT') return [true, `Simulated call to ${contactName} — no real call placed.`];
    if (r.intent === 'CANCEL') {
      const open = incidents.find((i) => canTransition(i.status, 'CANCELLED'));
      if (!open) return [false, 'No active alert to cancel.'];
      const c = await cancel(open);
      return [c.ok, c.ok ? 'Alert cancelled.' : c.reason];
    }
    if (r.intent === 'DEVICE_STATUS') return [true, `Battery ${device.battery}% · heart rate ${device.heartRate} BPM · connected`];
    return [false, 'Command not recognised. Try "Synclet, I am in danger."'];
  };

  const handle = async (text) => {
    const r = interpret(text);
    const [ok, action] = await act(r);
    setResult({ ...r, ok, action });
  };
  const listening = useLiveListening(handle);

  return (
    <Section title="Voice system">
      <div className="space-y-3">
        <LiveListeningToggle listening={listening} />
        <div className="border border-dashed border-warn/50 rounded-md p-3 space-y-2">
          <div className="flex items-center justify-between gap-2">
            <p className="text-sm font-medium">Wearable microphone</p>
            <SimBadge label="Simulated input" />
          </div>
          <p className="text-xs text-muted-foreground">Stands in for the wearable's always-on microphone and wake-word engine. Choose or type what the user says.</p>
          <VoiceSimulatorInput onSubmit={handle} disabled={sending} />
        </div>
        <VoiceResult result={result} />
      </div>
    </Section>
  );
}