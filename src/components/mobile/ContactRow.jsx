import React from 'react';
import { Phone, Pencil, Trash2, Star } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';

export default function ContactRow({ contact, onEdit, onDelete, onPrimary }) {
  const btn = 'p-2 rounded-sm text-muted-foreground hover:text-foreground hover:bg-secondary';
  return (
    <li className="flex items-center justify-between py-3 border-b border-border last:border-0">
      <div>
        <p className="font-semibold text-sm uppercase tracking-wide">{contact.name}</p>
        <p className="text-sm font-mono">{contact.phone}</p>
        <p className="text-xs text-muted-foreground">
          {contact.relationship || 'Contact'} · Primary: {contact.is_primary ? <b className="text-foreground">YES</b> : 'No'}
        </p>
      </div>
      <div className="flex">
        <button className={btn} aria-label="Simulate call" onClick={() => toast({ title: `Simulated call to ${contact.name}`, description: 'Prototype only — no real call placed.' })}><Phone className="w-4 h-4" /></button>
        {!contact.is_primary && <button className={btn} aria-label="Set primary" onClick={onPrimary}><Star className="w-4 h-4" /></button>}
        <button className={btn} aria-label="Edit" onClick={onEdit}><Pencil className="w-4 h-4" /></button>
        <button className={btn} aria-label="Delete" onClick={onDelete}><Trash2 className="w-4 h-4" /></button>
      </div>
    </li>
  );
}