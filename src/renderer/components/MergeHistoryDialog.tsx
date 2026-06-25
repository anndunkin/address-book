import React from 'react';
import { Contact, MergeHistoryEntry } from '../../shared/types';
import { Modal } from './Modal';

interface MergeHistoryDialogProps {
  entries: MergeHistoryEntry[];
  onUndo: (mergeId: number) => void;
  onClose: () => void;
}

const name = (c: Contact): string =>
  `${c.first_name} ${c.last_name}`.trim() || '(no name)';

export function MergeHistoryDialog({
  entries,
  onUndo,
  onClose
}: MergeHistoryDialogProps): JSX.Element {
  return (
    <Modal
      title="Merge History"
      onClose={onClose}
      footer={<button onClick={onClose}>Close</button>}
    >
      {entries.length === 0 && <div className="empty">No merges yet</div>}
      <div className="merge-history-list">
        {entries.map((e) => (
          <div key={e.id} className="merge-history-row">
            <div>
              <strong>{name(e.merged_result)}</strong>
              <div className="muted">
                merged {name(e.secondary_snapshot)} ·{' '}
                {new Date(e.merged_at).toLocaleString()}
              </div>
            </div>
            <button onClick={() => onUndo(e.id)}>Undo</button>
          </div>
        ))}
      </div>
    </Modal>
  );
}
