import React, { useEffect, useState } from 'react';
import { AlertTriangle, Timer } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { useDevice } from '@/components/mobile/DeviceProvider';
import useEmergency from '@/hooks/useEmergency';
import SosResponseActions from '@/components/mobile/SosResponseActions';
import useMyIncidents from '@/hooks/useMyIncidents';

const COUNTDOWN_MS = 15000;

export default function SosCountdown({ user }) {
  const { device, update } = useDevice();
  const { trigger } = useEmergency();
  const startedAt = device.sosCountdownStartedAt;
  const committedAt = device.hwEmergencyAt;
  const { data: incidents = [] } = useMyIncidents(user);
  const [now, setNow] = useState(() => Date.now());
  const [retrying, setRetrying] = useState(false);
  const incident = incidents.find((item) => item.id === device.hwEmergencyIncidentId);
  const visible = Boolean((startedAt || committedAt || incident) && incident?.user_check_in !== 'SAFE');

  useEffect(() => {
    if (!visible) return undefined;
    setNow(Date.now());
    const interval = window.setInterval(() => setNow(Date.now()), 250);
    return () => window.clearInterval(interval);
  }, [visible, startedAt, committedAt]);

  if (!visible) return null;

  const countdownRunning = Boolean(startedAt && !committedAt);
  const hardwareCancelled = Boolean(
    !startedAt && device.hwSosCancelledAt && device.hwSosCancelledAt > (committedAt || 0),
  );
  const elapsed = countdownRunning ? Math.min(COUNTDOWN_MS, Math.max(0, now - startedAt)) : COUNTDOWN_MS;
  const remainingSeconds = Math.ceil((COUNTDOWN_MS - elapsed) / 1000);
  const elapsedPercent = (elapsed / COUNTDOWN_MS) * 100;
  const countdownFinished = Boolean(committedAt || (countdownRunning && remainingSeconds === 0));
  const resetHardwareAlert = () => update({ hwEmergencyAt: null, hwEmergencyIncidentId: null, hwEmergencyError: '' });

  return (
    <AlertDialog open onOpenChange={() => {}}>
      <AlertDialogContent
        onEscapeKeyDown={(event) => event.preventDefault()}
        onPointerDownOutside={(event) => event.preventDefault()}
        className="w-[calc(100%-2rem)] max-w-sm gap-5 rounded-xl border border-critical/20 bg-background p-5 shadow-xl sm:p-6"
      >
        <div className="flex items-center gap-3">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-critical/10 text-critical">
            <AlertTriangle className="h-5 w-5" aria-hidden="true" />
          </span>
          <AlertDialogHeader className="space-y-1 text-left">
            <AlertDialogTitle className="text-base font-semibold">
              {startedAt || incident ? 'Are you okay?' : committedAt ? 'Safety check-in' : 'Safety alert countdown'}
            </AlertDialogTitle>
            <AlertDialogDescription className="text-xs leading-relaxed">
              {countdownFinished
                ? 'Your ESP32 countdown ended. Choose whether you are okay or need help.'
                : hardwareCancelled && incident
                  ? 'Your ESP32 countdown was cancelled. Tell the control room whether you are okay or need help.'
                  : countdownRunning && incident
                    ? 'Your ESP32 countdown is running. You can answer now.'
                    : committedAt
                      ? 'The ESP32 alert has been committed. Preparing your local incident record…'
                      : incident
                        ? 'Your alert is recorded locally. Choose whether you are okay or need help.'
                        : 'SOS button pressed on the ESP32.'}
            </AlertDialogDescription>
          </AlertDialogHeader>
        </div>

        {countdownRunning && (
          <div className="rounded-lg border border-critical/20 bg-critical/5 px-4 py-5 text-center">
            <Timer className="mx-auto h-5 w-5 text-critical" aria-hidden="true" />
            <p
              role="timer"
              aria-live="off"
              aria-label={countdownFinished ? 'Countdown finished; waiting for the ESP32' : `${remainingSeconds} seconds remaining`}
              className="mt-2 font-mono text-5xl font-semibold tabular-nums tracking-tight text-critical"
            >
              00:{String(remainingSeconds).padStart(2, '0')}
            </p>
            <p className="mt-2 text-sm font-medium text-foreground">
              {countdownFinished ? 'Waiting for the ESP32 to confirm…' : 'Press the hardware button again to cancel.'}
            </p>
            <Progress
              value={elapsedPercent}
              aria-label="Safety countdown progress"
              className="mt-4 h-1.5 bg-critical/10 [&>div]:bg-critical"
            />
          </div>
        )}

        {device.hwEmergencyError && (
          <div role="alert" className="space-y-2 rounded-md border border-critical/30 bg-critical/5 p-3 text-xs text-critical">
            <p>{device.hwEmergencyError}</p>
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={retrying}
              onClick={async () => {
                setRetrying(true);
                try {
                  const { incident: created } = await trigger({ triggerType: 'MANUAL' });
                  update({ hwEmergencyIncidentId: created.id || null, hwEmergencyError: '' });
                } catch (error) {
                  update({ hwEmergencyError: error.message || 'Could not record the hardware alert.' });
                } finally {
                  setRetrying(false);
                }
              }}
            >
              {retrying ? 'Retrying…' : 'Retry recording alert'}
            </Button>
          </div>
        )}

        {(incident || startedAt || committedAt) && (
          <SosResponseActions
            incident={incident}
            disabled={!incident?.id}
            countdownActive={countdownRunning && !countdownFinished}
            onCompleted={resetHardwareAlert}
          />
        )}

        {!committedAt && (
          <p className="text-center text-xs leading-relaxed text-muted-foreground">
            If you need immediate help, contact local emergency services directly. Synclet does not dispatch emergency services.
          </p>
        )}
      </AlertDialogContent>
    </AlertDialog>
  );
}
