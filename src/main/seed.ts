import * as fs from 'fs';
import { NewContact } from '../shared/types';

const str = (v: unknown): string => (v == null ? '' : String(v));

/**
 * Map a raw master/export record (Outlook-style field names) onto the Contact
 * schema. The master file uses names like `address_line_1`, `city`, `zip`, and
 * `categories` that don't match Contact columns, so without this the database
 * layer would silently drop that data.
 */
export function normalizeSeedRecord(raw: Record<string, unknown>): NewContact {
  const street = [raw.address_line_1, raw.address_line_2, raw.address_line_3]
    .map(str)
    .filter(Boolean)
    .join(', ');

  return {
    first_name: str(raw.first_name),
    last_name: str(raw.last_name),
    company: str(raw.company),
    title: str(raw.title),
    email_1: str(raw.email_1),
    email_2: str(raw.email_2),
    phone_mobile: str(raw.phone_mobile),
    phone_work: str(raw.phone_work),
    phone_home: str(raw.phone_home),
    address_street: street,
    address_city: str(raw.city),
    address_state: str(raw.state),
    address_zip: str(raw.zip),
    address_country: str(raw.country),
    linkedin_url: str(raw.linkedin_url),
    website: str(raw.website),
    notes: str(raw.notes),
    tags: str(raw.categories),
    favorite: raw.favorite ? 1 : 0,
    title_prefix: str(raw.title_prefix),
    suffix: str(raw.suffix),
    department: str(raw.department),
    home_street: str(raw.home_street),
    home_city: str(raw.home_city),
    home_state: str(raw.home_state),
    home_zip: str(raw.home_zip),
    home_country: str(raw.home_country),
    birthday: str(raw.birthday),
    anniversary: str(raw.anniversary),
    spouse: str(raw.spouse),
    children: str(raw.children),
    hobby: str(raw.hobby),
    gender: str(raw.gender),
    assistant_name: str(raw.assistant_name),
    user_1: str(raw.user_1),
    user_2: str(raw.user_2),
    user_3: str(raw.user_3),
    user_4: str(raw.user_4)
  };
}

/** Read and normalize a seed JSON file into Contact-shaped records. */
export function loadSeedContacts(filePath: string): NewContact[] {
  const parsed = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
  if (!Array.isArray(parsed)) return [];
  return parsed.map((r) => normalizeSeedRecord(r as Record<string, unknown>));
}
