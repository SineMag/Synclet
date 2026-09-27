import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, PieChart, Pie, Legend } from 'recharts';

const TRIGGER_COLORS = ['#ef4444', '#2dd4bf'];

export default function Stats() {
  const { data: incidents = [] } = useQuery({ queryKey: ['cr-incidents'], queryFn: () => base44.entities.Incident.list('-created_date', 100) });

  const days = [...Array(7)].map((_, idx) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - idx));
    const key = d.toDateString();
    return {
      day: d.toLocaleDateString('en-GB', { weekday: 'short' }),
      incidents: incidents.filter((i) => new Date(i.triggered_at || i.created_date).toDateString() === key).length,
    };
  });
  const byTrigger = ['VOICE', 'MANUAL'].map((t, idx) => ({ name: t, value: incidents.filter((i) => i.trigger_type === t).length || 0, fill: TRIGGER_COLORS[idx] }));
  const avg = (from, to) => {
    const xs = incidents.filter((i) => i[from] && i[to]).map((i) => new Date(i[to]) - new Date(i[from]));
    return xs.length ? Math.round(xs.reduce((a, b) => a + b, 0) / xs.length / 1000) : null;
  };

  const tiles = [
    ['Avg. acknowledge', avg('triggered_at', 'acknowledged_at'), 's'],
    ['Avg. resolve', avg('triggered_at', 'resolved_at'), 's'],
    ['Escalated', incidents.filter((i) => i.escalated).length, ''],
    ['Cancelled by user', incidents.filter((i) => i.status === 'CANCELLED').length, ''],
  ];

  return (
    <div className="p-6 space-y-6 max-w-5xl">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight">Statistics</h1>
        <p className="text-sm text-muted-foreground mt-1">Response performance across the last {incidents.length} incidents.</p>
      </header>
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-3">
        {tiles.map(([label, value, unit]) => (
          <div key={label} className="border border-border rounded-md p-4 bg-card">
            <p className="text-2xl font-semibold tabular-nums">{value == null ? '—' : value}{unit}</p>
            <p className="text-xs text-muted-foreground mt-0.5">{label}</p>
          </div>
        ))}
      </div>
      <div className="grid lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)] gap-6">
        <div className="border border-border rounded-md p-4 bg-card">
          <h2 className="text-[11px] font-mono uppercase tracking-[0.14em] text-muted-foreground mb-3">Incidents per day (7 days)</h2>
          <div className="h-56">
            <ResponsiveContainer>
              <BarChart data={days} margin={{ top: 4, right: 4, left: -24, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                <XAxis dataKey="day" stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} allowDecimals={false} />
                <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: 4, fontSize: 12 }} />
                <Bar dataKey="incidents" fill="#2dd4bf" radius={[2, 2, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="border border-border rounded-md p-4 bg-card">
          <h2 className="text-[11px] font-mono uppercase tracking-[0.14em] text-muted-foreground mb-3">Trigger types</h2>
          <div className="h-56">
            <ResponsiveContainer>
              <PieChart>
                <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: 4, fontSize: 12 }} />
                <Pie data={byTrigger} dataKey="value" nameKey="name" innerRadius="55%" outerRadius="80%" paddingAngle={4} strokeWidth={0} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}