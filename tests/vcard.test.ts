import { parseVcard } from '../src/shared/import/vcard';

describe('vCard parser', () => {
  it('parses a vCard 3.0 card', () => {
    const vcf = [
      'BEGIN:VCARD',
      'VERSION:3.0',
      'N:Lovelace;Ada;;;',
      'FN:Ada Lovelace',
      'ORG:Analytical Engines',
      'TITLE:Mathematician',
      'EMAIL;TYPE=INTERNET:ada@math.org',
      'TEL;TYPE=CELL:555-1000',
      'TEL;TYPE=WORK:555-2000',
      'ADR;TYPE=WORK:;;1 Engine Way;London;;EC1;UK',
      'URL:https://www.linkedin.com/in/adalovelace',
      'NOTE:First programmer',
      'CATEGORIES:work,history',
      'END:VCARD'
    ].join('\r\n');
    const { contacts } = parseVcard(vcf);
    expect(contacts).toHaveLength(1);
    expect(contacts[0]).toMatchObject({
      first_name: 'Ada',
      last_name: 'Lovelace',
      company: 'Analytical Engines',
      title: 'Mathematician',
      email_1: 'ada@math.org',
      phone_mobile: '555-1000',
      phone_work: '555-2000',
      address_city: 'London',
      address_country: 'UK',
      linkedin_url: 'https://www.linkedin.com/in/adalovelace',
      notes: 'First programmer',
      tags: 'work,history'
    });
  });

  it('parses multiple cards in one file', () => {
    const vcf =
      'BEGIN:VCARD\nVERSION:2.1\nFN:Alan Turing\nEMAIL:alan@enigma.uk\nEND:VCARD\n' +
      'BEGIN:VCARD\nVERSION:2.1\nFN:Grace Hopper\nEMAIL:grace@navy.mil\nEND:VCARD';
    const { contacts } = parseVcard(vcf);
    expect(contacts).toHaveLength(2);
    expect(contacts[0].first_name).toBe('Alan');
    expect(contacts[0].last_name).toBe('Turing');
    expect(contacts[1].email_1).toBe('grace@navy.mil');
  });

  it('derives names from FN when N is absent', () => {
    const vcf = 'BEGIN:VCARD\nVERSION:3.0\nFN:Katherine Johnson\nEND:VCARD';
    const { contacts } = parseVcard(vcf);
    expect(contacts[0].first_name).toBe('Katherine');
    expect(contacts[0].last_name).toBe('Johnson');
  });
});
