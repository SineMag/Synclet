import React from 'react';
import { ShieldCheck, ShieldOff } from 'lucide-react';

export default function SafetyStatus({ connected }) {
  return (
    <div className={`border rounded-md p-5 flex items-center gap-4 ${connected ? 'border-safe/30 bg-safe/5' : 'border-warn/40 bg-warn/5'}`}>
      <div className={`w-12 h-12 rounded-full flex items-center justify-center ${connected ? 'bg-safe/10 text-safe' : 'bg-warn/10 text-warn'}`}>
        {connected ? <ShieldCheck className="w-6 h-6" /> : <ShieldOff className="w-6 h-6" />}
      </div>
      <div>
        <p className={`font-mono text-sm font-semibold tracking-[0.2em] ${connected ? 'text-safe' : 'text-warn'}`}>
          {connected ? 'SAFE' : 'NOT MONITORING'}
        </p>
        <p className="text-sm text-muted-foreground mt-0.5">
          {connected ? 'Your Synclet device is monitoring.' : 'Device disconnected — reconnect from the Device tab.'}
        </p>
      </div>
    </div>
  );
}