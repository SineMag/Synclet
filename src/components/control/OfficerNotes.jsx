import React, { useState } from 'react';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { logIncidentAction } from '@/lib/synclet/incidentService';
import { EVENTS } from '@/lib/synclet/constants';

export default function OfficerNotes({ incident, officerName }) {
  const [note, setNote] = useState('');
  const [saving, setSaving] = useState(false);
  const add = async () => {
    setSaving(true);
    await logIncidentAction(incident, EVENTS.NOTE, `Note: ${note.trim()}`, officerName);
    setNote('');
    setSaving(false);
  };
  return (
    <div className="space-y-2">
      <p className="text-[11px] font-mono tracking-[0.14em] text-muted-foreground">OFFICER NOTE</p>
      <Textarea rows={3} value={note} onChange={(e) => setNote(e.target.value)} placeholder="Add an observation to the log…" className="text-sm" />
      <Button size="sm" variant="outline" className="w-full" disabled={!note.trim() || saving} onClick={add}>
        {saving ? 'Logging…' : 'Add to log'}
      </Button>
    </div>
  );
}