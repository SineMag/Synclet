import React from 'react';

export default function ConnectionStrip({ connected, pending }) {
  return (
    <div className="shrink-0 border-b border-border">
      <div className="flex items-center justify-between px-5 h-10 text-[10px] font-mono uppercase tracking-wider">
        <span className="text-muted-foreground">Control room link</span>
        {connected ? (
          <span className="flex items-center gap-1.5 text-safe"><span className="w-1.5 h-1.5 rounded-full bg-safe" />Connected</span>
        ) : (
          <span className="flex items-center gap-1.5 text-warn"><span className="w-1.5 h-1.5 rounded-full border border-warn" />Disconnected · Reconnecting…</span>
        )}
      </div>
      {pending > 0 && (
        <p className="px-5 pb-2 text-[11px] text-warn">
          {pending} alert{pending > 1 ? 's' : ''} saved on this phone — sending when the connection returns.
        </p>
      )}
    </div>
  );
}