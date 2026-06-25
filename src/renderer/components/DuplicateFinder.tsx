import React, { useState } from 'react';
import { Contact, DuplicateGroup, MergeConfidence } from '../../shared/types';

interface DuplicateFinderProps {
  groups: DuplicateGroup[];
  onReview: (group: DuplicateGroup) => void;
  onMergeAllHigh: () => void;
  onClose: () => void;
}

const CONFIDENCE_LABEL: Record<MergeConfidence, string> = {
  high: 'HIGH — same email',
  medium: 'MEDIUM — same name',
  low: 'LOW — same last name + company'
};

function line(c: Contact): string {
  const name = `${c.first_name} ${c.last_name}`.trim() || '(no name)';
  const email = c.email_1 || c.email_2 || '(no email)';
  const company = c.company || '(no company)';
  return `${name} | ${email} | ${company}`;
}

export function DuplicateFinder({
  groups,
  onReview,
  onMergeAllHigh,
  onClose
}: DuplicateFinderProps): JSX.Element {
  const [skipped, setSkipped] = useState<Set<number>>(new Set());

  const visible = groups
    .map((g, i) => ({ g, i }))
    .filter(({ i }) => !skipped.has(i));
  const hasHigh = visible.some(({ g }) => g.confidence === 'high');

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal duplicate-finder"
        role="dialog"
        aria-label="Duplicate Finder"
        onClick={(e) => e.stopPropagation()}
      >
        <h3>Duplicate Finder</h3>
        <p className="muted">
          Found {visible.length} potential duplicate group
          {visible.length === 1 ? '' : 's'}
        </p>

        {hasHigh && (
          <div className="merge-actions-row">
            <button className="primary" onClick={onMergeAllHigh}>
              Merge All High-Confidence
            </button>
          </div>
        )}

        {visible.length === 0 && (
          <div className="empty">No duplicate groups to review.</div>
        )}

        <div className="dup-groups">
          {visible.map(({ g, i }) => (
            <div key={i} className={`dup-group conf-${g.confidence}`} data-confidence={g.confidence}>
              <div className="dup-group-head">
                <span className={`conf-badge conf-${g.confidence}`}>
                  {CONFIDENCE_LABEL[g.confidence]}
                </span>
                <span className="muted">{g.reason}</span>
              </div>
              <ul className="dup-members">
                {g.contacts.map((c) => (
                  <li key={c.id}>{line(c)}</li>
                ))}
              </ul>
              <div className="dup-group-actions">
                <button className="primary" onClick={() => onReview(g)}>
                  Review &amp; Merge
                </button>
                <button
                  onClick={() => setSkipped((s) => new Set(s).add(i))}
                >
                  Skip
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="modal-actions">
          <button onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  );
}
