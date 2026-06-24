import Store from 'electron-store';
import { AppSettings } from '../shared/types';

const defaults: AppSettings = {
  databasePath: null,
  theme: 'light',
  linkedinClientId: '',
  defaultFieldMappings: {}
};

const store = new Store<AppSettings>({ name: 'address-book-settings', defaults });

export function getSettings(): AppSettings {
  return {
    databasePath: store.get('databasePath'),
    theme: store.get('theme'),
    linkedinClientId: store.get('linkedinClientId'),
    defaultFieldMappings: store.get('defaultFieldMappings')
  };
}

export function setSettings(patch: Partial<AppSettings>): AppSettings {
  for (const [key, value] of Object.entries(patch)) {
    store.set(key, value as never);
  }
  return getSettings();
}

export function setDatabasePath(path: string): void {
  store.set('databasePath', path);
}
