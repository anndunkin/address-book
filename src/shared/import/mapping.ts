import { FieldMapping, Contact, CONTACT_FIELDS } from '../types';

/** Heuristic aliases mapping common column header names to Contact fields. */
const ALIASES: Record<string, keyof Contact> = {
  'first name': 'first_name',
  firstname: 'first_name',
  first: 'first_name',
  given: 'first_name',
  'given name': 'first_name',
  'last name': 'last_name',
  lastname: 'last_name',
  last: 'last_name',
  surname: 'last_name',
  family: 'last_name',
  'family name': 'last_name',
  company: 'company',
  organization: 'company',
  organisation: 'company',
  org: 'company',
  employer: 'company',
  title: 'title',
  'job title': 'title',
  position: 'title',
  role: 'title',
  email: 'email_1',
  'email 1': 'email_1',
  'email address': 'email_1',
  'e-mail': 'email_1',
  'primary email': 'email_1',
  'email 2': 'email_2',
  'secondary email': 'email_2',
  'mobile': 'phone_mobile',
  'mobile phone': 'phone_mobile',
  cell: 'phone_mobile',
  'cell phone': 'phone_mobile',
  phone: 'phone_mobile',
  'work phone': 'phone_work',
  'business phone': 'phone_work',
  'office phone': 'phone_work',
  'home phone': 'phone_home',
  street: 'address_street',
  address: 'address_street',
  'street address': 'address_street',
  city: 'address_city',
  town: 'address_city',
  state: 'address_state',
  province: 'address_state',
  region: 'address_state',
  zip: 'address_zip',
  'zip code': 'address_zip',
  postal: 'address_zip',
  'postal code': 'address_zip',
  postcode: 'address_zip',
  country: 'address_country',
  linkedin: 'linkedin_url',
  'linkedin url': 'linkedin_url',
  website: 'website',
  url: 'website',
  web: 'website',
  homepage: 'website',
  notes: 'notes',
  note: 'notes',
  comment: 'notes',
  comments: 'notes',
  tags: 'tags',
  tag: 'tags',
  groups: 'tags',
  categories: 'tags'
};

export function autoGuessMapping(headers: string[]): FieldMapping {
  const mapping: FieldMapping = {};
  const fieldSet = new Set<string>(CONTACT_FIELDS as string[]);
  for (const header of headers) {
    const key = header.trim().toLowerCase();
    const direct = fieldSet.has(key) ? (key as keyof Contact) : undefined;
    mapping[header] = direct ?? ALIASES[key] ?? '';
  }
  return mapping;
}
