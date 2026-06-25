import { ipcMain, dialog, BrowserWindow } from 'electron';
import * as path from 'path';
import * as fs from 'fs';
import { ContactDatabase } from './database';
import { IPC } from '../shared/ipc';
import {
  NewContact,
  DuplicateStrategy,
  ImportFormat,
  FieldMapping
} from '../shared/types';
import {
  detectFormat,
  parseByFormat,
  parseXlsxBuffer,
  applyMapping
} from '../shared/import';
import { commitImport } from './import-service';
import { exportCsv, exportJson, exportVcard } from '../shared/export';
import { getSettings, setSettings } from './settings';
import { updateContact, updateAll, connect } from './linkedin';

interface DbHolder {
  db: ContactDatabase | null;
  path: string | null;
}

const holder: DbHolder = { db: null, path: null };

export function getCurrentDb(): DbHolder {
  return holder;
}

function requireDb(): ContactDatabase {
  if (!holder.db) throw new Error('No database is open.');
  return holder.db;
}

const IMPORT_FILTERS: Record<ImportFormat, Electron.FileFilter[]> = {
  csv: [{ name: 'CSV', extensions: ['csv'] }],
  vcard: [{ name: 'vCard', extensions: ['vcf', 'vcard'] }],
  json: [{ name: 'JSON', extensions: ['json'] }],
  xlsx: [{ name: 'Excel', extensions: ['xlsx', 'xls'] }],
  text: [{ name: 'Text', extensions: ['txt'] }]
};

