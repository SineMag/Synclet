import React, { useState } from 'react';
import { CheckCircle2, XCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Section from '@/components/mobile/Section';
import { useDevice } from '@/components/mobile/DeviceProvider';
import { bleService } from '@/lib/synclet/bleService';
import { biometricService } from '@/lib/synclet/biometricService';
import { interpret } from '@/lib/synclet/voiceService';
import { HR_MODES } from '@/lib/synclet/heartRateService';

export default function DeviceTests() {
  const { device, connect, disconnect, busy, hwMode, setHwMode } = useDevice();
  const realHw = hwMode === 'real';
  const [log, setLog] = useState([]);
  const [running, setRunning] = useState(null);
  const off = 'Unavailable — device disconnected.';

  const tests = {
    'Test Device': async () => {
      if (!device.connected) return [false, off];
      const r = await bleService.sendCommand('PING');
      return [r.ok, `Replied ${r.echo} · battery ${device.battery}%`];
    },
    'Test Heart Rate': async () =>
      device.connected ? [true, `${device.heartRate} BPM (${HR_MODES[device.hrMode].label} range)`] : [false, off],
    'Test Fingerprint': async () => {
      const r = await biometricService.authenticateUser({ available: device.connected && device.fingerprintReady });
      return [r.ok, r.ok ? `Fingerprint detected · identity verified (${r.matchScore})` : r.reason];
    },
    'Test Voice': async () => {
      if (!device.connected) return [false, off];
      const r = interpret('Synclet, device status');
      return [r.intent === 'DEVICE_STATUS', `"${r.rawText}" → ${r.intent} (${r.confidence})`];
    },
  };

  const run = async (name) => {
    setRunning(name);
    const [ok, detail] = await tests[name]();
    setLog((l) => [{ id: Date.now(), name, ok, detail }, ...l].slice(0, 5));
    setRunning(null);
  };

  return (
    <Section title="Diagnostics">
      <p className="text-xs text-muted-foreground mb-2">Hardware link</p>
      <div className="grid grid-cols-2 border border-border rounded-md overflow-hidden mb-3">
        <button onClick={() => setHwMode('sim')} className={`py-2 text-xs font-medium ${!realHw ? 'bg-foreground text-background' : 'hover:bg-secondary'}`}>Simulated device</button>
        <button onClick={() => setHwMode('real')} className={`py-2 text-xs font-medium ${realHw ? 'bg-foreground text-background' : 'hover:bg-secondary'}`}>Real ESP32 (Chrome)</button>
      </div>
      {realHw && (
        <p className="text-[11px] text-muted-foreground mb-3">
          Chrome/Edge over HTTPS only. Pairing opens the browser's device picker — your wearable must advertise a name starting with "Synclet". Heart rate + battery use standard Bluetooth services; the emergency button uses the custom service on the Architecture page.
        </p>
      )}
      <div className="grid grid-cols-2 gap-2">
        {Object.keys(tests).map((name) => (
          <Button key={name} variant="outline" size="sm" disabled={!!running} onClick={() => run(name)}>
            {running === name && <Loader2 className="w-3.5 h-3.5 mr-1 animate-spin" />}{name}
          </Button>
        ))}
      </div>
      <Button variant={device.connected ? 'ghost' : 'default'} className="w-full mt-2" disabled={busy} onClick={device.connected ? disconnect : connect}>
        {busy ? 'Working…' : device.connected ? 'Disconnect' : realHw ? 'Pair real device' : 'Scan & connect'}
      </Button>
      <ul className="mt-3 space-y-2">
        {log.map((l) => (
          <li key={l.id} className="flex gap-2 text-xs">
            {l.ok ? <CheckCircle2 className="w-4 h-4 text-safe shrink-0" /> : <XCircle className="w-4 h-4 text-critical shrink-0" />}
            <span><span className="font-medium">{l.name}:</span> {l.detail}</span>
          </li>
        ))}
      </ul>
    </Section>
  );
}