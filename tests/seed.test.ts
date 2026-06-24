import * as os from 'os';
import * as path from 'path';
import * as fs from 'fs';
import { ContactDatabase } from '../src/main/database';
import { normalizeSeedRecord, loadSeedContacts } from '../src/main/seed';

function tmp(name: string): string {
  return path.join(os.tmpdir(), `addressbook-${name}-${Date.now()}-${Math.random()}`);
}

const masterRecord = {
  id: 1,
  first_name: 'E.',
  last_name: 'Anderson',
  company: 'Vancouver Police Department',
  title: 'Police Officer',
  email_1: 'erik.anderson@ci.vancouver.wa.us',
  email_3: 'dropped@example.com',
  phone_work: '(360) 487-7400',
  fax: '(360) 000-0000',
  address_line_1: 'P.O. Box 1995',
  address_line_2: 'Suite 4',
  city: 'Vancouver',
  state: 'WA',
  zip: '98668-1995',
  country: 'United States',
  categories: 'work,police',
  birthday: '1980-01-01',
  spouse: 'Jane',
  department: 'Patrol',
  user_1: 'custom-a',
  favorite: 1,
  source_file: 'Contacts-3.csv'
};

describe('seed normalizer', () => {
  it('maps Outlook-style field names onto the Contact schema', () => {
    const c = normalizeSeedRecord(masterRecord);
    expect(c.first_name).toBe('E.');
    expect(c.last_name).toBe('Anderson');
    expect(c.address_street).toBe('P.O. Box 1995, Suite 4');
    expect(c.address_city).toBe('Vancouver');
    expect(c.address_state).toBe('WA');
    expect(c.address_zip).toBe('98668-1995');
    expect(c.address_country).toBe('United States');
    expect(c.tags).toBe('work,police');
    expect(c.favorite).toBe(1);
    expect(c.birthday).toBe('1980-01-01');
    expect(c.spouse).toBe('Jane');
    expect(c.department).toBe('Patrol');
    expect(c.user_1).toBe('custom-a');
  });

  it('coerces missing fields to empty strings', () => {
    const c = normalizeSeedRecord({ first_name: 'Solo' });
    expect(c.last_name).toBe('');
    expect(c.address_street).toBe('');
    expect(c.favorite).toBe(0);
  });
});

describe('seeding from a master file', () => {
  let seedPath: string;
  let dbPath: string;
  let db: ContactDatabase;

  beforeEach(() => {
    seedPath = tmp('master') + '.json';
    dbPath = tmp('db') + '.db';
    const records = Array.from({ length: 25 }, (_, i) => ({
      ...masterRecord,
      id: i + 1,
      first_name: `Person${i}`,
      email_1: `person${i}@example.com`
    }));
    fs.writeFileSync(seedPath, JSON.stringify(records));
    db = new ContactDatabase(dbPath);
  });

  afterEach(() => {
    db.close();
    for (const f of [seedPath, dbPath, dbPath + '-wal', dbPath + '-shm']) {
      if (fs.existsSync(f)) fs.unlinkSync(f);
    }
  });

  it('inserts every record from the seed file with mapped fields', () => {
    const contacts = loadSeedContacts(seedPath);
    expect(contacts).toHaveLength(25);
    db.bulkCreate(contacts);
    expect(db.count()).toBe(25);
    const all = db.list();
    expect(all.every((c) => c.address_city === 'Vancouver')).toBe(true);
    expect(all.every((c) => c.tags === 'work,police')).toBe(true);
  });
});
