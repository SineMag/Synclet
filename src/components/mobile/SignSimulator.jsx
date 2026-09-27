import React from 'react';
import Section from '@/components/mobile/Section';
import SimBadge from '@/components/mobile/SimBadge';
import { useDevice } from '@/components/mobile/DeviceProvider';
import { HR_MODES, assessSignals } from '@/lib/synclet/heartRateService';

const MOTIONS = { STILL: 'Still', WALKING: 'Walking', SUDDEN: 'Sudden movement' };

function Segmented({ options, value, onChange }) {
  return (
    <div className="grid grid-flow-col auto-cols-fr border border-border rounded-md overflow-hidden">
      {Object.entries(options).map(([k, label]) => (
        <button key={k} onClick={() => onChange(k)} className={`py-2 text-xs font-medium transition-colors ${value === k ? 'bg-foreground text-background' : 'hover:bg-secondary'}`}>
          {label}
        </button>
      ))}
    </div>
  );
}

export default function SignalSimulator() {
  const { device, update } = useDevice();
  const hrOptions = Object.fromEntries(Object.entries(HR_MODES).map(([k, m]) => [k, `${m.label} ${m.range}`]));
  const { level, reasons } = assessSignals(device);
  return (
    <Section title="Signal simulation" aside={<SimBadge label="Demo controls" />}>
      <p className="text-xs text-muted-foreground mb-2">Heart rate (BPM)</p>
      <Segmented options={hrOptions} value={device.hrMode} onChange={(hrMode) => update({ hrMode })} />
      <p className="text-xs text-muted-foreground mt-4 mb-2">Motion</p>
      <Segmented options={MOTIONS} value={device.motion} onChange={(motion) => update({ motion })} />
      <div className="mt-4 border-t border-border pt-3 text-sm">
        <p>Combined signal: <span className="font-mono font-semibold">{level}</span></p>
        {reasons.map((r) => <p key={r} className="text-xs text-muted-foreground">• {r}</p>)}
        <p className="text-[11px] text-muted-foreground mt-2">Prototype signal only — not a medical assessment. No single reading triggers an alert.</p>
      </div>
    </Section>
  );
}