import { Contact, NewContact, MERGE_FIELDS } from './types';

export type FieldChoice = 'A' | 'B';
export type MergeSelection = Partial<Record<keyof Contact, FieldChoice>>;

const val = (c: Contact, key: keyof Contact): string => {
  const v = c[key];
  return v == null ? '' : String(v);
};

/** Number of merge-relevant fields with a non-empty value — used to pick a primary. */
export function filledFieldCount(c: Contact): number {
  return MERGE_FIELDS.reduce((n, f) => (val(c, f.key).trim() ? n + 1 : n), 0);
}

/**
 * Default per-field choice for a pair: prefer the non-empty value, and when both
 * are non-empty prefer A (the primary). Identical values resolve to A.
 */
export function defaultSelection(a: Contact, b: Contact): MergeSelection {
  const sel: MergeSelection = {};
  for (const { key } of MERGE_FIELDS) {
    const av = val(a, key).trim();
    const bv = val(b, key).trim();
    sel[key] = !av && bv ? 'B' : 'A';
  }
  return sel;
}

/** Smart choice: pick the longer / more complete value for each field. */
export function smartSelection(a: Contact, b: Contact): MergeSelection {
  const sel: MergeSelection = {};
  for (const { key } of MERGE_FIELDS) {
    const av = val(a, key).trim();
    const bv = val(b, key).trim();
    sel[key] = bv.length > av.length ? 'B' : 'A';
  }
  return sel;
}

/** Build the merged field payload from a per-field selection. */
export function buildMergedData(
  a: Contact,
  b: Contact,
  selection: MergeSelection
): NewContact {
  const data: NewContact = {};
  for (const { key } of MERGE_FIELDS) {
    const choice = selection[key] ?? 'A';
    const chosen = choice === 'B' ? b : a;
    (data as Record<string, unknown>)[key] = chosen[key] ?? '';
  }

  // Preserve a second distinct email when one record's primary email differs and
  // the chosen result has an empty secondary slot — don't silently lose it.
  const emails = new Set(
    [a.email_1, a.email_2, b.email_1, b.email_2]
      .map((e) => (e || '').trim())
      .filter(Boolean)
  );
  if (!String(data.email_2 || '').trim() && emails.size > 1) {
    const primary = String(data.email_1 || '').trim().toLowerCase();
    const extra = [...emails].find((e) => e.toLowerCase() !== primary);
    if (extra) data.email_2 = extra;
  }

  return data;
}

/** One-shot smart merge payload (used by batch "Merge All High-Confidence"). */
export function smartMergeData(a: Contact, b: Contact): NewContact {
  return buildMergedData(a, b, smartSelection(a, b));
}
