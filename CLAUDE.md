# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Overview

Bashar Thikana is a rental accommodation finder (MERN): `Backend/` is Express 5 + Mongoose (**ESM**, `import`/`export` only, no CommonJS), `Frontend/` is React 19 + Vite + React Router 7 (ESM, plain JSX, no TypeScript). The UI follows a supplied Figma design. There is no root package.json and no linter configured. `Backend/API.md` documents the auth and property endpoints with request/response examples and a manual test checklist.

## Commands

Backend (`cd Backend`, requires a local MongoDB; copy `.env.example` to `.env`):
- `npm run dev`: nodemon on `src/server.js`, port 5000
- `npm start`: run without reload
- `npm run seed`: wipe Booking/Report/Notification/Property collections and `@basharthikana.local` users, then insert demo data (`scripts/seedDemo.js`)

Frontend (`cd Frontend`, `VITE_API_URL` defaults to `http://localhost:5000/api`):
- `npm run dev`: Vite on port 5173
- `npm run build` / `npm run preview`

Demo logins after seeding: `admin@basharthikana.local` / `Admin123!`, `owner@basharthikana.local` / `Owner123!`, `consumer@basharthikana.local` / `Consumer123!`.

## Backend architecture

All backend source lives in `Backend/src/`, one folder per feature module: `auth/`, `property/`, `upload/`, `booking/`, `admin/`, `ai/`. Each module has `<name>.route.js` (endpoints + middleware) → `<name>.controller.js` (read `req`, send `res`, nothing else) → `<name>.service.js` (database work and business logic, throw `ApiError`). New features get a new module folder with the same three files. Shared code sits beside the modules: `models/` (schemas, validation, statics/methods holding domain rules), `middleware/`, `config/`, and `utils/` (`ApiError`, `validators` (`requireFields`, `pick`, `passwordProblem`, …), `constants` (role/enum lists), `generateToken`, `toJSON`). `src/server.js` mounts every module's router. `config/env.js` loads and checks `.env` once; import settings from it rather than reading `process.env` elsewhere. `Backend/scripts/seedDemo.js` and `Backend/uploads/` stay outside `src`.

Team rules: modular design, DRY, fat model / thin controller. Express 5 forwards rejected promises to `src/middleware/errorMiddleware.js`, so controllers are plain `async` functions without try/catch. The error handler maps `ApiError`, Mongoose validation/cast errors, duplicate keys and multer errors to `{ message }`. Successful responses use named keys (`{ property }`, `{ properties, count }`, `{ user, token }`).

## Roles (important naming)

Three roles, stored as `consumer`, `user`, `admin` (`src/utils/constants.js`). **`user` means property owner/manager**, not a generic user. Public registration can only create `consumer` or `user`; admins come from the seed.

The frontend uses `client` / `owner` / `admin` for routes and labels. The mapping lives only in `Frontend/src/api/adapters.js` (`fromApiUser`, `toApiRole`); keep it there.

Role enforcement:
- Backend: `src/middleware/authMiddleware.js` (`protect`: JWT Bearer → `req.user`, rejects inactive users; `optionalAuth` for public routes that show more to owners/admins) then `middleware/roleMiddleware.js` (`allowRoles(...)`) per route.
- Frontend: `src/api/client.js` stores the JWT in `localStorage` key `bashar_thikana_token` and adds it in an Axios interceptor. `context/AuthContext.jsx` restores the session with `GET /api/auth/me` (`loading` is true meanwhile) and `components/ProtectedRoute.jsx` gates dashboards by role.

## Core data flow

- **Property shape** matches the frontend form: `title, description, district, area, address, type (single-room|shared-room|bed|full-flat), gender, rent, rooms, bathrooms, totalBeds, availableBeds, washroom, balcony, furnishing, availableFrom, facilities, images, occupancy`, optional `location` (GeoJSON Point, `[longitude, latitude]`, `2dsphere` index). `toJSON` adds `id`, `ownerId`, `status` (= `verificationStatus`) and an `owner` summary when populated.
- **Lifecycle**: owners create → `pending`, unpublished. Admin `PATCH /api/admin/properties/:id/review` (`decision` ∈ approved/rejected/changes-requested) publishes only on approval. Any owner edit via `PUT /api/properties/:id` calls `resubmitForReview()`. Owners can only send `Property.OWNER_FIELDS`. `GET /api/properties` and `GET /api/properties/:id` expose only public listings, except the owner or an admin can open their non-public ones.
- **Search**: `Property.buildSearchFilter()` accepts the frontend filter names (`q, district, area, type` incl. `shared`, `gender, minRent, maxRent, beds, balcony, washroom, furnishing, availableBy, verified, sort`) plus `availableNow` and `lng, lat, radius` (km, uses `$near`, so no extra sort).
- **Images**: `POST /api/uploads/property-images` (multipart field `images`, up to 8 JPG/PNG/WebP, 5 MB each, owner only) saves to `Backend/uploads/` (gitignored) and returns absolute URLs; the form stores those URLs in `property.images`.
- **Frontend state**: `context/PropertyContext.jsx` loads listings from the API (public + `/properties/mine` for owners + `/admin/properties/pending` for admins). Requests, reports, favourites and saved searches are still localStorage-only until their endpoints are wired; listing delete and the property/owner "verified" toggles only change on-screen state.

## Placeholders

- Maps: `src/property/maps.service.js` is a stub. Google Maps keys (`VITE_GOOGLE_MAPS_API_KEY`, `GOOGLE_MAPS_SERVER_API_KEY`) are not wired yet.
- AI: `POST /api/ai/search` and `src/ai/ai.service.js` are stubs. AI features must never invent vacancy, routes, verification, or listings; property data comes only from MongoDB.
