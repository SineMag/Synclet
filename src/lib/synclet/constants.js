// Shared definitions used by BOTH the mobile app and the Security Control Room.
// These mirror the "shared/types" + "socketEvents" contract from the spec.

export const DEVICE_ID = 'SYNCLET-001';

export const DEMO_LOCATION = { lat: -29.8587, lng: 31.0218, label: 'Demo Location · Durban CBD' };

export const OPEN_STATUSES = ['ACTIVE', 'ACKNOWLEDGED', 'RESPONDING'];
export const STATUS_FLOW = ['ACTIVE', 'ACKNOWLEDGED', 'RESPONDING', 'RESOLVED'];

// Real-time event names (delivered through the live data channel).
export const EVENTS = {
  TRIGGERED: 'EMERGENCY_TRIGGERED',
  ACKNOWLEDGED: 'EMERGENCY_ACKNOWLEDGED',
  RESPONDING: 'EMERGENCY_RESPONDING',
  RESOLVED: 'EMERGENCY_RESOLVED',
  CANCELLED: 'EMERGENCY_CANCELLED',
  CONTACT: 'OFFICER_CONTACT_USER',
  ESCALATED: 'EMERGENCY_ESCALATED',
  NOTE: 'OFFICER_NOTE',
  SYNCED: 'OFFLINE_EVENT_SYNCED',
};

export const STATUS_EVENT = {
  ACKNOWLEDGED: EVENTS.ACKNOWLEDGED,
  RESPONDING: EVENTS.RESPONDING,
  RESOLVED: EVENTS.RESOLVED,
  CANCELLED: EVENTS.CANCELLED,
};

export const MOBILE_MESSAGES = {
  ACTIVE: 'Security control room notified.',
  ACKNOWLEDGED: 'Security officer acknowledged your alert.',
  RESPONDING: 'Response initiated.',
  RESOLVED: 'Incident resolved.',
  CANCELLED: 'Alert cancelled.',
};

export const TRIGGER_LABELS = { VOICE: 'Voice command', MANUAL: 'Manual safety alert' };

export const DEFAULT_SETTINGS = {
  demoMode: true,
  safety: { useRealLocation: false, requireFingerprintToCancel: false },
  device: { hapticOnAlert: true },
  voice: { wakeWordEnabled: true },
  biometric: { fingerprintEnabled: true },
  notifications: { statusUpdates: true },
  privacy: { shareHeartRate: true, shareLocation: true, coarseLocation: false },
};

export function getSettings(user) {
  const saved = user?.synclet_settings || {};
  return Object.fromEntries(
    Object.entries(DEFAULT_SETTINGS).map(([k, v]) => [
      k,
      typeof v === 'object' ? { ...v, ...(saved[k] || {}) } : saved[k] ?? v,
    ])
  );
}