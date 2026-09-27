// biometricService — SIMULATED wearable fingerprint sensor.
// This is NOT the phone/laptop fingerprint reader. A real ESP32 sensor (e.g. R503/AS608)
// would answer these calls over BLE with match results; template data never leaves the wearable.

const KEY = 'synclet.fingerprintTemplate';
const delay = (ms) => new Promise((r) => setTimeout(r, ms));

export const biometricService = {
  kind: 'SIMULATED_HARDWARE',

  async isBiometricAvailable({ available }) {
    return available;
  },

  async registerFingerprint({ available }) {
    if (!available) return { ok: false, reason: 'Fingerprint sensor unavailable — check device connection.' };
    await delay(1600);
    const templateId = `FP-${Math.random().toString(36).slice(2, 7).toUpperCase()}`;
    localStorage.setItem(KEY, templateId);
    return { ok: true, templateId };
  },

  async authenticateUser({ available }) {
    if (!available) return { ok: false, reason: 'Fingerprint sensor unavailable — check device connection.' };
    await delay(1200);
    const templateId = localStorage.getItem(KEY) || 'FP-DEMO1';
    return { ok: true, templateId, matchScore: 0.97 };
  },
};