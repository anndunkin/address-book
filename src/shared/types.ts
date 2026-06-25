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
  // Extended fields from Outlook contact exports (optional).
  title_prefix?: string;
  suffix?: string;
  department?: string;
  home_street?: string;
  home_city?: string;
  home_state?: string;
  home_zip?: string;
  home_country?: string;
  birthday?: string;
  anniversary?: string;
  spouse?: string;
  children?: string;
  hobby?: string;
  gender?: string;
  assistant_name?: string;
  user_1?: string;
  user_2?: string;
  user_3?: string;
  user_4?: string;
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

export type MergeConfidence = 'high' | 'medium' | 'low';

export interface DuplicateGroup {
  confidence: MergeConfidence;
  contacts: Contact[];
  reason: string;
}

export interface MergeHistoryEntry {
  id: number;
  merged_at: string;
  primary_id: number;
  primary_before: Contact;
  secondary_snapshot: Contact;
  merged_result: Contact;
}

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
  'tags',
  'title_prefix',
  'suffix',
  'department',
  'home_street',
  'home_city',
  'home_state',
  'home_zip',
  'home_country',
  'birthday',
  'anniversary',
  'spouse',
  'children',
  'hobby',
  'gender',
  'assistant_name',
  'user_1',
  'user_2',
  'user_3',
  'user_4'
];

/** Fields shown (in order) in the merge preview dialog, with display labels. */
export const MERGE_FIELDS: { key: keyof Contact; label: string }[] = [
  { key: 'first_name', label: 'First Name' },
  { key: 'last_name', label: 'Last Name' },
  { key: 'company', label: 'Company' },
  { key: 'title', label: 'Title' },
  { key: 'email_1', label: 'Email 1' },
  { key: 'email_2', label: 'Email 2' },
  { key: 'phone_mobile', label: 'Mobile' },
  { key: 'phone_work', label: 'Phone Work' },
  { key: 'phone_home', label: 'Phone Home' },
  { key: 'address_street', label: 'Street' },
  { key: 'address_city', label: 'City' },
  { key: 'address_state', label: 'State' },
  { key: 'address_zip', label: 'ZIP' },
  { key: 'address_country', label: 'Country' },
  { key: 'linkedin_url', label: 'LinkedIn' },
  { key: 'website', label: 'Website' },
  { key: 'notes', label: 'Notes' },
  { key: 'tags', label: 'Tags' },
  { key: 'title_prefix', label: 'Prefix' },
  { key: 'suffix', label: 'Suffix' },
  { key: 'department', label: 'Department' },
  { key: 'home_street', label: 'Home Street' },
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
  { key: 'assistant_name', label: 'Assistant' },
  { key: 'user_1', label: 'Custom 1' },
  { key: 'user_2', label: 'Custom 2' },
  { key: 'user_3', label: 'Custom 3' },
  { key: 'user_4', label: 'Custom 4' }
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
    updated_at: now,
    title_prefix: '',
    suffix: '',
    department: '',
    home_street: '',
    home_city: '',
    home_state: '',
    home_zip: '',
    home_country: '',
    birthday: '',
    anniversary: '',
    spouse: '',
    children: '',
    hobby: '',
    gender: '',
    assistant_name: '',
    user_1: '',
    user_2: '',
    user_3: '',
    user_4: ''
  };
}
