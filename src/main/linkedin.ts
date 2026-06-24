import { shell } from 'electron';
import { ContactDatabase } from './database';
import { LinkedInUpdateResult } from '../shared/types';

/**
 * LinkedIn integration.
 *
 * A full LinkedIn API integration requires an approved OAuth app and the
 * Marketing/Profile APIs, which are not available in this build. The feature is
 * therefore scaffolded around a manual workflow that is ready to swap for a real
 * API client:
 *
 *  - For a contact with a stored linkedin_url, we open the profile in the user's
 *    default browser so they can review it and copy updated details back in.
 *  - `linkedin_last_updated` is stamped so the UI can show freshness.
 *  - `connect()` is where an OAuth flow would be initiated once credentials exist.
 *
 * To enable the real API later, replace `fetchProfile` with an authenticated
 * call and have `updateContact` write the returned title/company/location.
 */

const LINKEDIN_SEARCH = 'https://www.linkedin.com/search/results/people/?keywords=';

export function buildProfileUrl(linkedinUrl: string): string {
  return linkedinUrl.startsWith('http') ? linkedinUrl : `https://${linkedinUrl}`;
}

export function buildSearchUrl(firstName: string, lastName: string, company: string): string {
  const query = [firstName, lastName, company].filter(Boolean).join(' ');
  return LINKEDIN_SEARCH + encodeURIComponent(query);
}

export async function updateContact(
  db: ContactDatabase,
  contactId: number
): Promise<LinkedInUpdateResult> {
  const contact = db.get(contactId);
  if (!contact) {
    return { contactId, name: '', status: 'error', message: 'Contact not found' };
  }
  const name = `${contact.first_name} ${contact.last_name}`.trim();

  const target = contact.linkedin_url
    ? buildProfileUrl(contact.linkedin_url)
    : buildSearchUrl(contact.first_name, contact.last_name, contact.company);

  await shell.openExternal(target);
  db.update(contactId, { linkedin_last_updated: new Date().toISOString() });

  return {
    contactId,
    name,
    status: contact.linkedin_url ? 'opened' : 'skipped',
    message: contact.linkedin_url
      ? 'Opened LinkedIn profile in browser. Review and paste any updated details.'
      : 'No LinkedIn URL on file — opened a LinkedIn search instead.'
  };
}

export async function updateAll(db: ContactDatabase): Promise<LinkedInUpdateResult[]> {
  const results: LinkedInUpdateResult[] = [];
  for (const contact of db.list()) {
    if (!contact.linkedin_url) continue;
    results.push(await updateContact(db, contact.id!));
  }
  return results;
}

export async function connect(clientId: string): Promise<{ ok: boolean; message: string }> {
  if (!clientId) {
    return {
      ok: false,
      message:
        'No LinkedIn Client ID configured. Add one in Settings to enable OAuth, then re-run Connect.'
    };
  }
  const authUrl =
    'https://www.linkedin.com/oauth/v2/authorization?response_type=code' +
    `&client_id=${encodeURIComponent(clientId)}` +
    '&redirect_uri=http://localhost:3000/callback&scope=r_liteprofile';
  await shell.openExternal(authUrl);
  return { ok: true, message: 'Opened LinkedIn OAuth consent in your browser.' };
}
