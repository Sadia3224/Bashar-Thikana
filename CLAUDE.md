# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Overview

Bashar Thikana is a rental accommodation finder (MERN): `Backend/` is Express 5 + Mongoose (CommonJS), `Frontend/` is React 19 + Vite + React Router 7 (ESM, plain JSX, no TypeScript). The UI follows a supplied Figma design. There is no root package.json, no test suite, and no linter configured.

## Commands

Backend (`cd Backend`, requires a local MongoDB; copy `.env.example` to `.env`):
- `npm run dev` — nodemon on `server.js`, port 5000
- `npm start` — run without reload
- `npm run seed` — wipe Booking/Report/Notification/Property collections and `@basharthikana.local` users, then insert demo data (`scripts/seedDemo.js`)

Frontend (`cd Frontend`, `VITE_API_URL` defaults to `http://localhost:5000/api`):
- `npm run dev` — Vite on port 5173
- `npm run build` / `npm run preview`

Demo logins after seeding: `admin@basharthikana.local` / `Admin123!`, `owner@basharthikana.local` / `Owner123!`, `consumer@basharthikana.local` / `Consumer123!`.

## Roles (important naming)

Three roles, stored as `consumer`, `user`, `admin` in `models/User.js`. **`user` means property owner/manager**, not a generic user — keep the labels exactly "Consumer / User / Admin" in the UI. Public registration can only create `consumer` or `user`; admins come from the seed.

Role enforcement is layered the same way on both sides:
- Backend: `middleware/authMiddleware.js` (JWT Bearer → `req.user`, rejects `isActive: false`) then `middleware/roleMiddleware.js` (`allowRoles(...)`) applied per route in `routes/*.js`.
- Frontend: `context/AuthContext.jsx` stores the token in `localStorage` key `bashar_thikana_token` (read by the Axios interceptor in `api/axios.js`); `routes/ProtectedRoute.jsx` gates routes by role in `App.jsx`. Pages are grouped by role under `src/pages/{public,consumer,owner,admin}` with matching `styles/*.css`.

## Core data flow

- **Property lifecycle**: owners (`user`) create properties → `verificationStatus: "pending"`, `isPublished: false`. Admin `PATCH /api/admin/properties/:id/review` with `decision` ∈ approved/rejected/changes-requested sets `isPublished` only on approval. Any owner edit via `PUT /api/properties/:id` resets the property to pending/unpublished (owners can't set `owner`, `verificationStatus`, `isPublished`). Public search (`GET /api/properties`) only returns `isPublished && approved`.
- **Search**: query params `propertyType, minRent, maxRent, suitableFor, area, lng, lat, radius (km), availableNow`. `Property.location` is a GeoJSON Point with a `2dsphere` index; `lng/lat` triggers `$near`.
- **Bookings**: consumers create/withdraw requests (`requestType` booking|visit); owners view `GET /api/bookings/owner/requests` and update status. Status enum lives in `models/Booking.js`.
- **Images**: `POST /api/uploads/property-images` (multer, up to 8 JPG/PNG/WebP, owner only) saves to `Backend/uploads/` and returns absolute URLs served by `express.static`; the client then stores those URLs in `property.images`. Demo images are SVG illustrations in `Frontend/public/demo/`.

## Placeholders

- Maps: `components/map/*` render a Figma-style preview; `services/mapsService.js` is a stub. Google Maps keys (`VITE_GOOGLE_MAPS_API_KEY`, `GOOGLE_MAPS_SERVER_API_KEY`) are not wired yet.
- AI: `POST /api/ai/search` and `services/aiService.js` are stubs. Per the code comments, AI features must never invent vacancy, routes, verification, or listings — property data comes only from MongoDB.

## Code style

Much of the backend (models, auth/ai controllers, some routes) and frontend core (`App.jsx`, `AuthContext.jsx`, `axios.js`) is written in dense minified-style one-liners, while other files (property/admin/booking controllers, most routes) are normally formatted. Match the style of the file you are editing. Controllers use `try { … } catch (e) { next(e) }` and respond with `{ message }` on errors and named keys (`{ property }`, `{ properties }`, `{ user, token }`) on success.
