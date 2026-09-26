import React from 'react';

const STEPS = [
  'Sign in with an admin account on both screens (laptop and phone, or two browser windows).',
  'Screen 2 → open /control, go to Incidents in the sidebar and click "Enable audio". Confirm it shows NO ACTIVE INCIDENTS.',
  'Screen 1 → open /app. Show SAFE, device connected and a live heart rate of about 74 BPM.',
  'Safety tab → say "Synclet, I am in danger." with live listening on, or pick it in the simulated wearable microphone.',
  'The phone shows EMERGENCY ACTIVE · Security Control Room Notified. The control room sounds the alarm and the incident appears at the top.',
  'Click ACKNOWLEDGE → the phone shows "Security officer acknowledged your alert."',
  'Click RESPONDING → the phone shows "Response initiated." Try CONTACT USER and ESCALATE as well.',
  'Click RESOLVE → the phone shows "Incident resolved." Open the incident under History to show the full timeline.',
];

export default function DemoSteps() {
  return (
    <section>
      <h2 className="text-[11px] font-mono uppercase tracking-[0.14em] text-muted-foreground">Two-screen demo</h2>
      <ol className="mt-3 space-y-2">
        {STEPS.map((s, i) => (
          <li key={i} className="flex gap-3 text-sm">
            <span className="font-mono text-xs text-muted-foreground w-5 pt-0.5">{String(i + 1).padStart(2, '0')}</span>
            <span>{s}</span>
          </li>
        ))}
      </ol>
    </section>
  );
}