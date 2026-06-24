import { app, Menu, BrowserWindow, MenuItemConstructorOptions } from 'electron';
import { IPC, MenuEvent } from '../shared/ipc';

function send(win: BrowserWindow, event: MenuEvent): void {
  win.webContents.send(IPC.MENU_EVENT, event);
}

export function buildMenu(win: BrowserWindow): Menu {
  const template: MenuItemConstructorOptions[] = [
    {
      label: 'File',
      submenu: [
        { label: 'New Database…', accelerator: 'CmdOrCtrl+N', click: () => send(win, 'new-db') },
        { label: 'Open Database…', accelerator: 'CmdOrCtrl+O', click: () => send(win, 'open-db') },
        { label: 'Save', accelerator: 'CmdOrCtrl+S', enabled: false, click: () => {} },
        { label: 'Save As…', accelerator: 'CmdOrCtrl+Shift+S', click: () => send(win, 'save-as') },
        { type: 'separator' },
        {
          label: 'Import',
          submenu: [
            { label: 'CSV…', click: () => send(win, 'import-csv') },
            { label: 'vCard / VCF…', click: () => send(win, 'import-vcard') },
            { label: 'JSON…', click: () => send(win, 'import-json') },
            { label: 'Excel (.xlsx)…', click: () => send(win, 'import-xlsx') },
            { label: 'Plain Text…', click: () => send(win, 'import-text') }
          ]
        },
        {
          label: 'Export',
          submenu: [
            { label: 'CSV…', click: () => send(win, 'export-csv') },
            { label: 'vCard…', click: () => send(win, 'export-vcard') },
            { label: 'JSON…', click: () => send(win, 'export-json') }
          ]
        },
        { type: 'separator' },
        { label: 'Exit', role: 'quit' }
      ]
    },
    {
      label: 'Edit',
      submenu: [
        { label: 'Add Contact', accelerator: 'CmdOrCtrl+Shift+A', click: () => send(win, 'add-contact') },
        { label: 'Edit Contact', accelerator: 'CmdOrCtrl+E', click: () => send(win, 'edit-contact') },
        { label: 'Delete Contact', accelerator: 'CmdOrCtrl+Backspace', click: () => send(win, 'delete-contact') },
        { type: 'separator' },
        { label: 'Find / Search', accelerator: 'CmdOrCtrl+F', click: () => send(win, 'find') },
        { type: 'separator' },
        { role: 'cut' },
        { role: 'copy' },
        { role: 'paste' },
        { role: 'selectAll' }
      ]
    },
    {
      label: 'View',
      submenu: [
        { label: 'All Contacts', click: () => send(win, 'view-all') },
        { label: 'Favorites', click: () => send(win, 'view-favorites') },
        { label: 'Groups / Tags', click: () => send(win, 'view-tags') },
        { type: 'separator' },
        { label: 'Settings…', accelerator: 'CmdOrCtrl+,', click: () => send(win, 'settings') },
        { type: 'separator' },
        { role: 'reload' },
        { role: 'toggleDevTools' },
        { type: 'separator' },
        { role: 'resetZoom' },
        { role: 'zoomIn' },
        { role: 'zoomOut' },
        { type: 'separator' },
        { role: 'togglefullscreen' }
      ]
    },
    {
      label: 'LinkedIn',
      submenu: [
        { label: 'Update Selected Contact', click: () => send(win, 'linkedin-update-selected') },
        { label: 'Update All Contacts', click: () => send(win, 'linkedin-update-all') },
        { type: 'separator' },
        { label: 'Connect to LinkedIn…', click: () => send(win, 'linkedin-connect') }
      ]
    },
    {
      label: 'Help',
      submenu: [
        { label: 'About Address Book', click: () => send(win, 'about') }
      ]
    }
  ];

  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);
  return menu;
}

export function setWindowTitle(win: BrowserWindow, filename: string | null): void {
  win.setTitle(filename ? `Address Book — ${filename}` : 'Address Book');
}

void app;
