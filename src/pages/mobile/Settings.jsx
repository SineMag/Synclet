import React from 'react';
import { Link } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { MonitorDot, Layers } from 'lucide-react';
import useCurrentUser, { saveMe } from '@/hooks/useCurrentUser';
import Section from '@/components/mobile/Section';
import SettingToggle from '@/components/mobile/SettingToggle';
import { SETTINGS_GROUPS } from '@/components/mobile/settingsGroups';
import { getSettings } from '@/lib/synclet/constants';

export default function Settings() {
  const { data: user } = useCurrentUser();
  const queryClient = useQueryClient();
  const settings = getSettings(user);

  const save = (next) => {
    queryClient.setQueryData(['me'], { ...user, synclet_settings: next });
    saveMe(queryClient, { synclet_settings: next });
  };
  const setField = (group, field, value) => save({ ...settings, [group]: { ...settings[group], [field]: value } });
  const link = 'flex items-center gap-3 py-3 border-b border-border last:border-0 text-sm font-medium';

  return (
    <div className="px-5 pt-6 pb-8 space-y-5">
      <header>
        <p className="text-[11px] font-mono uppercase tracking-[0.14em] text-muted-foreground">Settings</p>
        <h1 className="text-2xl font-semibold mt-1 tracking-tight">Preferences</h1>
      </header>
      <Section title="Interface">
        <SettingToggle label="Sensor interface checks" description="Show generated sensor controls to check the interface. These are not live device readings." checked={settings.showSignalControls} onChange={(value) => save({ ...settings, showSignalControls: value })} />
      </Section>
      {SETTINGS_GROUPS.map((group) => (
        <Section key={group.key} title={group.title}>
          {group.items.map(([field, label, description]) => (
            <SettingToggle key={field} label={label} description={description} checked={settings[group.key][field]} onChange={(value) => setField(group.key, field, value)} />
          ))}
        </Section>
      ))}
      <Section title="More">
        {user.role === 'admin' && <Link to="/control" className={link}><MonitorDot className="w-4 h-4" />Open Security Control Room</Link>}
        <Link to="/architecture" className={link}><Layers className="w-4 h-4" />Architecture & hardware setup</Link>
        <p className="pt-3 text-xs text-muted-foreground">Incident and profile data are stored in this browser. Use browser settings to clear local data.</p>
      </Section>
    </div>
  );
}
