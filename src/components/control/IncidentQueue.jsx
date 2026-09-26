import React, { useState } from 'react';
import { ShieldCheck } from 'lucide-react';
import IncidentCard from '@/components/control/IncidentCard';
import { isOpen } from '@/lib/synclet/incidentService';

export default function IncidentQueue({ incidents, selectedId, onSelect }) {
  const [tab, setTab] = useState('active');
  const active = incidents.filter((i) => isOpen(i.status));
  const history = incidents.filter((i) => !isOpen(i.status));
  const list = tab === 'active' ? active : history;
  const tabCls = (t) => `flex-1 py-3 text-[11px] font-mono tracking-[0.14em] border-b-2 ${tab === t ? 'border-primary text-foreground' : 'border-transparent text-muted-foreground hover:text-foreground'}`;

  return (
    <aside className="border-r border-border flex flex-col lg:min-h-0 bg-card/40">
      <div className="flex border-b border-border shrink-0">
        <button className={tabCls('active')} onClick={() => setTab('active')}>ACTIVE INCIDENTS ({active.length})</button>
        <button className={tabCls('history')} onClick={() => setTab('history')}>HISTORY ({history.length})</button>
      </div>
      <div className="flex-1 lg:overflow-y-auto">
        {list.map((i) => <IncidentCard key={i.id} incident={i} selected={i.id === selectedId} onSelect={onSelect} />)}
        {list.length === 0 && (
          <div className="p-8 text-center">
            <ShieldCheck className="w-6 h-6 text-safe mx-auto" />
            <p className="mt-2 font-mono text-xs tracking-[0.14em]">{tab === 'active' ? 'NO ACTIVE INCIDENTS' : 'NO HISTORY YET'}</p>
          </div>
        )}
      </div>
    </aside>
  );
}