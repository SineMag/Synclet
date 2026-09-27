import React, { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/use-toast';
import Section from '@/components/mobile/Section';
import { saveMe } from '@/hooks/useCurrentUser';

export default function ProfileForm({ user }) {
  const qc = useQueryClient();
  const [form, setForm] = useState({ display_name: user.display_name || user.full_name || '', phone: user.phone || '' });
  const [saving, setSaving] = useState(false);
  const initials = (form.display_name || '?').split(' ').map((w) => w[0]).slice(0, 2).join('').toUpperCase();

  const save = async (e) => {
    e.preventDefault();
    setSaving(true);
    await saveMe(qc, form);
    setSaving(false);
    toast({ title: 'Profile saved' });
  };

  return (
    <Section title="Profile">
      <form onSubmit={save} className="space-y-3">
        <div className="flex items-center gap-3">
          <div className="w-14 h-14 rounded-full bg-accent text-accent-foreground flex items-center justify-center font-semibold">{initials}</div>
          <p className="text-xs text-muted-foreground">Profile photo placeholder</p>
        </div>
        <div className="space-y-1.5"><Label>Full name</Label><Input value={form.display_name} onChange={(e) => setForm({ ...form, display_name: e.target.value })} /></div>
        <div className="space-y-1.5"><Label>Phone</Label><Input value={form.phone} placeholder="+27 …" onChange={(e) => setForm({ ...form, phone: e.target.value })} /></div>
        <div className="space-y-1.5"><Label>Email</Label><Input value={user.email} disabled /></div>
        <Button type="submit" className="w-full" disabled={saving}>{saving ? 'Saving…' : 'Save profile'}</Button>
      </form>
    </Section>
  );
}