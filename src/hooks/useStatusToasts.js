import { useEffect, useRef } from 'react';
import { toast } from '@/components/ui/use-toast';
import { EVENTS, MOBILE_MESSAGES } from '@/lib/synclet/constants';

// Notifies the user on the phone when the control room changes their incident.
export default function useStatusToasts(incident, enabled) {
  const prev = useRef({});
  useEffect(() => {
    if (!incident) return;
    const last = incident.timeline?.[incident.timeline.length - 1];
    const p = prev.current;
    if (enabled && p.id === incident.id) {
      if (p.status !== incident.status && incident.status !== 'ACTIVE') {
        toast({ title: MOBILE_MESSAGES[incident.status], description: incident.incident_code });
      }
      if (last?.type === EVENTS.CONTACT && last.at !== p.lastAt) {
        toast({ title: 'Control room is contacting you', description: last.message });
      }
    }
    prev.current = { id: incident.id, status: incident.status, lastAt: last?.at };
  }, [incident?.id, incident?.status, incident?.timeline?.length]);
}