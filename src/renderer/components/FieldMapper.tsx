import React, { useState } from 'react';
import { CONTACT_FIELDS, Contact, FieldMapping } from '../../shared/types';
import { Modal } from './Modal';

interface FieldMapperProps {
  headers: string[];
  initialMapping: FieldMapping;
  onConfirm: (mapping: FieldMapping) => void;
  onCancel: () => void;
}

function guessFromHeaders(headers: string[]): FieldMapping {
  const m: FieldMapping = {};
  for (const h of headers) m[h] = '';
  return m;
}

export function FieldMapper({
  headers,
  initialMapping,
  onConfirm,
  onCancel
}: FieldMapperProps): JSX.Element {
  const [mapping, setMapping] = useState<FieldMapping>({
    ...guessFromHeaders(headers),
    ...initialMapping
  });

  return (
    <Modal
      title="Map Columns to Contact Fields"
      onClose={onCancel}
      footer={
        <>
          <button onClick={onCancel}>Cancel</button>
          <button className="primary" onClick={() => onConfirm(mapping)}>
            Continue
          </button>
        </>
      }
    >
      <p style={{ color: 'var(--muted)' }}>
        Choose which contact field each source column maps to. Unmapped columns are ignored.
      </p>
      {headers.map((header) => (
        <div className="mapper-row" key={header}>
          <div>
            <strong>{header}</strong>
          </div>
          <select
            value={mapping[header] ?? ''}
            onChange={(e) =>
              setMapping((prev) => ({
                ...prev,
                [header]: e.target.value as keyof Contact | ''
              }))
            }
          >
            <option value="">— Ignore —</option>
            {CONTACT_FIELDS.map((field) => (
              <option key={field} value={field}>
                {field}
              </option>
            ))}
          </select>
        </div>
      ))}
    </Modal>
  );
}
