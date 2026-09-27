import React from 'react';
import { Check, X } from 'lucide-react';

const STAGES = ['Microphone', 'Wake word', 'Speech', 'Intent', 'Action'];

export default function VoiceResult({ result }) {
  const reached = !result ? 0 : !result.wakeWordDetected ? 1 : result.intent === 'UNKNOWN' ? 3 : 5;
  return (
    <div className="border border-border rounded-md p-3 space-y-3">
      <ol className="flex items-center gap-1 text-[9px] font-mono uppercase tracking-wider">
        {STAGES.map((s, i) => (
          <li key={s} className={`flex-1 text-center py-1 border-b-2 ${i < reached ? 'border-primary text-foreground' : 'border-border text-muted-foreground'}`}>{s}</li>
        ))}
      </ol>
      {!result ? (
        <p className="text-xs text-muted-foreground">Waiting for "Synclet…"</p>
      ) : (
        <div className="space-y-1.5 text-sm">
          <p className="text-muted-foreground">Heard: <span className="text-foreground">"{result.rawText}"</span></p>
          <p className="flex items-center gap-1.5">
            {result.wakeWordDetected ? <Check className="w-4 h-4 text-safe" /> : <X className="w-4 h-4 text-critical" />}
            Wake word {result.wakeWordDetected ? 'detected' : 'not detected'}
          </p>
          {result.wakeWordDetected && (
            <p className="font-mono text-xs">
              intent: <b>{result.intent}</b> · confidence: {result.confidence}{result.contact && ` · contact: ${result.contact}`}
            </p>
          )}
          <p className={`text-sm font-medium ${result.ok ? 'text-foreground' : 'text-muted-foreground'}`}>→ {result.action}</p>
        </div>
      )}
    </div>
  );
}