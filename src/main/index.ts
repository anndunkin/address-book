import { app, BrowserWindow, dialog } from 'electron';
import * as path from 'path';
import * as fs from 'fs';
import { ContactDatabase } from './database';
import { buildMenu, setWindowTitle } from './menu';
import { getSettings, setDatabasePath } from './settings';
import { registerIpcHandlers, getCurrentDb } from './ipc-handlers';
import { loadSeedContacts } from './seed';
import { IPC, SeedProgress } from '../shared/ipc';

let mainWindow: BrowserWindow | null = null;

/**
 * Resolve the bundled sample seed file (10 demo contacts) in both dev and
 * packaged contexts. Gives a brand-new database a small starter dataset on
 * first launch; users import their own contacts via File → Import.
 *
 * Note: v1.0.0–v1.0.4 bundled the full master-contacts.json (~20k contacts) as
 * a one-time first-launch seed. That file is no longer shipped — the app now
 * seeds only the small sample dataset and users manage their own data.
 */
function sampleSeedPath(): string {
  const candidates = [
    path.join(process.resourcesPath || '', 'data', 'sample-contacts.json'),
    path.join(app.getAppPath(), 'data', 'sample-contacts.json'),
    path.join(__dirname, '..', '..', 'data', 'sample-contacts.json')
  ];
  return candidates.find((p) => fs.existsSync(p)) || candidates[candidates.length - 1];
}

/** Documents/AddressBook is where the portable .db lives. */
function documentsDir(): string {
  const dir = path.join(app.getPath('documents'), 'AddressBook');
  fs.mkdirSync(dir, { recursive: true });
  return dir;
}

function sendSeedProgress(progress: SeedProgress): void {
  mainWindow?.webContents.send(IPC.SEED_PROGRESS, progress);
}

/**
 * Seed a brand-new database from the bundled sample file. Runs only once: if the
 * database already has contacts, this is a no-op so a user's data is never
 * overwritten on subsequent launches.
 */
function seedDatabase(db: ContactDatabase): void {
  if (db.count() > 0) return;
  const seed = sampleSeedPath();
  if (!fs.existsSync(seed)) return;
  try {
    const contacts = loadSeedContacts(seed);
    if (!contacts.length) return;
    sendSeedProgress({ phase: 'start', total: contacts.length });
    db.bulkCreate(contacts);
    sendSeedProgress({ phase: 'done', total: contacts.length });
  } catch {
    /* ignore malformed seed */
  }
}

export function openDatabaseAt(filePath: string): void {
  const current = getCurrentDb();
  if (current.db) current.db.close();
  const db = new ContactDatabase(filePath);
  seedDatabase(db);
  current.db = db;
  current.path = filePath;
  setDatabasePath(filePath);
  if (mainWindow) setWindowTitle(mainWindow, path.basename(filePath));
}

async function firstLaunchFlow(): Promise<void> {
  const settings = getSettings();

  if (settings.databasePath && fs.existsSync(settings.databasePath)) {
    openDatabaseAt(settings.databasePath);
    return;
  }

  if (!mainWindow) return;
  const choice = await dialog.showMessageBox(mainWindow, {
    type: 'question',
    buttons: ['Create New Database', 'Open Existing…'],
    defaultId: 0,
    cancelId: 0,
    title: 'Welcome to Address Book',
    message: 'No address book database is configured.',
    detail: 'Create a new database (pre-loaded with the bundled contacts) or open an existing .db file.'
  });

  if (choice.response === 1) {
    const result = await dialog.showOpenDialog(mainWindow, {
      title: 'Open Address Book Database',
      filters: [{ name: 'SQLite Database', extensions: ['db', 'sqlite'] }],
      properties: ['openFile']
    });
    if (!result.canceled && result.filePaths[0]) {
      openDatabaseAt(result.filePaths[0]);
      return;
    }
  }

  // Default: create new in Documents/AddressBook.
  const defaultPath = path.join(documentsDir(), 'addressbook.db');
  openDatabaseAt(defaultPath);
}

function createWindow(): void {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 800,
    minHeight: 600,
    title: 'Address Book',
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false
    }
  });

  buildMenu(mainWindow);
  mainWindow.loadFile(path.join(__dirname, '..', 'renderer', 'index.html'));

  mainWindow.webContents.on('did-finish-load', () => {
    void firstLaunchFlow();
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

app.whenReady().then(() => {
  registerIpcHandlers(
    () => mainWindow,
    (filePath) => openDatabaseAt(filePath),
    documentsDir
  );
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  const current = getCurrentDb();
  if (current.db) current.db.close();
  if (process.platform !== 'darwin') app.quit();
});
