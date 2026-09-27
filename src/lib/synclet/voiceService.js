// voiceService — wake-word detection + intent classification (REAL software, runs locally).
// Pipeline: microphone -> wake word "Synclet" -> speech-to-text -> intent -> safety action.
// A dedicated wake-word engine or an LLM can replace classifyIntent() later with the same output shape.

export const WAKE_WORD = 'Synclet';

// Matches "Synclet", "Syncel" and common speech-recognition mishearings.
const WAKE_RE = /\b(synclet|sync ?let|sync ?le|syncel|sync ?el|sin ?clet|sin ?cel|sinclair|synced let)\b[\s,.!:-]*/i;

const PATTERNS = {
  cancel: [/cancel (the |my )?alert/, /\bfalse alarm\b/, /\bi('| a)?m (safe|ok|okay) now\b/, /\bstand down\b/],
  emergency: [/\bin danger\b/, /\bnot safe\b/, /\bunsafe\b/, /don'?t feel safe/, /\bhelp( me)?\b/, /\bemergency\b/, /\bbeing followed\b/, /\battack/],
  contact: [/\b(call|phone|message|text|alert) (my )?(mom|mum|mother|dad|father|contacts?|primary|family)\b/],
  status: [/\bbattery\b/, /\bstatus\b/, /\bheart ?rate\b/, /\bare you (on|connected)\b/],
};

const has = (text, list) => list.some((p) => p.test(text));

export function detectWakeWord(text) {
  const m = text.match(WAKE_RE);
  return m ? { detected: true, command: text.slice(m.index + m[0].length).trim() } : { detected: false, command: '' };
}

export function classifyIntent(command) {
  const t = command.toLowerCase().replace(/’/g, "'");
  if (has(t, PATTERNS.cancel)) return { intent: 'CANCEL', confidence: 0.96 };
  const emergency = has(t, PATTERNS.emergency);
  const contact = has(t, PATTERNS.contact);
  if (emergency) return { intent: 'EMERGENCY', confidence: contact ? 0.97 : 0.98, ...(contact && { contact: 'primary' }) };
  if (contact) return { intent: 'CONTACT', contact: 'primary', confidence: 0.95 };
  if (has(t, PATTERNS.status)) return { intent: 'DEVICE_STATUS', confidence: 0.9 };
  return { intent: 'UNKNOWN', confidence: 0.3 };
}

export function interpret(rawText) {
  const wake = detectWakeWord(rawText);
  if (!wake.detected) return { wakeWordDetected: false, intent: 'UNKNOWN', confidence: 0, rawText, command: '' };
  return { wakeWordDetected: true, rawText, command: wake.command, ...classifyIntent(wake.command) };
}