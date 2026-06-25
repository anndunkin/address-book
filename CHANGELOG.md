# Changelog

## [1.0.4] - 2026-06-24

### Changed
- Removed 22 Microsoft Teams visitor/org ID records (8:teamsvisitor: and 8:orgid: entries stored as contact names), 20,319 → 20,297 contacts

## [1.0.3] - 2026-06-24

### Changed
- Removed 170 Microsoft Teams thread ID records (19:GUID@thread.v2 entries stored as contact names), 20,489 → 20,319 contacts

## [1.0.2] - 2026-06-24

### Changed
- Second bulk data cleanup pass (20,660 → 20,489 records, 171 deleted):
  - Removed 61 Microsoft Teams chat ID records (unq.gbl.spaces GUIDs stored as names)
  - Removed 6 Microsoft Teams visitor/org ID records (8:orgid: entries)
  - Removed 94 HP/HPE service and infrastructure accounts (disabled accounts, mailfc-service, om/vcd/gen subdomains, system accounts)
  - Removed 5 lb.bcentral.com return-path tracking addresses
  - Removed 3 followup.cc variant addresses (typos: .ccom, .ccc, .c)
  - Removed 2 info@ addresses with no real name

## [1.0.1] - 2026-06-24

### Changed
- Bulk data cleanup applied to master contacts (20,713 → 20,660 records):
  - Removed 9 email addresses containing "unsubscribe" or "removeme"
  - Removed 44 entries from the followup.cc domain
  - Dropped 53 records that became empty after email cleanup
  - Assigned names to EPA contacts using lastname.firstname@epa.gov format (3 records)
  - Inferred first/last names from dotted/underscore email addresses (225 records)
  - Best-effort name parsing for single-token email local parts (383 records — flagged for review in notes field)

## [1.0.0] - 2026-06-24

### Added
- Initial release of Address Book desktop application
- Electron + React + TypeScript + SQLite architecture
- First-launch seeding of 20,713 contacts from bundled master-contacts.json
- Full contact schema: name, company, title, department, 3 emails, 4 phone types, business and home addresses, birthday, anniversary, spouse, children, hobby, gender, assistant, LinkedIn URL, website, notes, categories, custom fields
- Import from CSV (with field mapper), vCard/VCF, JSON, XLSX, plain text
- Duplicate detection on import (email-based): skip, merge, or create new
- Export to CSV, vCard, JSON
- LinkedIn integration scaffolded (open-URL workflow)
- Search and filter across all contacts
- Favorites and tag-based filtering
- Light/dark theme
- Full native menu: File / Edit / View / LinkedIn / Help
- Windows NSIS installer with desktop and Start Menu shortcuts
- Separate SQLite database file in Documents/AddressBook (portable)
- Automatic database migration for schema upgrades
