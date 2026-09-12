# Project — Cutroom (CapCut-style, fully dynamic)

Full-stack **CapCut-like browser video editor**: React (Vite) frontend + Express + **PostgreSQL** backend with a dynamic creative library (text templates, stickers, background music) and cloud-saved projects.

## Structure
```
project/
├── README.md
├── backend/                 # Node.js + Express API (PostgreSQL via `pg`)
│   ├── package.json
│   ├── server.js            # loads dotenv, starts Express, ensures schema + seed
│   ├── config/
│   │   ├── db.js            # pg connection pool + initDb (schema & seed)
│   │   └── embedded-pg.js   # auto-booted embedded PostgreSQL (backend/.pgdata)
│   ├── database/
│   │   ├── schema.sql       # PostgreSQL tables (users, items, templates, stickers, music, projects)
│   │   └── seed.sql         # creative-library seed data (loaded automatically)
│   ├── models/
│   │   ├── Item.js          # SQL queries for items
│   │   └── User.js          # SQL queries for users
│   ├── routes/
│   │   └── api.js           # /api routes (auth, items, libraries, cloud projects)
│   ├── .env                 # PORT, DATABASE_URL (not committed)
│   └── .env.example
└── frontend/                # React app (Vite)
    ├── index.html
    ├── package.json
    ├── vite.config.js
    ├── .env                 # VITE_API_URL (not committed)
    ├── .env.example
    └── src/
        ├── main.jsx
        ├── App.jsx          # editor: preview, trim, cuts, color, text/stickers, music, cloud
        ├── api.js           # fetch helpers (templates, stickers, music, projects, auth)
        ├── index.css
        └── components/
            ├── CutTools.jsx
            ├── Library.jsx  # dynamic creative library + cloud projects browser
            ├── auth/AuthShell.jsx   # shared FlowStep shell for the auth pages
            ├── auth/SignIn.jsx      # sign in page (+ forgot-password step)
            └── auth/SignUp.jsx      # create account page
```

## Prerequisites
- Node.js 18+
- A running **PostgreSQL** server — **or nothing at all**: the backend now
  includes an **embedded PostgreSQL** (via `embedded-postgres`) that boots
  automatically when no external server is reachable, so `npm start` /
  `npm run dev` just work out of the box (data is stored in `backend/.pgdata`).

## Setup & Run

### Database
Two options — the second requires no setup:

1. **Use your own PostgreSQL** (recommended for production). Create the database
   (tables are auto-created on boot):
   ```sql
   CREATE DATABASE cutroom;
   ```
   Set `DATABASE_URL` in `backend/.env`:
   ```
   DATABASE_URL=postgres://postgres:postgres@localhost:5432/cutroom
   ```

2. **Let the backend run an embedded PostgreSQL.** Leave `EMBEDDED_PG=1` in
   `backend/.env`. Whenever the configured server is unreachable, the backend
   starts its own cluster (PostgreSQL 18 binaries, UTF-8, data in
   `backend/.pgdata`) and connects to it automatically.

### Backend
```bash
cd backend
npm install
# On newer npm versions, approve the embedded Postgres binary script the first time:
npm approve-scripts @embedded-postgres/windows-x64
npm start        # or: npm run dev (nodemon, auto-restart)
# API available at http://localhost:5000/api
```
On boot the server runs `database/schema.sql` (idempotent) and seeds the creative library (text templates, stickers, background music) if empty. You can also run the schema/seed manually:
```bash
npm run db:setup
```

### Frontend
```bash
cd frontend
npm install
npm run dev       # http://localhost:3000
npm run build     # production build to frontend/dist
```
The frontend reads the API base URL from `VITE_API_URL` in `frontend/.env` (defaults to `http://localhost:5000/api`).

## Linting & tests
```bash
cd backend && npm install && npm run lint && npm test   # ESLint + Jest/Supertest
cd frontend && npm install && npm run lint               # ESLint
```
Backend tests mock the database layer, so they run without a live Postgres connection.
They cover password hashing, JWT session tokens, the `requireAuth`/`requireAdmin`
guards, and signup/login validation — including a regression test that a spoofed
`X-User-Id` header alone can never grant access.

## Features (CapCut-style editor)
- **Import & trim** — set in/out points, jigsaw cuts, frame-step preview
- **Color tools** — brightness, contrast, saturation, hue, grayscale, blur
- **Text overlays** — add, drag on the preview, resize, recolor, delete
- **Creative Library (dynamic, loaded from PostgreSQL)** — free text templates, sticker pack, and background music tracks
- **Background music** — pick a track from the library, it plays during preview
- **Cloud saving** — unfinished projects are saved to PostgreSQL and reloaded from any browser/device
- **Project import/export** — import a `.json` project plan, export/resume any saved cloud project
- **High-resolution export** — choose 360p / 720p / 1080p; the export records the canvas (captureStream + MediaRecorder) and downloads a `.webm` video
- **Playback** — speed, volume/mute, fullscreen, scrubbing
- **Undo/Redo** (Ctrl+Z / Ctrl+Y) and keyboard shortcuts (Space, arrows, Shift+←/→ set in/out, F fullscreen, Delete)
- Account auth against the backend API (`/api/auth/signup`, `/api/auth/login`) with dedicated FlowStep-styled **Sign in** and **Sign up** pages (plus forgot/reset password and Google sign-in)