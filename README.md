# CivicLoop – Frontend

React (Vite) + Tailwind CSS + React Router + Leaflet + Recharts. **Frontend only.**

## Run in GitHub Codespaces
```bash
unzip civicloop-frontend.zip && cd civicloop
npm install
npm run dev        # open the forwarded port 5173
```

## Demo mode (no backend yet)
All data lives in `src/services/api.js`, which stores seeded demo data in the browser (localStorage).
Reporting, supporting, assigning, resolving and verifying all change that stored data.
A banner at the top of every page says so; "Reset demo data" restores the seed.

Demo logins (password `demo1234`):
| Role | Email |
|---|---|
| Citizen | priya@civicloop.demo (has a fix waiting for verification), arjun / meena / karthik / fatima @civicloop.demo |
| Department | roads@, waste@, water@, lights@civicloop.demo |
| Admin | admin@civicloop.demo |

## Connecting the backend later
Every export in `src/services/api.js` maps to one REST call (`src/services/http.js` is a ready axios instance).
Replace function bodies, e.g. `login` → `POST /auth/login`, `listComplaints` → `GET /complaints`,
`findNearby` → `GET /complaints/nearby` (PostGIS `ST_DWithin`), `verify` → `POST /complaints/:id/verify`.
Pages do not need to change. Demo-only shortcuts to replace: plain-text passwords, client-side rate limiting
(1 complaint/minute), images stored as data URLs (→ Supabase Storage), analytics computed in the browser (→ SQL views).

## Structure
`src/pages` (citizen, dept, admin, public) · `src/components` (Shell, maps, charts, tables, ui) · `src/services` · `src/data/seed.js`

## Not included yet
Backend, Supabase schema/RLS, email verification, real image storage, PWA.
