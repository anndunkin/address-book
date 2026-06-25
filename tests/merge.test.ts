import * as os from 'os';
import * as path from 'path';
import * as fs from 'fs';
import { ContactDatabase } from '../src/main/database';

function tmpDbPath(): string {
  return path.join(os.tmpdir(), `addressbook-merge-${Date.now()}-${Math.random()}.db`);
}

describe('merge feature', () => {
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

  describe('findDuplicates', () => {
    it('detects HIGH confidence on shared email', () => {
      db.create({ first_name: 'John', last_name: 'Smith', email_1: 'john@acme.com', company: 'Acme' });
      db.create({ first_name: 'John', last_name: 'Smith', email_1: 'john@acme.com' });
      const groups = db.findDuplicates();
      expect(groups).toHaveLength(1);
      expect(groups[0].confidence).toBe('high');
      expect(groups[0].contacts).toHaveLength(2);
      expect(groups[0].reason).toContain('john@acme.com');
    });

    it('matches a shared email even across different email slots', () => {
      db.create({ first_name: 'A', last_name: 'One', email_1: 'shared@x.com' });
      db.create({ first_name: 'B', last_name: 'Two', email_2: 'shared@x.com' });
      const groups = db.findDuplicates();
      expect(groups).toHaveLength(1);
      expect(groups[0].confidence).toBe('high');
    });

    it('detects MEDIUM confidence on same first + last name', () => {
      db.create({ first_name: 'David', last_name: 'Johnson', email_1: 'd.j@gmail.com' });
      db.create({ first_name: 'David', last_name: 'Johnson', email_1: 'd.johnson@doe.gov' });
      const groups = db.findDuplicates();
      expect(groups).toHaveLength(1);
      expect(groups[0].confidence).toBe('medium');
    });

    it('detects LOW confidence on same last name + company', () => {
      db.create({ first_name: 'Sam', last_name: 'Lee', company: 'Globex' });
      db.create({ first_name: 'Pat', last_name: 'Lee', company: 'Globex' });
      const groups = db.findDuplicates();
      expect(groups).toHaveLength(1);
      expect(groups[0].confidence).toBe('low');
    });

    it('places each contact in only the highest-confidence group', () => {
      // Same email AND same name — should be a single HIGH group, not two.
      db.create({ first_name: 'John', last_name: 'Smith', email_1: 'j@x.com' });
      db.create({ first_name: 'John', last_name: 'Smith', email_1: 'j@x.com' });
      const groups = db.findDuplicates();
      expect(groups).toHaveLength(1);
      expect(groups[0].confidence).toBe('high');
    });

    it('returns nothing when there are no duplicates', () => {
      db.create({ first_name: 'Unique', last_name: 'Person', email_1: 'u@x.com' });
      db.create({ first_name: 'Other', last_name: 'Human', email_1: 'o@y.com' });
      expect(db.findDuplicates()).toHaveLength(0);
    });
  });

  describe('mergeContacts', () => {
    it('writes merged data to the primary and deletes the secondary', () => {
      const a = db.create({ first_name: 'John', last_name: 'Smith', company: 'Acme', email_1: 'john@acme.com' });
      const b = db.create({ first_name: 'John', last_name: 'Smith', title: 'VP Sales', email_1: 'john@acme.com' });

      const merged = db.mergeContacts(a.id!, b.id!, {
        first_name: 'John',
        last_name: 'Smith',
        company: 'Acme',
        title: 'VP Sales',
        email_1: 'john@acme.com'
      });

      expect(merged.id).toBe(a.id);
      expect(merged.company).toBe('Acme');
      expect(merged.title).toBe('VP Sales');
      expect(db.get(b.id!)).toBeUndefined();
      expect(db.count()).toBe(1);
    });

    it('records a merge_history entry', () => {
      const a = db.create({ first_name: 'A', last_name: 'X' });
      const b = db.create({ first_name: 'B', last_name: 'X' });
      db.mergeContacts(a.id!, b.id!, { first_name: 'A', last_name: 'X' });
      const history = db.getMergeHistory();
      expect(history).toHaveLength(1);
      expect(history[0].primary_id).toBe(a.id);
      expect(history[0].secondary_snapshot.id).toBe(b.id);
    });

    it('throws if either contact is missing', () => {
      const a = db.create({ first_name: 'A' });
      expect(() => db.mergeContacts(a.id!, 99999, {})).toThrow();
    });
  });

  describe('undoMerge', () => {
    it('restores the deleted secondary and reverts the primary', () => {
      const a = db.create({ first_name: 'John', last_name: 'Smith', company: 'Acme' });
      const b = db.create({ first_name: 'John', last_name: 'Smith', title: 'VP' });

      db.mergeContacts(a.id!, b.id!, {
        first_name: 'John',
        last_name: 'Smith',
        company: 'Acme',
        title: 'VP'
      });
      expect(db.count()).toBe(1);
      // primary picked up the title from B
      expect(db.get(a.id!)?.title).toBe('VP');

      const history = db.getMergeHistory();
      db.undoMerge(history[0].id);

      expect(db.count()).toBe(2);
      // primary reverted to its pre-merge state (no title)
      expect(db.get(a.id!)?.title).toBe('');
      // secondary restored with its original id
      const restored = db.get(b.id!);
      expect(restored?.first_name).toBe('John');
      expect(restored?.title).toBe('VP');
    });

    it('removes the history entry so it cannot be undone twice', () => {
      const a = db.create({ first_name: 'A' });
      const b = db.create({ first_name: 'B' });
      db.mergeContacts(a.id!, b.id!, { first_name: 'A' });
      const id = db.getMergeHistory()[0].id;
      db.undoMerge(id);
      expect(db.getMergeHistory()).toHaveLength(0);
      // a second undo is a no-op
      expect(() => db.undoMerge(id)).not.toThrow();
      expect(db.count()).toBe(2);
    });
  });
});
