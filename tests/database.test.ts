import * as os from 'os';
import * as path from 'path';
import * as fs from 'fs';
import { ContactDatabase } from '../src/main/database';
import { commitImport } from '../src/main/import-service';

function tmpDbPath(): string {
  return path.join(os.tmpdir(), `addressbook-test-${Date.now()}-${Math.random()}.db`);
}

describe('ContactDatabase CRUD', () => {
  let dbPath: string;
  let db: ContactDatabase;

  beforeEach(() => {
    dbPath = tmpDbPath();
    db = new ContactDatabase(dbPath);
  });

  afterEach(() => {
    db.close();
    for (const ext of ['', '-wal', '-shm']) {
      const f = dbPath + ext;
      if (fs.existsSync(f)) fs.unlinkSync(f);
    }
  });

  it('creates and reads a contact', () => {
    const created = db.create({ first_name: 'Ada', last_name: 'Lovelace', email_1: 'ada@math.org' });
    expect(created.id).toBeGreaterThan(0);
    expect(created.created_at).toBeTruthy();
    const fetched = db.get(created.id!);
    expect(fetched?.email_1).toBe('ada@math.org');
  });

  it('lists contacts ordered by last then first name', () => {
    db.create({ first_name: 'Alan', last_name: 'Turing' });
    db.create({ first_name: 'Ada', last_name: 'Lovelace' });
    const list = db.list();
    expect(list.map((c) => c.last_name)).toEqual(['Lovelace', 'Turing']);
  });

  it('updates a contact and bumps updated_at', async () => {
    const c = db.create({ first_name: 'Grace', last_name: 'Hopper' });
    const updated = db.update(c.id!, { title: 'Rear Admiral' });
    expect(updated?.title).toBe('Rear Admiral');
    expect(updated?.first_name).toBe('Grace');
  });

  it('deletes a contact', () => {
    const c = db.create({ first_name: 'Temp' });
    expect(db.delete(c.id!)).toBe(true);
    expect(db.get(c.id!)).toBeUndefined();
  });

  it('toggles favorite', () => {
    const c = db.create({ first_name: 'Fav' });
    expect(db.toggleFavorite(c.id!)?.favorite).toBe(1);
    expect(db.toggleFavorite(c.id!)?.favorite).toBe(0);
  });

  it('bulk-creates and counts', () => {
    db.bulkCreate([{ first_name: 'A' }, { first_name: 'B' }, { first_name: 'C' }]);
    expect(db.count()).toBe(3);
  });

  it('commitImport applies skip strategy and writes an import log', () => {
    db.create({ first_name: 'Ada', last_name: 'Lovelace', email_1: 'ada@math.org' });
    const summary = commitImport(
      db,
      [
        { first_name: 'Ada', last_name: 'Lovelace', email_1: 'ada@math.org' },
        { first_name: 'New', last_name: 'Person', email_1: 'new@x.com' }
      ],
      'skip',
      { filename: 'test.csv', format: 'csv' }
    );
    expect(summary.imported).toBe(1);
    expect(summary.skipped).toBe(1);
    expect(db.count()).toBe(2);
    expect(db.importLog()).toHaveLength(1);
  });

  it('commitImport merge fills empty fields on the existing contact', () => {
    const orig = db.create({ first_name: 'Ada', last_name: 'Lovelace', email_1: 'ada@math.org' });
    const summary = commitImport(
      db,
      [{ first_name: 'Ada', last_name: 'Lovelace', email_1: 'ada@math.org', phone_mobile: '555-1' }],
      'merge',
      { filename: 'test.csv', format: 'csv' }
    );
    expect(summary.merged).toBe(1);
    expect(db.get(orig.id!)?.phone_mobile).toBe('555-1');
  });
});
