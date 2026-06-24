import { ContactDatabase } from './database';
import {
  NewContact,
  DuplicateStrategy,
  ImportSummary,
  ImportFormat
} from '../shared/types';
import {
  buildDuplicateIndex,
  findDuplicate,
  mergeContacts
} from '../shared/import/duplicates';

/**
 * Commit a list of parsed contacts into the database applying the chosen
 * duplicate strategy, and write an import_log entry.
 */
export function commitImport(
  db: ContactDatabase,
  contacts: NewContact[],
  strategy: DuplicateStrategy,
  meta: { filename: string; format: ImportFormat }
): ImportSummary {
  const summary: ImportSummary = {
    imported: 0,
    skipped: 0,
    merged: 0,
    total: contacts.length,
    errors: []
  };

  const index = buildDuplicateIndex(db.list());

  for (const candidate of contacts) {
    try {
      const dup = findDuplicate(candidate, index);
      if (!dup) {
        db.create(candidate);
        summary.imported++;
        continue;
      }
      if (strategy === 'skip') {
        summary.skipped++;
      } else if (strategy === 'merge') {
        const merged = mergeContacts(dup, candidate);
        db.update(dup.id!, merged);
        summary.merged++;
      } else {
        db.create(candidate);
        summary.imported++;
      }
    } catch (err) {
      summary.errors.push(err instanceof Error ? err.message : String(err));
    }
  }

  db.logImport({
    filename: meta.filename,
    format: meta.format,
    records_imported: summary.imported + summary.merged,
    imported_at: new Date().toISOString()
  });

  return summary;
}
