import React from 'react';
import { Contact } from '../../shared/types';

export type SortKey = 'name' | 'company' | 'city' | 'updated';

interface ContactListProps {
  contacts: Contact[];
  selectedId: number | null;
  onSelect: (id: number) => void;
  sortKey: SortKey;
  onSortChange: (key: SortKey) => void;
}

const SORTS: { key: SortKey; label: string }[] = [
  { key: 'name', label: 'Name' },
  { key: 'company', label: 'Company' },
  { key: 'city', label: 'City' },
  { key: 'updated', label: 'Updated' }
];

export function ContactList({
  contacts,
  selectedId,
  onSelect,
  sortKey,
  onSortChange
}: ContactListProps): JSX.Element {
  return (
    <div className="list-panel">
      <div className="list-header">
        <span>Sort:</span>
        {SORTS.map((s) => (
          <button
            key={s.key}
            className={sortKey === s.key ? 'active' : ''}
            onClick={() => onSortChange(s.key)}
          >
            {s.label}
          </button>
        ))}
      </div>
      {contacts.length === 0 && <div className="empty">No contacts</div>}
      {contacts.map((c) => (
        <div
          key={c.id}
          className={`contact-row ${selectedId === c.id ? 'selected' : ''}`}
          onClick={() => onSelect(c.id!)}
        >
          {c.favorite ? <span className="star">★</span> : null}
          <div className="name">
            {c.last_name || c.first_name
              ? `${c.last_name}${c.last_name && c.first_name ? ', ' : ''}${c.first_name}`
              : '(no name)'}
          </div>
          <div className="sub">
            {[c.title, c.company].filter(Boolean).join(' · ') || c.email_1 || '—'}
          </div>
        </div>
      ))}
    </div>
  );
}
