export interface Contact {
  id?: number;
  first_name: string;
  last_name: string;
  company: string;
  title: string;
  email_1: string;
  email_2: string;
  phone_mobile: string;
  phone_work: string;
  phone_home: string;
  address_street: string;
  address_city: string;
  address_state: string;
  address_zip: string;
  address_country: string;
  linkedin_url: string;
  linkedin_last_updated: string;
  website: string;
  notes: string;
  tags: string;
  favorite: number;
  created_at: string;
  updated_at: string;
}

export type NewContact = Partial<Contact>;

export interface ImportLogEntry {
  id?: number;
  filename: string;
  format: string;
  records_imported: number;
  imported_at: string;
}

export type ImportFormat = 'csv' | 'vcard' | 'json' | 'xlsx' | 'text';

export type DuplicateStrategy = 'skip' | 'merge' | 'create';

export interface ImportSummary {
  imported: number;
  skipped: number;
  merged: number;
  total: number;
  errors: string[];
}

export interface ParsedImport {
  contacts: NewContact[];
  /** For CSV/XLSX: the raw header row so the renderer can offer a field-mapping dialog. */
  headers?: string[];
  /** For CSV/XLSX: raw rows of values aligned to headers, used after mapping. */
  rows?: string[][];
}

/** Maps a source column name to a Contact field key. */
export type FieldMapping = Record<string, keyof Contact | ''>;

export interface AppSettings {
  databasePath: string | null;
  theme: 'light' | 'dark';
  linkedinClientId: string;
  defaultFieldMappings: FieldMapping;
}

export interface LinkedInUpdateResult {
  contactId: number;
  name: string;
  status: 'updated' | 'opened' | 'skipped' | 'error';
  message: string;
}

export const CONTACT_FIELDS: (keyof Contact)[] = [
  'first_name',
  'last_name',
  'company',
  'title',
  'email_1',
  'email_2',
  'phone_mobile',
  'phone_work',
  'phone_home',
  'address_street',
  'address_city',
  'address_state',
  'address_zip',
  'address_country',
  'linkedin_url',
  'website',
  'notes',
  'tags'
];

export function emptyContact(): Contact {
  const now = new Date().toISOString();
  return {
    first_name: '',
    last_name: '',
    company: '',
    title: '',
    email_1: '',
    email_2: '',
    phone_mobile: '',
    phone_work: '',
    phone_home: '',
    address_street: '',
    address_city: '',
    address_state: '',
    address_zip: '',
    address_country: '',
    linkedin_url: '',
    linkedin_last_updated: '',
    website: '',
    notes: '',
    tags: '',
    favorite: 0,
    created_at: now,
    updated_at: now
  };
}
