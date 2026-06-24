# Changelog

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
