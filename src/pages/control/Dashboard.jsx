import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Siren, CheckCircle2, Timer, ListChecks, ArrowRight, ShieldCheck } from 'lucide-react';
import { isOpen } from '@/lib/synclet/incidentService';
import { fmtTime } from '@/lib/synclet/format';
import IncidentCard from '@/components/control/IncidentCard';

function StatCard({ Icon, label, value, tone = 'text-foreground', to }) {
  return (
    <Link to={to} className="border border-border rounded-md p-4 bg-card hover:bg-secondary/50 transition-colors">
      <Icon className="w-4 h-4 text-muted-foreground" />
      <p className={`mt-2 text-2xl font-semibold tabular-nums ${tone}`}>{value}</p>
      <p className="text-xs text-muted-foreground mt-0.5">{label}</p>
    </Link>
  );
}

export default function Dashboard() {
  const navigate = useNavigate();
  const { data: incidents = [] } = useQuery({ queryKey: ['cr-incidents'], queryFn: () => base44.entities.Incident.list('-created_date', 100) });
  const { data: tasks = [] } = useQuery({ queryKey: ['cr-tasks'], queryFn: () => base44.entities.Task.list('created_date', 50) });

  const active = incidents.filter((i) => isOpen(i.status));
  const today = new Date().toDateString();
  const resolvedToday = incidents.filter((i) => i.resolved_at && new Date(i.resolved_at).toDateString() === today).length;
  const acks = incidents.filter((i) => i.triggered_at && i.acknowledged_at).map((i) => new Date(i.acknowledged_at) - new Date(i.triggered_at));
  const avgAck = acks.length ? acks.reduce((a, b) => a + b, 0) / acks.length / 1000 : null;
  const openTasks = tasks.filter((t) => t.status === 'TODO').length;
  const activity = incidents
    .flatMap((i) => (i.timeline || []).map((e) => ({ ...e, code: i.incident_code })))
    .sort((a, b) => new Date(b.at) - new Date(a.at))
    .slice(0, 8);

  return (
    <div className="p-6 space-y-6 max-w-6xl">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight">Control room overview</h1>
        <p className="text-sm text-muted-foreground mt-1">
          {new Date().toLocaleDateString('en-GB', { weekday: 'long', day: '2-digit', month: 'long' })}
        </p>
      </header>
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-3">
        <StatCard Icon={Siren} label="Active incidents" value={active.length} tone={active.length ? 'text-critical' : 'text-safe'} to="/control/incidents" />
        <StatCard Icon={CheckCircle2} label="Resolved today" value={resolvedToday} tone="text-safe" to="/control/data" />
        <StatCard Icon={Timer} label="Avg. acknowledge" value={avgAck != null ? `${Math.round(avgAck)}s` : '—'} to="/control/stats" />
        <StatCard Icon={ListChecks} label="Open tasks" value={openTasks} to="/control/tasks" />
      </div>
      <div className="grid lg:grid-cols-2 gap-6">
        <section>
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-[11px] font-mono uppercase tracking-[0.14em] text-muted-foreground">Active incidents</h2>
            <Link to="/control/incidents" className="flex items-center gap-1 text-xs text-primary hover:underline">Open console <ArrowRight className="w-3 h-3" /></Link>
          </div>
          <div className="border border-border rounded-md bg-card divide-y divide-border overflow-hidden">
            {active.length === 0 ? (
              <div className="p-6 flex flex-col items-center gap-2 text-center">
                <ShieldCheck className="w-6 h-6 text-safe" />
                <p className="font-mono text-xs tracking-[0.14em]">ALL CLEAR — NO ACTIVE INCIDENTS</p>
              </div>
            ) : (
              active.map((i) => <IncidentCard key={i.id} incident={i} onSelect={() => navigate('/control/incidents')} />)
            )}
          </div>
        </section>
        <section>
          <h2 className="text-[11px] font-mono uppercase tracking-[0.14em] text-muted-foreground mb-2">Recent activity</h2>
          <div className="border border-border rounded-md bg-card p-2">
            {activity.length === 0 && <p className="text-sm text-muted-foreground p-4">No activity yet.</p>}
            {activity.map((e, idx) => (
              <div key={e.at + idx} className="flex gap-3 px-2 py-2.5 border-b border-border last:border-0 text-sm">
                <span className="font-mono text-xs text-muted-foreground tabular-nums shrink-0 pt-0.5">{fmtTime(e.at)}</span>
                <div>
                  <p>{e.message}</p>
                  <p className="text-[10px] font-mono text-muted-foreground mt-0.5">{e.code} · {e.actor}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}