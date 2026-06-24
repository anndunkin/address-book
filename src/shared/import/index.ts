import { ImportFormat, ParsedImport } from '../types';
import { parseCsv } from './csv';
import { parseVcard } from './vcard';
import { parseJson } from './json';
import { parseText } from './text';
import { parseXlsxBuffer } from './xlsx';

export * from './csv';
export * from './vcard';
export * from './json';
export * from './text';
export * from './xlsx';
export * from './mapping';
export * from './duplicates';

export function detectFormat(filePath: string): ImportFormat {
  const ext = filePath.toLowerCase().split('.').pop() ?? '';
  switch (ext) {
    case 'csv':
      return 'csv';
    case 'vcf':
    case 'vcard':
      return 'vcard';
    case 'json':
      return 'json';
    case 'xlsx':
    case 'xls':
      return 'xlsx';
    default:
      return 'text';
  }
}

/** Parse text-based formats. XLSX must use parseXlsxBuffer with a Buffer. */
export function parseByFormat(format: ImportFormat, content: string): ParsedImport {
  switch (format) {
    case 'csv':
      return parseCsv(content);
    case 'vcard':
      return parseVcard(content);
    case 'json':
      return parseJson(content);
    case 'text':
      return parseText(content);
    default:
      throw new Error(`Use parseXlsxBuffer for format: ${format}`);
  }
}
