# Bashar Thikana — Figma-aligned connected starter

This package is the remodelled version of the starter project. It keeps the MongoDB/Express/React architecture but changes the frontend structure and flow to match the supplied Figma direction much more closely.

## What is connected

- React frontend → Express API using Axios
- Express → MongoDB through Mongoose
- Consumer registration/login
- User (property owner/manager) registration/login
- Admin account through the demo seed
- Owner property creation → MongoDB
- Local property image upload → `Backend/uploads/` → property image URLs
- Admin property review → published/unpublished state
- Consumer search → approved MongoDB properties
- Consumer viewing/booking request → MongoDB
- Owner request management
- Consumer request tracking/withdrawal
- Admin reports and user management
- Demo dataset for immediate UI testing

## Design flow

Public home → Search setup → Search map/list → Property details → Booking/viewing request → Request sent

Owner: Overview → Properties → Add property → Units & availability → Requests

Admin: Overview → Property verification → Users → Reports

The role labels remain exactly: **Consumer / User / Admin**.

## First run

### Backend

```bash
cd Backend
npm install
npm run seed
npm run dev
```

You should see MongoDB connected and the server running on `http://localhost:5000`.

### Frontend

In another terminal:

```bash
cd Frontend
npm install
npm run dev
```

Open `http://localhost:5173`.

## Demo accounts

- Admin: `admin@basharthikana.local` / `Admin123!`
- User / owner: `owner@basharthikana.local` / `Owner123!`
- Consumer: `consumer@basharthikana.local` / `Consumer123!`

## Demo dataset

`npm run seed` clears the project demo collections and inserts:

- 4 public/approved accommodation listings
- 2 pending listings for Admin review
- owner accounts
- consumer account
- admin account
- sample accommodation requests
- a sample report

Property images in the demo dataset are original SVG illustrations under `Frontend/public/demo`. They are intentionally not presented as real rental photos.

## Image upload

Owners can upload JPG/PNG/WebP images on Add Property. For local development the files are stored in `Backend/uploads` and served by Express.

For deployment, replace local upload storage with Cloudinary or another persistent object-storage provider.

## Google Maps

The search/map screens are visually implemented but use a Figma-style map preview until a Google Maps API key is added. MongoDB already supports GeoJSON `Point` locations and a `2dsphere` index, so the data model is ready for geospatial search.

## Important

Do not commit real secrets. Replace the JWT secret and database URI before deployment.
