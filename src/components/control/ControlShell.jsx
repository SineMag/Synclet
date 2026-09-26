import React from 'react';
import { NavLink, Outlet, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { LayoutDashboard, Siren, ListChecks, Database, ScrollText, BarChart3, Bell, Settings, ShieldHalf } from 'lucide-react';
import { isOpen } from '@/lib/synclet/incidentService';

export default function ControlShell({ officer }) {
  const { data: incidents = [] } = useQuery({ queryKey: ['cr-incidents'], queryFn: () => base44.entities.Incident.list('-created_date', 100) });
  const { data: tasks = [] } = useQuery({ queryKey: ['cr-tasks'], queryFn: () => base44.entities.Task.list('created_date', 50) });

  const active = incidents.filter((i) => isOpen(i.status)).length;
  const openTasks = tasks.filter((t) => t.status === 'TODO').length;
  const dayAgo = Date.now() - 86400000;
  const recentEvents = incidents.flatMap((i) => i.timeline || []).filter((e) => new Date(e.at).getTime() > dayAgo).length;

  const NAV = [
    { to: '/control', label: 'Dashboard', Icon: LayoutDashboard, end: true },
    { to: '/control/incidents', label: 'Incidents', Icon: Siren, badge: active },
    { to: '/control/tasks', label: 'Tasks', Icon: ListChecks, badge: openTasks },
    { to: '/control/data', label: 'Data', Icon: Database },
    { to: '/control/audit', label: 'Audit Logs', Icon: ScrollText },
    { to: '/control/stats', label: 'Stats', Icon: BarChart3 },
    { to: '/control/notifications', label: 'Notifications', Icon: Bell, badge: recentEvents },
  ];

  const item = ({ isActive }) =>
    `flex items-center gap-3 px-3 py-2 rounded-sm text-sm transition-colors ${isActive ? 'bg-secondary text-foreground font-medium' : 'text-muted-foreground hover:text-foreground hover:bg-secondary/60'}`;

  return (
    <div className="flex min-h-screen lg:h-screen">
      <aside className="hidden lg:flex w-56 shrink-0 flex-col border-r border-border bg-card sticky top-0 h-screen">
        <Link to="/control" className="flex items-center gap-2 px-4 h-14 border-b border-border">
          <ShieldHalf className="w-5 h-5 text-primary" />
          <span className="font-mono text-sm font-semibold tracking-[0.18em]">SYNCLET</span>
        </Link>
        <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
          {NAV.map(({ to, label, Icon, badge, end }) => (
            <NavLink key={to} to={to} end={end} className={item}>
              <Icon className="w-4 h-4 shrink-0" />
              <span className="flex-1">{label}</span>
              {badge > 0 && <span className="text-[10px] font-mono bg-critical/20 text-critical border border-critical/40 rounded-sm px-1.5">{badge}</span>}
            </NavLink>
          ))}
        </nav>
        <div className="p-3 border-t border-border space-y-0.5">
          <NavLink to="/control/settings" className={item}><Settings className="w-4 h-4" /><span className="flex-1">Settings</span></NavLink>
          <div className="px-3 pt-2 text-[10px] font-mono leading-relaxed text-muted-foreground">
            {officer.full_name || 'Officer'}<br />ROLE: ADMIN · <span className="text-safe">ON DUTY</span>
          </div>
        </div>
      </aside>
      <div className="flex-1 flex flex-col lg:min-h-0">
        <nav className="lg:hidden flex items-center gap-1 px-2 h-12 border-b border-border overflow-x-auto shrink-0">
          <Link to="/control" className="flex items-center gap-1.5 px-2 py-1.5 font-mono text-xs tracking-wider shrink-0">
            <ShieldHalf className="w-4 h-4 text-primary" />SYNCLET
          </Link>
          {[...NAV, { to: '/control/settings', label: 'Settings', Icon: Settings }].map(({ to, label, Icon, badge, end }) => (
            <NavLink key={to} to={to} end={end} className={({ isActive }) => `flex items-center gap-1.5 px-2 py-1.5 rounded-sm text-xs whitespace-nowrap shrink-0 ${isActive ? 'bg-secondary text-foreground' : 'text-muted-foreground'}`}>
              <Icon className="w-4 h-4" />{label}{badge > 0 && <span className="text-critical font-mono">·{badge}</span>}
            </NavLink>
          ))}
        </nav>
        <main className="flex-1 lg:overflow-y-auto lg:min-h-0"><Outlet /></main>
      </div>
    </div>
  );
}