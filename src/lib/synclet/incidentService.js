// incidentService — emergency creation, status transitions, and the offline pending queue.
import { base44 } from '@/api/base44Client';
import { EVENTS, STATUS_EVENT, OPEN_STATUSES } from './constants';

const QUEUE_KEY = 'synclet.pendingIncidents';
const HISTORY_KEY = 'synclet.localHistory';

export const TRANSITIONS = {
  ACTIVE: ['ACKNOWLEDGED', 'CANCELLED'],
  ACKNOWLEDGED: ['RESPONDING', 'RESOLVED', 'CANCELLED'],
  RESPONDING: ['RESOLVED'],
  RESOLVED: [],
  CANCELLED: [],
};

export const canTransition = (from, to) => (TRANSITIONS[from] || []).includes(to);

// Security audit trail — writes an entry for every security-relevant action.
// Never allowed to block or break the emergency flow if logging fails.
export const audit = (action, actor, detail, target = '', target_label = '', severity = 'info') =>
  base44.entities.AuditLog.create({ action, actor, detail, target, target_label, severity }).catch(() => {});
export const isOpen = (status) => OPEN_STATUSES.includes(status);
export const timelineEntry = (type, message, actor) => ({ at: new Date().toISOString(), type, message, actor });
export const generateIncidentCode = () => `INC-${String(Date.now()).slice(-5)}`;

const read = (k) => JSON.parse(localStorage.getItem(k) || '[]');
const write = (k, v) => {
  localStorage.setItem(k, JSON.stringify(v));
  window.dispatchEvent(new Event('synclet:queue'));
};
export const getPendingQueue = () => read(QUEUE_KEY);

export function buildIncident({ user, device, location, triggerType, voiceCommand, confidence, primaryContact, privacy }) {
  const name = user.display_name || user.full_name || 'Demo User';
  const message = triggerType === 'VOICE' ? `Emergency received — voice command "${voiceCommand}"` : 'Emergency received — manual safety alert';
  return {
    incident_code: generateIncidentCode(),
    user_name: name,
    user_phone: user.phone || '',
    device_id: device.deviceId,
    trigger_type: triggerType,
    voice_command: voiceCommand || '',
    intent_confidence: confidence,
    heart_rate: privacy.shareHeartRate ? device.heartRate : undefined,
    heart_rate_mode: device.hrMode,
    battery: device.battery,
    device_connected: device.connected,
    latitude: privacy.shareLocation ? location.lat : undefined,
    longitude: privacy.shareLocation ? location.lng : undefined,
    location_label: privacy.shareLocation ? location.label : 'Withheld by user privacy setting',
    location_simulated: location.simulated,
    primary_contact: primaryContact ? `${primaryContact.name} (${primaryContact.relationship || 'contact'})` : '',
    status: 'ACTIVE',
    priority: 'CRITICAL',
    triggered_at: new Date().toISOString(),
    timeline: [timelineEntry(EVENTS.TRIGGERED, message, name)],
  };
}

// Stores locally first, then transmits. On failure the event waits in the pending queue.
export async function sendIncident(payload) {
  write(HISTORY_KEY, [payload, ...read(HISTORY_KEY)].slice(0, 50));
  try {
    const incident = await base44.entities.Incident.create(payload);
    audit('ALERT_TRIGGERED', payload.user_name, `${payload.trigger_type} emergency triggered`, incident.id, incident.incident_code, 'critical');
    return { incident, queued: false };
  } catch {
    write(QUEUE_KEY, [...read(QUEUE_KEY), payload]);
    return { incident: payload, queued: true };
  }
}

export async function flushQueue() {
  const remaining = [];
  let sent = 0;
  for (const p of read(QUEUE_KEY)) {
    try {
      await base44.entities.Incident.create({
        ...p,
        timeline: [...p.timeline, timelineEntry(EVENTS.SYNCED, 'Delivered after reconnect (queued on phone while offline)', 'System')],
      });
      sent++;
      audit('ALERT_SYNCED', 'System', `Offline alert ${p.incident_code} delivered after reconnect`, '', p.incident_code);
    } catch {
      remaining.push(p);
    }
  }
  write(QUEUE_KEY, remaining);
  return sent;
}

const MESSAGES = {
  ACKNOWLEDGED: (a) => `Incident acknowledged by ${a}`,
  RESPONDING: (a) => `Response initiated by ${a}`,
  RESOLVED: (a) => `Incident resolved by ${a}`,
  CANCELLED: () => 'Alert cancelled by user from mobile app',
};
const STAMP = { ACKNOWLEDGED: 'acknowledged_at', RESPONDING: 'responding_at', RESOLVED: 'resolved_at', CANCELLED: 'resolved_at' };

export async function transitionIncident(incident, to, actor) {
  if (!canTransition(incident.status, to)) throw new Error(`Cannot move incident from ${incident.status} to ${to}`);
  const patch = {
    status: to,
    [STAMP[to]]: new Date().toISOString(),
    timeline: [...(incident.timeline || []), timelineEntry(STATUS_EVENT[to], MESSAGES[to](actor), actor)],
  };
  if (to === 'ACKNOWLEDGED') patch.officer = actor;
  await base44.entities.Incident.update(incident.id, patch);
  audit(`INCIDENT_${to}`, actor, MESSAGES[to](actor), incident.id, incident.incident_code);
}

export const logIncidentAction = async (incident, type, message, actor, extra = {}) => {
  await base44.entities.Incident.update(incident.id, {
    ...extra,
    timeline: [...(incident.timeline || []), timelineEntry(type, message, actor)],
  });
  audit(type, actor, message, incident.id, incident.incident_code);
};