import React, { useState } from 'react';
import { AppSettings } from '../../shared/types';
import { Modal } from './Modal';

interface SettingsDialogProps {
  settings: AppSettings;
  dbPath: string | null;
  onSave: (patch: Partial<AppSettings>) => void;
  onCancel: () => void;
  onChooseDatabase: () => void;
}

export function SettingsDialog({
  settings,
  dbPath,
  onSave,
  onCancel,
  onChooseDatabase
}: SettingsDialogProps): JSX.Element {
  const [theme, setTheme] = useState(settings.theme);
  const [clientId, setClientId] = useState(settings.linkedinClientId);

  return (
    <Modal
      title="Settings"
      onClose={onCancel}
      footer={
        <>
          <button onClick={onCancel}>Cancel</button>
          <button
            className="primary"
            onClick={() => onSave({ theme, linkedinClientId: clientId })}
          >
            Save
          </button>
        </>
      }
    >
      <div className="form-field" style={{ marginBottom: 16 }}>
        <label>Database File</label>
        <div style={{ display: 'flex', gap: 8 }}>
          <input value={dbPath ?? '(none)'} readOnly />
          <button onClick={onChooseDatabase} style={{ whiteSpace: 'nowrap' }}>
            Open…
          </button>
        </div>
      </div>

      <div className="form-field" style={{ marginBottom: 16 }}>
        <label>Theme</label>
        <select value={theme} onChange={(e) => setTheme(e.target.value as 'light' | 'dark')}>
          <option value="light">Light</option>
          <option value="dark">Dark</option>
        </select>
      </div>

      <div className="form-field">
        <label>LinkedIn Client ID (for OAuth — optional)</label>
        <input
          value={clientId}
          placeholder="Paste your LinkedIn app Client ID"
          onChange={(e) => setClientId(e.target.value)}
        />
      </div>
    </Modal>
  );
}
