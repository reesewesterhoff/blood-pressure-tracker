# Blood Pressure Tracker

A full-stack web app for logging and tracking blood pressure readings over time. It's an installable Progressive Web App (PWA), so it can be added to a phone's home screen and used like a native app.

- **Live app:** https://bptracker.net
- **API:** https://api.bptracker.net

## Features

- Email/password and Google OAuth sign-in
- Log systolic, diastolic, and pulse readings
- View reading history and blood pressure averages
- Installable PWA with offline-friendly assets and mobile home-screen support
- Rate-limited, session-based authentication for security

## Tech stack

**Frontend** (`frontend/`)

- Vue 3 (Composition API, `<script setup>`) + TypeScript
- Vite build tooling, Pinia state management, Vue Router
- Tailwind CSS for styling
- `vite-plugin-pwa` for PWA support
- Vitest (unit) and Cypress (end-to-end) for testing

**Backend** (`backend/`)

- Node.js + Express + TypeScript
- MongoDB via Mongoose
- Passport authentication (local email/password + Google OAuth), backed by `express-session` with a MongoDB session store (`connect-mongo`)
- Upstash Redis for distributed rate limiting
- Jest for testing (uses an in-memory MongoDB, so no database is required to run tests)

## Repository structure

This is a monorepo with two independently deployable services:

```
blood-pressure-tracker/
├── backend/            # Express + MongoDB API
│   └── src/
│       ├── auth/       # Authentication (Google OAuth + local), User model
│       ├── readings/   # Blood pressure readings (routes, controllers, models)
│       └── shared/     # Config, middleware, utils, and types
├── frontend/           # Vue 3 PWA
└── .github/workflows/  # CI/CD pipelines (see workflows README)
```

## API overview

All reading endpoints require an authenticated session.

| Method | Endpoint                | Description                              |
| ------ | ----------------------- | ---------------------------------------- |
| POST   | `/auth/register`        | Register a new user (email/password)     |
| POST   | `/auth/login`           | Log in with email/password               |
| GET    | `/auth/google`          | Begin Google OAuth flow                  |
| GET    | `/auth/google/callback` | Google OAuth callback                    |
| GET    | `/auth/logout`          | Log out and destroy the session          |
| GET    | `/auth/user`            | Get the current logged-in user           |
| POST   | `/api/readings`         | Add a blood pressure reading             |
| GET    | `/api/readings`         | List the current user's readings         |
| GET    | `/api/readings/average` | Get average blood pressure for the user  |

## Getting started

### Prerequisites

- Node.js 20+ (the frontend requires `^20.19.0 || >=22.12.0`)
- A MongoDB instance (local or hosted) for running the backend
- (Optional) Google OAuth credentials and an Upstash Redis instance for full functionality

### Backend

```sh
cd backend
npm install
cp .env.example .env   # then fill in the values
npm run dev            # starts the API with hot reload on PORT (default 3000)
```

Backend environment variables (see `backend/.env.example`):

| Variable                   | Description                                  |
| -------------------------- | -------------------------------------------- |
| `NODE_ENV`                 | `development` / `production`                 |
| `PORT`                     | API port (default `3000`)                    |
| `MONGO_URI`                | MongoDB connection string                    |
| `GOOGLE_CLIENT_ID`         | Google OAuth client ID                       |
| `GOOGLE_CLIENT_SECRET`     | Google OAuth client secret                   |
| `FRONTEND_URL`             | Frontend origin for redirects/CORS           |
| `SESSION_SECRET`           | Secret used to sign session cookies          |
| `UPSTASH_REDIS_REST_URL`   | Upstash Redis REST URL (rate limiting)       |
| `UPSTASH_REDIS_REST_TOKEN` | Upstash Redis REST token (rate limiting)     |

### Frontend

```sh
cd frontend
npm install
cp .env.example .env   # then fill in the values
npm run dev            # starts Vite dev server (default http://localhost:5173)
```

Frontend environment variables (see `frontend/.env.example`):

| Variable            | Description                          |
| ------------------- | ------------------------------------ |
| `VITE_API_BASE_URL` | Base URL of the backend API          |
| `VITE_APP_URL`      | Public URL of the frontend app       |

## Testing

```sh
# Backend (Jest) — spins up an in-memory MongoDB, no DB setup needed
cd backend && npm test

# Frontend unit tests (Vitest)
cd frontend && npm run test:unit

# Frontend end-to-end tests (Cypress)
cd frontend && npm run test:e2e:dev
```

## Deployment

Both services are containerized with Docker and deployed as images in Amazon ECR. On pushes to `main`, a GitHub Actions pipeline detects which service(s) changed, runs their tests, and builds/pushes only the changed image(s).
