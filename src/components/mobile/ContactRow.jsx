import React from 'react';
import { Phone, Pencil, Trash2, Star } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';

export default function ContactRow({ contact, onEdit, onDelete, onPrimary }) {
  const buttonClass = 'p-2 rounded-sm text-muted-foreground hover:text-foreground hover:bg-secondary';
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
        <button type="button" className={buttonClass} aria-label="Show contact number" onClick={() => toast({ title: contact.phone, description: 'Synclet does not place calls.' })}><Phone className="w-4 h-4" /></button>
        {!contact.is_primary && <button type="button" className={buttonClass} aria-label="Set primary" onClick={onPrimary}><Star className="w-4 h-4" /></button>}
        <button type="button" className={buttonClass} aria-label="Edit" onClick={onEdit}><Pencil className="w-4 h-4" /></button>
        <button type="button" className={buttonClass} aria-label="Delete" onClick={onDelete}><Trash2 className="w-4 h-4" /></button>
      </div>
    </li>
  );
}
