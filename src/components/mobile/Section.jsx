import React from 'react';

export default function Section({ title, aside, children, className = '' }) {
  return (
    <section className={`bg-card border border-border rounded-md ${className}`}>
      {title && (
        <header className="flex items-center justify-between gap-2 px-4 pt-4 pb-2">
          <h2 className="text-[11px] font-mono uppercase tracking-[0.14em] text-muted-foreground">{title}</h2>
          {aside}
        </header>
      )}
      <div className="px-4 pb-4">{children}</div>
    </section>
  );
}

export function Row({ label, value, tone = '' }) {
  return (
    <div className="flex items-center justify-between py-2.5 border-b border-border last:border-0 text-sm">
      <span className="text-muted-foreground">{label}</span>
      <span className={`font-medium text-right ${tone}`}>{value}</span>
    </div>
  );
}