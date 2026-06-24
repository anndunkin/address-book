import React from 'react';
import { Contact } from '../../shared/types';

interface ContactDetailProps {
  contact: Contact | null;
  onEdit: () => void;
  onDelete: () => void;
  onToggleFavorite: () => void;
  onLinkedInUpdate: () => void;
}

function Row({ label, value }: { label: string; value?: string }): JSX.Element | null {
  if (!value) return null;
  return (
    <>
      <div className="label">{label}</div>
      <div>{value}</div>
    </>
  );
}

export function ContactDetail({
  contact,
  onEdit,
  onDelete,
  onToggleFavorite,
  onLinkedInUpdate
}: ContactDetailProps): JSX.Element {
  if (!contact) {
    return <div className="detail-panel"><div className="empty">Select a contact to view details</div></div>;
  }

  const fullName = `${contact.first_name} ${contact.last_name}`.trim() || '(no name)';
  const address = [
    contact.address_street,
    [contact.address_city, contact.address_state].filter(Boolean).join(', '),
    contact.address_zip,
    contact.address_country
  ]
    .filter(Boolean)
    .join('  ');

  return (
    <div className="detail-panel">
      <div className="detail-header">
        <div style={{ flex: 1 }}>
          <h2>
            {fullName}
            {contact.linkedin_url && (
              <span className="badge">
                in
                {contact.linkedin_last_updated
                  ? ` · updated ${new Date(contact.linkedin_last_updated).toLocaleDateString()}`
                  : ''}
              </span>
            )}
          </h2>
          <div className="title-line">
            {[contact.title, contact.company].filter(Boolean).join(' at ')}
          </div>
        </div>
        <button onClick={onToggleFavorite} title="Toggle favorite">
          {contact.favorite ? '★ Favorite' : '☆ Favorite'}
        </button>
        <button onClick={onEdit}>Edit</button>
        <button className="danger" onClick={onDelete}>
          Delete
        </button>
      </div>

      <button className="primary" onClick={onLinkedInUpdate}>
        Update from LinkedIn
      </button>

      <div className="field-grid">
        <Row label="Email" value={contact.email_1} />
        <Row label="Email (2)" value={contact.email_2} />
        <Row label="Mobile" value={contact.phone_mobile} />
        <Row label="Work" value={contact.phone_work} />
        <Row label="Home" value={contact.phone_home} />
        <Row label="Address" value={address} />
        {contact.website && (
          <>
            <div className="label">Website</div>
            <div>
              <a className="link" href={contact.website} target="_blank" rel="noreferrer">
                {contact.website}
              </a>
            </div>
          </>
        )}
        {contact.linkedin_url && (
          <>
            <div className="label">LinkedIn</div>
            <div>
              <a className="link" href={contact.linkedin_url} target="_blank" rel="noreferrer">
                {contact.linkedin_url}
              </a>
            </div>
          </>
        )}
        <Row label="Tags" value={contact.tags} />
        <Row label="Notes" value={contact.notes} />
      </div>
    </div>
  );
}
