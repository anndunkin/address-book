import * as XLSX from 'xlsx';
import { parseXlsxBuffer, matrixToParsed } from '../src/shared/import/xlsx';

describe('XLSX parser', () => {
  it('parses a matrix with header row and auto-maps fields', () => {
    const matrix = [
      ['First Name', 'Last Name', 'Email', 'Company'],
      ['Ada', 'Lovelace', 'ada@math.org', 'Analytical Engines'],
      ['Alan', 'Turing', 'alan@enigma.uk', 'Bletchley']
    ];
    const result = matrixToParsed(matrix);
    expect(result.headers).toEqual(['First Name', 'Last Name', 'Email', 'Company']);
    expect(result.contacts).toHaveLength(2);
    expect(result.contacts[1]).toMatchObject({
      first_name: 'Alan',
      last_name: 'Turing',
      email_1: 'alan@enigma.uk'
    });
  });

  it('parses a real xlsx workbook buffer', () => {
    const ws = XLSX.utils.aoa_to_sheet([
      ['first_name', 'company'],
      ['Grace', 'US Navy']
    ]);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');
    const buf = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });
    const result = parseXlsxBuffer(buf);
    expect(result.contacts[0]).toMatchObject({ first_name: 'Grace', company: 'US Navy' });
  });

  it('skips fully empty rows', () => {
    const matrix = [
      ['first_name'],
      [''],
      ['Ada']
    ];
    const result = matrixToParsed(matrix);
    expect(result.contacts).toHaveLength(1);
  });
});
