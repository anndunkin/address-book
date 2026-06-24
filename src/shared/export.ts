import Papa from 'papaparse';
import { Contact, CONTACT_FIELDS } from './types';

export function exportCsv(contacts: Contact[]): string {
  const rows = contacts.map((c) => {
    const row: Record<string, unknown> = {};
    for (const field of CONTACT_FIELDS) row[field] = c[field] ?? '';
    row['favorite'] = c.favorite ?? 0;
    return row;
  });
  return Papa.unparse(rows);
}

export function exportJson(contacts: Contact[]): string {
  return JSON.stringify(contacts, null, 2);
}

export function exportVcard(contacts: Contact[]): string {
  return contacts.map(contactToVcard).join('\r\n');
}

function esc(value: string): string {
  return (value ?? '').replace(/\\/g, '\\\\').replace(/;/g, '\\;').replace(/,/g, '\\,').replace(/\n/g, '\\n');
}

function contactToVcard(c: Contact): string {
  const lines: string[] = ['BEGIN:VCARD', 'VERSION:3.0'];
  lines.push(`N:${esc(c.last_name)};${esc(c.first_name)};;;`);
  lines.push(`FN:${esc(`${c.first_name} ${c.last_name}`.trim())}`);
  if (c.company) lines.push(`ORG:${esc(c.company)}`);
  if (c.title) lines.push(`TITLE:${esc(c.title)}`);
  if (c.email_1) lines.push(`EMAIL;TYPE=INTERNET:${esc(c.email_1)}`);
  if (c.email_2) lines.push(`EMAIL;TYPE=INTERNET:${esc(c.email_2)}`);
  if (c.phone_mobile) lines.push(`TEL;TYPE=CELL:${esc(c.phone_mobile)}`);
  if (c.phone_work) lines.push(`TEL;TYPE=WORK:${esc(c.phone_work)}`);
  if (c.phone_home) lines.push(`TEL;TYPE=HOME:${esc(c.phone_home)}`);
  if (c.address_street || c.address_city) {
    lines.push(
      `ADR;TYPE=WORK:;;${esc(c.address_street)};${esc(c.address_city)};${esc(
        c.address_state
      )};${esc(c.address_zip)};${esc(c.address_country)}`
    );
  }
  if (c.linkedin_url) lines.push(`URL:${esc(c.linkedin_url)}`);
  if (c.website) lines.push(`URL:${esc(c.website)}`);
  if (c.notes) lines.push(`NOTE:${esc(c.notes)}`);
  if (c.tags) lines.push(`CATEGORIES:${esc(c.tags)}`);
  lines.push('END:VCARD');
  return lines.join('\r\n');
}
