import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useDevice } from '@/components/mobile/DeviceProvider';
import useCurrentUser from '@/hooks/useCurrentUser';
import useContacts from '@/hooks/useContacts';
import { getSettings } from '@/lib/synclet/constants';
import { getLocation } from '@/lib/synclet/locationService';
import { cancelMqttSos } from '@/lib/synclet/mqttService';
import { buildIncident, canTransition, logIncidentAction, recordUserCheckIn, sendIncident, transitionIncident } from '@/lib/synclet/incidentService';
import { biometricService } from '@/lib/synclet/biometricService';

export default function useEmergency() {
  const { device } = useDevice();
  const { data: user } = useCurrentUser();
  const contactsQuery = useContacts(user);
  const contacts = contactsQuery.data || [];
  const qc = useQueryClient();
  const [sending, setSending] = useState(false);
  const settings = getSettings(user);

  const trigger = async ({ triggerType, voiceCommand, confidence }) => {
    setSending(true);
    try {
      if (settings.device.hapticOnAlert) navigator.vibrate?.(250);
      const location = await getLocation({ useDevice: settings.safety.useRealLocation, coarse: settings.privacy.coarseLocation });
      const payload = buildIncident({
        user, device, location, triggerType, voiceCommand, confidence,
        primaryContact: contacts.find((c) => c.is_primary),
        privacy: settings.privacy,
      });
      const result = await sendIncident(payload);
      await qc.invalidateQueries({ queryKey: ['my-incidents', user.id] });
      return result;
    } finally {
      setSending(false);
    }
  };

  const checkIn = async (incident, response, { source = 'app' } = {}) => {
    if (response === 'SAFE' && source !== 'hardware' && canTransition(incident.status, 'CANCELLED') && settings.safety.requireFingerprintToCancel) {
      const auth = await biometricService.authenticateUser({ available: device.connected && device.fingerprintReady });
      if (!auth.ok) return auth;
    }
    const freshContacts = response === 'NEEDS_HELP'
      ? contactsQuery.data ?? (await contactsQuery.refetch()).data ?? []
      : [];
    const result = await recordUserCheckIn(
      incident,
      response,
      user.display_name || user.full_name || 'User',
      freshContacts,
    );
    await qc.invalidateQueries({ queryKey: ['my-incidents', user.id] });
    if (response === 'SAFE' && source !== 'hardware' && device.sosCountdownStartedAt && device.source === 'hardware' && !result.alreadyRecorded) {
      cancelMqttSos().catch(async () => {
        try {
          await logIncidentAction(
            result.incident,
            'HARDWARE_CANCEL_UNCONFIRMED',
            'The control room record is marked safe, but the app did not receive confirmation that the ESP32 countdown stopped. Check the device.',
            user.display_name || user.full_name || 'User',
          );
          await qc.invalidateQueries({ queryKey: ['my-incidents', user.id] });
        } catch {
          // The local safe check-in remains recorded even if a follow-up note cannot be written.
        }
      });
    }
    return { ok: true, ...result };
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

  return { trigger, cancel, checkIn, sending, contacts, primaryContact: contacts.find((c) => c.is_primary) };
}