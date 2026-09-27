import React from 'react';
import { Link } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { MonitorDot, Layers, LogOut } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import useCurrentUser, { saveMe } from '@/hooks/useCurrentUser';
import Section from '@/components/mobile/Section';
import SettingToggle from '@/components/mobile/SettingToggle';
import { SETTINGS_GROUPS } from '@/components/mobile/settingsGroups';
import { getSettings } from '@/lib/synclet/constants';

export default function Settings() {
  const { data: user } = useCurrentUser();
  const qc = useQueryClient();
  const settings = getSettings(user);

  const save = (next) => {
    qc.setQueryData(['me'], { ...user, synclet_settings: next });
    saveMe(qc, { synclet_settings: next });
  };
  const setField = (group, field, value) => save({ ...settings, [group]: { ...settings[group], [field]: value } });
  const link = 'flex items-center gap-3 py-3 border-b border-border last:border-0 text-sm font-medium';

  return (
    <div className="px-5 pt-6 pb-8 space-y-5">
      <header>
        <p className="text-[11px] font-mono uppercase tracking-[0.14em] text-muted-foreground">Settings</p>
        <h1 className="text-2xl font-semibold mt-1 tracking-tight">Preferences</h1>
      </header>
      <Section title="Demo mode">
        <SettingToggle label="Presentation controls" description="Show simulated signal controls and label demo triggers." checked={settings.demoMode} onChange={(v) => save({ ...settings, demoMode: v })} />
      </Section>
      {SETTINGS_GROUPS.map((g) => (
        <Section key={g.key} title={g.title}>
          {g.items.map(([field, label, description]) => (
            <SettingToggle key={field} label={label} description={description} checked={settings[g.key][field]} onChange={(v) => setField(g.key, field, v)} />
          ))}
        </Section>
      ))}
      <Section title="More">
        {user.role === 'admin' && <Link to="/control" className={link}><MonitorDot className="w-4 h-4" />Open Security Control Room</Link>}
        <Link to="/architecture" className={link}><Layers className="w-4 h-4" />Architecture & hardware plan</Link>
        <button onClick={() => base44.auth.logout()} className={`${link} w-full text-critical`}><LogOut className="w-4 h-4" />Log out</button>
      </Section>
    </div>
  );
}