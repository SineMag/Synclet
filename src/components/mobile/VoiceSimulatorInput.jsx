import React, { useState } from 'react';
import { Send } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

const PRESETS = ['Synclet, I am in danger.', 'Synclet, call my mom, I am in danger.', "Synclet, I'm not safe.", 'Synclet, cancel alert.', 'Synclet, device status.'];

export default function VoiceSimulatorInput({ onSubmit, disabled }) {
  const [text, setText] = useState('');
  const submit = (value) => {
    if (!value.trim()) return;
    onSubmit(value.trim());
    setText('');
  };
  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-1.5">
        {PRESETS.map((p) => (
          <button key={p} disabled={disabled} onClick={() => submit(p)} className="text-xs border border-border rounded-sm px-2 py-1 hover:bg-secondary disabled:opacity-50 text-left">
            {p}
          </button>
        ))}
      </div>
      <form onSubmit={(e) => { e.preventDefault(); submit(text); }} className="flex gap-2">
        <Input value={text} onChange={(e) => setText(e.target.value)} placeholder='What the user says, e.g. "Synclet, help me"' />
        <Button type="submit" size="icon" disabled={disabled} aria-label="Send to voice pipeline"><Send className="w-4 h-4" /></Button>
      </form>
    </div>
  );
}