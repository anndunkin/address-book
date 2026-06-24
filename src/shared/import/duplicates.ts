import { Contact, NewContact } from '../types';

function norm(value: string | undefined | null): string {
  return (value ?? '').toString().trim().toLowerCase();
}

/**
 * Build a fast lookup index over existing contacts keyed by email and by the
 * (first + last + company) tuple.
 */
export function buildDuplicateIndex(existing: Contact[]) {
  const byEmail = new Map<string, Contact>();
  const byName = new Map<string, Contact>();
  for (const c of existing) {
    for (const email of [c.email_1, c.email_2]) {
      const e = norm(email);
      if (e) byEmail.set(e, c);
    }
    const nameKey = nameCompanyKey(c);
    if (nameKey) byName.set(nameKey, c);
  }
  return { byEmail, byName };
}

function nameCompanyKey(c: NewContact): string {
  const first = norm(c.first_name);
  const last = norm(c.last_name);
  const company = norm(c.company);
  if (!first && !last) return '';
  return `${first}|${last}|${company}`;
}

export type DuplicateIndex = ReturnType<typeof buildDuplicateIndex>;

/**
 * Return the existing contact that duplicates `candidate`, or null. A match is
 * by shared email (email_1 or email_2) or by identical first+last+company.
 */
export function findDuplicate(
  candidate: NewContact,
  index: DuplicateIndex
): Contact | null {
  for (const email of [candidate.email_1, candidate.email_2]) {
    const e = norm(email);
    if (e && index.byEmail.has(e)) return index.byEmail.get(e)!;
  }
  const nameKey = nameCompanyKey(candidate);
  if (nameKey && index.byName.has(nameKey)) return index.byName.get(nameKey)!;
  return null;
}

/**
 * Merge a candidate's non-empty fields into an existing contact without
 * overwriting populated existing values.
 */
export function mergeContacts(existing: Contact, candidate: NewContact): Contact {
  const merged: Contact = { ...existing };
  for (const key of Object.keys(candidate) as (keyof Contact)[]) {
    if (key === 'id' || key === 'created_at') continue;
    const incoming = candidate[key];
    if (incoming === undefined || incoming === null || incoming === '') continue;
    const current = merged[key];
    if (current === undefined || current === null || current === '' || current === 0) {
      (merged as unknown as Record<string, unknown>)[key] = incoming;
    }
  }
  return merged;
}
