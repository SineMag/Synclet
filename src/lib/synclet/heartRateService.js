// heartRateService — SIMULATED sensor readings for the prototype.
// A real ESP32 heart-rate sensor would replace nextHeartRate() with BLE notifications.

export const HR_MODES = {
  NORMAL: { label: 'Normal', range: '60–90', min: 60, max: 90 },
  ELEVATED: { label: 'Elevated', range: '90–120', min: 90, max: 120 },
  CRITICAL: { label: 'Low', range: '<50', min: 40, max: 49 },
};

export function nextHeartRate(prev, mode) {
  const { min, max } = HR_MODES[mode] || HR_MODES.NORMAL;
  if (prev < min) return Math.min(prev + 4, max);
  if (prev > max) return Math.max(prev - 4, min);
  const next = prev + Math.round((Math.random() - 0.5) * 4);
  return Math.min(max, Math.max(min, next));
}

// Combines several signals. A single heart-rate value is never treated as proof of danger.
export function assessSignals({ heartRate, motion }) {
  const reasons = [];
  if (heartRate > 90) reasons.push('Heart rate above normal range');
  if (heartRate < 50) reasons.push('Heart rate below normal range');
  if (motion === 'SUDDEN') reasons.push('Sudden movement detected');
  const level = reasons.length >= 2 ? 'ELEVATED' : reasons.length === 1 ? 'WATCH' : 'NORMAL';
  return { level, reasons };
}