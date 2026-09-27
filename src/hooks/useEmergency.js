import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useDevice } from '@/components/mobile/DeviceProvider';
import useCurrentUser from '@/hooks/useCurrentUser';
import useContacts from '@/hooks/useContacts';
import { getSettings } from '@/lib/synclet/constants';
import { getLocation } from '@/lib/synclet/locationService';
import { buildIncident, sendIncident, transitionIncident } from '@/lib/synclet/incidentService';
import { biometricService } from '@/lib/synclet/biometricService';

export default function useEmergency() {
  const { device } = useDevice();
  const { data: user } = useCurrentUser();
  const { data: contacts = [] } = useContacts(user);
  const qc = useQueryClient();
  const [sending, setSending] = useState(false);
  const settings = getSettings(user);

  const trigger = async ({ triggerType, voiceCommand, confidence }) => {
    setSending(true);
    if (settings.device.hapticOnAlert) navigator.vibrate?.(250);
    const location = await getLocation({ useDevice: settings.safety.useRealLocation, coarse: settings.privacy.coarseLocation });
    const payload = buildIncident({
      user, device, location, triggerType, voiceCommand, confidence,
      primaryContact: contacts.find((c) => c.is_primary),
      privacy: settings.privacy,
    });
    const result = await sendIncident(payload);
    await qc.invalidateQueries({ queryKey: ['my-incidents', user.id] });
    setSending(false);
    return result;
  };

  const cancel = async (incident) => {
    if (settings.safety.requireFingerprintToCancel) {
      const auth = await biometricService.authenticateUser({ available: device.connected && device.fingerprintReady });
      if (!auth.ok) return auth;
    }
    await transitionIncident(incident, 'CANCELLED', user.display_name || user.full_name || 'User');
    await qc.invalidateQueries({ queryKey: ['my-incidents', user.id] });
    return { ok: true };
  };

  return { trigger, cancel, sending, primaryContact: contacts.find((c) => c.is_primary) };
}