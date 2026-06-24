import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  AppSettings,
  Contact,
  ImportSummary,
  NewContact,
  FieldMapping
} from '../shared/types';
import { MenuEvent } from '../shared/ipc';
import { PickedImport } from '../main/preload';
import { SearchBar } from './components/SearchBar';
import { ContactList, SortKey } from './components/ContactList';
import { ContactDetail } from './components/ContactDetail';
import { ContactForm } from './components/ContactForm';
import { ImportDialog } from './components/ImportDialog';
import { FieldMapper } from './components/FieldMapper';
import { SettingsDialog } from './components/SettingsDialog';
import { Modal } from './components/Modal';

type FilterMode = 'all' | 'favorites' | 'tags';

export function App(): JSX.Element {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<FilterMode>('all');
  const [tagFilter, setTagFilter] = useState<string | null>(null);
  const [sortKey, setSortKey] = useState<SortKey>('name');
  const [settings, setSettings] = useState<AppSettings | null>(null);
  const [dbInfo, setDbInfo] = useState<{ path: string | null; filename: string | null }>({
    path: null,
    filename: null
  });

  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Contact | null>(null);
  const [picked, setPicked] = useState<PickedImport | null>(null);
  const [mappingContacts, setMappingContacts] = useState<NewContact[] | null>(null);
  const [showMapper, setShowMapper] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [message, setMessage] = useState<{ title: string; body: string } | null>(null);
  const [seeding, setSeeding] = useState<{ total: number } | null>(null);

  const searchRef = useRef<HTMLInputElement>(null);

  const refresh = useCallback(async () => {
    const [list, info] = await Promise.all([
      window.addressBook.listContacts(),
      window.addressBook.dbInfo()
    ]);
    setContacts(list);
    setDbInfo({ path: info.path, filename: info.filename });
  }, []);

  const loadSettings = useCallback(async () => {
    const s = await window.addressBook.getSettings();
    setSettings(s);
    document.documentElement.setAttribute('data-theme', s.theme);
  }, []);

  useEffect(() => {
    void loadSettings();
    const id = setInterval(() => void refresh(), 1500);
    void refresh();
    return () => clearInterval(id);
  }, [refresh, loadSettings]);

  const selected = useMemo(
    () => contacts.find((c) => c.id === selectedId) ?? null,
    [contacts, selectedId]
  );

  const allTags = useMemo(() => {
    const set = new Set<string>();
    for (const c of contacts) {
      for (const t of (c.tags || '').split(',').map((s) => s.trim()).filter(Boolean)) {
        set.add(t);
      }
    }
    return Array.from(set).sort();
  }, [contacts]);

  const visible = useMemo(() => {
    const q = search.trim().toLowerCase();
    let list = contacts.filter((c) => {
      if (filter === 'favorites' && !c.favorite) return false;
      if (filter === 'tags' && tagFilter) {
        const tags = (c.tags || '').split(',').map((s) => s.trim().toLowerCase());
        if (!tags.includes(tagFilter.toLowerCase())) return false;
      }
      if (!q) return true;
      return [
        c.first_name,
        c.last_name,
        c.company,
        c.email_1,
        c.email_2,
        c.phone_mobile,
        c.phone_work
      ]
        .join(' ')
        .toLowerCase()
        .includes(q);
    });

    list = [...list].sort((a, b) => {
      switch (sortKey) {
        case 'company':
          return a.company.localeCompare(b.company);
        case 'city':
          return a.address_city.localeCompare(b.address_city);
        case 'updated':
          return (b.updated_at || '').localeCompare(a.updated_at || '');
        default:
          return (
            a.last_name.localeCompare(b.last_name) ||
            a.first_name.localeCompare(b.first_name)
          );
      }
    });
    return list;
  }, [contacts, search, filter, tagFilter, sortKey]);

  const notify = (title: string, body: string) => setMessage({ title, body });

  const handleImportPick = useCallback(async (format: PickedImport['format']) => {
    const result = await window.addressBook.pickImport(format);
    if (!result) return;
    setPicked(result);
    if ((format === 'csv' || format === 'xlsx') && result.headers && result.headers.length) {
      setShowMapper(true);
    } else {
      setMappingContacts(result.contacts);
    }
  }, []);

  const handleExport = useCallback(async (format: 'csv' | 'vcard' | 'json') => {
    const result = await window.addressBook.exportContacts(format);
    if (result.path) notify('Export Complete', `Saved to ${result.path}`);
  }, []);

  const handleMapperConfirm = useCallback(
    async (mapping: FieldMapping) => {
      if (!picked) return;
      const built = await window.addressBook.applyMappingPreview(
        picked.headers ?? [],
        picked.rows ?? [],
        mapping
      );
      setShowMapper(false);
      setMappingContacts(built);
    },
    [picked]
  );

  const handleLinkedInOne = useCallback(async () => {
    if (!selectedId) {
      notify('LinkedIn', 'Select a contact first.');
      return;
    }
    const r = await window.addressBook.linkedinUpdateOne(selectedId);
    notify('LinkedIn', r.message);
    void refresh();
  }, [selectedId, refresh]);

  const handleLinkedInAll = useCallback(async () => {
    const results = await window.addressBook.linkedinUpdateAll();
    notify('LinkedIn Batch Update', `Processed ${results.length} contact(s) with LinkedIn URLs.`);
    void refresh();
  }, [refresh]);

  const handleMenu = useCallback(
    async (event: MenuEvent) => {
      switch (event) {
        case 'add-contact':
          setEditing(null);
          setShowForm(true);
          break;
        case 'edit-contact':
          if (selected) {
            setEditing(selected);
            setShowForm(true);
          }
          break;
        case 'delete-contact':
          if (selectedId && confirm('Delete this contact?')) {
            await window.addressBook.deleteContact(selectedId);
            setSelectedId(null);
            void refresh();
          }
          break;
        case 'find':
          searchRef.current?.focus();
          break;
        case 'view-all':
          setFilter('all');
          break;
        case 'view-favorites':
          setFilter('favorites');
          break;
        case 'view-tags':
          setFilter('tags');
          break;
        case 'import-csv':
          await handleImportPick('csv');
          break;
        case 'import-vcard':
          await handleImportPick('vcard');
          break;
        case 'import-json':
          await handleImportPick('json');
          break;
        case 'import-xlsx':
          await handleImportPick('xlsx');
          break;
        case 'import-text':
          await handleImportPick('text');
          break;
        case 'export-csv':
          await handleExport('csv');
          break;
        case 'export-vcard':
          await handleExport('vcard');
          break;
        case 'export-json':
          await handleExport('json');
          break;
        case 'new-db':
          await window.addressBook.newDatabase();
          void refresh();
          break;
        case 'open-db':
          await window.addressBook.openDatabase();
          void refresh();
          break;
        case 'save-as':
          await window.addressBook.saveDatabaseAs();
          void refresh();
          break;
        case 'linkedin-update-selected':
          await handleLinkedInOne();
          break;
        case 'linkedin-update-all':
          await handleLinkedInAll();
          break;
        case 'linkedin-connect': {
          const r = await window.addressBook.linkedinConnect();
          notify('Connect to LinkedIn', r.message);
          break;
        }
        case 'settings':
          setShowSettings(true);
          break;
        case 'about':
          notify(
            'About Address Book',
            'Address Book v1.0.0 — Electron + React + SQLite. Multi-format import (CSV, vCard, JSON, Excel, text) with LinkedIn integration.'
          );
          break;
      }
    },
    [selected, selectedId, refresh, handleImportPick, handleExport, handleLinkedInOne, handleLinkedInAll]
  );

  useEffect(() => {
    const off = window.addressBook.onMenuEvent((evt) => void handleMenu(evt));
    return off;
  }, [handleMenu]);

  useEffect(() => {
    const off = window.addressBook.onSeedProgress((progress) => {
      if (progress.phase === 'start') {
        setSeeding({ total: progress.total });
      } else {
        setSeeding(null);
        void refresh();
      }
    });
    return off;
  }, [refresh]);

  const saveContact = async (data: NewContact) => {
    if (editing && editing.id) {
      await window.addressBook.updateContact(editing.id, data);
    } else {
      const created = await window.addressBook.createContact(data);
      setSelectedId(created.id ?? null);
    }
    setShowForm(false);
    setEditing(null);
    void refresh();
  };

  return (
    <div className="app">
      {seeding && (
        <div className="seed-splash">
          <div className="spinner" />
          <h2>Loading your contacts…</h2>
          <p style={{ color: 'var(--muted)' }}>
            Importing {seeding.total.toLocaleString()} contacts. This only happens once.
          </p>
        </div>
      )}
      <div className="toolbar">
        <SearchBar value={search} onChange={setSearch} inputRef={searchRef} />
        <button
          className="primary"
          onClick={() => {
            setEditing(null);
            setShowForm(true);
          }}
        >
          + Add Contact
        </button>
        <div className="spacer" />
        <span style={{ color: 'var(--muted)' }}>
          {dbInfo.filename ? `${dbInfo.filename} · ` : ''}
          {contacts.length} contacts
        </span>
        <button onClick={() => setShowSettings(true)}>Settings</button>
      </div>

      <div className="filter-chips">
        <span
          className={`chip ${filter === 'all' ? 'active' : ''}`}
          onClick={() => setFilter('all')}
        >
          All
        </span>
        <span
          className={`chip ${filter === 'favorites' ? 'active' : ''}`}
          onClick={() => setFilter('favorites')}
        >
          ★ Favorites
        </span>
        {filter === 'tags' &&
          allTags.map((t) => (
            <span
              key={t}
              className={`chip ${tagFilter === t ? 'active' : ''}`}
              onClick={() => setTagFilter(t)}
            >
              {t}
            </span>
          ))}
        {filter !== 'tags' && allTags.length > 0 && (
          <span className="chip" onClick={() => setFilter('tags')}>
            Tags…
          </span>
        )}
      </div>

      <div className="main">
        <ContactList
          contacts={visible}
          selectedId={selectedId}
          onSelect={setSelectedId}
          sortKey={sortKey}
          onSortChange={setSortKey}
        />
        <ContactDetail
          contact={selected}
          onEdit={() => {
            setEditing(selected);
            setShowForm(true);
          }}
          onDelete={async () => {
            if (selected?.id && confirm('Delete this contact?')) {
              await window.addressBook.deleteContact(selected.id);
              setSelectedId(null);
              void refresh();
            }
          }}
          onToggleFavorite={async () => {
            if (selected?.id) {
              await window.addressBook.toggleFavorite(selected.id);
              void refresh();
            }
          }}
          onLinkedInUpdate={handleLinkedInOne}
        />
      </div>

      {showForm && (
        <ContactForm
          initial={editing}
          onSave={saveContact}
          onCancel={() => {
            setShowForm(false);
            setEditing(null);
          }}
        />
      )}

      {showMapper && picked && (
        <FieldMapper
          headers={picked.headers ?? []}
          initialMapping={{}}
          onConfirm={handleMapperConfirm}
          onCancel={() => {
            setShowMapper(false);
            setPicked(null);
          }}
        />
      )}

      {mappingContacts && picked && (
        <ImportDialog
          picked={picked}
          contacts={mappingContacts}
          onCancel={() => {
            setMappingContacts(null);
            setPicked(null);
          }}
          onDone={(summary: ImportSummary) => {
            setMappingContacts(null);
            setPicked(null);
            void refresh();
            notify(
              'Import Complete',
              `${summary.imported} imported, ${summary.merged} merged, ${summary.skipped} skipped.`
            );
          }}
        />
      )}

      {showSettings && settings && (
        <SettingsDialog
          settings={settings}
          dbPath={dbInfo.path}
          onChooseDatabase={async () => {
            await window.addressBook.openDatabase();
            void refresh();
          }}
          onSave={async (patch) => {
            const updated = await window.addressBook.setSettings(patch);
            setSettings(updated);
            document.documentElement.setAttribute('data-theme', updated.theme);
            setShowSettings(false);
          }}
          onCancel={() => setShowSettings(false)}
        />
      )}

      {message && (
        <Modal
          title={message.title}
          onClose={() => setMessage(null)}
          footer={
            <button className="primary" onClick={() => setMessage(null)}>
              OK
            </button>
          }
        >
          <p style={{ whiteSpace: 'pre-wrap' }}>{message.body}</p>
        </Modal>
      )}
    </div>
  );
}
