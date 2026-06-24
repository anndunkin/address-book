import React, { useState } from 'react';
import { Contact, NewContact, emptyContact } from '../../shared/types';
import { Modal } from './Modal';

interface ContactFormProps {
  initial: Contact | null;
  onSave: (data: NewContact) => void;
  onCancel: () => void;
}

const FIELDS: { key: keyof Contact; label: string; full?: boolean }[] = [
  { key: 'first_name', label: 'First Name' },
  { key: 'last_name', label: 'Last Name' },
  { key: 'company', label: 'Company' },
  { key: 'title', label: 'Title' },
  { key: 'email_1', label: 'Email' },
  { key: 'email_2', label: 'Email (2)' },
  { key: 'phone_mobile', label: 'Mobile Phone' },
  { key: 'phone_work', label: 'Work Phone' },
  { key: 'phone_home', label: 'Home Phone' },
  { key: 'website', label: 'Website' },
  { key: 'address_street', label: 'Street', full: true },
  { key: 'address_city', label: 'City' },
  { key: 'address_state', label: 'State' },
  { key: 'address_zip', label: 'ZIP' },
  { key: 'address_country', label: 'Country' },
  { key: 'linkedin_url', label: 'LinkedIn URL', full: true },
  { key: 'tags', label: 'Tags (comma separated)', full: true },
  { key: 'notes', label: 'Notes', full: true },
  { key: 'title_prefix', label: 'Title Prefix' },
  { key: 'suffix', label: 'Suffix' },
  { key: 'department', label: 'Department' },
  { key: 'home_street', label: 'Home Street', full: true },
  { key: 'home_city', label: 'Home City' },
  { key: 'home_state', label: 'Home State' },
  { key: 'home_zip', label: 'Home ZIP' },
  { key: 'home_country', label: 'Home Country' },
  { key: 'birthday', label: 'Birthday' },
  { key: 'anniversary', label: 'Anniversary' },
  { key: 'spouse', label: 'Spouse' },
  { key: 'children', label: 'Children' },
  { key: 'hobby', label: 'Hobby' },
  { key: 'gender', label: 'Gender' },
  { key: 'assistant_name', label: 'Assistant Name' },
  { key: 'user_1', label: 'Custom Field 1' },
  { key: 'user_2', label: 'Custom Field 2' },
  { key: 'user_3', label: 'Custom Field 3' },
  { key: 'user_4', label: 'Custom Field 4' }
];

export function ContactForm({ initial, onSave, onCancel }: ContactFormProps): JSX.Element {
  const [form, setForm] = useState<Contact>(initial ?? emptyContact());

  const set = (key: keyof Contact, value: string) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  return (
    <Modal
      title={initial ? 'Edit Contact' : 'Add Contact'}
      onClose={onCancel}
      footer={
        <>
          <button onClick={onCancel}>Cancel</button>
          <button className="primary" onClick={() => onSave(form)}>
            Save
          </button>
        </>
      }
    >
      <div className="form-grid">
        {FIELDS.map((f) => (
          <div key={f.key} className={`form-field ${f.full ? 'full' : ''}`}>
            <label htmlFor={`field-${f.key}`}>{f.label}</label>
            {f.key === 'notes' ? (
              <textarea
                id={`field-${f.key}`}
                rows={3}
                value={String(form[f.key] ?? '')}
                onChange={(e) => set(f.key, e.target.value)}
              />
            ) : (
              <input
                id={`field-${f.key}`}
                value={String(form[f.key] ?? '')}
                onChange={(e) => set(f.key, e.target.value)}
              />
            )}
          </div>
        ))}
        <div className="form-field full">
          <label>
            <input
              type="checkbox"
              style={{ width: 'auto', marginRight: 8 }}
              checked={!!form.favorite}
              onChange={(e) => setForm((p) => ({ ...p, favorite: e.target.checked ? 1 : 0 }))}
            />
            Mark as favorite
          </label>
        </div>
      </div>
    </Modal>
  );
}
