import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle2, LifeBuoy, MessageSquareText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import useEmergency from '@/hooks/useEmergency';

function smsDraftHref(phone, body) {
  const number = String(phone || '').replace(/[^\d+]/g, '');
  const separator = /iPhone|iPad|iPod/i.test(navigator.userAgent) ? '&' : '?';
  return `sms:${number}${separator}body=${encodeURIComponent(body)}`;
}

export default function SosResponseActions({ incident, countdownActive = false, disabled = false, onCompleted }) {
  const { checkIn } = useEmergency();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const contactAlerts = incident?.contact_alerts || [];

  const respond = async (response) => {
    setBusy(true);
    setError('');
    try {
      const result = await checkIn(incident, response);
      if (!result.ok) {
        setError(result.reason || 'Could not record your check-in. Please try again.');
        return;
      }
      if (response === 'SAFE') onCompleted?.();
    } catch (checkInError) {
      setError(checkInError.message || 'Could not record your check-in. Please try again.');
    } finally {
      setBusy(false);
    }
  };

  const safe = incident?.user_check_in === 'SAFE';
  const needsHelp = incident?.user_check_in === 'NEEDS_HELP';

  if (safe) {
    return (
      <div role="status" className="rounded-lg border border-safe/30 bg-safe/5 p-4 text-sm text-safe">
        <p className="flex items-center gap-2 font-semibold"><CheckCircle2 className="h-4 w-4" aria-hidden="true" />You confirmed you’re okay.</p>
        <p className="mt-1 text-xs leading-relaxed text-foreground">
          {incident.status === 'CANCELLED'
            ? 'The control room on this browser has been updated and this alert is closed.'
            : 'The control room on this browser has been updated. An in-progress response remains open until staff confirm it is safe to close.'}
        </p>
      </div>
    );
  }

  if (needsHelp) {
    const smsBody = `${incident.user_name} needs help. Synclet incident ${incident.incident_code}. Please contact them as soon as you can.`;
    return (
      <section aria-labelledby="sos-help-title" className="space-y-3 rounded-lg border border-critical/30 bg-critical/5 p-4">
        <div>
          <h2 id="sos-help-title" className="flex items-center gap-2 text-sm font-semibold text-critical">
            <LifeBuoy className="h-4 w-4" aria-hidden="true" />Help requested · control room updated
          </h2>
          <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
            Choose a contact to open a prefilled SMS. Review and send it in your messaging app; Synclet has not sent any messages.
          </p>
        </div>
        {contactAlerts.length > 0 ? (
          <ul className="space-y-2">
            {contactAlerts.map((contact) => (
              <li key={contact.id || contact.phone}>
                <Button asChild variant="outline" className="h-auto min-h-11 w-full justify-start whitespace-normal border-critical/30 px-3 py-2 text-left">
                  <a href={smsDraftHref(contact.phone, smsBody)}>
                    <MessageSquareText className="h-4 w-4 shrink-0 text-critical" aria-hidden="true" />
                    <span className="min-w-0">
                      <span className="block text-xs font-medium">Text {contact.name}</span>
                      <span className="block truncate text-[11px] font-normal text-muted-foreground">{contact.phone} · draft only</span>
                    </span>
                  </a>
                </Button>
              </li>
            ))}
          </ul>
        ) : (
          <div className="rounded-md border border-border bg-background p-3 text-xs leading-relaxed">
            <p>No emergency contacts were saved when you requested help.</p>
            <Link to="/app/profile" className="mt-2 inline-block font-medium text-primary underline underline-offset-4">Add an emergency contact</Link>
          </div>
        )}
        <p className="text-[11px] leading-relaxed text-muted-foreground">Contact details and this request are recorded locally for the control room. SMS delivery is not automatic.</p>
        <Button type="button" variant="ghost" className="w-full" onClick={onCompleted}>Continue to incident details</Button>
      </section>
    );
  }

  return (
    <section aria-labelledby="sos-checkin-title" className="space-y-3">
      <div>
        <h2 id="sos-checkin-title" className="text-base font-semibold">Are you okay?</h2>
        <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
          {disabled
            ? 'Your ESP32 countdown is running. Choose whether you are okay or need help; the buttons will be ready as soon as the incident is recorded.'
            : countdownActive
              ? 'Your alert is recorded locally. Tell the control room whether you are safe or need help. Your ESP32 countdown is still running; you can answer now.'
              : 'Your alert is recorded locally. Tell the control room whether you are safe or need help.'}
        </p>
      </div>
      <div className="grid gap-2">
        <Button
          type="button"
          variant="outline"
          className="h-12 justify-start border-safe/40 bg-safe/5 text-safe hover:bg-safe/10"
          disabled={busy || disabled}
          onClick={() => respond('SAFE')}
        >
          <CheckCircle2 className="h-4 w-4" aria-hidden="true" />Yes, I’m okay
        </Button>
        <Button
          type="button"
          variant="destructive"
          className="h-12 justify-start"
          disabled={busy || disabled}
          onClick={() => respond('NEEDS_HELP')}
        >
          <LifeBuoy className="h-4 w-4" aria-hidden="true" />No, I need help
        </Button>
      </div>
      {disabled && <p role="status" className="text-xs text-muted-foreground">Recording SOS incident for the control room…</p>}
      {busy && <p role="status" className="text-xs text-muted-foreground">Recording your response…</p>}
      {error && <p role="alert" className="text-xs text-critical">{error}</p>}
      <p className="text-[11px] leading-relaxed text-muted-foreground">This updates the Synclet control room in this browser. It does not contact emergency services.</p>
    </section>
  );
}
