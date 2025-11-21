# Hourly Work Log API

A small, production-style REST API (Node.js + TypeScript + Express) for tracking hourly work. It uses Firebase Authentication, Firestore repositories, and OpenAPI docs. **Scope:** a single **user** role can CRUD their own Employers, Shifts, and Adjustments.

---

## What's implemented

* **Core resources:** Employers, Shifts (with `includeTotals`), Adjustments — full CRUD, Joi validation, standardized `{status,data,message}` responses.
* **Security:** Helmet, CORS, centralized error handler; **rate limit** on write endpoints; **Firebase Auth** (`authenticate`) and **role guard** (`authorize`) with default **user** role; **owner scoping** in services (`ownerUserId`).
* **Auth in docs:** OpenAPI includes `bearerAuth`, and **401/403** responses on protected routes.
* **Quality:** Unit + integration tests (middleware, services, routes); GitHub Actions for docs; Redoc HTML generated at `docs/index.html`.

---

## Quick start

```bash
npm install
# create .env (minimal)
# PORT=3000
# NODE_ENV=development
# SWAGGER_SERVER_URL=http://localhost:3000/api/v1
npm run build && npm start
# or
npm test
```

### Auth header

`Authorization: Bearer <Firebase_ID_token>`

---

## API overview (selected)

* **GET** `/api/v1/employers` - list current user's employers
* **POST** `/api/v1/employers` - create (validated)
* **PUT** `/api/v1/employers/:id` - update
* **DELETE** `/api/v1/employers/:id` - delete
* **GET** `/api/v1/shifts?employerId=&includeTotals=true` - list with optional totals
* **POST** `/api/v1/shifts` / **PUT** `/api/v1/shifts/:id` / **DELETE** `/api/v1/shifts/:id`
* **GET** `/api/v1/adjustments[?employerId&shiftId]` / **POST** / **PUT** / **DELETE`**

> All write routes require: `authenticate` → `authorize({ hasRole: ["user"] })` → validation → controller. Services enforce **owner-only** access (404 on other users’ data).

---

## Rate limiting (write endpoints)

* Prevents accidental double-submit during lag/refresh.
* Example config: **10s window, 3 requests** → HTTP **429** with friendly message.

---

## Documentation

```bash
npm run generate-docs   # builds openapi.json and docs/index.html (Redoc)
```

OpenAPI includes reusable schemas for **Employer / Shift / Adjustment** and global **bearerAuth** security.

---

## Testing

```bash
npm test   # unit + integration; Firebase and Firestore mocked
```
