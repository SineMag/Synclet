import React, { useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import DeviceProvider from '@/components/mobile/DeviceProvider';
import ConnectionStrip from '@/components/mobile/ConnectionStrip';
import BottomNav from '@/components/mobile/BottomNav';
import EmergencyOverlay from '@/components/mobile/EmergencyOverlay';
import HardwareEmergencyBridge from '@/components/mobile/HardwareEmergencyBridge';
import useCurrentUser from '@/hooks/useCurrentUser';
import useConnection from '@/hooks/useConnection';
import useMyIncidents from '@/hooks/useMyIncidents';
import usePendingQueue from '@/hooks/usePendingQueue';
import { flushQueue } from '@/lib/synclet/incidentService';

export default function MobileLayout() {
  const { data: user } = useCurrentUser();
  const { connected } = useConnection();
  const pending = usePendingQueue();
  const qc = useQueryClient();
  useMyIncidents(user, { live: true });

  useEffect(() => {
    if (connected && pending > 0) flushQueue().then(() => qc.invalidateQueries({ queryKey: ['my-incidents'] }));
  }, [connected, pending]);

  return (
    <DeviceProvider>
      <div className="min-h-screen bg-secondary sm:py-8 flex justify-center">
        <div className="relative w-full sm:max-w-[400px] h-[100dvh] sm:h-[820px] bg-background sm:border sm:border-border sm:rounded-[28px] overflow-hidden flex flex-col sm:shadow-2xl">
          <ConnectionStrip connected={connected} pending={pending} />
          <main className="flex-1 overflow-y-auto">
            {user ? <Outlet /> : <div className="p-10 text-center text-sm text-muted-foreground">Loading…</div>}
          </main>
          <BottomNav />
          {user && <HardwareEmergencyBridge />}
          {user && <EmergencyOverlay user={user} />}
        </div>
      </div>
    </DeviceProvider>
  );
}