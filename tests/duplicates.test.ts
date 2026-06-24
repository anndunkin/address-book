import {
  buildDuplicateIndex,
  findDuplicate,
  mergeContacts
} from '../src/shared/import/duplicates';
import { Contact, emptyContact } from '../src/shared/types';

function make(overrides: Partial<Contact>): Contact {
  return { ...emptyContact(), id: Math.floor(Math.random() * 100000), ...overrides };
}

describe('Duplicate detection', () => {
  const existing: Contact[] = [
    make({ id: 1, first_name: 'Ada', last_name: 'Lovelace', email_1: 'ada@math.org', company: 'AE' }),
    make({ id: 2, first_name: 'Alan', last_name: 'Turing', company: 'Bletchley' })
  ];
  const index = buildDuplicateIndex(existing);

  it('matches by email (case-insensitive)', () => {
    const dup = findDuplicate({ email_1: 'ADA@math.org' }, index);
    expect(dup?.id).toBe(1);
  });

  it('matches by second email field', () => {
    const idx = buildDuplicateIndex([make({ id: 9, email_2: 'alt@x.com' })]);
    expect(findDuplicate({ email_1: 'alt@x.com' }, idx)?.id).toBe(9);
  });

  it('matches by first + last + company when no email', () => {
    const dup = findDuplicate(
      { first_name: 'Alan', last_name: 'Turing', company: 'Bletchley' },
      index
    );
    expect(dup?.id).toBe(2);
  });

  it('returns null when nothing matches', () => {
    expect(findDuplicate({ first_name: 'Grace', last_name: 'Hopper' }, index)).toBeNull();
  });

  it('merges only into empty fields and never overwrites existing data', () => {
    const target = make({ id: 1, first_name: 'Ada', last_name: 'Lovelace', email_1: 'ada@math.org' });
    const merged = mergeContacts(target, {
      email_1: 'should-not-overwrite@x.com',
      phone_mobile: '555-9999',
      company: 'New Co'
    });
    expect(merged.email_1).toBe('ada@math.org');
    expect(merged.phone_mobile).toBe('555-9999');
    expect(merged.company).toBe('New Co');
  });
});
