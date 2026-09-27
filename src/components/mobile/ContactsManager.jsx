import React, { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { base44 } from '@/api/base44Client';
import Section from '@/components/mobile/Section';
import ContactForm from '@/components/mobile/ContactForm';
import ContactRow from '@/components/mobile/ContactRow';
import useContacts from '@/hooks/useContacts';

export default function ContactsManager({ user }) {
  const qc = useQueryClient();
  const { data: contacts = [], isLoading } = useContacts(user);
  const [editing, setEditing] = useState(null); // null | 'new' | contact
  const refresh = () => qc.invalidateQueries({ queryKey: ['contacts', user.id] });
  const Contact = base44.entities.EmergencyContact;

  const save = async (form) => {
    if (editing === 'new') await Contact.create({ ...form, is_primary: contacts.length === 0 });
    else await Contact.update(editing.id, form);
    setEditing(null);
    refresh();
  };
  const remove = async (c) => { await Contact.delete(c.id); refresh(); };
  const makePrimary = async (c) => {
    await Promise.all(contacts.filter((x) => x.is_primary).map((x) => Contact.update(x.id, { is_primary: false })));
    await Contact.update(c.id, { is_primary: true });
    refresh();
  };

  return (
    <Section title="Emergency contacts" aside={editing !== 'new' && <Button size="sm" variant="ghost" onClick={() => setEditing('new')}><Plus className="w-4 h-4 mr-1" />Add</Button>}>
      {editing === 'new' && <ContactForm onSave={save} onCancel={() => setEditing(null)} />}
      {isLoading && <p className="text-sm text-muted-foreground">Loading…</p>}
      {!isLoading && contacts.length === 0 && editing !== 'new' && <p className="text-sm text-muted-foreground">No contacts yet. Your first contact becomes primary.</p>}
      <ul>
        {contacts.map((c) =>
          editing?.id === c.id ? (
            <li key={c.id} className="py-2"><ContactForm contact={c} onSave={save} onCancel={() => setEditing(null)} /></li>
          ) : (
            <ContactRow key={c.id} contact={c} onEdit={() => setEditing(c)} onDelete={() => remove(c)} onPrimary={() => makePrimary(c)} />
          )
        )}
      </ul>
    </Section>
  );
}