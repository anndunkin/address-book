import { NewContact, ParsedImport } from '../types';

/**
 * Parse vCard 2.1 / 3.0 content. Supports multiple VCARD blocks in a single file.
 */
export function parseVcard(content: string): ParsedImport {
  const contacts: NewContact[] = [];
  const blocks = content.split(/BEGIN:VCARD/i).slice(1);
  for (const block of blocks) {
    const body = block.split(/END:VCARD/i)[0];
    const contact = parseBlock(body);
    if (Object.keys(contact).length > 0) {
      contacts.push(contact);
    }
  }
  return { contacts };
}

function unfold(body: string): string[] {
  // vCard line folding: continuation lines start with a space or tab.
  const rawLines = body.split(/\r\n|\r|\n/);
  const lines: string[] = [];
  for (const line of rawLines) {
    if ((line.startsWith(' ') || line.startsWith('\t')) && lines.length > 0) {
      lines[lines.length - 1] += line.slice(1);
    } else {
      lines.push(line);
    }
  }
  return lines.filter((l) => l.trim().length > 0);
}

function decodeValue(params: string, value: string): string {
  let v = value;
  if (/quoted-printable/i.test(params)) {
    v = v.replace(/=\r?\n/g, '').replace(/=([0-9A-Fa-f]{2})/g, (_, hex) =>
      String.fromCharCode(parseInt(hex, 16))
    );
  }
  return v.replace(/\\n/gi, '\n').replace(/\\,/g, ',').replace(/\\;/g, ';').trim();
}

function parseBlock(body: string): NewContact {
  const contact: NewContact = {};
  const phones: string[] = [];
  let workPhoneSet = false;
  let homePhoneSet = false;

  for (const line of unfold(body)) {
    const colonIdx = line.indexOf(':');
    if (colonIdx === -1) continue;
    const namePart = line.slice(0, colonIdx);
    const value = line.slice(colonIdx + 1);
    const [rawName, ...paramParts] = namePart.split(';');
    const name = rawName.toUpperCase();
    const params = paramParts.join(';');
    const decoded = decodeValue(params, value);

    switch (name) {
      case 'N': {
        const parts = value.split(';');
        contact.last_name = decodeValue(params, parts[0] ?? '');
        contact.first_name = decodeValue(params, parts[1] ?? '');
        break;
      }
      case 'FN': {
        if (!contact.first_name && !contact.last_name) {
          const parts = decoded.split(' ');
          contact.first_name = parts.shift() ?? '';
          contact.last_name = parts.join(' ');
        }
        break;
      }
      case 'ORG':
        contact.company = decoded.split(';')[0];
        break;
      case 'TITLE':
        contact.title = decoded;
        break;
      case 'EMAIL':
        if (!contact.email_1) contact.email_1 = decoded;
        else if (!contact.email_2) contact.email_2 = decoded;
        break;
      case 'TEL': {
        const p = params.toUpperCase();
        if (p.includes('CELL') || p.includes('MOBILE')) {
          contact.phone_mobile = decoded;
        } else if (p.includes('WORK')) {
          contact.phone_work = decoded;
          workPhoneSet = true;
        } else if (p.includes('HOME')) {
          contact.phone_home = decoded;
          homePhoneSet = true;
        } else {
          phones.push(decoded);
        }
        break;
      }
      case 'ADR': {
        const parts = value.split(';').map((s) => decodeValue(params, s));
        // ADR: po-box;ext;street;city;region;postal;country
        contact.address_street = parts[2] || '';
        contact.address_city = parts[3] || '';
        contact.address_state = parts[4] || '';
        contact.address_zip = parts[5] || '';
        contact.address_country = parts[6] || '';
        break;
      }
      case 'URL':
        if (/linkedin/i.test(decoded)) contact.linkedin_url = decoded;
        else if (!contact.website) contact.website = decoded;
        break;
      case 'NOTE':
        contact.notes = decoded;
        break;
      case 'CATEGORIES':
        contact.tags = decoded;
        break;
      default:
        break;
    }
  }

  // Assign leftover untyped phones to mobile, then fill others.
  for (const phone of phones) {
    if (!contact.phone_mobile) contact.phone_mobile = phone;
    else if (!workPhoneSet) {
      contact.phone_work = phone;
      workPhoneSet = true;
    } else if (!homePhoneSet) {
      contact.phone_home = phone;
      homePhoneSet = true;
    }
  }

  return contact;
}
