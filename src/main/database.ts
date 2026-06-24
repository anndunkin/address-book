import Database from 'better-sqlite3';
import { Contact, NewContact, ImportLogEntry, emptyContact } from '../shared/types';

const SCHEMA = `
CREATE TABLE IF NOT EXISTS contacts (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  first_name TEXT DEFAULT '',
  last_name TEXT DEFAULT '',
  company TEXT DEFAULT '',
  title TEXT DEFAULT '',
  email_1 TEXT DEFAULT '',
  email_2 TEXT DEFAULT '',
  phone_mobile TEXT DEFAULT '',
  phone_work TEXT DEFAULT '',
  phone_home TEXT DEFAULT '',
  address_street TEXT DEFAULT '',
  address_city TEXT DEFAULT '',
  address_state TEXT DEFAULT '',
  address_zip TEXT DEFAULT '',
  address_country TEXT DEFAULT '',
  linkedin_url TEXT DEFAULT '',
  linkedin_last_updated TEXT DEFAULT '',
  website TEXT DEFAULT '',
  notes TEXT DEFAULT '',
  tags TEXT DEFAULT '',
  favorite INTEGER DEFAULT 0,
  created_at TEXT DEFAULT '',
  updated_at TEXT DEFAULT ''
);

CREATE TABLE IF NOT EXISTS import_log (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  filename TEXT,
  format TEXT,
  records_imported INTEGER,
  imported_at TEXT
);

CREATE INDEX IF NOT EXISTS idx_contacts_name ON contacts(last_name, first_name);
CREATE INDEX IF NOT EXISTS idx_contacts_email ON contacts(email_1);
`;

const COLUMNS: (keyof Contact)[] = [
  'first_name', 'last_name', 'company', 'title', 'email_1', 'email_2',
  'phone_mobile', 'phone_work', 'phone_home', 'address_street', 'address_city',
  'address_state', 'address_zip', 'address_country', 'linkedin_url',
  'linkedin_last_updated', 'website', 'notes', 'tags', 'favorite',
  'created_at', 'updated_at'
];

export class ContactDatabase {
  private db: Database.Database;

  constructor(filePath: string) {
    this.db = new Database(filePath);
    this.db.pragma('journal_mode = WAL');
    this.db.exec(SCHEMA);
  }

  close(): void {
    this.db.close();
  }

  count(): number {
    const row = this.db.prepare('SELECT COUNT(*) as n FROM contacts').get() as { n: number };
    return row.n;
  }

  list(): Contact[] {
    return this.db
      .prepare('SELECT * FROM contacts ORDER BY last_name COLLATE NOCASE, first_name COLLATE NOCASE')
      .all() as Contact[];
  }

  get(id: number): Contact | undefined {
    return this.db.prepare('SELECT * FROM contacts WHERE id = ?').get(id) as Contact | undefined;
  }

  create(input: NewContact): Contact {
    const now = new Date().toISOString();
    const contact: Contact = { ...emptyContact(), ...input, created_at: now, updated_at: now };
    const placeholders = COLUMNS.map(() => '?').join(', ');
    const values = COLUMNS.map((col) => contact[col]);
    const result = this.db
      .prepare(`INSERT INTO contacts (${COLUMNS.join(', ')}) VALUES (${placeholders})`)
      .run(...(values as never[]));
    return this.get(Number(result.lastInsertRowid))!;
  }

  update(id: number, input: NewContact): Contact | undefined {
    const existing = this.get(id);
    if (!existing) return undefined;
    const updated: Contact = { ...existing, ...input, id, updated_at: new Date().toISOString() };
    const assignments = COLUMNS.map((col) => `${col} = ?`).join(', ');
    const values = COLUMNS.map((col) => updated[col]);
    this.db.prepare(`UPDATE contacts SET ${assignments} WHERE id = ?`).run(...(values as never[]), id);
    return this.get(id);
  }

  delete(id: number): boolean {
    const result = this.db.prepare('DELETE FROM contacts WHERE id = ?').run(id);
    return result.changes > 0;
  }

  toggleFavorite(id: number): Contact | undefined {
    const existing = this.get(id);
    if (!existing) return undefined;
    return this.update(id, { favorite: existing.favorite ? 0 : 1 });
  }

  /** Bulk-insert within a single transaction. Returns created contacts. */
  bulkCreate(inputs: NewContact[]): Contact[] {
    const created: Contact[] = [];
    const txn = this.db.transaction((items: NewContact[]) => {
      for (const item of items) created.push(this.create(item));
    });
    txn(inputs);
    return created;
  }

  logImport(entry: Omit<ImportLogEntry, 'id'>): void {
    this.db
      .prepare('INSERT INTO import_log (filename, format, records_imported, imported_at) VALUES (?, ?, ?, ?)')
      .run(entry.filename, entry.format, entry.records_imported, entry.imported_at);
  }

  importLog(): ImportLogEntry[] {
    return this.db.prepare('SELECT * FROM import_log ORDER BY imported_at DESC').all() as ImportLogEntry[];
  }
}
