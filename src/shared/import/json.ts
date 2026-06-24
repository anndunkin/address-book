import { NewContact, CONTACT_FIELDS, ParsedImport, Contact } from '../types';
import { autoGuessMapping } from './mapping';

/**
 * Parse a JSON array of contact objects. Keys matching Contact fields are taken
 * directly; unknown keys are run through the alias guesser so common variants
 * (e.g. "firstName", "Email") still map correctly.
 */
export function parseJson(content: string): ParsedImport {
  const data = JSON.parse(content);
  const array: unknown[] = Array.isArray(data) ? data : [data];
  const contacts: NewContact[] = [];

  for (const item of array) {
    if (!item || typeof item !== 'object') continue;
    const record = item as Record<string, unknown>;
    const contact: NewContact = {};
    const keys = Object.keys(record);
    const guessed = autoGuessMapping(keys);

    for (const key of keys) {
      const direct = CONTACT_FIELDS.includes(key as keyof Contact)
        ? (key as keyof Contact)
        : guessed[key];
      if (!direct) continue;
      const value = record[key];
      if (value === null || value === undefined) continue;
      if (direct === 'tags' && Array.isArray(value)) {
        (contact as Record<string, unknown>)[direct] = value.join(', ');
      } else {
        (contact as Record<string, unknown>)[direct] = String(value).trim();
      }
    }
    if (Object.keys(contact).length > 0) contacts.push(contact);
  }

  return { contacts };
}