export function registerIpcHandlers(
  getWindow: () => BrowserWindow | null,
  openDatabaseAt: (filePath: string) => void,
  documentsDir: () => string
): void {
  // --- contacts ---
  ipcMain.handle(IPC.CONTACTS_LIST, () => requireDb().list());
  ipcMain.handle(IPC.CONTACT_GET, (_e, id: number) => requireDb().get(id));
  ipcMain.handle(IPC.CONTACT_CREATE, (_e, c: NewContact) => requireDb().create(c));
  ipcMain.handle(IPC.CONTACT_UPDATE, (_e, id: number, c: NewContact) =>
    requireDb().update(id, c)
  );
  ipcMain.handle(IPC.CONTACT_DELETE, (_e, id: number) => requireDb().delete(id));
  ipcMain.handle(IPC.CONTACT_TOGGLE_FAVORITE, (_e, id: number) =>
    requireDb().toggleFavorite(id)
  );

  // --- merge ---
  ipcMain.handle(IPC.CONTACTS_FIND_DUPLICATES, () => requireDb().findDuplicates());
  ipcMain.handle(
    IPC.CONTACT_MERGE,
    (_e, primaryId: number, secondaryId: number, mergedData: NewContact) =>
      requireDb().mergeContacts(primaryId, secondaryId, mergedData)
  );
  ipcMain.handle(IPC.CONTACT_UNDO_MERGE, (_e, mergeId: number) =>
    requireDb().undoMerge(mergeId)
  );
  ipcMain.handle(IPC.MERGE_HISTORY, () => requireDb().getMergeHistory());

  // --- database ---
  ipcMain.handle(IPC.DB_INFO, () => ({
    path: holder.path,
    filename: holder.path ? path.basename(holder.path) : null,
    count: holder.db ? holder.db.count() : 0
  }));

  ipcMain.handle(IPC.DB_NEW, async () => {
    const win = getWindow();
    if (!win) return { path: null };
    const result = await dialog.showSaveDialog(win, {
      title: 'Create New Database',
      defaultPath: path.join(documentsDir(), 'addressbook.db'),
      filters: [{ name: 'SQLite Database', extensions: ['db'] }]
    });
    if (result.canceled || !result.filePath) return { path: null };
    if (fs.existsSync(result.filePath)) fs.unlinkSync(result.filePath);
    openDatabaseAt(result.filePath);
    return { path: result.filePath };
  });

  ipcMain.handle(IPC.DB_OPEN, async () => {
    const win = getWindow();
    if (!win) return { path: null };
    const result = await dialog.showOpenDialog(win, {
      title: 'Open Database',
      filters: [{ name: 'SQLite Database', extensions: ['db', 'sqlite'] }],
      properties: ['openFile']
    });
    if (result.canceled || !result.filePaths[0]) return { path: null };
    openDatabaseAt(result.filePaths[0]);
    return { path: result.filePaths[0] };
  });

  ipcMain.handle(IPC.DB_SAVE_AS, async () => {
    const win = getWindow();
    if (!win || !holder.path) return { path: null };
    const result = await dialog.showSaveDialog(win, {
      title: 'Save Database As',
      defaultPath: path.join(documentsDir(), 'addressbook-copy.db'),
      filters: [{ name: 'SQLite Database', extensions: ['db'] }]
    });
    if (result.canceled || !result.filePath) return { path: null };
    fs.copyFileSync(holder.path, result.filePath);
    openDatabaseAt(result.filePath);
    return { path: result.filePath };
  });

  // --- import ---
  ipcMain.handle(IPC.IMPORT_PICK, async (_e, format: ImportFormat) => {
    const win = getWindow();
    if (!win) return null;
    const result = await dialog.showOpenDialog(win, {
      title: `Import ${format.toUpperCase()}`,
      filters: IMPORT_FILTERS[format],
      properties: ['openFile']
    });
    if (result.canceled || !result.filePaths[0]) return null;
    const filePath = result.filePaths[0];
    const detected = format ?? detectFormat(filePath);

    let parsed;
    if (detected === 'xlsx') {
      parsed = parseXlsxBuffer(fs.readFileSync(filePath));
    } else {
      parsed = parseByFormat(detected, fs.readFileSync(filePath, 'utf-8'));
    }
    return {
      ...parsed,
      filePath,
      filename: path.basename(filePath),
      format: detected
    };
  });

  ipcMain.handle(
    'import:applyMapping',
    (_e, headers: string[], rows: string[][], mapping: FieldMapping) =>
      applyMapping(headers, rows, mapping)
  );

  ipcMain.handle(
    IPC.IMPORT_COMMIT,
    (
      _e,
      contacts: NewContact[],
      strategy: DuplicateStrategy,
      meta: { filename: string; format: ImportFormat }
    ) => commitImport(requireDb(), contacts, strategy, meta)
  );

  ipcMain.handle(IPC.IMPORT_LOG, () => requireDb().importLog());

  // --- export ---
  ipcMain.handle(IPC.EXPORT, async (_e, format: 'csv' | 'vcard' | 'json') => {
    const win = getWindow();
    if (!win) return { path: null };
    const ext = format === 'vcard' ? 'vcf' : format;
    const result = await dialog.showSaveDialog(win, {
      title: `Export ${format.toUpperCase()}`,
      defaultPath: path.join(documentsDir(), `contacts.${ext}`),
      filters: [{ name: format.toUpperCase(), extensions: [ext] }]
    });
    if (result.canceled || !result.filePath) return { path: null };
    const contacts = requireDb().list();
    const content =
      format === 'csv'
        ? exportCsv(contacts)
        : format === 'json'
        ? exportJson(contacts)
        : exportVcard(contacts);
    fs.writeFileSync(result.filePath, content, 'utf-8');
    return { path: result.filePath };
  });

  // --- settings ---
  ipcMain.handle(IPC.SETTINGS_GET, () => getSettings());
  ipcMain.handle(IPC.SETTINGS_SET, (_e, patch) => setSettings(patch));

  // --- linkedin ---
  ipcMain.handle(IPC.LINKEDIN_UPDATE_ONE, (_e, id: number) =>
    updateContact(requireDb(), id)
  );
  ipcMain.handle(IPC.LINKEDIN_UPDATE_ALL, () => updateAll(requireDb()));
  ipcMain.handle(IPC.LINKEDIN_CONNECT, () => connect(getSettings().linkedinClientId));
}
