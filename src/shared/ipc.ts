export const IPC = {
  // contacts
  CONTACTS_LIST: 'contacts:list',
  CONTACT_GET: 'contact:get',
  CONTACT_CREATE: 'contact:create',
  CONTACT_UPDATE: 'contact:update',
  CONTACT_DELETE: 'contact:delete',
  CONTACT_TOGGLE_FAVORITE: 'contact:toggleFavorite',
  // database
  DB_INFO: 'db:info',
  DB_NEW: 'db:new',
  DB_OPEN: 'db:open',
  DB_SAVE_AS: 'db:saveAs',
  // import / export
  IMPORT_PICK: 'import:pick',
  IMPORT_COMMIT: 'import:commit',
  EXPORT: 'export',
  IMPORT_LOG: 'import:log',
  // settings
  SETTINGS_GET: 'settings:get',
  SETTINGS_SET: 'settings:set',
  // linkedin
  LINKEDIN_UPDATE_ONE: 'linkedin:updateOne',
  LINKEDIN_UPDATE_ALL: 'linkedin:updateAll',
  LINKEDIN_CONNECT: 'linkedin:connect',
  // menu -> renderer events
  MENU_EVENT: 'menu:event'
} as const;

export type MenuEvent =
  | 'add-contact'
  | 'edit-contact'
  | 'delete-contact'
  | 'find'
  | 'view-all'
  | 'view-favorites'
  | 'view-tags'
  | 'import-csv'
  | 'import-vcard'
  | 'import-json'
  | 'import-xlsx'
  | 'import-text'
  | 'export-csv'
  | 'export-vcard'
  | 'export-json'
  | 'new-db'
  | 'open-db'
  | 'save-as'
  | 'linkedin-update-selected'
  | 'linkedin-update-all'
  | 'linkedin-connect'
  | 'settings'
  | 'about';
