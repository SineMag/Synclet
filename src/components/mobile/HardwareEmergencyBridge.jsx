import React, { useEffect, useRef } from 'react';
import { useDevice } from '@/components/mobile/DeviceProvider';
import useEmergency from '@/hooks/useEmergency';

// Forwards emergency-button notifications from real ESP32 hardware into the incident flow.
export default function HardwareEmergencyBridge() {
  const { device } = useDevice();
  const { trigger } = useEmergency();
  const last = useRef(device.hwEmergencyAt);

  useEffect(() => {
    if (device.hwEmergencyAt && device.hwEmergencyAt !== last.current) {
      last.current = device.hwEmergencyAt;
      trigger({ triggerType: 'MANUAL' });
    }
  }, [device.hwEmergencyAt]);

  return null;
}