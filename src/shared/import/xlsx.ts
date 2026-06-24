import * as XLSX from 'xlsx';
import { ParsedImport } from '../types';
import { autoGuessMapping } from './mapping';
import { applyMapping } from './csv';

/** Parse the first sheet of an XLSX workbook (from a file buffer). */
export function parseXlsxBuffer(buffer: ArrayBuffer | Buffer): ParsedImport {
  const workbook = XLSX.read(buffer, { type: 'buffer' });
  const sheetName = workbook.SheetNames[0];
  if (!sheetName) return { contacts: [], headers: [], rows: [] };
  const sheet = workbook.Sheets[sheetName];
  const matrix: string[][] = XLSX.utils.sheet_to_json(sheet, {
    header: 1,
    raw: false,
    defval: ''
  });
  return matrixToParsed(matrix);
}

/** Shared logic so tests can feed a plain matrix without a real workbook. */
export function matrixToParsed(matrix: string[][]): ParsedImport {
  const cleaned = matrix.filter((row) => row.some((cell) => String(cell).trim() !== ''));
  if (cleaned.length === 0) return { contacts: [], headers: [], rows: [] };
  const headers = cleaned[0].map((h) => String(h).trim());
  const rows = cleaned.slice(1).map((r) => r.map((c) => String(c)));
  const mapping = autoGuessMapping(headers);
  const contacts = applyMapping(headers, rows, mapping);
  return { contacts, headers, rows };
}
