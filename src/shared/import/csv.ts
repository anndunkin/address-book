import Papa from 'papaparse';
import { NewContact, FieldMapping, Contact, ParsedImport } from '../types';
import { autoGuessMapping } from './mapping';

/**
 * Parse CSV content into headers + rows. The caller then applies a field mapping
 * (manually via the FieldMapper dialog, or via the auto-guessed mapping).
 */
export function parseCsv(content: string): ParsedImport {
  const result = Papa.parse<string[]>(content.trim(), {
    skipEmptyLines: true
  });
  const data = result.data as string[][];
  if (data.length === 0) {
    return { contacts: [], headers: [], rows: [] };
  }
  const headers = data[0].map((h) => String(h).trim());
  const rows = data.slice(1);
  const mapping = autoGuessMapping(headers);
  const contacts = applyMapping(headers, rows, mapping);
  return { contacts, headers, rows };
}

/** Build contacts from raw rows given an explicit header->field mapping. */
export function applyMapping(
  headers: string[],
  rows: string[][],
  mapping: FieldMapping
): NewContact[] {
  return rows
    .map((row) => {
      const contact: NewContact = {};
      headers.forEach((header, idx) => {
        const field = mapping[header];
        if (field) {
          const value = (row[idx] ?? '').toString().trim();
          if (value) {
            (contact as Record<string, unknown>)[field as keyof Contact] = value;
          }
        }
      });
      return contact;
    })
    .filter((c) => Object.keys(c).length > 0);
}
