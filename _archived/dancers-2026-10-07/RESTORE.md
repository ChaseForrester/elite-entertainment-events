# Restore Dancers (Elite Entertainment & Events)

Archived 7 Oct 2026 (Sydney).

## What was removed from the live site
1. **Dance Troupes** category/folder (`dance-troupes-mcs`) from `categories-data.js` and all nav/home chips.
2. **Models & Dancers** hire section/page links (`models-dancers.html`) from home, Hire menu, search, admin and vendor forms.

## Files in this folder
- `models-dancers.html` — full page (copy back to repo root)
- `talent-data.js` — roster data for that page (copy back to repo root)
- `dance-troupes-mcs.folder.js` — paste object back into `window.ELITE_FOLDERS` in `categories-data.js`, and add `"dance-troupes-mcs"` back into the `folderIds` array near the end of that file
- `site-nav.snippets.txt` — nav lines to restore
- `script.js.models-dancers-*.js` — vendor-form branches if needed

## Quick restore steps
1. Copy `models-dancers.html` and `talent-data.js` to the repo root.
2. Re-insert the folder object from `dance-troupes-mcs.folder.js` into `categories-data.js` (ELITE_FOLDERS) and add the id to `folderIds`.
3. Restore nav / home / cms / admin options from the snippets (or revert this commit).
4. Push to `main` to publish.
