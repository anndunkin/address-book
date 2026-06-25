import React, { useMemo, useState } from 'react';
import { Contact, NewContact, MERGE_FIELDS } from '../../shared/types';
import {
  MergeSelection,
  defaultSelection,
  smartSelection,
  buildMergedData
} from '../../shared/merge';

interface MergeDialogProps {
  contactA: Contact;
  contactB: Contact;
  onMerge: (primaryId: number, secondaryId: number, mergedData: NewContact) => void;
  onCancel: () => void;
}

const text = (c: Contact, key: keyof Contact): string => {
  const v = c[key];
  return v == null ? '' : String(v);
};

function headline(c: Contact): { name: string } {
  return {
    name: `${c.first_name} ${c.last_name}`.trim() || '(no name)'
  };
}

export function MergeDialog({
  contactA,
  contactB,
  onMerge,
  onCancel
}: MergeDialogProps): JSX.Element {
  const [selection, setSelection] = useState<MergeSelection>(() =>
    defaultSelection(contactA, contactB)
  );

  const setAll = (choice: 'A' | 'B') => {
    const next: MergeSelection = {};
    for (const { key } of MERGE_FIELDS) next[key] = choice;
    setSelection(next);
  };

  const mergedData = useMemo(
    () => buildMergedData(contactA, contactB, selection),
    [contactA, contactB, selection]
  );

  const preview = useMemo(() => {
    const name = `${mergedData.first_name ?? ''} ${mergedData.last_name ?? ''}`.trim();
    return [name, mergedData.company, mergedData.title, mergedData.email_1]
      .map((s) => (s ? String(s) : ''))
      .filter(Boolean)
      .join(' | ');
  }, [mergedData]);

  const headA = headline(contactA);
  const headB = headline(contactB);

  return (
    <div className="modal-overlay" onClick={onCancel}>
      <div
        className="modal merge-dialog"
        role="dialog"
        aria-label="Merge Contacts"
        onClick={(e) => e.stopPropagation()}
      >
        <h3>Merge Contacts</h3>

        <div className="merge-cards">
          <div className="merge-card">
            <strong>{headA.name}</strong>
            <div className="muted">Contact A</div>
          </div>
          <div className="merge-card">
            <strong>{headB.name}</strong>
            <div className="muted">Contact B</div>
          </div>
        </div>

        <div className="merge-actions-row">
          <button onClick={() => setAll('A')}>← Use All A</button>
          <button onClick={() => setAll('B')}>Use All B →</button>
          <button onClick={() => setSelection(smartSelection(contactA, contactB))}>
            Smart Merge
          </button>
        </div>

        <table className="merge-table">
          <thead>
            <tr>
              <th>Field</th>
              <th>Contact A</th>
              <th>Contact B</th>
              <th>Use</th>
            </tr>
          </thead>
          <tbody>
            {MERGE_FIELDS.map(({ key, label }) => {
              const av = text(contactA, key);
              const bv = text(contactB, key);
              if (!av && !bv) return null;
              const identical = av === bv && av !== '';
              const choice = selection[key] ?? 'A';
              return (
                <tr key={key} className={identical ? 'identical' : ''} data-field={key}>
                  <td className="merge-field-label">{label}</td>
                  <td className={av ? '' : 'empty'}>{av || '—'}</td>
                  <td className={bv ? '' : 'empty'}>{bv || '—'}</td>
                  <td className="merge-choice">
                    {identical ? (
                      <span className="check" title="Identical value">✓</span>
                    ) : (
                      <>
                        <label>
                          <input
                            type="radio"
                            name={`merge-${key}`}
                            aria-label={`${label} use A`}
                            checked={choice === 'A'}
                            onChange={() =>
                              setSelection((s) => ({ ...s, [key]: 'A' }))
                            }
                          />
                          A
                        </label>
                        <label>
                          <input
                            type="radio"
                            name={`merge-${key}`}
                            aria-label={`${label} use B`}
                            checked={choice === 'B'}
                            onChange={() =>
                              setSelection((s) => ({ ...s, [key]: 'B' }))
                            }
                          />
                          B
                        </label>
                      </>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        <div className="merge-preview">
          <span className="muted">Result preview:</span> {preview || '(empty)'}
        </div>

        <div className="modal-actions">
          <button onClick={onCancel}>Cancel</button>
          <button
            className="primary"
            onClick={() => onMerge(contactA.id!, contactB.id!, mergedData)}
          >
            Merge &amp; Save
          </button>
        </div>
      </div>
    </div>
  );
}
