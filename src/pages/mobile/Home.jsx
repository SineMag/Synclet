import React from 'react';
import { Link } from 'react-router-dom';
import { toast } from '@/components/ui/use-toast';
import useCurrentUser from '@/hooks/useCurrentUser';
import useEmergency from '@/hooks/useEmergency';
import { useDevice } from '@/components/mobile/DeviceProvider';
import SafetyStatus from '@/components/mobile/SafetyStatus';
import DeviceSummary from '@/components/mobile/DeviceSummary';
import HoldToAlert from '@/components/mobile/HoldToAlert';
import Section from '@/components/mobile/Section';

const greeting = () => {
  const hour = new Date().getHours();
  return hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';
};

export default function Home() {
  const { data: user } = useCurrentUser();
  const { device, hwMode, mqttState } = useDevice();
  const { trigger, sending } = useEmergency();
  const name = (user.display_name || user.full_name || 'there').split(' ')[0];

  const onTrigger = async () => {
    const result = await trigger({ triggerType: 'MANUAL' });
    if (result.queued) toast({ title: 'Alert saved on this browser', description: 'The local incident could not be saved just now. Check your connection.' });
  };

  return (
    <div className="px-5 pt-6 pb-8 space-y-5">
      <header>
        <p className="font-mono text-[11px] tracking-[0.3em] text-muted-foreground">SYNCLET</p>
        <h1 className="font-heading text-2xl font-semibold mt-2 tracking-tight">{greeting()}, {name}</h1>
      </header>
      <SafetyStatus connected={device.connected} mode={hwMode} />
      <DeviceSummary device={device} mode={hwMode} brokerConnected={mqttState.brokerConnected} />
      <Section title="Emergency">
        <HoldToAlert disabled={sending} onTrigger={onTrigger} />
        <p className="mt-3 text-xs text-muted-foreground leading-relaxed">
          You can also say <span className="text-foreground font-medium">"Synclet, I am in danger."</span> See{' '}
          <Link to="/app/safety" className="underline underline-offset-2 text-foreground">voice system</Link>.
        </p>
        <p className="mt-2 text-[11px] text-muted-foreground">Alerts are stored in this browser. No emergency service is contacted.</p>
      </Section>
    </div>
  );
}
