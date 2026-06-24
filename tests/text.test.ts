import { parseText } from '../src/shared/import/text';

describe('Plain text parser', () => {
  it('detects name, email and phone from a line', () => {
    const { contacts } = parseText('Ada Lovelace, ada@math.org, 555-123-4567');
    expect(contacts[0]).toMatchObject({
      first_name: 'Ada',
      last_name: 'Lovelace',
      email_1: 'ada@math.org',
      phone_mobile: '555-123-4567'
    });
  });

  it('classifies a LinkedIn URL', () => {
    const { contacts } = parseText('Grace Hopper https://www.linkedin.com/in/gracehopper');
    expect(contacts[0].linkedin_url).toBe('https://www.linkedin.com/in/gracehopper');
    expect(contacts[0].first_name).toBe('Grace');
  });

  it('treats each non-empty line as a contact', () => {
    const { contacts } = parseText('Ada\n\nAlan\nGrace');
    expect(contacts).toHaveLength(3);
  });
});
