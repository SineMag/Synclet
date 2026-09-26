import React, { useEffect, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import useCurrentUser from '@/hooks/useCurrentUser';
import useConnection from '@/hooks/useConnection';
import { isOpen } from '@/lib/synclet/incidentService';
import { playAlarm } from '@/lib/synclet/alertSound';
import TopBar from '@/components/control/TopBar';
import AlertBanner from '@/components/control/AlertBanner';
import IncidentQueue from '@/components/control/IncidentQueue';
import IncidentDetail from '@/components/control/IncidentDetail';
import ResponsePanel from '@/components/control/ResponsePanel';
import EmptyState from '@/components/control/EmptyState';

const KEY = ['cr-incidents'];

export default function ControlConsole() {
  const { data: officer } = useCurrentUser();
  const qc = useQueryClient();
  const { connected } = useConnection();
  const { data: incidents = [] } = useQuery({ queryKey: KEY, queryFn: () => base44.entities.Incident.list('-created_date', 100) });
  const [selectedId, setSelectedId] = useState(null);
  const [alertCode, setAlertCode] = useState(null);

  useEffect(() => base44.entities.Incident.subscribe((event) => {
    const rec = { ...event.data, id: event.id };
    qc.setQueryData(KEY, (old = []) =>
      event.type === 'delete' ? old.filter((i) => i.id !== event.id)
      : event.type === 'create' ? [rec, ...old.filter((i) => i.id !== event.id)]
      : old.map((i) => (i.id === event.id ? { ...i, ...rec } : i))
    );
    qc.invalidateQueries({ queryKey: KEY });
    if (event.type === 'create') {
      playAlarm();
      setSelectedId(event.id);
      setAlertCode(event.data?.incident_code || 'NEW');
      setTimeout(() => setAlertCode(null), 8000);
    }
  }), [qc]);

  useEffect(() => {
    const firstOpen = incidents.find((i) => isOpen(i.status));
    if (!selectedId && firstOpen) setSelectedId(firstOpen.id);
  }, [incidents, selectedId]);

  const selected = incidents.find((i) => i.id === selectedId) || null;
  const officerName = `Officer ${(officer.full_name || 'Demo').split(' ')[0]}`;

  return (
    <div className="h-full flex flex-col">
      <TopBar connected={connected} officerName={officerName} activeCount={incidents.filter((i) => isOpen(i.status)).length} />
      {alertCode && <AlertBanner code={alertCode} />}
      <div className="flex-1 lg:min-h-0 grid grid-cols-1 lg:grid-cols-[320px_minmax(0,1fr)_300px]">
        <IncidentQueue incidents={incidents} selectedId={selected?.id} onSelect={setSelectedId} />
        {selected ? <IncidentDetail incident={selected} /> : <EmptyState />}
        <ResponsePanel incident={selected} officerName={officerName} />
      </div>
    </div>
  );
}