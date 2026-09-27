import React from 'react';
import { Outlet } from 'react-router-dom';
import DeviceProvider from '@/components/mobile/DeviceProvider';
import ConnectionStrip from '@/components/mobile/ConnectionStrip';
import BottomNav from '@/components/mobile/BottomNav';
import EmergencyOverlay from '@/components/mobile/EmergencyOverlay';
import HardwareEmergencyBridge from '@/components/mobile/HardwareEmergencyBridge';
import SosCountdown from '@/components/mobile/SosCountdown';
import useCurrentUser from '@/hooks/useCurrentUser';
import useMyIncidents from '@/hooks/useMyIncidents';

export default function MobileLayout() {
  const { data: user } = useCurrentUser();
  useMyIncidents(user, { live: true });

  return (
    <DeviceProvider>
      <div className="min-h-screen bg-secondary sm:py-8 flex justify-center">
        <div className="relative w-full sm:max-w-[400px] h-[100dvh] sm:h-[820px] bg-background sm:border sm:border-border sm:rounded-[28px] overflow-hidden flex flex-col sm:shadow-2xl">
          <ConnectionStrip />
          <main className="flex-1 overflow-y-auto">
            {user ? <Outlet /> : <div className="p-10 text-center text-sm text-muted-foreground">Loading…</div>}
          </main>
          <BottomNav />
          {user && <HardwareEmergencyBridge user={user} />}
          {user && <SosCountdown user={user} />}
          {user && <EmergencyOverlay user={user} />}
        </div>
      </div>
    </DeviceProvider>
  );
}