import React from 'react';
import useCurrentUser from '@/hooks/useCurrentUser';
import ProfileForm from '@/components/mobile/ProfileForm';
import ContactsManager from '@/components/mobile/ContactsManager';

export default function Profile() {
  const { data: user } = useCurrentUser();
  return (
    <div className="px-5 pt-6 pb-8 space-y-5">
      <header>
        <p className="text-[11px] font-mono uppercase tracking-[0.14em] text-muted-foreground">Profile</p>
        <h1 className="text-2xl font-semibold mt-1 tracking-tight">You & your people</h1>
      </header>
      <ProfileForm user={user} />
      <ContactsManager user={user} />
    </div>
  );
}