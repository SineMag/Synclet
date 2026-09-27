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

  const act = async (command) => {
    if (!getSettings(user).voice.wakeWordEnabled) return [false, 'Wake word is turned off in Settings.'];
    if (!command.wakeWordDetected) return [false, 'Ignored — wake word "Synclet" not detected.'];
    if (command.intent === 'EMERGENCY') {
      await trigger({ triggerType: 'VOICE', voiceCommand: command.rawText, confidence: command.confidence });
      const message = 'Alert recorded in this browser. No emergency service was contacted.';
      return [true, command.contact ? `${message} Contact ${contactName} separately if needed.` : message];
    }
    if (command.intent === 'CONTACT') return [false, `No call is placed by Synclet. Contact ${contactName} directly if needed.`];
    if (command.intent === 'CANCEL') {
      const open = incidents.find((incident) => canTransition(incident.status, 'CANCELLED'));
      if (!open) return [false, 'No active alert to cancel.'];
      const cancelled = await cancel(open);
      return [cancelled.ok, cancelled.ok ? 'Alert cancelled.' : cancelled.reason];
    }
    if (command.intent === 'DEVICE_STATUS') {
      const readings = [device.battery != null && `Battery ${device.battery}%`, device.heartRate != null && `heart rate ${device.heartRate} BPM`].filter(Boolean);
      return [device.connected, device.connected ? readings.join(' · ') || 'ESP32 online; no sensor values reported.' : 'ESP32 is offline.'];
    }
    return [false, 'Command not recognised. Try "Synclet, I am in danger."'];
  };

  const handle = async (text) => {
    const command = interpret(text);
    const [ok, action] = await act(command);
    setResult({ ...command, ok, action });
  };
  const listening = useLiveListening(handle);

  return (
    <Section title="Voice system">
      <div className="space-y-3">
        <LiveListeningToggle listening={listening} />
        <div className="border border-dashed border-warn/50 rounded-md p-3 space-y-2">
          <div className="flex items-center justify-between gap-2">
            <p className="text-sm font-medium">Wearable microphone</p>
            <SimBadge label="Not connected" />
          </div>
          <p className="text-xs text-muted-foreground">The wearable microphone and wake-word engine are not connected. Use the phone browser microphone while this page is open.</p>
          <VoiceSimulatorInput onSubmit={handle} disabled={sending} />
        </div>
        <VoiceResult result={result} />
      </div>
    </Section>
  );
}
