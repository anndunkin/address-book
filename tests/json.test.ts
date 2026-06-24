import { parseJson } from '../src/shared/import/json';

describe('JSON parser', () => {
  it('parses an array of direct-field contact objects', () => {
    const json = JSON.stringify([
      { first_name: 'Ada', last_name: 'Lovelace', email_1: 'ada@math.org' },
      { first_name: 'Alan', last_name: 'Turing' }
    ]);
    const { contacts } = parseJson(json);
    expect(contacts).toHaveLength(2);
    expect(contacts[0].email_1).toBe('ada@math.org');
  });

  it('maps aliased keys like firstName and Email', () => {
    const json = JSON.stringify([
      { firstName: 'Grace', surname: 'Hopper', Email: 'grace@navy.mil', Company: 'US Navy' }
    ]);
    const { contacts } = parseJson(json);
    expect(contacts[0]).toMatchObject({
      first_name: 'Grace',
      last_name: 'Hopper',
      email_1: 'grace@navy.mil',
      company: 'US Navy'
    });
  });

  it('joins array tags into a comma string', () => {
    const json = JSON.stringify([{ first_name: 'A', tags: ['work', 'vip'] }]);
    const { contacts } = parseJson(json);
    expect(contacts[0].tags).toBe('work, vip');
  });

  it('accepts a single object (not wrapped in array)', () => {
    const { contacts } = parseJson(JSON.stringify({ first_name: 'Solo' }));
    expect(contacts).toHaveLength(1);
    expect(contacts[0].first_name).toBe('Solo');
  });
});
