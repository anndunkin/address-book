import React, { useMemo, useState } from 'react';
import { Contact } from '../../shared/types';
import { Modal } from './Modal';

interface MergeSearchDialogProps {
  source: Contact;
  candidates: Contact[];
  onPick: (contact: Contact) => void;
  onCancel: () => void;
}

export function MergeSearchDialog({
  source,
  candidates,
  onPick,
  onCancel
}: MergeSearchDialogProps): JSX.Element {
  const [query, setQuery] = useState('');

  const matches = useMemo(() => {
    const q = query.trim().toLowerCase();
    const pool = candidates.filter((c) => c.id !== source.id);
    if (!q) return pool.slice(0, 25);
    return pool
      .filter((c) =>
        [c.first_name, c.last_name, c.company, c.email_1, c.email_2]
          .join(' ')
          .toLowerCase()
          .includes(q)
      )
      .slice(0, 25);
  }, [query, candidates, source.id]);

  return (
    <Modal title={`Merge "${`${source.first_name} ${source.last_name}`.trim() || '(no name)'}" with…`} onClose={onCancel}>
      <input
        autoFocus
        className="merge-search-input"
        placeholder="Search by name or email"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />
      <div className="merge-search-results">
        {matches.length === 0 && <div className="empty">No matching contacts</div>}
        {matches.map((c) => (
          <div
            key={c.id}
            className="merge-search-row"
            onClick={() => onPick(c)}
          >
            <div className="name">
              {`${c.first_name} ${c.last_name}`.trim() || '(no name)'}
            </div>
            <div className="sub muted">
              {[c.email_1 || c.email_2, c.company].filter(Boolean).join(' · ') || '—'}
            </div>
          </div>
        ))}
      </div>
    </Modal>
  );
}
