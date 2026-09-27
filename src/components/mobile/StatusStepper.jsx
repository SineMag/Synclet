import React from 'react';
import { Check } from 'lucide-react';
import { STATUS_FLOW } from '@/lib/synclet/constants';

export default function StatusStepper({ status }) {
  const current = STATUS_FLOW.indexOf(status);
  return (
    <ol className="grid grid-cols-4 gap-1">
      {STATUS_FLOW.map((s, i) => {
        const done = i <= current;
        return (
          <li key={s} className="flex flex-col gap-1.5">
            <span className={`h-1 rounded-full transition-colors duration-500 ${done ? 'bg-foreground' : 'bg-border'}`} />
            <span className={`flex items-center gap-1 text-[9px] font-mono tracking-wider ${done ? 'text-foreground' : 'text-muted-foreground'}`}>
              {done && <Check className="w-3 h-3" />}
              {s}
            </span>
          </li>
        );
      })}
    </ol>
  );
}