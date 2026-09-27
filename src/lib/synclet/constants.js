// Shared definitions used by the mobile app and Security Control Room.
export const DEVICE_ID = 'ESP32_Pro_Unit_01';
export const FALLBACK_LOCATION = { lat: -29.8587, lng: 31.0218, label: 'Fallback location · Durban CBD (not GPS)' };

export const OPEN_STATUSES = ['ACTIVE', 'ACKNOWLEDGED', 'RESPONDING'];
export const STATUS_FLOW = ['ACTIVE', 'ACKNOWLEDGED', 'RESPONDING', 'RESOLVED'];

export const EVENTS = {
  TRIGGERED: 'EMERGENCY_TRIGGERED',
  ACKNOWLEDGED: 'EMERGENCY_ACKNOWLEDGED',
  RESPONDING: 'EMERGENCY_RESPONDING',
  RESOLVED: 'EMERGENCY_RESOLVED',
  CANCELLED: 'EMERGENCY_CANCELLED',
  CONTACT: 'OFFICER_CONTACT_USER',
  ESCALATED: 'EMERGENCY_ESCALATED',
  USER_CHECK_IN_SAFE: 'USER_CHECK_IN_SAFE',
  USER_CHECK_IN_HELP: 'USER_CHECK_IN_HELP',
  HARDWARE_CANCEL_UNCONFIRMED: 'HARDWARE_CANCEL_UNCONFIRMED',
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
  ACTIVE: 'Alert recorded in this browser. No emergency service was contacted.',
  ACKNOWLEDGED: 'Control room marked this alert acknowledged.',
  RESPONDING: 'Control room updated the response status.',
  RESOLVED: 'Incident resolved.',
  CANCELLED: 'You confirmed you are okay. The alert was cancelled.',
};

export const TRIGGER_LABELS = { VOICE: 'Voice command', MANUAL: 'Manual safety alert' };

export const DEFAULT_SETTINGS = {
  showSignalControls: false,
  safety: { useRealLocation: false, requireFingerprintToCancel: false },
  device: { hapticOnAlert: true },
  voice: { wakeWordEnabled: true },
  biometric: { fingerprintEnabled: true },
  notifications: { statusUpdates: true },
  privacy: { shareHeartRate: true, shareLocation: true, coarseLocation: false },
};

export function getSettings(user) {
  const saved = user?.synclet_settings || {};
  const normalized = {
    ...saved,
    showSignalControls: saved.showSignalControls ?? saved.demoMode ?? false,
  };
  delete normalized.demoMode;
  return Object.fromEntries(
    Object.entries(DEFAULT_SETTINGS).map(([key, value]) => [
      key,
      typeof value === 'object' ? { ...value, ...(normalized[key] || {}) } : normalized[key] ?? value,
    ]),
  );
}
