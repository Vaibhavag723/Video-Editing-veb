# Veltra — premium dark SaaS video editing platform

**Veltra** is an original, production-grade dark SaaS product for browser-based
video editing — created from scratch as a full visual spec with a real
backend architecture blueprint. (Deliberately **not** the legacy Cutroom app in
this repo; this is a fresh product with its own brand, name, logo and identity.)

## What's inside

```
veltra/
├── app/                     # Next.js App Router pages (TypeScript)
│   ├── signin/              # Split-screen sign-in
│   ├── signup/              # Sign-up with password strength + validation
│   ├── dashboard/           # User workspace (projects, templates, media,
│   │                        #   recent edits, exports, storage, profile)
│   ├── admin/               # Admin dashboard + users/pages/blog/logins/questions
│   ├── editor/              # Full video editor (tools, canvas, properties, timeline)
│   └── page.tsx             # Redirects to /dashboard
├── components/              # Reusable design system
│   ├── brand/               # Veltra logo mark & wordmark (original SVG)
│   ├── ui/                  # Button, Input, Card, Badge, Avatar, Progress,
│   │                        #   StatCard, SearchField
│   ├── layout/              # TopNav, Sidebar, MobileNav, Shells, nav config
│   ├── auth/                # AuthLayout + sign-in/sign-up views
│   ├── dashboard/           # Metric cards, activity feed, tables, settings
│   └── editor/              # Topbar, tool rail/panels, preview, properties,
│                            #   timeline, export modal
├── lib/                     # cn() helper + admin/user demo datasets
└── backend/                 # NestJS + Prisma + PostgreSQL architecture
    ├── prisma/schema.prisma # Full relational model (auth, RBAC, projects,
    │                        #   media, exports, subscriptions, platform content)
    ├── prisma/seed.ts       # Idempotent seed (plans, admin, pages)
    ├── src/modules/         # auth, users, projects, media, exports,
    │                        #   subscriptions, platform, admin
    ├── src/common/          # Roles decorator + RolesGuard + JWT guards
    ├── docker-compose.yml   # PostgreSQL 16 + pgAdmin
    └── README.md            # API blueprint & run instructions
```

## Design system

- **Background:** near-black navy `#05060d` with ambient violet/purple aurora + grid floor
- **Primary accent:** lime `#a3e635`  ·  **Secondary:** cyan `#22d3ee`  ·  **Atmosphere:** violet `#8b5cf6`
- **Type:** Space Grotesk (display) + Inter (body), both self-hosted via fontsource
- **Surfaces:** rounded `2xl` panels, thin `white/7%` borders, glassmorphism, soft glows
- **Motion:** fade-up entrances, hover lifts, ambient drift
- **Responsive:** full layouts on desktop, collapsing side panels on tablet,
  bottom navigation + drawers + touch controls on mobile

## Screens

1. **Sign in** — split-screen; left brand headline “Create videos that keep
   moving.” with product tease; right card (email, password, forgot password,
   sign in, Google, create-account link)
2. **Sign up** — full name, email, password + confirm, password strength meter,
   live checklist, Google signup, sign-in link
3. **Admin dashboard** — top nav (Dashboard · Users · Pages · Blog · Logins ·
   Questions · Search), sidebar (incl. Editor), 5 metric cards, recent activity,
   quick actions with system-health status, plus users/pages/blog/logins and
   questions data tables
4. **User dashboard** — stats, create-project banner, projects grid, templates,
   media list, recent edits, exports table, storage ring, profile/settings
5. **Video editor** — tool rail (Media, Audio, Text, Captions, Effects,
   Filters, Transitions, AI), preview canvas + transport, right properties
   panel, multi-track timeline with ruler/playhead, Save/Preview/Export with a
   working export modal

## Run the frontend

```bash
cd veltra
npm install
npm run dev        # http://localhost:3000
npm run lint       # eslint
npm run typecheck  # tsc --noEmit
npm run build      # production build (type-checks + lints)
```

## Run the backend (blueprint)

```bash
cd veltra/backend
npm install
docker compose up -d          # postgres
npx prisma migrate dev --name init
npx prisma db seed            # admin@veltra.app / Admin1234!
npm run start:dev             # http://localhost:4000/api
```

See `backend/README.md` for the full API surface and security model.