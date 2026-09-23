# Netlify deployment

This repository has a React/Vite frontend in `frontend/` and a Node/Express/MongoDB backend in `backend/`.

## Netlify

The root `netlify.toml` already configures:

- Base directory: `frontend`
- Build command: `npm install && npm run build`
- Publish directory: `frontend/dist`
- API URL: `https://dtechsupreme.com/api`
- SPA fallback: every React route (for example `/users` and `/profile`) falls back to `index.html`

The previous Netlify "Page not found" happened because React Router routes were being opened directly without an SPA fallback. `frontend/public/_redirects` and `netlify.toml` now fix that.

## Existing database

Do not create a new MongoDB database. The backend should continue using the existing MongoDB Atlas database through the existing `MONGO_URI` environment variable.

## Session/token errors

If an old browser token expires, the frontend now removes that token and redirects to `/login` once instead of showing repeated token-expired notifications.

## Backend

Netlify only deploys the frontend. Keep the backend running on the existing AWS server / domain:

`https://dtechsupreme.com/api`

The frontend talks to that API through `VITE_API_ENDPOINT`.
