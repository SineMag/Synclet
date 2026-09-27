import React from 'react';
import { FlaskConical, Cpu } from 'lucide-react';

export default function SimBadge({ label, real = false }) {
  const Icon = real ? Cpu : FlaskConical;
  return (
    <span className={`inline-flex items-center gap-1 border border-dashed px-1.5 py-0.5 text-[10px] font-mono uppercase tracking-wider rounded-sm whitespace-nowrap ${real ? 'border-safe/60 text-safe' : 'border-warn/60 text-warn'}`}>
      <Icon className="w-3 h-3" />
      {label || (real ? 'Real software' : 'Prototype simulation')}
    </span>
  );
}