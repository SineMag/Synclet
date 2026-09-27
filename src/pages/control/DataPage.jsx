import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Download } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { audit } from '@/lib/synclet/incidentService';
import { fmtDateTime } from '@/lib/synclet/format';

export default function DataPage() {
  const { data: incidents = [] } = useQuery({ queryKey: ['cr-incidents'], queryFn: () => base44.entities.Incident.list('-created_date', 100) });
  const [q, setQ] = useState('');
  const needle = q.trim().toLowerCase();
  const filtered = needle
    ? incidents.filter((i) => [i.incident_code, i.user_name, i.status, i.trigger_type, i.location_label, i.officer].join(' ').toLowerCase().includes(needle))
    : incidents;

  const exportCsv = () => {
    const head = ['code', 'triggered_at', 'user', 'trigger', 'status', 'priority', 'location', 'officer'];
    const rows = filtered.map((i) => [i.incident_code, i.triggered_at || i.created_date, i.user_name, i.trigger_type, i.status, i.priority, i.location_label, i.officer]);
    const csv = [head, ...rows].map((r) => r.map((c) => `"${String(c ?? '').replace(/"/g, '""')}"`).join(',')).join('\n');
    const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }));
    const a = document.createElement('a');
    a.href = url;
    a.download = 'synclet-incidents.csv';
    a.click();
    URL.revokeObjectURL(url);
    audit('DATA_EXPORT', 'Officer', `Exported ${filtered.length} incident records to CSV`);
  };

  return (
    <div className="p-6 space-y-4">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Incident data</h1>
          <p className="text-sm text-muted-foreground mt-1">{filtered.length} of {incidents.length} records</p>
        </div>
        <div className="flex gap-2">
          <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search code, user, status…" className="w-56" />
          <Button variant="outline" onClick={exportCsv}><Download className="w-4 h-4 mr-1.5" />Export CSV</Button>
        </div>
      </header>
      <div className="border border-border rounded-md bg-card overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              {['Code', 'Triggered', 'User', 'Trigger', 'Status', 'Priority', 'Location', 'Officer'].map((h) => (
                <TableHead key={h} className="text-[10px] font-mono tracking-wider uppercase">{h}</TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((i) => (
              <TableRow key={i.id}>
                <TableCell className="font-mono text-xs">{i.incident_code}</TableCell>
                <TableCell className="text-xs">{fmtDateTime(i.triggered_at || i.created_date)}</TableCell>
                <TableCell className="text-xs">{i.user_name}</TableCell>
                <TableCell className="text-xs">{i.trigger_type}</TableCell>
                <TableCell className="text-xs">{i.status}</TableCell>
                <TableCell className={`text-xs font-medium ${i.status === 'CANCELLED' || i.status === 'RESOLVED' ? '' : 'text-critical'}`}>{i.priority}</TableCell>
                <TableCell className="text-xs max-w-[180px] truncate">{i.location_label}</TableCell>
                <TableCell className="text-xs">{i.officer || '—'}</TableCell>
              </TableRow>
            ))}
            {filtered.length === 0 && <TableRow><TableCell colSpan={8} className="text-sm text-muted-foreground text-center py-6">No matching records.</TableCell></TableRow>}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}