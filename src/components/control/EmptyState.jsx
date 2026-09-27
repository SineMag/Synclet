import React from 'react';
import { ShieldCheck } from 'lucide-react';

export default function EmptyState() {
  return (
    <section className="flex flex-col items-center justify-center text-center p-10 min-h-[320px]">
      <div className="w-14 h-14 border border-safe/40 rounded-full flex items-center justify-center">
        <ShieldCheck className="w-7 h-7 text-safe" />
      </div>
      <h2 className="mt-4 font-mono tracking-[0.2em] text-sm">NO ACTIVE INCIDENTS</h2>
      <p className="mt-1 text-sm text-muted-foreground">New incidents saved from Synclet in this browser appear here.</p>
    </section>
  );
}
