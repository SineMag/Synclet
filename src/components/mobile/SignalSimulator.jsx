import React from 'react';
import Section from '@/components/mobile/Section';
import SimBadge from '@/components/mobile/SimBadge';
import { useDevice } from '@/components/mobile/DeviceProvider';
import { HR_MODES, assessSignals } from '@/lib/synclet/heartRateService';

const MOTIONS = { STILL: 'Still', WALKING: 'Walking', SUDDEN: 'Sudden movement' };

function Segmented({ options, value, onChange }) {
  return (
    <div className="grid grid-flow-col auto-cols-fr border border-border rounded-md overflow-hidden">
      {Object.entries(options).map(([key, label]) => (
        <button key={key} type="button" onClick={() => onChange(key)} aria-pressed={value === key} className={`py-2 text-xs font-medium transition-colors ${value === key ? 'bg-foreground text-background' : 'hover:bg-secondary'}`}>
          {label}
        </button>
      ))}
    </div>
  );
}

export default function SignalSimulator() {
  const { device, update } = useDevice();
  const hrOptions = Object.fromEntries(Object.entries(HR_MODES).map(([key, mode]) => [key, `${mode.label} ${mode.range}`]));
  const { level, reasons } = assessSignals(device);
  return (
    <Section title="Sensor interface checks" aside={<SimBadge label="Generated values" />}>
      <p className="text-xs text-muted-foreground mb-2">Heart rate (BPM)</p>
      <Segmented options={hrOptions} value={device.hrMode} onChange={(hrMode) => update({ hrMode })} />
      <p className="text-xs text-muted-foreground mt-4 mb-2">Motion</p>
      <Segmented options={MOTIONS} value={device.motion} onChange={(motion) => update({ motion })} />
      <div className="mt-4 border-t border-border pt-3 text-sm">
        <p>Combined signal: <span className="font-mono font-semibold">{level}</span></p>
        {reasons.map((reason) => <p key={reason} className="text-xs text-muted-foreground">• {reason}</p>)}
        <p className="text-[11px] text-muted-foreground mt-2">Generated values are not sensor readings or medical assessments.</p>
      </div>
    </Section>
  );
}
