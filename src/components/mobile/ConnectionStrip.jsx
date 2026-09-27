import React from 'react';

export default function ConnectionStrip() {
  return (
    <div className="shrink-0 border-b border-border px-5 py-2.5">
      <div className="flex items-center justify-between gap-3 text-[10px] font-mono uppercase tracking-wider">
        <span className="text-muted-foreground">SYNCLET</span>
        <span className="flex items-center gap-1.5 text-muted-foreground">
          <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground" />Local browser storage
        </span>
      </div>
    </div>
  );
}
