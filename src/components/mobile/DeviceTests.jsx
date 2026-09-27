import React, { useState } from 'react';
import {
  Activity,
  AudioLines,
  CheckCircle2,
  Fingerprint,
  Lightbulb,
  Loader2,
  Radio,
  Wifi,
  XCircle,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import Section from '@/components/mobile/Section';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { useDevice } from '@/components/mobile/DeviceProvider';
import { pingMqttDevice, setMqttLed } from '@/lib/synclet/mqttService';
import { biometricService } from '@/lib/synclet/biometricService';
import { HR_MODES } from '@/lib/synclet/heartRateService';
import { interpret } from '@/lib/synclet/voiceService';

export default function DeviceTests() {
  const { device, connect, disconnect, busy, hwMode, setHwMode, mqttState } = useDevice();
  const [log, setLog] = useState([]);
  const [running, setRunning] = useState(null);
  const simulation = hwMode === 'simulation';
  const connected = simulation ? device.connected : mqttState.brokerConnected;

  const tests = simulation
    ? [
        {
          id: 'device',
          name: 'Device link',
          description: 'Check the local simulation.',
          Icon: Radio,
          run: async () => device.connected
            ? [true, 'Interface simulation responds.']
            : [false, 'Start the interface simulation first.'],
        },
        {
          id: 'heart-rate',
          name: 'Heart-rate flow',
          description: 'Check generated BPM values.',
          Icon: Activity,
          run: async () => device.connected
            ? [true, `${device.heartRate} BPM (${HR_MODES[device.hrMode].label} range, simulated)`]
            : [false, 'Start the interface simulation first.'],
        },
        {
          id: 'fingerprint',
          name: 'Fingerprint flow',
          description: 'Preview the authentication state.',
          Icon: Fingerprint,
          run: async () => {
            const result = await biometricService.authenticateUser({ available: device.connected && device.fingerprintReady });
            return [result.ok, result.ok ? 'Fingerprint flow simulated.' : result.reason];
          },
        },
        {
          id: 'voice',
          name: 'Voice intent',
          description: 'Check a sample device-status phrase.',
          Icon: AudioLines,
          run: async () => device.connected
            ? [interpret('Synclet, device status').intent === 'DEVICE_STATUS', 'Voice intent flow is available while this page is open.']
            : [false, 'Start the interface simulation first.'],
        },
      ]
    : [
        {
          id: 'ping',
          name: 'Ping ESP32',
          description: 'Send a command and verify its reply.',
          Icon: Wifi,
          run: async () => {
            const result = await pingMqttDevice();
            return [true, `Firmware replied · ${result.device}`];
          },
        },
        {
          id: 'led-on',
          name: 'GPIO 2 LED on',
          description: 'Test the controllable output.',
          Icon: Lightbulb,
          run: async () => {
            const result = await setMqttLed(true);
            return [result.led === 'ON', 'ESP32 confirmed GPIO 2 output ON.'];
          },
        },
        {
          id: 'led-off',
          name: 'GPIO 2 LED off',
          description: 'Return the controllable output to off.',
          Icon: Lightbulb,
          run: async () => {
            const result = await setMqttLed(false);
            return [result.led === 'OFF', 'ESP32 confirmed GPIO 2 output OFF.'];
          },
        },
      ];

  const runTest = async (test) => {
    setRunning(test.id);
    try {
      const [ok, detail] = await test.run();
      setLog((items) => [{ id: `${test.id}-${Date.now()}`, name: test.name, ok, detail }, ...items].slice(0, 5));
    } catch (error) {
      setLog((items) => [{ id: `${test.id}-${Date.now()}`, name: test.name, ok: false, detail: error.message || 'Command failed.' }, ...items].slice(0, 5));
    } finally {
      setRunning(null);
    }
  };

  const connectOrDisconnect = async () => {
    try {
      if (device.connected || mqttState.brokerConnected) await disconnect();
      else await connect();
    } catch {
      // The provider keeps the connection failure message visible in this panel.
    }
  };

  const connectionLabel = simulation
    ? device.connected ? 'Simulation running' : 'Simulation stopped'
    : mqttState.brokerConnected ? device.connected ? 'ESP32 online' : 'Broker connected · waiting for ESP32' : 'Not connected';
  const connectionBadge = simulation
    ? device.connected ? 'Simulation active' : 'Simulation stopped'
    : device.connected ? 'ESP32 online' : mqttState.brokerConnected ? 'Broker online' : 'Offline';
  const connectionTone = simulation
    ? device.connected ? 'text-safe' : 'text-muted-foreground'
    : device.connected ? 'text-safe' : mqttState.brokerConnected ? 'text-warn' : 'text-muted-foreground';

  return (
    <Section
      title="Device checks"
      aside={(
        <Badge variant="outline" className={connectionTone}>
          <span className={`mr-1.5 h-1.5 w-1.5 rounded-full ${connectionTone === 'text-safe' ? 'bg-safe' : connectionTone === 'text-warn' ? 'bg-warn' : 'bg-muted-foreground/50'}`} />
          {connectionBadge}
        </Badge>
      )}
      className="overflow-hidden"
    >
      <div className="space-y-4">
        <ToggleGroup
          type="single"
          value={simulation ? 'simulation' : 'mqtt'}
          onValueChange={(value) => { if (value) setHwMode(value); }}
          aria-label="Device connection mode"
          className="grid w-full grid-cols-2 gap-0 overflow-hidden rounded-md border border-border"
        >
          <ToggleGroupItem value="simulation" className="h-10 w-full rounded-none text-xs data-[state=on]:bg-foreground data-[state=on]:text-background">
            <Activity className="h-3.5 w-3.5" aria-hidden="true" />
            Simulation
          </ToggleGroupItem>
          <ToggleGroupItem value="mqtt" className="h-10 w-full rounded-none text-xs data-[state=on]:bg-foreground data-[state=on]:text-background">
            <Radio className="h-3.5 w-3.5" aria-hidden="true" />
            ESP32 hardware
          </ToggleGroupItem>
        </ToggleGroup>

        <div className="rounded-md border border-border bg-muted/30 p-3">
          <div className="flex items-center gap-2">
            <span className={`h-2 w-2 rounded-full ${connected ? 'bg-safe' : 'bg-muted-foreground/40'}`} />
            <p className="text-sm font-medium">{connectionLabel}</p>
          </div>
          <p className="mt-1 pl-4 text-xs leading-relaxed text-muted-foreground">
            {simulation
              ? 'Synthetic sensor values are for interface checks only; they are not readings from your ESP32.'
              : device.connected
                ? `Live telemetry received from ${device.deviceId}.`
                : 'Connect the board to Wi-Fi and HiveMQ, then connect the app to the broker.'}
          </p>
          {!simulation && (
            <>
              <p className="mt-2 pl-4 text-[11px] leading-relaxed text-muted-foreground">
                Press a momentary button wired from GPIO 4 to GND to start the hardware countdown. The mobile app asks if you’re okay immediately and records your response in the control room.
              </p>
              <p className="mt-2 pl-4 text-[11px] leading-relaxed text-muted-foreground">
                Countdown flashes GPIO 2 only if a controllable LED is connected. The blue USB power light stays on and cannot be blinked.
              </p>
              <p className="mt-2 pl-4 text-[11px] leading-relaxed text-warn">
                The public broker is shared. Don’t send personal or emergency information through it.
              </p>
            </>
          )}
        </div>

        {mqttState.error && !simulation && (
          <p role="status" className="rounded-md border border-critical/20 bg-critical/5 px-3 py-2 text-xs leading-relaxed text-critical">
            {mqttState.error}
          </p>
        )}

        <Button variant={connected ? 'outline' : 'default'} className="w-full" disabled={busy} onClick={connectOrDisconnect}>
          {busy ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : <Radio className="h-4 w-4" aria-hidden="true" />}
          {busy ? 'Connecting…' : connected ? 'Disconnect' : simulation ? 'Start simulation' : 'Connect to MQTT'}
        </Button>

        <div>
          <p className="mb-2 text-[11px] font-mono uppercase tracking-[0.14em] text-muted-foreground">
            {simulation ? 'Simulation tests' : 'Hardware tests'}
          </p>
          <div className="grid grid-cols-1 gap-2">
            {tests.map((test) => (
              <Button
                key={test.id}
                type="button"
                variant="outline"
                disabled={!!running || (!simulation && !mqttState.brokerConnected)}
                onClick={() => runTest(test)}
                className="h-auto min-h-12 justify-start whitespace-normal px-3 py-2.5 text-left"
              >
                {running === test.id
                  ? <Loader2 className="h-4 w-4 shrink-0 animate-spin text-primary" aria-hidden="true" />
                  : <test.Icon className="h-4 w-4 shrink-0 text-muted-foreground" aria-hidden="true" />}
                <span className="min-w-0">
                  <span className="block text-xs font-medium">{running === test.id ? 'Checking…' : test.name}</span>
                  <span className="mt-0.5 block text-[11px] font-normal leading-snug text-muted-foreground">{test.description}</span>
                </span>
              </Button>
            ))}
          </div>
        </div>

        {log.length > 0 && (
          <div>
            <p className="mb-2 text-[11px] font-mono uppercase tracking-[0.14em] text-muted-foreground">Recent results</p>
            <ul className="space-y-2" aria-live="polite">
              {log.map((item) => (
                <li key={item.id} className="flex items-start gap-2 rounded-md border border-border px-3 py-2.5 text-xs">
                  {item.ok
                    ? <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-safe" aria-hidden="true" />
                    : <XCircle className="mt-0.5 h-4 w-4 shrink-0 text-critical" aria-hidden="true" />}
                  <span className="min-w-0 leading-relaxed">
                    <span className="font-medium">{item.name}</span>
                    <span className="text-muted-foreground"> · {item.detail}</span>
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </Section>
  );
}
