import { NewContact, ParsedImport } from '../types';

const EMAIL_RE = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/;
const PHONE_RE = /(\+?\d[\d\s().-]{6,}\d)/;
const URL_RE = /(https?:\/\/[^\s,;]+)/i;

/**
 * Best-effort plain-text parser. Each non-empty line is treated as one contact.
 * Detects email, phone, LinkedIn/website URLs, and infers a name from the
 * remaining tokens.
 */
export function parseText(content: string): ParsedImport {
  const contacts: NewContact[] = [];
  const lines = content.split(/\r\n|\r|\n/);

  for (const rawLine of lines) {
    const line = rawLine.trim();
    if (!line) continue;
    const contact = parseLine(line);
    if (Object.keys(contact).length > 0) contacts.push(contact);
  }

  return { contacts };
}

function parseLine(line: string): NewContact {
  const contact: NewContact = {};
  let remaining = line;

  const emailMatch = remaining.match(EMAIL_RE);
  if (emailMatch) {
    contact.email_1 = emailMatch[0];
    remaining = remaining.replace(emailMatch[0], ' ');
  }

  const urlMatch = remaining.match(URL_RE);
  if (urlMatch) {
    if (/linkedin/i.test(urlMatch[0])) contact.linkedin_url = urlMatch[0];
    else contact.website = urlMatch[0];
    remaining = remaining.replace(urlMatch[0], ' ');
  }

  const phoneMatch = remaining.match(PHONE_RE);
  if (phoneMatch) {
    contact.phone_mobile = phoneMatch[0].trim();
    remaining = remaining.replace(phoneMatch[0], ' ');
  }

  // Whatever text tokens are left (split on commas/tabs/pipes) — first chunk is the name.
  const chunks = remaining
    .split(/[,\t|]+/)
    .map((c) => c.trim())
    .filter((c) => c && !/^[\s\-–—]+$/.test(c));

  if (chunks.length > 0) {
    const nameParts = chunks[0].split(/\s+/).filter(Boolean);
    if (nameParts.length === 1) {
      contact.first_name = nameParts[0];
    } else if (nameParts.length > 1) {
      contact.first_name = nameParts[0];
      contact.last_name = nameParts.slice(1).join(' ');
    }
    if (chunks[1]) contact.company = chunks[1];
  }

  return contact;
}
