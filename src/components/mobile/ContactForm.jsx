import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

export default function ContactForm({ contact, onSave, onCancel }) {
  const [form, setForm] = useState({ name: contact?.name || '', phone: contact?.phone || '', relationship: contact?.relationship || '' });
  const [saving, setSaving] = useState(false);
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    setSaving(true);
    await onSave(form);
    setSaving(false);
  };

  return (
    <form onSubmit={submit} className="space-y-2 border border-border rounded-md p-3 bg-secondary/50">
      <Input required placeholder="Name" value={form.name} onChange={set('name')} />
      <Input required placeholder="Phone (+27 …)" value={form.phone} onChange={set('phone')} />
      <Input placeholder="Relationship (e.g. Mother)" value={form.relationship} onChange={set('relationship')} />
      <div className="flex gap-2">
        <Button type="submit" size="sm" className="flex-1" disabled={saving}>{saving ? 'Saving…' : 'Save contact'}</Button>
        <Button type="button" size="sm" variant="ghost" onClick={onCancel}>Cancel</Button>
      </div>
    </form>
  );
}