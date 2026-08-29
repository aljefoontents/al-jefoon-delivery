# AL JEFOON TENTS — Delivery Management Software

A simple GitHub Pages delivery management system for Al Jefoon Tents.

## Included

- User-friendly dashboard
- Automatic unique references: `AJT-DEL-2026-0001`
- Create, edit and delete delivery records
- Search and status filtering
- Delivery status: Pending / Out for Delivery / Delivered / Cancelled
- Customer, phone, address, driver, vehicle, time, items and notes
- Printable delivery note
- CSV export
- JSON backup and restore
- Mobile-friendly layout
- No server required for the first version

## Important data note

This version stores data in the browser using localStorage. It is excellent for a single computer/device, but records are not automatically shared between different computers or staff members.

For a multi-user business system, the next version should connect this same interface to a cloud database such as Supabase or Google Sheets/App Script, with user login and automatic cloud backup.

## GitHub Pages

1. Create a new GitHub repository.
2. Upload `index.html`, `style.css`, `app.js` and this README.
3. Open **Settings → Pages**.
4. Select **Deploy from a branch**.
5. Select the `main` branch and `/root`.
6. Save.
7. GitHub will provide the public website address.

Do not rename `index.html`.
