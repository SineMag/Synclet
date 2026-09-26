import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ShieldHalf, Volume2, VolumeX } from 'lucide-react';
import { unlockAudio, playAlarm } from '@/lib/synclet/alertSound';

function Stat({ label, children, tone = '' }) {
  return (
    <div className="hidden md:block">
      <p className="text-[9px] text-muted-foreground tracking-[0.18em]">{label}</p>
      <p className={`text-xs font-semibold ${tone}`}>{children}</p>
    </div>
  );
}

export default function TopBar({ connected, officerName, activeCount }) {
  const [now, setNow] = useState(new Date());
  const [audio, setAudio] = useState(false);
  useEffect(() => { const t = setInterval(() => setNow(new Date()), 1000); return () => clearInterval(t); }, []);

  const enableAudio = () => { unlockAudio(); setAudio(true); setTimeout(playAlarm, 50); };

  return (
    <header className="h-14 shrink-0 border-b border-border bg-card flex items-center px-4 gap-6 font-mono uppercase">
      <Link to="/app" className="flex items-center gap-2">
        <ShieldHalf className="w-5 h-5 text-primary" />
        <span className="text-sm font-semibold tracking-[0.2em]">SYNCLET</span>
        <span className="hidden xl:inline text-[11px] tracking-[0.2em] text-muted-foreground">Security Control Room</span>
      </Link>
      <div className="ml-auto flex items-center gap-6">
        <Stat label="Connection" tone={connected ? 'text-safe' : 'text-warn'}>{connected ? '● Online' : '○ Offline · reconnecting'}</Stat>
        <Stat label="Officer">{officerName} · <span className="text-safe">On duty</span></Stat>
        <Stat label="Active incidents" tone={activeCount ? 'text-critical' : ''}>{activeCount}</Stat>
        <button onClick={enableAudio} className={`flex items-center gap-1.5 text-[11px] border px-2 py-1 rounded-sm ${audio ? 'border-safe/50 text-safe' : 'border-warn/50 text-warn'}`}>
          {audio ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
          {audio ? 'Audio on' : 'Enable audio'}
        </button>
        <span className="text-lg tabular-nums">{now.toLocaleTimeString('en-GB')}</span>
      </div>
    </header>
  );
}