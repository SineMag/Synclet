import React, { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Plus, Trash2, CheckCircle2, Circle, Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { audit } from '@/lib/synclet/incidentService';

const PRIORITY_TONE = { HIGH: 'text-critical', MEDIUM: 'text-warn', LOW: 'text-muted-foreground' };

export default function Tasks() {
  const qc = useQueryClient();
  const { data: tasks = [], isLoading } = useQuery({ queryKey: ['cr-tasks'], queryFn: () => base44.entities.Task.list('created_date', 50) });
  const [title, setTitle] = useState('');
  const [priority, setPriority] = useState('MEDIUM');
  const [busy, setBusy] = useState(false);
  const Task = base44.entities.Task;
  const refresh = () => qc.invalidateQueries({ queryKey: ['cr-tasks'] });

  const add = async (e) => {
    e.preventDefault();
    if (!title.trim()) return;
    setBusy(true);
    const t = await Task.create({ title: title.trim(), priority, status: 'TODO' });
    audit('TASK_CREATED', 'Officer', `Task created: ${t.title}`, t.id);
    setTitle('');
    refresh();
    setBusy(false);
  };
  const toggle = async (t) => {
    await Task.update(t.id, { status: t.status === 'TODO' ? 'DONE' : 'TODO' });
    audit('TASK_UPDATED', 'Officer', `Task ${t.status === 'TODO' ? 'completed' : 'reopened'}: ${t.title}`, t.id);
    refresh();
  };
  const remove = async (t) => {
    await Task.delete(t.id);
    audit('TASK_DELETED', 'Officer', `Task deleted: ${t.title}`);
    refresh();
  };

  const open = tasks.filter((t) => t.status === 'TODO');
  const done = tasks.filter((t) => t.status === 'DONE');

  return (
    <div className="p-6 max-w-3xl space-y-6">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight">Officer tasks</h1>
        <p className="text-sm text-muted-foreground mt-1">Follow-ups, checks and admin work for the security team.</p>
      </header>
      <form onSubmit={add} className="flex gap-2">
        <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="New task, e.g. Follow up with user after incident" />
        <select value={priority} onChange={(e) => setPriority(e.target.value)} className="border border-input rounded-md bg-background text-sm px-2">
          {['LOW', 'MEDIUM', 'HIGH'].map((p) => <option key={p}>{p}</option>)}
        </select>
        <Button type="submit" size="icon" disabled={busy || !title.trim()} aria-label="Add task">{busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}</Button>
      </form>
      {isLoading && <p className="text-sm text-muted-foreground">Loading…</p>}
      {['Open', 'Done'].map((label) => (
        <section key={label}>
          <h2 className="text-[11px] font-mono uppercase tracking-[0.14em] text-muted-foreground mb-2">{label} ({label === 'Open' ? open.length : done.length})</h2>
          <ul className="border border-border rounded-md bg-card divide-y divide-border">
            {(label === 'Open' ? open : done).map((t) => (
              <li key={t.id} className="flex items-center gap-3 px-4 py-3">
                <button onClick={() => toggle(t)} aria-label="Toggle task">
                  {t.status === 'TODO' ? <Circle className="w-5 h-5 text-muted-foreground hover:text-foreground" /> : <CheckCircle2 className="w-5 h-5 text-safe" />}
                </button>
                <div className="flex-1">
                  <p className={`text-sm ${t.status === 'DONE' ? 'line-through text-muted-foreground' : ''}`}>{t.title}</p>
                  <p className={`text-[10px] font-mono mt-0.5 ${PRIORITY_TONE[t.priority]}`}>{t.priority}</p>
                </div>
                <button onClick={() => remove(t)} className="p-2 text-muted-foreground hover:text-critical" aria-label="Delete task"><Trash2 className="w-4 h-4" /></button>
              </li>
            ))}
            {(label === 'Open' ? open : done).length === 0 && <li className="px-4 py-3 text-sm text-muted-foreground">No {label.toLowerCase()} tasks.</li>}
          </ul>
        </section>
      ))}
    </div>
  );
}