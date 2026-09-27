import { useEffect, useRef } from 'react';
import { useDevice } from '@/components/mobile/DeviceProvider';
import useEmergency from '@/hooks/useEmergency';
import useMyIncidents from '@/hooks/useMyIncidents';

// Creates an incident at SOS start and records a physical cancellation as a safe check-in.
export default function HardwareEmergencyBridge({ user }) {
  const { device, update } = useDevice();
  const { trigger, checkIn } = useEmergency();
  const { data: incidents = [] } = useMyIncidents(user);
  const lastSignal = useRef(null);
  const lastCancel = useRef(null);
  const creating = useRef(false);
  const signal = device.sosCountdownStartedAt || device.hwEmergencyAt;
  const incident = incidents.find((item) => item.id === device.hwEmergencyIncidentId);

  useEffect(() => {
    if (!signal || device.hwEmergencyIncidentId || creating.current || signal === lastSignal.current) return;
    lastSignal.current = signal;
    creating.current = true;
    update({ hwEmergencyError: '' });
    trigger({ triggerType: 'MANUAL' })
      .then(({ incident: created }) => update({ hwEmergencyIncidentId: created.id || null }))
      .catch((error) => update({ hwEmergencyError: error.message || 'Could not record the hardware alert.' }))
      .finally(() => { creating.current = false; });
  }, [device.hwEmergencyIncidentId, signal, trigger, update]);

  useEffect(() => {
    const cancelledAt = device.hwSosCancelledAt;
    if (!cancelledAt || !incident || cancelledAt === lastCancel.current) return;
    lastCancel.current = cancelledAt;
    checkIn(incident, 'SAFE', { source: 'hardware' }).catch((error) => {
      update({ hwEmergencyError: error.message || 'The ESP32 cancelled, but Synclet could not record your safe check-in.' });
    });
  }, [checkIn, device.hwSosCancelledAt, incident, update]);

  return null;
}
