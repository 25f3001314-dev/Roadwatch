# RoadWatch Admin

React admin dashboard for the RoadWatch full-stack platform (Spring Boot API on AWS EC2, AI service, Android app).

## Project structure

```
src/
├── api/              # HTTP client & API calls
├── components/
│   ├── complaints/   # Complaint UI
│   ├── dashboard/    # Dashboard charts & sections
│   ├── layout/       # Shell & auth guard
│   ├── map/          # Leaflet map
│   └── ui/           # Shared UI primitives
├── constants/        # Routes, config
├── context/          # Auth state
├── data/             # Static reference data
├── hooks/            # Data-fetching hooks
├── pages/            # Route pages
├── types/            # TypeScript types
└── utils/            # Formatters, dashboard helpers
```

## Local development

1. Copy `.env.example` to `.env.local` (defaults to `http://localhost:8080` API).
2. Start the backend on port `8080` (or `docker-compose up` from the repo root).
3. Install and run the dev server:

```bash
npm install
npm run dev
```

Open http://localhost:5173 — default login: `admin` / `admin123`.

## Deploy to Vercel

<<<<<<< HEAD
There are two equivalent ways. Pick one — both work.
=======
| Setting | Value |
|---------|--------|
| Root Directory | `Website` |
| Build Command | `npm run build` |
| Output Directory | `dist` |
| Environment | `VITE_API_BASE_URL` = your production API URL (AWS backend URL for remote deployments) |

If the admin UI and backend are deployed on the same origin, the app can also use a relative `/api` path.
>>>>>>> e43aea6 (update frontend api config)

### Option A — deploy from repo root (recommended for monorepo)

The repo root has a `vercel.json` that builds `Website/` and serves `Website/dist`. No special UI config needed.

1. Import the repo on Vercel.
2. Leave **Root Directory** as the default (repo root).
3. Set **Environment Variable**: `VITE_API_BASE_URL` = your AWS EC2 API URL (e.g. `https://api.your-domain.com`).
4. Deploy.

### Option B — set Root Directory to `Website`

1. Import the repo on Vercel.
2. **Root Directory:** `Website`.
3. Framework auto-detects as **Vite**. Build Command = `npm run build`, Output Directory = `dist` (already set in `Website/vercel.json`).
4. Set **Environment Variable**: `VITE_API_BASE_URL` = your AWS EC2 API URL.
5. Deploy.

Both options use the SPA rewrite rule so React Router routes (`/complaints/:id`, etc.) resolve correctly on hard reload.

## Production environment variables

| Variable | Where to set | Example |
|----------|--------------|---------|
| `VITE_API_BASE_URL` | Vercel Project → Settings → Environment Variables | `https://api.example.com` |

The value is baked into the build at compile time (Vite static replacement). Re-deploy after changing it.

## Backend on AWS EC2 — required CORS

The Spring Boot API must allow your Vercel domain in `CORS_ALLOWED_ORIGINS`. For example:

```
CORS_ALLOWED_ORIGINS=https://your-app.vercel.app,https://your-custom-domain.com
```

(Set this on the EC2 instance / via systemd / Docker env, then restart the API.)

## Full stack hosts

| Service | Suggested host |
|---------|----------------|
| Admin UI (this) | Vercel |
| Spring Boot API | AWS EC2 |
| PostgreSQL | AWS RDS / Neon / Supabase |
| AI (YOLO) | AWS EC2 (GPU) / Render |
| Android app | Play Store / APK |
