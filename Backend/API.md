# Bashar Thikana API: auth, properties, uploads

Base URL: `http://localhost:5000/api`. All bodies are JSON unless noted. Errors always look like `{ "message": "..." }`.

## Token format

- Login and register return `{ user, token }`.
- Send the token on private routes as `Authorization: Bearer <token>`.
- JWT payload: `{ id, role }`, expiry from `JWT_EXPIRES_IN` (default `7d`).
- Roles: `consumer`, `user` (property owner/manager), `admin`. The frontend shows them as Client / Owner / Admin.

## Auth

### POST /auth/register

```json
{ "name": "Rahim Uddin", "email": "rahim@example.com", "phone": "01712-345678", "password": "Secret123", "role": "user" }
```

`role` is `consumer` (default) or `user`. Admin accounts cannot be self-registered.

`201`:

```json
{
  "message": "Account created",
  "user": { "id": "…", "name": "Rahim Uddin", "email": "rahim@example.com", "phone": "01712-345678", "about": "", "role": "user", "isVerified": false, "isActive": true, "createdAt": "…", "updatedAt": "…" },
  "token": "eyJhbGciOi…"
}
```

Errors: `400` missing fields, invalid email/phone, weak password (needs 8+ characters with a letter and a number) or role `admin`; `409` email already registered.

### POST /auth/login

```json
{ "email": "owner@basharthikana.local", "password": "Owner123!" }
```

`200` returns `{ message, user, token }`. Errors: `401` "Invalid email or password" (same message for unknown email and wrong password); `403` account deactivated.

### GET /auth/me (token)

`200` returns `{ user }`. Errors: `401` no token, bad or expired token.

### PUT /auth/me (token)

Any of `name, email, phone, about, newPassword`. Role and status cannot be changed here. Returns `{ message, user }`.

## Properties

A property as returned by the API:

```json
{
  "id": "…", "ownerId": "…", "owner": { "id": "…", "name": "Mahmud Karim", "phone": "…", "verified": true },
  "title": "Bright family flat near Nasirabad Housing", "description": "…",
  "district": "Chattogram", "area": "Nasirabad", "address": "Road 2, Nasirabad Housing Society",
  "location": { "type": "Point", "coordinates": [91.8135, 22.3677] },
  "type": "full-flat", "gender": "any", "rent": 26000, "rooms": 3, "bathrooms": 2, "totalBeds": 3, "availableBeds": 3,
  "washroom": "attached", "balcony": true, "furnishing": "semi-furnished", "availableFrom": "2026-11-02",
  "facilities": ["Lift", "Parking"], "images": ["https://…"],
  "occupancy": "available", "status": "approved", "verificationStatus": "approved", "isPublished": true, "verified": true,
  "rejectionReason": "", "createdAt": "…", "updatedAt": "…"
}
```

`owner` is only present on public search and details. `location` is optional and always `[longitude, latitude]`.

| Field | Values |
| --- | --- |
| `type` | `single-room`, `shared-room`, `bed`, `full-flat` |
| `gender` | `male`, `female`, `any` |
| `washroom` | `attached`, `shared` |
| `furnishing` | `furnished`, `semi-furnished`, `unfurnished` |
| `occupancy` | `available`, `occupied` |

### GET /properties (public)

Returns `{ count, properties }`, only approved and published listings, newest first, max 100.

| Query | Meaning |
| --- | --- |
| `q` | text in title, area, district or address |
| `district`, `area` | exact location |
| `type` | a type above, or `shared` for shared-room + bed |
| `gender` | `male`/`female` also include `any`; `any` means only "any gender" listings |
| `minRent`, `maxRent` | rent range in Taka |
| `beds` | at least N bedrooms (flat), free beds (shared/bed) or beds in room (single) |
| `balcony` | `yes` / `no` |
| `washroom`, `furnishing` | exact value |
| `availableBy` | `YYYY-MM-DD`, available on or before |
| `verified` | `true` for verified listings only |
| `availableNow` | `true` for not occupied and with a free bed |
| `lng`, `lat`, `radius` | nearby search, radius in km (default 5), results sorted by distance |
| `sort` | `newest` (default), `price-asc`, `price-desc` |

Example: `GET /properties?district=Chattogram&type=shared&maxRent=8000&sort=price-asc`

### GET /properties/:id

Public listings for everyone. A pending or rejected listing is visible only to its owner or an admin (send the token); everyone else gets `404`.

### GET /properties/mine (owner)

`{ count, properties }`, all of the owner's listings in any status.

### POST /properties (owner)

Body: the editable fields `title, description, district, area, address, location, type, gender, rent, rooms, bathrooms, totalBeds, availableBeds, washroom, balcony, furnishing, availableFrom, facilities, images`. Anything else (`owner`, `verificationStatus`, `isPublished`, `verified`) is ignored.

`201` returns `{ message: "Property submitted for review", property }` with `status: "pending"`, `isPublished: false`.

Errors: `400` validation (title of 10+ characters, description of 40+, rent of at least 500, at least one image, `availableBeds` ≤ `totalBeds`, valid coordinates); `401` no token; `403` not an owner.

### PUT /properties/:id (owner)

Same body as create (send only what changed). The listing goes back to `pending` and leaves public search until an admin approves it again. `404` if the listing belongs to someone else.

### PATCH /properties/:id/availability (owner)

```json
{ "occupancy": "occupied" }
```

or `{ "availableBeds": 2 }`. Does not trigger a new review. Updates `availabilityLastConfirmed`.

## Uploads

### POST /uploads/property-images (owner)

`multipart/form-data` with one or more files in the field **`images`** (max 8, JPG/PNG/WebP, 5 MB each).

`201`:

```json
{ "message": "Images uploaded", "images": [{ "filename": "1761…-123.jpg", "url": "http://localhost:5000/uploads/1761…-123.jpg" }] }
```

Store the `url` values in the property's `images`. Errors: `400` no files, wrong type or too large; `403` not an owner.

## Test checklist

Run `npm run seed` first. Every item below was checked against a running server.

Auth (Member 1)
- [ ] Register consumer and owner: `201` with token, no `password` anywhere in the response
- [ ] Register the same email again (any letter case): `409`
- [ ] Register with missing name/email/password: `400`; weak password: `400`; `role: "admin"`: `400`
- [ ] Login with wrong password or unknown email: `401`
- [ ] Login as a deactivated user: `403`
- [ ] `GET /auth/me` without a token, or with a broken token: `401`
- [ ] `GET /auth/me` with a valid token: user without password
- [ ] Consumer calling an owner route (e.g. `POST /properties`): `403`; consumer calling `/admin/*`: `403`

Properties and uploads (Member 2)
- [ ] `GET /properties` shows only approved listings; seeded pending ones are absent
- [ ] Filters: `type=shared`, `gender=female&maxRent=8000`, `district=…&sort=price-asc`, `q=khulshi`, `lng=91.8135&lat=22.3677&radius=2`
- [ ] Create as owner: `201`, `status: "pending"`, even if the body says `isPublished: true`
- [ ] New listing is missing from public search and `GET /properties/:id` gives `404` without a token, `200` for its owner or an admin
- [ ] Admin approves (`PATCH /admin/properties/:id/review` with `{ "decision": "approved" }`): listing appears in search
- [ ] Owner edits it: back to `pending` and out of search
- [ ] Edit or change availability of another owner's listing: `404`
- [ ] `availableBeds` above `totalBeds`: `400`; coordinates in the wrong order (latitude first, out of range): `400`
- [ ] Upload a PNG as owner: `201` and the returned URL opens; upload a `.txt`: `400`; upload as consumer: `403`
