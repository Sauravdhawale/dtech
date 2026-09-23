# Arkentech CRM — Full Developer Handoff

This package contains the recovered backend source, a clean editable React frontend reconstructed from the currently deployed production bundle, and the exact current production frontend build for visual/behavior reference.

## Important

**Do not create a new MongoDB database.** The application is designed to reconnect to the existing MongoDB Atlas cluster/database already used by the live portal.

## Folder structure

```text
arkentech-crm-full-source/
├── frontend/                       # clean editable React/Vite source
├── backend/                        # recovered Node/Express/Mongoose backend source
├── reference/current-production-build/  # exact deployed compiled frontend
└── docs/                           # stack, API, database and deployment notes
```

## Current application architecture

```text
React 18 + Vite
      |
      | Axios REST calls
      v
Node.js + Express
      |
      | Mongoose
      v
Existing MongoDB Atlas database
```

## Run frontend locally

```bash
cd frontend
cp .env.example .env
npm install
npm run dev
```

The default example points to the existing API at `https://www.dtechsupreme.com/api`. For local backend development change `VITE_API_ENDPOINT` to `http://localhost:5000/api`.

## Run backend locally

```bash
cd backend
cp .env.example .env
# fill .env with the existing database/API secrets from the server
npm install
npm run dev
```

Never commit `.env`.

## Production server mapping found

```text
/var/www/html       -> currently deployed compiled frontend
/var/www/backend    -> Node/Express API
PM2 process         -> dtech-backend
Domain              -> dtechsupreme.com
API                 -> https://www.dtechsupreme.com/api
```

## Recovery note

The original React `src/` directory was not present on the AWS server. Only the minified production bundle was available. Therefore `frontend/` is a clean reconstruction of the application behavior and screens, not a byte-for-byte recovery of the original developer's React source filenames/comments.

The exact live bundle is preserved under `reference/current-production-build/` so a developer can compare behavior and styling with production.
