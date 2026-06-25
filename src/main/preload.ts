import { contextBridge, ipcRenderer } from 'electron';
import { IPC, MenuEvent, SeedProgress } from '../shared/ipc';
import {
  Contact,
  NewContact,
  AppSettings,
  DuplicateStrategy,
  DuplicateGroup,
  MergeHistoryEntry,
  ImportFormat,
  ImportSummary,
  ParsedImport,
  FieldMapping,
  ImportLogEntry,
  LinkedInUpdateResult
} from '../shared/types';

export interface PickedImport extends ParsedImport {
  filePath: string;
  filename: string;
  format: ImportFormat;
}

const api = {
  listContacts: (): Promise<Contact[]> => ipcRenderer.invoke(IPC.CONTACTS_LIST),
  getContact: (id: number): Promise<Contact | undefined> =>
    ipcRenderer.invoke(IPC.CONTACT_GET, id),
  createContact: (c: NewContact): Promise<Contact> =>
    ipcRenderer.invoke(IPC.CONTACT_CREATE, c),
  updateContact: (id: number, c: NewContact): Promise<Contact> =>
    ipcRenderer.invoke(IPC.CONTACT_UPDATE, id, c),
  deleteContact: (id: number): Promise<boolean> =>
    ipcRenderer.invoke(IPC.CONTACT_DELETE, id),
  toggleFavorite: (id: number): Promise<Contact> =>
    ipcRenderer.invoke(IPC.CONTACT_TOGGLE_FAVORITE, id),

  findDuplicates: (): Promise<DuplicateGroup[]> =>
    ipcRenderer.invoke(IPC.CONTACTS_FIND_DUPLICATES),
  mergeContacts: (
    primaryId: number,
    secondaryId: number,
    mergedData: NewContact
  ): Promise<Contact> =>
    ipcRenderer.invoke(IPC.CONTACT_MERGE, primaryId, secondaryId, mergedData),
  undoMerge: (mergeId: number): Promise<void> =>
    ipcRenderer.invoke(IPC.CONTACT_UNDO_MERGE, mergeId),
  getMergeHistory: (): Promise<MergeHistoryEntry[]> =>
    ipcRenderer.invoke(IPC.MERGE_HISTORY),

  dbInfo: (): Promise<{ path: string | null; filename: string | null; count: number }> =>
    ipcRenderer.invoke(IPC.DB_INFO),
  newDatabase: (): Promise<{ path: string | null }> => ipcRenderer.invoke(IPC.DB_NEW),
  openDatabase: (): Promise<{ path: string | null }> => ipcRenderer.invoke(IPC.DB_OPEN),
  saveDatabaseAs: (): Promise<{ path: string | null }> =>
    ipcRenderer.invoke(IPC.DB_SAVE_AS),

  pickImport: (format: ImportFormat): Promise<PickedImport | null> =>
    ipcRenderer.invoke(IPC.IMPORT_PICK, format),
  commitImport: (
    contacts: NewContact[],
    strategy: DuplicateStrategy,
    meta: { filename: string; format: ImportFormat }
  ): Promise<ImportSummary> =>
    ipcRenderer.invoke(IPC.IMPORT_COMMIT, contacts, strategy, meta),
  applyMappingPreview: (
    headers: string[],
    rows: string[][],
    mapping: FieldMapping
  ): Promise<NewContact[]> => ipcRenderer.invoke('import:applyMapping', headers, rows, mapping),
  exportContacts: (format: 'csv' | 'vcard' | 'json'): Promise<{ path: string | null }> =>
    ipcRenderer.invoke(IPC.EXPORT, format),
  importLog: (): Promise<ImportLogEntry[]> => ipcRenderer.invoke(IPC.IMPORT_LOG),

  getSettings: (): Promise<AppSettings> => ipcRenderer.invoke(IPC.SETTINGS_GET),
  setSettings: (patch: Partial<AppSettings>): Promise<AppSettings> =>
    ipcRenderer.invoke(IPC.SETTINGS_SET, patch),

  linkedinUpdateOne: (id: number): Promise<LinkedInUpdateResult> =>
    ipcRenderer.invoke(IPC.LINKEDIN_UPDATE_ONE, id),
  linkedinUpdateAll: (): Promise<LinkedInUpdateResult[]> =>
    ipcRenderer.invoke(IPC.LINKEDIN_UPDATE_ALL),
  linkedinConnect: (): Promise<{ ok: boolean; message: string }> =>
    ipcRenderer.invoke(IPC.LINKEDIN_CONNECT),

  onMenuEvent: (handler: (event: MenuEvent) => void): (() => void) => {
    const listener = (_e: unknown, evt: MenuEvent) => handler(evt);
    ipcRenderer.on(IPC.MENU_EVENT, listener);
    return () => ipcRenderer.removeListener(IPC.MENU_EVENT, listener);
  },

  onSeedProgress: (handler: (progress: SeedProgress) => void): (() => void) => {
    const listener = (_e: unknown, progress: SeedProgress) => handler(progress);
    ipcRenderer.on(IPC.SEED_PROGRESS, listener);
    return () => ipcRenderer.removeListener(IPC.SEED_PROGRESS, listener);
  }
};

export type AddressBookApi = typeof api;

contextBridge.exposeInMainWorld('addressBook', api);
