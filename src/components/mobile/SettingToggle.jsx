import React from 'react';
import { Switch } from '@/components/ui/switch';

export default function SettingToggle({ label, description, checked, onChange }) {
  return (
    <label className="flex items-center justify-between gap-4 py-3 border-b border-border last:border-0 cursor-pointer">
      <span>
        <span className="block text-sm font-medium">{label}</span>
        <span className="block text-xs text-muted-foreground mt-0.5">{description}</span>
      </span>
      <Switch checked={checked} onCheckedChange={onChange} />
    </label>
  );
}