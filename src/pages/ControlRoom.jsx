import React from 'react';
import { Link } from 'react-router-dom';
import { Lock } from 'lucide-react';
import useCurrentUser from '@/hooks/useCurrentUser';
import ControlShell from '@/components/control/ControlShell';

export default function ControlRoom() {
  const { data: user, isLoading } = useCurrentUser();
  return (
    <div className="dark min-h-screen bg-background text-foreground font-body">
      {isLoading ? (
        <p className="p-10 font-mono text-sm text-muted-foreground">CONNECTING…</p>
      ) : user?.role === 'admin' ? (
        <ControlShell officer={user} />
      ) : (
        <div className="min-h-screen flex flex-col items-center justify-center gap-3 text-center p-6">
          <Lock className="w-8 h-8 text-muted-foreground" />
          <h1 className="font-mono tracking-[0.2em] text-sm">RESTRICTED</h1>
          <p className="text-sm text-muted-foreground max-w-sm">The Security Control Room is only available to security officers (admin accounts).</p>
          <Link to="/app" className="text-sm text-primary underline underline-offset-4">Back to Synclet</Link>
        </div>
      )}
    </div>
  );
}