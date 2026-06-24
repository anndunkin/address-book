import { parseCsv, applyMapping } from '../src/shared/import/csv';
import { autoGuessMapping } from '../src/shared/import/mapping';

describe('CSV parser', () => {
  it('parses headers and auto-maps common columns', () => {
    const csv =
      'First Name,Last Name,Company,Email,Mobile\n' +
      'Ada,Lovelace,Analytical Engines,ada@math.org,555-1000\n' +
      'Alan,Turing,Bletchley,alan@enigma.uk,555-2000';
    const result = parseCsv(csv);
    expect(result.headers).toEqual(['First Name', 'Last Name', 'Company', 'Email', 'Mobile']);
    expect(result.contacts).toHaveLength(2);
    expect(result.contacts[0]).toMatchObject({
      first_name: 'Ada',
      last_name: 'Lovelace',
      company: 'Analytical Engines',
      email_1: 'ada@math.org',
      phone_mobile: '555-1000'
    });
  });

  it('handles quoted fields with commas', () => {
    const csv = 'first_name,company\n"Grace","Hopper, Inc"';
    const result = parseCsv(csv);
    expect(result.contacts[0].company).toBe('Hopper, Inc');
  });

  it('ignores unmapped columns when applying an explicit mapping', () => {
    const headers = ['Name', 'Extra'];
    const rows = [['Solo', 'junk']];
    const mapping = { Name: 'first_name' as const, Extra: '' as const };
    const contacts = applyMapping(headers, rows, mapping);
    expect(contacts[0]).toEqual({ first_name: 'Solo' });
  });

  it('auto-guesses field mapping from aliases', () => {
    const mapping = autoGuessMapping(['Given Name', 'Surname', 'E-Mail', 'Unknown']);
    expect(mapping['Given Name']).toBe('first_name');
    expect(mapping['Surname']).toBe('last_name');
    expect(mapping['E-Mail']).toBe('email_1');
    expect(mapping['Unknown']).toBe('');
  });
});
